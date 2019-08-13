var Sequelize = require("sequelize");
const Op = Sequelize.Op; //Sequelize exposes symbol operators that can be used for to create more complex comparisons -
var moment = require("moment");
var async = require("async");
var _ = require("lodash");
var request = require("request");
var global = require("../config/global");
var StripeCharges = require("../models").StripeCharges;
var Trips = require("../models").Trips;
var Invites = require("../models").Invites;
var Notifications = require("../models").Notifications;
var Payments = require("../models").Payments;
var CourierRequestors = require("../models").CourierRequestors;
var AssistantRequestors = require("../models").AssistantRequestors;
var Currency = require("../models").Currency;
var Users = require("../models").Users;
const Wallet = require("../models").Wallet;

var stripe = require("stripe")("sk_test_gIo68sd4913SiWIGUqmN34nG006iipJzRB");

module.exports = {
  createStripePayment(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var userId = req.session.user.id;
      var email = req.session.user.email;
      var tripId = req.body.trip_id;
      console.log("req.body.", req.body);

      Trips.findOne({
        where: { id: tripId },
        include: [
          {
            model: Users,
            attributes: ["id", "name", "email"],
            include: [
              {
                model: Currency,
                as: "currency"
              }
            ]
          }
        ]
      }).then(trip => {
        if (trip) {
          // var amount = trip.dataValues.budget * 100;
          var amount = Math.round(req.body.total_payment * 100);
          console.log("total payment", amount);

          if (amount > 0) {
            StripeCharges.findOne({
              where: { user_id: userId }
            }).then(suser => {
              if (suser) {
                stripe.charges.create(
                  {
                    // charge the customer
                    amount: amount,
                    description: "Charge from Ternster: " + userId,
                    currency: req.body.currency_code,
                    customer: suser.stripe_customer_id
                  },
                  function (err, charge) {
                    console.log("stripe error", err);
                    if (!err) {
                      StripeCharges.create({
                        user_id: userId,
                        stripe_customer_id: suser.stripe_customer_id,
                        trip_id: tripId,
                        charge_id: charge.id
                      }).then(custCharge => {
                        Invites.update(
                          {
                            status: "paid",
                            package_status: "assigned"
                          },
                          {
                            where: { user_id: userId, trip_id: tripId }
                          }
                        )
                          .then(result => {
                            Trips.update(
                              {
                                unplanned_days: "0"
                              },
                              {
                                where: {
                                  id: tripId
                                }
                              }
                            );
                          })
                          .then(result => {
                            Notifications.create({
                              from_user_id: userId,
                              to_user_id: req.body.trip_user_id,
                              trip_id: tripId,
                              request_status: "paid",
                              view_status: "unread",
                              request_id: req.body.request_id,
                              request_type: req.body.request_type,
                              request_courier_weight: req.body.total_weight,
                              request_members: req.body.request_members,
                              package_status: "assigned"
                            }).then(notificationdata => {
                              Notifications.update(
                                {
                                  // request_status: 'paid',
                                  view_status: "unread",
                                  is_archived: true
                                },
                                {
                                  where: {
                                    from_user_id: req.body.trip_user_id,
                                    to_user_id: userId,
                                    trip_id: tripId
                                  }
                                }
                              ).then(notificationdata => {
                                payment_converation(
                                  req.body.trip_user_id,
                                  userId,
                                  req.body.total_payment -
                                  req.body.ternster_commission
                                ).then(exchange => {
                                  Payments.create({
                                    trip_id: req.body.trip_id,
                                    trip_user_id: req.body.trip_user_id,
                                    strip_id: custCharge.id,
                                    requestor_id: userId,
                                    requestor_type: req.body.request_type,
                                    budget: req.body.budget,
                                    total_weight: req.body.total_weight,
                                    ternster_commission:
                                      req.body.ternster_commission,
                                    total_payment: req.body.total_payment.toFixed(
                                      2
                                    ),
                                    actual_payment: (
                                      req.body.total_payment -
                                      req.body.ternster_commission
                                    ).toFixed(2),
                                    converted_payment:
                                      exchange.convertedPayment,
                                    converted_currency_id:
                                      exchange.convertedCurrencyId,
                                    currency_id:
                                      trip.dataValues.User.dataValues.currency
                                        .dataValues.id,
                                    status: "success"
                                  }).then(result => {
                                    Wallet.findOne({
                                      where: {
                                        user_id: req.body.trip_user_id,
                                        status: 1
                                      }
                                    }).then(value => {
                                      if (value) {
                                        Wallet.increment(
                                          [
                                            "pending_balance",
                                            "pending_balance"
                                          ],
                                          {
                                            by: exchange.convertedPayment,
                                            where: {
                                              user_id: req.body.trip_user_id
                                            }
                                          }
                                        ).then(() => {
                                          if (
                                            req.body.request_type ==
                                            "assistance"
                                          ) {
                                            console.log(
                                              "AssistantRequestors inside trippppp",
                                              tripId
                                            );
                                            AssistantRequestors.update(
                                              {
                                                assigned_trip_id: tripId,
                                                package_status: "assigned"
                                              },
                                              {
                                                where: {
                                                  id: req.body.request_id
                                                }
                                              }
                                            ).then(reqresult => {
                                              res.send({
                                                status: "ok",
                                                notification: notificationdata
                                              });
                                            });
                                          } else {
                                            res.send({
                                              status: "ok",
                                              notification: notificationdata
                                            });
                                          }
                                        });
                                      } else {
                                        Wallet.create({
                                          user_id: req.body.trip_user_id,
                                          pending_balance:
                                            exchange.convertedPayment,
                                          available_balance: (0).toFixed(2),
                                          status: 1
                                        }).then(wallet => {
                                          if (
                                            req.body.request_type ==
                                            "assistance"
                                          ) {
                                            console.log(
                                              "AssistantRequestors inside trippppp",
                                              tripId
                                            );
                                            AssistantRequestors.update(
                                              {
                                                assigned_trip_id: tripId,
                                                package_status: "assigned"
                                              },
                                              {
                                                where: {
                                                  id: req.body.request_id
                                                }
                                              }
                                            ).then(reqresult => {
                                              res.send({
                                                status: "ok",
                                                notification: notificationdata
                                              });
                                            });
                                          } else {
                                            res.send({
                                              status: "ok",
                                              notification: notificationdata
                                            });
                                          }
                                        });
                                      }
                                    });
                                  });
                                  // res.send({ 'status': 'ok', notification: notificationdata });
                                });
                              });
                            });
                          });
                      });
                    } else {
                      switch (err.type) {
                        case "StripeCardError":
                          // A declined card error
                          console.log("stripe err", err);
                          res.send({ status: "error", error: err.message });
                          // => e.g. "Your card's expiration year is invalid."
                          break;
                        case "StripeRateLimitError":
                          // Too many requests made to the API too quickly
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeInvalidRequestError":
                          // Invalid parameters were supplied to Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAPIError":
                          // An error occurred internally with Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeConnectionError":
                          // Some kind of error occurred during the HTTPS communication
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAuthenticationError":
                          console.log("stripe err", err.Error);
                          res.send({ status: "error", error: err.message });
                          // You probably used an incorrect API key
                          break;
                        default:
                          // Handle any other types of unexpected errors
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                      }
                    }
                  }
                );
              } else {
                stripe.customers.create(
                  {
                    description: "Customer from Ternster :" + userId,
                    source: req.body.token.id,
                    email: email
                  },
                  function (err, result) {
                    if (!err) {
                      stripe.charges.create(
                        {
                          // charge the customer
                          amount: amount,
                          description: "Charge from Ternster: " + userId,
                          currency: req.body.currency_code,
                          customer: result.id
                        },
                        function (err1, charge) {
                          if (!err1) {
                            StripeCharges.create({
                              user_id: userId,
                              stripe_customer_id: result.id,
                              trip_id: tripId,
                              charge_id: charge.id
                            }).then(custCharge => {
                              // console.log("custCharge,",custCharge)
                              Invites.update(
                                {
                                  status: "paid",
                                  package_status: "assigned"
                                },
                                {
                                  where: { user_id: userId, trip_id: tripId }
                                }
                              ).then(result => {
                                Notifications.create({
                                  from_user_id: userId,
                                  to_user_id: req.body.trip_user_id,
                                  trip_id: tripId,
                                  request_status: "paid",
                                  view_status: "unread",
                                  request_id: req.body.request_id,
                                  request_type: req.body.request_type,
                                  request_courier_weight: req.body.total_weight,
                                  request_members: req.body.request_members,
                                  package_status: "assigned"
                                })
                                  .then(result => {
                                    Trips.update(
                                      {
                                        unplanned_days: "0"
                                      },
                                      {
                                        where: {
                                          id: tripId
                                        }
                                      }
                                    );
                                  })
                                  .then(notificationdata => {
                                    Notifications.update(
                                      {
                                        // request_status: 'paid',
                                        view_status: "unread",
                                        is_archived: true
                                      },
                                      {
                                        where: {
                                          from_user_id: req.body.trip_user_id,
                                          to_user_id: userId,
                                          trip_id: tripId
                                        }
                                      }
                                    ).then(notificationdata => {
                                      payment_converation(
                                        req.body.trip_user_id,
                                        userId,
                                        req.body.total_payment -
                                        req.body.ternster_commission
                                      ).then(exchange => {
                                        Payments.create({
                                          trip_id: req.body.trip_id,
                                          trip_user_id: req.body.trip_user_id,
                                          strip_id: custCharge.id,
                                          requestor_id: userId,
                                          requestor_type: req.body.request_type,
                                          budget: req.body.budget,
                                          total_weight: req.body.total_weight,
                                          ternster_commission:
                                            req.body.ternster_commission,
                                          total_payment: req.body.total_payment.toFixed(
                                            2
                                          ),
                                          actual_payment: (
                                            req.body.total_payment -
                                            req.body.ternster_commission
                                          ).toFixed(2),
                                          converted_payment:
                                            exchange.convertedPayment,
                                          converted_currency_id:
                                            exchange.convertedCurrencyId,
                                          currency_id:
                                            trip.dataValues.User.dataValues
                                              .currency.dataValues.id,
                                          status: "success"
                                        }).then(result => {
                                          Wallet.findOne({
                                            where: {
                                              user_id: req.body.trip_user_id,
                                              status: 1
                                            }
                                          }).then(value => {
                                            if (value) {
                                              Wallet.increment(
                                                [
                                                  "pending_balance",
                                                  "pending_balance"
                                                ],
                                                {
                                                  by: exchange.convertedPayment,
                                                  where: {
                                                    user_id:
                                                      req.body.trip_user_id
                                                  }
                                                }
                                              ).then(() => {
                                                if (
                                                  req.body.request_type ==
                                                  "assistance"
                                                ) {
                                                  console.log(
                                                    "AssistantRequestors inside trippppp",
                                                    tripId
                                                  );
                                                  AssistantRequestors.update(
                                                    {
                                                      assigned_trip_id: tripId,
                                                      package_status: "assigned"
                                                    },
                                                    {
                                                      where: {
                                                        id: req.body.request_id
                                                      }
                                                    }
                                                  ).then(reqresult => {
                                                    res.send({
                                                      status: "ok",
                                                      notification: notificationdata
                                                    });
                                                  });
                                                } else {
                                                  res.send({
                                                    status: "ok",
                                                    notification: notificationdata
                                                  });
                                                }
                                              });
                                            } else {
                                              Wallet.create({
                                                user_id: req.body.trip_user_id,
                                                pending_balance:
                                                  exchange.convertedPayment,
                                                available_balance: (0).toFixed(2),
                                                status: 1
                                              }).then(wallet => {
                                                if (
                                                  req.body.request_type ==
                                                  "assistance"
                                                ) {
                                                  console.log(
                                                    "AssistantRequestors inside trippppp",
                                                    tripId
                                                  );
                                                  AssistantRequestors.update(
                                                    {
                                                      assigned_trip_id: tripId,
                                                      package_status: "assigned"
                                                    },
                                                    {
                                                      where: {
                                                        id: req.body.request_id
                                                      }
                                                    }
                                                  ).then(reqresult => {
                                                    res.send({
                                                      status: "ok",
                                                      notification: notificationdata
                                                    });
                                                  });
                                                } else {
                                                  res.send({
                                                    status: "ok",
                                                    notification: notificationdata
                                                  });
                                                }
                                              });
                                            }
                                          });
                                        });
                                        // res.send({ 'status': 'ok', notification: notificationdata });
                                      });
                                    });
                                  });
                              });
                            });
                          }
                        }
                      );
                    } else {
                      // console.log("stripe err", err);
                      switch (err.type) {
                        case "StripeCardError":
                          // A declined card error
                          console.log("stripe err", err);
                          res.send({ status: "error", error: err.message });
                          // => e.g. "Your card's expiration year is invalid."
                          break;
                        case "StripeRateLimitError":
                          // Too many requests made to the API too quickly
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeInvalidRequestError":
                          // Invalid parameters were supplied to Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAPIError":
                          // An error occurred internally with Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeConnectionError":
                          // Some kind of error occurred during the HTTPS communication
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAuthenticationError":
                          console.log("stripe err", err.Error);
                          res.send({ status: "error", error: err.message });
                          // You probably used an incorrect API key
                          break;
                        default:
                          // Handle any other types of unexpected errors
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                      }
                    }
                  }
                );
              }
            });
          }
        }
      });
    }
  },

  createStripePaymentForCourier(req, res, next) {
    console.log("-----------------------Inside courier-----------------------");
    if (typeof req.session.user !== "undefined") {
      var userId = req.session.user.id;
      var email = req.session.user.email;
      var tripId = req.body.trip_id;
      console.log("req.body.", req.body);

      Trips.findOne({
        where: { id: tripId },
        include: [
          {
            model: Users,
            attributes: ["id", "name", "email"],
            include: [
              {
                model: Currency,
                as: "currency"
              }
            ]
          }
        ]
      }).then(trip => {
        if (trip) {
          // var amount = trip.dataValues.budget * 100;
          var amount = Math.round(req.body.total_payment * 100);
          console.log(
            "-----------------------total payment-----------------------",
            amount
          );

          if (amount > 0) {
            StripeCharges.findOne({
              where: { user_id: userId }
            }).then(suser => {
              if (suser) {
                console.log(
                  "-----------------------total payment-------if----------------",
                  amount
                );
                stripe.charges.create(
                  {
                    // charge the customer
                    amount: amount,
                    description: "Charge from Ternster: " + userId,
                    currency: req.body.currency_code,
                    customer: suser.stripe_customer_id
                  },
                  function (err, charge) {
                    console.log("stripe error", err);
                    if (!err) {
                      StripeCharges.create({
                        user_id: userId,
                        stripe_customer_id: suser.stripe_customer_id,
                        trip_id: tripId,
                        charge_id: charge.id
                      }).then(custCharge => {
                        Invites.update(
                          {
                            status: "paid",
                            package_status: "assigned"
                          },
                          {
                            where: { user_id: userId, trip_id: tripId }
                          }
                        )
                          .then(result => {
                            Trips.update(
                              {
                                unplanned_days: "0"
                              },
                              {
                                where: {
                                  id: tripId
                                }
                              }
                            );
                          })
                          .then(result => {
                            Notifications.create({
                              from_user_id: userId,
                              to_user_id: req.body.trip_user_id,
                              trip_id: tripId,
                              request_status: "paid",
                              view_status: "unread",
                              request_id: req.body.request_id,
                              request_type: req.body.request_type,
                              request_courier_weight: req.body.total_weight,
                              package_status: "assigned"
                              // request_members:,
                            }).then(notificationdata => {
                              Notifications.update(
                                {
                                  // request_status: 'paid',
                                  view_status: "unread",
                                  is_archived: true
                                },
                                {
                                  where: {
                                    from_user_id: req.body.trip_user_id,
                                    to_user_id: userId,
                                    trip_id: tripId
                                  }
                                }
                              ).then(notificationdata => {
                                CourierRequestors.update(
                                  {
                                    assigned_trip_id: tripId,
                                    package_status: "assigned"
                                  },
                                  {
                                    where: { id: req.body.request_id }
                                  }
                                ).then(reqresult => {
                                  payment_converation(
                                    req.body.trip_user_id,
                                    userId,
                                    req.body.total_payment -
                                    req.body.ternster_commission
                                  ).then(exchange => {
                                    Payments.create({
                                      trip_id: req.body.trip_id,
                                      trip_user_id: req.body.trip_user_id,
                                      strip_id: custCharge.id,
                                      requestor_id: userId,
                                      requestor_type: req.body.request_type,
                                      budget: req.body.budget,
                                      total_weight: req.body.total_weight,
                                      ternster_commission:
                                        req.body.ternster_commission,
                                      total_payment: req.body.total_payment.toFixed(
                                        2
                                      ),
                                      actual_payment: (
                                        req.body.total_payment -
                                        req.body.ternster_commission
                                      ).toFixed(2),
                                      converted_payment:
                                        exchange.convertedPayment,
                                      converted_currency_id:
                                        exchange.convertedCurrencyId,
                                      currency_id:
                                        trip.dataValues.User.dataValues.currency
                                          .dataValues.id,
                                      status: "success"
                                    }).then(result => {
                                      Wallet.findOne({
                                        where: {
                                          user_id: req.body.trip_user_id,
                                          status: 1
                                        }
                                      }).then(value => {
                                        if (value) {
                                          Wallet.increment(
                                            [
                                              "pending_balance",
                                              "pending_balance"
                                            ],
                                            {
                                              by: exchange.convertedPayment,
                                              where: {
                                                user_id: req.body.trip_user_id
                                              }
                                            }
                                          ).then(() => {
                                            res.send({
                                              status: "ok",
                                              notification: notificationdata
                                            });
                                          });
                                        } else {
                                          Wallet.create({
                                            user_id: req.body.trip_user_id,
                                            pending_balance:
                                              exchange.convertedPayment,
                                            available_balance: (0).toFixed(2),
                                            status: 1
                                          }).then(() => {
                                            res.send({
                                              status: "ok",
                                              notification: notificationdata
                                            });
                                          });
                                        }
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                      });
                    } else {
                      switch (err.type) {
                        case "StripeCardError":
                          // A declined card error
                          console.log("stripe err", err);
                          res.send({ status: "error", error: err.message });
                          // => e.g. "Your card's expiration year is invalid."
                          break;
                        case "StripeRateLimitError":
                          // Too many requests made to the API too quickly
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeInvalidRequestError":
                          // Invalid parameters were supplied to Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAPIError":
                          // An error occurred internally with Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeConnectionError":
                          // Some kind of error occurred during the HTTPS communication
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAuthenticationError":
                          console.log("stripe err", err.Error);
                          res.send({ status: "error", error: err.message });
                          // You probably used an incorrect API key
                          break;
                        default:
                          // Handle any other types of unexpected errors
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                      }
                    }
                  }
                );
              } else {
                console.log(
                  "-----------------------total payment-----else------------------",
                  amount
                );
                stripe.customers.create(
                  {
                    description: "Customer from Ternster :" + userId,
                    source: req.body.token.id,
                    email: email
                  },
                  function (err, result) {
                    if (!err) {
                      stripe.charges.create(
                        {
                          // charge the customer
                          amount: amount,
                          description: "Charge from Ternster: " + userId,
                          currency: req.body.currency_code,
                          customer: result.id
                        },
                        function (err1, charge) {
                          if (!err1) {
                            StripeCharges.create({
                              user_id: userId,
                              stripe_customer_id: result.id,
                              trip_id: tripId,
                              charge_id: charge.id
                            }).then(custCharge => {
                              // console.log("custCharge,",custCharge)
                              Invites.update(
                                {
                                  status: "paid",
                                  package_status: "assigned"
                                },
                                {
                                  where: { user_id: userId, trip_id: tripId }
                                }
                              ).then(result => {
                                Notifications.create({
                                  from_user_id: userId,
                                  to_user_id: req.body.trip_user_id,
                                  trip_id: tripId,
                                  request_status: "paid",
                                  view_status: "unread",
                                  request_id: req.body.request_id,
                                  request_type: req.body.request_type,
                                  request_courier_weight: req.body.total_weight,
                                  package_status: "assigned"
                                  // request_members:,
                                })
                                  .then(result => {
                                    Trips.update(
                                      {
                                        unplanned_days: "0"
                                      },
                                      {
                                        where: {
                                          id: tripId
                                        }
                                      }
                                    );
                                  })
                                  .then(notificationdata => {
                                    Notifications.update(
                                      {
                                        // request_status: 'paid',
                                        view_status: "unread",
                                        is_archived: true
                                      },
                                      {
                                        where: {
                                          from_user_id: req.body.trip_user_id,
                                          to_user_id: userId,
                                          trip_id: tripId
                                        }
                                      }
                                    ).then(notificationdata => {
                                      CourierRequestors.update(
                                        {
                                          assigned_trip_id: tripId,
                                          package_status: "assigned"
                                        },
                                        {
                                          where: { id: req.body.request_id }
                                        }
                                      ).then(reqresult => {
                                        payment_converation(
                                          req.body.trip_user_id,
                                          userId,
                                          req.body.total_payment -
                                          req.body.ternster_commission
                                        ).then(exchange => {
                                          Payments.create({
                                            trip_id: req.body.trip_id,
                                            trip_user_id: req.body.trip_user_id,
                                            strip_id: custCharge.id,
                                            requestor_id: userId,
                                            requestor_type:
                                              req.body.request_type,
                                            budget: req.body.budget,
                                            total_weight: req.body.total_weight,
                                            ternster_commission:
                                              req.body.ternster_commission,
                                            total_payment:
                                              req.body.total_payment.toFixed(2),
                                            actual_payment:
                                              (req.body.total_payment -
                                                req.body.ternster_commission).toFixed(2),
                                            converted_payment:
                                              exchange.convertedPayment,
                                            converted_currency_id:
                                              exchange.convertedCurrencyId,
                                            currency_id:
                                              trip.dataValues.User.dataValues
                                                .currency.dataValues.id,
                                            status: "success"
                                          }).then(result => {
                                            Wallet.findOne({
                                              where: {
                                                user_id: req.body.trip_user_id,
                                                status: 1
                                              }
                                            }).then(value => {
                                              if (value) {
                                                Wallet.increment(
                                                  [
                                                    "pending_balance",
                                                    "pending_balance"
                                                  ],
                                                  {
                                                    by:
                                                      exchange.convertedPayment,
                                                    where: {
                                                      user_id:
                                                        req.body.trip_user_id
                                                    }
                                                  }
                                                ).then(() => {
                                                  res.send({
                                                    status: "ok",
                                                    notification: notificationdata
                                                  });
                                                });
                                              } else {
                                                Wallet.create({
                                                  user_id:
                                                    req.body.trip_user_id,
                                                  pending_balance:
                                                    exchange.convertedPayment,
                                                  available_balance: (0).toFixed(2),
                                                  status: 1
                                                }).then(() => {
                                                  res.send({
                                                    status: "ok",
                                                    notification: notificationdata
                                                  });
                                                });
                                              }
                                            });
                                            // res.send({ 'status': 'ok', notification: notificationdata });
                                          });
                                        });
                                      });
                                    });
                                  });
                              });
                            });
                          }
                        }
                      );
                    } else {
                      // console.log("stripe err", err);
                      switch (err.type) {
                        case "StripeCardError":
                          // A declined card error
                          console.log("stripe err", err);
                          res.send({ status: "error", error: err.message });
                          // => e.g. "Your card's expiration year is invalid."
                          break;
                        case "StripeRateLimitError":
                          // Too many requests made to the API too quickly
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeInvalidRequestError":
                          // Invalid parameters were supplied to Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAPIError":
                          // An error occurred internally with Stripe's API
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeConnectionError":
                          // Some kind of error occurred during the HTTPS communication
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                        case "StripeAuthenticationError":
                          console.log("stripe err", err.Error);
                          res.send({ status: "error", error: err.message });
                          // You probably used an incorrect API key
                          break;
                        default:
                          // Handle any other types of unexpected errors
                          console.log("stripe err", err.message);
                          res.send({ status: "error", error: err.message });
                          break;
                      }
                    }
                  }
                );
              }
            });
          }
        }
      });
    }
  }
};

const payment_converation = async (ternsterId, requestorId, paidAmount) => {
  const ternsterDetails = await UserDetils(ternsterId);
  const requestorDetails = await UserDetils(requestorId);
  const convertedPayment = (
    (paidAmount / requestorDetails.currency.currency_rate) *
    ternsterDetails.currency.currency_rate
  ).toFixed(2);
  return {
    convertedPayment: convertedPayment,
    convertedCurrencyId: requestorDetails.currency.id
  };
};

const UserDetils = async userId => {
  return await Users.findOne({
    where: {
      id: userId
    },
    attributes: ["id", "name", "email"],
    include: [
      {
        model: Currency,
        as: "currency"
      }
    ]
  });
};
