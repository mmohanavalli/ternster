const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Moment = require("moment");
const Users = require("../models").Users;
const Trips = require("../models").Trips;
const Invites = require("../models").Invites;
const Notifications = require("../models").Notifications;
const CancelledTrips = require("../models").CancelledTrips;
const Wallet = require("../models").Wallet;
const Payments = require("../models").Payments;
const StripeCharges = require("../models").StripeCharges;
const StripeRefund = require("../models").StripeRefund;
const CourierRequestors = require("../models").CourierRequestors;

const Stripe = require("stripe")("sk_test_gIo68sd4913SiWIGUqmN34nG006iipJzRB");

const updateUserRating = async (userId, rating) => {
  await Users.increment(["reduced_ratings", "reduced_ratings"], {
    by: rating,
    where: {
      id: userId
    }
  });
};

const updateUserBlockedTemporary = async (
  userId,
  blocked_from_date,
  blocked_to_date
) => {
  await Users.update(
    {
      is_blocked: 1,
      blocked_from_date: blocked_from_date,
      blocked_to_date: blocked_to_date,
      blocked_type: "temporary"
    },
    {
      where: { id: userId }
    }
  );
};

const updateUserBlockedPermanent = async userId => {
  await Users.update(
    {
      is_blocked: 1,
      blocked_type: "permanent"
    },
    {
      where: { id: userId }
    }
  );
};

const paymentDeductionProcess = async (userId, tripDetails, percent) => {
  const getPaymentDetails = await Payments.findOne({
    where: {
      trip_id: tripDetails.id,
      requestor_id: userId,
      status: "success"
    },
    include: [
      {
        model: StripeCharges,
        as: "stripe_charges"
      },
      {
        model: Users,
        as: "trip_user_details",
        attributes: ["id", "name", "email"]
      },
      {
        model: Users,
        as: "requester_details",
        attributes: ["id", "name", "email"]
      }
    ]
  });
  if (getPaymentDetails) {
    const reducedAmount = (percent / 100) * getPaymentDetails.total_payment;
    const refundAmount = Math.round(
      getPaymentDetails.total_payment - reducedAmount
    );
    if (refundAmount) {
      const stripeRefundResponse = await Stripe.refunds.create({
        charge: getPaymentDetails.stripe_charges.charge_id,
        amount: refundAmount * 100
      });
      await StripeRefund.create({
        stripe_charge_id: getPaymentDetails.stripe_charges.charge_id,
        refund_charge_id: stripeRefundResponse.id
      });
      await Payments.update(
        {
          status: "withdraw",
          refund_amount: refundAmount,
          refund_date: Moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          where: {
            id: getPaymentDetails.id
          }
        }
      );
    } else {
      await Payments.update(
        {
          status: "withdraw",
          refund_amount: 0,
          refund_date: Moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          where: {
            id: getPaymentDetails.id
          }
        }
      );
    }
    await Wallet.decrement(["pending_balance", "pending_balance"], {
      by: getPaymentDetails.converted_payment.toFixed(2),
      where: {
        user_id: tripDetails.User.id
      }
    });
  }
};

const cancellationProcessForRequestor = async (userId, tripDetails) => {
  await CancelledTrips.create({
    user_id: userId,
    trip_id: tripDetails.id,
    is_ternster: false,
    is_requestor: true
  });
  const getInvitesDetails = await Invites.findOne({
    where: {
      trip_id: tripDetails.id,
      from_user_id: userId,
      status: {
        [Op.in]: ["pending", "accepted", "paid"]
      }
    }
  });
  getInvitesDetails
    ? await Invites.update(
        {
          status: "withdraw",
          package_status: "withdraw"
        },
        {
          where: { id: getInvitesDetails.id }
        }
      )
    : null;
  tripDetails.is_courier
    ? await CourierRequestors.update(
        {
          package_status: "created",
          assigned_trip_id: null
        },
        {
          where: {
            assigned_trip_id: tripDetails.id,
            user_id: userId
          }
        }
      )
    : null;
  getInvitesDetails
    ? await Notifications.update(
        {
          view_status: "read",
          is_archived: true
        },
        {
          where: {
            from_user_id: getInvitesDetails.from_user_id,
            to_user_id: getInvitesDetails.to_user_id,
            trip_id: getInvitesDetails.trip_id
          }
        }
      )
    : null;
  getInvitesDetails
    ? await Notifications.create({
        from_user_id: getInvitesDetails.from_user_id,
        to_user_id: getInvitesDetails.to_user_id,
        request_status: "withdraw",
        package_status: "withdraw",
        request_id: getInvitesDetails.request_id,
        request_type: getInvitesDetails.request_type,
        trip_id: getInvitesDetails.trip_id
      })
    : null;
};

const cancellationProcessForTernster = async (userId, tripDetails) => {
  await CancelledTrips.create({
    user_id: userId,
    trip_id: tripDetails.id,
    is_ternster: true,
    is_requestor: false
  });
  await Trips.update(
    {
      trip_status: "cancel"
    },
    {
      where: { id: tripDetails.id }
    }
  );
  const findAllInvites = await Invites.findAll({
    where: {
      trip_id: tripDetails.id,
      status: {
        [Op.in]: ["pending", "accepted", "paid"]
      }
    }
  });
  await Invites.update(
    {
      status: "cancelled",
      package_status: "withdraw"
    },
    {
      where: { trip_id: tripDetails.id }
    }
  );
  let notificationList = findAllInvites.map(invite => {
    return {
      from_user_id: invite.to_user_id,
      to_user_id: invite.from_user_id,
      request_status: "cancelled",

      request_id: invite.request_id,
      request_type: invite.request_type,
      trip_id: invite.trip_id
    };
  });
  await Promise.all(
    notificationList.map(async notification => {
      await Notifications.update(
        {
          view_status: "read",
          is_archived: true
        },
        {
          where: {
            from_user_id: notification.from_user_id,
            to_user_id: notification.to_user_id,
            trip_id: notification.trip_id
          }
        }
      );
      await Notifications.update(
        {
          view_status: "read",
          is_archived: true
        },
        {
          where: {
            from_user_id: notification.to_user_id,
            to_user_id: notification.from_user_id,
            trip_id: notification.trip_id
          }
        }
      );
    })
  );
  await Notifications.bulkCreate(notificationList);
  tripDetails.is_courier
    ? await CourierRequestors.update(
        {
          package_status: "created",
          assigned_trip_id: null
        },
        {
          where: {
            assigned_trip_id: tripDetails.id
          }
        }
      )
    : null;
  const getAllRequesterPayments = await Payments.findAll({
    where: {
      trip_id: tripDetails.id,
      status: "success"
    },
    include: [
      {
        model: StripeCharges,
        as: "stripe_charges"
      },
      {
        model: Users,
        as: "trip_user_details",
        attributes: ["id", "name", "email"]
      },
      {
        model: Users,
        as: "requester_details",
        attributes: ["id", "name", "email"]
      }
    ]
  });
  await Promise.all(
    getAllRequesterPayments.map(async payments => {
      const stripeRefundResponse = await Stripe.refunds.create({
        charge: payments.stripe_charges.charge_id
      });
      await StripeRefund.create({
        stripe_charge_id: payments.stripe_charges.charge_id,
        refund_charge_id: stripeRefundResponse.id
      });
      await Payments.update(
        {
          status: "withdraw",
          refund_amount: payments.total_payment.toFixed(2),
          refund_date: Moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          where: {
            id: payments.id
          }
        }
      );
      await Wallet.decrement(["pending_balance", "pending_balance"], {
        by: payments.converted_payment.toFixed(2),
        where: {
          user_id: tripDetails.User.id
        }
      });
    })
  );
};

module.exports = {
  async getCancellationMessage(req, res, next) {
    try {
      const userId = req.session.user.id;
      const tripDetails = await Trips.findOne({
        where: {
          id: req.params.trip_id,
          trip_status: "open"
        },
        include: [
          {
            model: Users,
            attributes: ["id", "name", "email"]
          }
        ]
      });
      if (tripDetails) {
        const userCancellationList = await CancelledTrips.findAll({
          where: {
            user_id: userId,
            is_ternster: req.params.type == "ternster" ? true : false,
            is_requestor: req.params.type == "requestor" ? true : false
          }
        });
        const cancelActionId = userCancellationList.length;
        const currentDateAndTime = Moment(new Date());
        const tripDateAndTime = Moment(tripDetails.from_date);
        const daysDifference = tripDateAndTime.diff(currentDateAndTime, "days");
        const hoursDifference = Moment.duration(
          tripDateAndTime.diff(currentDateAndTime)
        ).asHours();
        console.log(hoursDifference);
        let cancellationMessage = "";
        if (hoursDifference > 0) {
          if (cancelActionId == 0) {
            if (daysDifference > 7) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the first cancellation process,<br>(greater than 7 calender days prior to trip start),<br> so, deduction of 0.25 point in your rating."
                  : "Your trip is going for the first cancellation process,<br>(greater than 7 calender days prior to trip start),<br> so, deduction of 25% in your payment.";
            } else if (daysDifference <= 7 && hoursDifference >= 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the first cancellation process,<br>(less than 7 calender days and greater than 48 hours prior to trip start),<br> so, deduction of 0.5 point in your rating."
                  : "Your trip is going  for the first cancellation process,<br>(less than 7 calender days and greater than 48 hours prior to trip start)<br> so, deduction of 30% in your payemnt.";
            } else if (hoursDifference < 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the first cancellation process,<br>(less than 48 hours prior to trip start)<br> so, deduction of 1 point in your rating."
                  : "Your trip is going for the first cancellation process,<br>(less than 48 hours prior to trip start)<br> so, deduction of 100% in your payment.";
            }
          } else if (cancelActionId == 1) {
            if (daysDifference > 7) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for second cancellation process,<br>(greater than 7 calender days prior to trip start)<br>so, deduction of 0.5 point in your rating."
                  : "Your trip is going for the second cancellation process,<br>(greater than 7 calender days prior to trip start)<br>so, deduction of 30% in your payemnt.";
            } else if (daysDifference <= 7 && hoursDifference >= 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the second cancellation process,<br>(less than 7 calender days and greater than 48 hours prior to trip start)<br> so, deduction of 1 point in your rating."
                  : "Your trip is going for the second cancellation process,<br>(less than 7 calender days and greater than 48 hours prior to trip start),<br> so, deduction of 50% in your payemnt.";
            } else if (hoursDifference < 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the second cancellation process,<br>(less than 48 hours prior to trip start),<br> so, your account blocked for one month."
                  : "Your trip is going for the second cancellation process,<br>(less than 48 hours prior to trip start),<br> so, deduction of 100% in your payemnt.";
            }
          } else if (cancelActionId == 2) {
            if (daysDifference > 7) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the third cancellation process,<br>(greater than 7 calender days prior to trip start),<br> so, deduction of 1 point in your rating."
                  : "Your trip is going for the third cancellation process,<br>(greater than 7 calender days prior to trip start),<br> so, deduction of 50% in your payemnt.";
            } else if (daysDifference <= 7 && hoursDifference >= 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the third cancellation process,<br>(less than 7 calender days and greater than 48 hours prior to trip start),<br> so, your account blocked for one month."
                  : "Your trip is going for the second cancellation process,<br>(less than 7 calender days and greater than 48 hours prior to trip start),<br> so, deduction of 75% in your payemnt.";
            } else if (hoursDifference < 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? "Your trip is going for the third cancellation process,<br>(less than 48 hours prior to trip start),<br> so, your account blocked permanently"
                  : "Your trip is going to cancel for the third cancellation process,<br>(less than 48 hours prior to trip start),<br> so, deduction of 100% in your payemnt.";
            }
          } else {
            cancellationMessage =
              req.params.type == "ternster"
                ? "Your trip is going for the exceed cancellation process, so, your account blocked permanently"
                : "Your trip is going for the exceed cancellation process, so, deduction of 100% in your payemnt.";
          }
          res.status(200).json({
            status: 200,
            message: cancellationMessage,
            response: {}
          });
        } else {
          res.status(404).json({
            status: 404,
            message: "Sorry trip cancel only before the trip start date",
            response: {}
          });
        }
      } else {
        res.status(404).json({
          status: 404,
          message: "Trip details not found for the given id.",
          response: {}
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  },
  async createCancellationTrip(req, res, next) {
    try {
      const userId = req.session.user.id;
      const tripDetails = await Trips.findOne({
        where: {
          id: req.body.trip_id,
          trip_status: "open"
        },
        include: [
          {
            model: Users,
            attributes: ["id", "name", "email"]
          }
        ]
      });
      if (tripDetails) {
        const userCancellationList = await CancelledTrips.findAll({
          where: {
            user_id: userId,
            is_ternster: req.body.type == "ternster" ? true : false,
            is_requestor: req.body.type == "requestor" ? true : false
          }
        });
        const cancelActionId = userCancellationList.length;
        const currentDateAndTime = Moment(new Date());
        const tripDateAndTime = Moment(tripDetails.from_date);
        const daysDifference = tripDateAndTime.diff(currentDateAndTime, "days");
        const hoursDifference = Moment.duration(
          tripDateAndTime.diff(currentDateAndTime)
        ).asHours();
        const oneMonthAfterDateTime = currentDateAndTime.add(1, "months");
        currentDateAndTime;
        if (hoursDifference > 0) {
          if (cancelActionId == 0) {
            if (daysDifference > 7) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserRating(userId, 0.25),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 25),
                    await cancellationProcessForRequestor(userId, tripDetails));
            } else if (daysDifference <= 7 && hoursDifference >= 48) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserRating(userId, 0.5),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 30),
                    await cancellationProcessForRequestor(userId, tripDetails));
            } else if (hoursDifference < 48) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserRating(userId, 1),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 100),
                    await cancellationProcessForRequestor(userId, tripDetails));
            }
          } else if (cancelActionId == 1) {
            if (daysDifference > 7) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserRating(userId, 0.5),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 30),
                    await cancellationProcessForRequestor(userId, tripDetails));
            } else if (daysDifference <= 7 && hoursDifference >= 48) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserRating(userId, 1),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 50),
                    await cancellationProcessForRequestor(userId, tripDetails));
            } else if (hoursDifference < 48) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserBlockedTemporary(
                      userId,
                      currentDateAndTime,
                      oneMonthAfterDateTime
                    ),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 100),
                    await cancellationProcessForRequestor(userId, tripDetails));
            }
          } else if (cancelActionId == 2) {
            if (daysDifference > 7) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserRating(userId, 1),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 50),
                    await cancellationProcessForRequestor(userId, tripDetails));
            } else if (daysDifference <= 7 && hoursDifference >= 48) {
              cancellationMessage =
                req.params.type == "ternster"
                  ? (await updateUserBlockedTemporary(
                      userId,
                      currentDateAndTime,
                      oneMonthAfterDateTime
                    ),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 70),
                    await cancellationProcessForRequestor(userId, tripDetails));
            } else if (hoursDifference < 48) {
              cancellationMessage =
                req.body.type == "ternster"
                  ? (await updateUserBlockedPermanent(userId),
                    await cancellationProcessForTernster(userId, tripDetails))
                  : (await paymentDeductionProcess(userId, tripDetails, 100),
                    await cancellationProcessForRequestor(userId, tripDetails));
            }
          } else {
            cancellationMessage =
              req.body.type == "ternster"
                ? (await updateUserBlockedPermanent(userId),
                  await cancellationProcessForTernster(userId, tripDetails))
                : (await paymentDeductionProcess(userId, tripDetails, 100),
                  await cancellationProcessForRequestor(userId, tripDetails));
          }
          res.status(200).json({
            status: 200,
            message: "Trip cancellation process successfully completed.",
            response: {}
          });
        } else {
          res.status(404).json({
            status: 404,
            message: "Sorry trip cancel only before the trip start date.",
            response: {}
          });
        }
      } else {
        res.status(404).json({
          status: 404,
          message: "Trip details not found for the given id.",
          response: {}
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "Internal Server Error",
        response: error
      });
    }
  }
};
