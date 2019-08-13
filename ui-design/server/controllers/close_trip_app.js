var global = require("../config/global");
var jwt = require("jsonwebtoken");
var db = require("../models");
var Sequelize = require("sequelize");
const Op = Sequelize.Op; //Sequelize exposes symbol operators that can be used for to create more complex comparisons -
var async = require("async");
var Trips = require("../models").Trips;
var Invites = require("../models").Invites;
var Payments = require("../models").Payments;
var Wallet = require("../models").Wallet;
var moment = require("moment");
var Users = require("../models").Users;

function removeDuplicate(arr) {
  var c;
  var len = arr.length;
  var result = [];
  var obj = {};
  for (c = 0; c < len; c++) {
    obj[arr[c]] = 0;
  }
  for (c in obj) {
    result.push(c);
  }
  return result;
}

function sendCloseTripEmail(trip_id, trip_data, email, callback) {
  console.log(
    "trip_data",
    trip_data[0].departure,
    "trip_id",
    trip_id,
    "email",
    email
  );
  var start = moment(trip_data[0].from_date).format("MM-DD-YYYY");
  var end = moment(trip_data[0].to_date).format("MM-DD-YYYY");

  var encode_data = {};
  encode_data.name = trip_id;
  encode_data.email = email;
  encode_data.date = new Date();

  var clientEmail = email;
  var transporter = global.transporter();

  var maillist = [clientEmail];

  maillist.toString();
  var html =
    "<div><span>Your Trip <b>" +
    trip_data[0].trip_name +
    "</b> </span><br>" +
    '<span><b>"' +
    trip_data[0].departure +
    "</b>  to  <b>" +
    trip_data[0].destination +
    '"</b></span><br>' +
    "<span>" +
    start +
    "  to " +
    end +
    "</span><br>" +
    "<span>(" +
    trip_data[0].type +
    ") has been closed.<span>";

  var mailOptions = {
    from: "botworldstatus@gmail.com",
    to: maillist,
    subject: "Trip Closed",
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      callback(false, {
        status: "error",
        error: global.errorCodes["1019"],
        msg: "Error Occured"
      });
      return false;
    } else {
      msg = "Mail Sent ";
      callback(false, {
        status: "ok",
        msg: msg
      });
    }
  });
}

function closeCompletedTrips() {
  let end_date_trip =
    "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) > 7 and t.trip_status !='close'";

  db.sequelize.query(end_date_trip).then(trip_result => {
    console.log("trip_result", trip_result);
    let c_trip_id = [];
    let end_trip = [];
    let end_trip_user = [];
    let t_trip = [];
    let invite_trip = [];
    let close_trip = [];
    let afterAyncIntrip = [];
    let afterAynctrip = [];
    var primes;
    let email_id = [];
    async.forEach(trip_result[0], function(r) {
      c_trip_id.push(r.id);
    });
    // console.log("typeof r...", c_trip_id);
    // console.log("length r...", c_trip_id.length);

    Invites.findAll({
      where: { trip_id: { [Op.in]: c_trip_id } }
    }).then(invite_trip => {
      async.forEach(invite_trip, function(rtrip) {
        end_trip.push(rtrip.trip_id);
        end_trip_user.push(rtrip.from_user_id, rtrip.to_user_id);
      });

      // console.log("end_trip" ,end_trip);
      // console.log("end_trip_user" ,end_trip_user);
      // console.log("end_trip", invite_trip.length);
      var emailId = removeDuplicate(end_trip_user);
      // console.log("end_trip_user", emailId);

      if (end_trip.length > 0) {
        Trips.update(
          {
            trip_status: "close",
            is_connection_continued: "0"
          },
          {
            where: { id: { [Op.in]: c_trip_id } }
          }
        ).then(tripres => {
          async.forEach(
            invite_trip,
            function(invites, callback) {
              Invites.update(
                {
                  is_connection_continued: "0",
                  status: "disconnect",
                  is_disconnect: "1"
                },
                {
                  where: {
                    [Op.or]: [
                      {
                        from_user_id: { [Op.eq]: invites.from_user_id },
                        to_user_id: { [Op.eq]: invites.to_user_id }
                      },
                      {
                        from_user_id: { [Op.eq]: invites.to_user_id },
                        to_user_id: { [Op.eq]: invites.from_user_id }
                      }
                    ]
                  }
                }
              )
                .then(trips => {
                  if (trips) {
                  }
                  callback();
                })
                .catch(error => {
                  next(error);
                });
            },
            function(err) {
              let close_query =
                "SELECT * from (SELECT t.id,t.is_connection_continued, t.trip_status FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) > 7 ) as dd ";
              db.sequelize.query(close_query).then(async res => {
                const payments = await Payments.findAll({
                  where: {
                    trip_id: { [Op.in]: c_trip_id },
                    is_credited: 0,
                    status: "success"
                  }
                });
                Promise.all(
                  payments
                    .map(async payment => {
                      if (!payment.is_credited) {
                        await Wallet.decrement(
                          ["pending_balance", "pending_balance"],
                          {
                            by: payment.actual_payment,
                            where: { user_id: payment.trip_user_id }
                          }
                        );
                        await Wallet.increment(
                          ["available_balance", "available_balance"],
                          {
                            by: payment.actual_payment,
                            where: { user_id: payment.trip_user_id }
                          }
                        );
                        await Payments.update(
                          { is_credited: 1 },
                          { where: { id: payment.id } }
                        );
                        return "completed";
                      }
                      return null;
                    })
                )
                    // }
                    .then(() => {
                      Users.findAll({
                        where: { id: { [Op.in]: emailId } },
                        attributes: ["email"]
                      }).then(emailid => {
                        async.forEach(emailid, function(emailid) {
                          email_id.push(emailid.email);
                        });

                        async.forEach(end_trip, function(close_trip_id) {
                          let sql_query =
                            "SELECT user_id, id, departure, destination, from_date, to_date, type, trip_name from trips where id=" +
                            close_trip_id +
                            " ";
                          db.sequelize
                            .query(sql_query)
                            .then(sql_query_result => {
                              sendCloseTripEmail(
                                close_trip_id,
                                sql_query_result[0],
                                email_id,
                                function(err, resp) {
                                  if (err) {
                                    next(err);
                                    res.send({ status: "error", msg: "" });
                                  } else {
                                    res.send({ status: "ok" });
                                  }
                                }
                              );
                            });
                        });
                      });
                      console.log(
                        "Trip Closed and Connection Closed !..",
                        res[0]
                      );
                    })
              });
            }
          );
        });
      } else if (c_trip_id.length > 0) {
        let no_invite_email_id = [];
        Trips.findAll({
          where: { id: { [Op.in]: c_trip_id } },
          attributes: ["user_id"]
        }).then(trips_id => {
          async.forEach(trips_id, function(ttrip) {
            t_trip.push(ttrip.user_id);
          });
          console.log("t_trip email", t_trip);

          Trips.update(
            {
              trip_status: "close",
              is_connection_continued: "0"
            },
            {
              where: { id: { [Op.in]: c_trip_id } }
            }
          ).then(() => {
            Users.findAll({
              where: { id: { [Op.in]: t_trip } },
              attributes: ["email"]
            }).then(emailid => {
              async.forEach(emailid, function(emailid) {
                no_invite_email_id.push(emailid.email);
              });
              // console.log("no_invites_trip_user" ,no_invite_email_id);
              //   console.log("end_trip_************&&&&&&&&&&&", c_trip_id);
              async.forEach(c_trip_id, function(close_trip_id) {
                let sql_query =
                  "SELECT user_id, id, departure, destination, from_date, to_date, type, trip_name from trips where id=" +
                  close_trip_id +
                  " ";
                db.sequelize.query(sql_query).then(sql_query_result => {
                  sendCloseTripEmail(
                    close_trip_id,
                    sql_query_result[0],
                    no_invite_email_id,
                    function(err, resp) {
                      if (err) {
                        next(err);
                        res.send({ status: "error", msg: "" });
                      } else {
                        console.log("E-mail Sent Successfully!..");
                        res.send({ status: "ok" });
                      }
                    }
                  );
                });
              });
            });
          });
        });
      } else {
        console.log("No Trips are ended before 7 days!..");
      }
    });
  });
}

module.exports = closeCompletedTrips;
