var global = require("../config/global");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");
var base64 = require("base-64");
var bcrypt = require("bcrypt");
var multer = require("multer");
var Sequelize = require("sequelize");
var CryptoJS = require("crypto-js");
var fs = require("fs");
var async = require("async");
var api = require("./clicksendapi.js");
const Op = Sequelize.Op;
var mysql = require("../config/db");
var moment = require("moment");

var Users = require("../models").Users;
var Trips = require("../models").Trips;
var TripReviews = require("../models").TripReviews;
var Invites = require("../models").Invites;

var Profiles = require("../models").Profiles;
var Settings = require("../models").Settings;
var Notifications = require("../models").Notifications;
var CscLists = require("../models").CscLists;
var user_feedback = require("../models").user_feedback;
var kyc_verification = require("../models").kyc_verification;
var CancelledTrips = require("../models").CancelledTrips;
var db = require("../models");
// var Countries = require('../models').Countries;
var TernsterAccounts = require("../models").TernsterAccounts;
var FeedbackToken = require("../models").FeedbackToken;
var Comments = require("../models").Comments;
const wallet = require("../models").Wallet;
const currency = require("../models").Currency;
const Payments = require("../models").Payments;
const StripeCharges = require("../models").StripeCharges;
const StripeRefund = require("../models").StripeRefund;
const CourierRequestors = require("../models").CourierRequestors;
const phone_code_list = require("../models").phone_code_list;

// var States = require('../models').States;
// var Cities = require('../models').Cities;

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    // callback(null, './src/assets/uploads');
    callback(null, "./uploads/profile_images");
  },
  filename: function(req, file, callback) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    // console.log('ext', ext);
    callback(null, file.fieldname + "_" + Date.now() + ext);
  }
});

var coverStorage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./uploads/cover_photos");
  },
  filename: function(req, file, callback) {
    // console.log('file', file);
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    callback(null, file.fieldname + "_" + Date.now() + ext);
  }
});

var upload = multer({
  storage: storage
}).single("photo");

var coverPicUpload = multer({
  storage: coverStorage
}).single("coverphoto");

const SendOtp = require("sendotp");
const sendOtp = new SendOtp("268706Abh2T8WQJWz5c947fe1");

// function getStateById(states, countries, state_id) {
// 	var stateCountry = {};
// 	async.forEach(states, function(state) {
// 		if(state.id == state_id) {
// 			async.forEach(countries, function(country) {
// 				if(country.id == state.country_id) {
// 					stateCountry = {
// 						state: state,
// 						country: country
// 					}
// 				}
// 			})
// 			return stateCountry;
// 		}
// 	});
// 	return null;
// }

function updateUserByLogin(user, provider, provider_id, req, res) {
  if(provider == 'google' && user.dataValues.google_id == null) {
    user.dataValues.google_id == provider_id;
  }
  else if(provider == 'facebook' && user.dataValues.facebook_id == null) {
    user.dataValues.facebook_id = provider_id;
  }

  Users.update({
    google_id: user.dataValues.google_id,
    facebook_id: user.dataValues.facebook_id
  }, {
    where: { id: user.id }
  }).then(uuser => {
    if (user.is_blocked && user.blocked_type == "temporary") {
      var date_filter = moment(user.blocked_from_date)
        .add(1, "month")
        .format("YYYY-MM-DD HH:mm:ss");
      var diffdate = moment.duration(
        moment(date_filter).diff(moment(new Date()))
      );
      if (diffdate.asDays() <= 0) {
        Users.update(
          {
            is_blocked: 0,
            blocked_type: null
          },
          {
            where: { id: user.id }
          }
        ).then(ures => {
          req.session.user = user;
          let userDetail = user.toJSON();
          delete userDetail.password;
          var token = jwt.sign(userDetail, global.jwt_secret, {
            expiresIn: "24h" //1 day
          });
          var reqresults;
          var ternresults;

          let end_date_trip = "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close'";

          db.sequelize.query(end_date_trip).then(trip_result => {
            let c_trip_id = [];
            async.forEach(trip_result[0], function (r) {
              // console.log('r...',r)
              c_trip_id.push(r.id);
            })
            console.log('r...',c_trip_id)
            let end_trip = []; 
            let no_invite_trip = []; 
            Invites.findAll({
              where: { trip_id: { [Op.in]: c_trip_id }}
            }).then(invite_trip => {
              console.log("Invites Id", invite_trip);
              // console.log("Invites Id", invite_trip[0].trip_id);    
              
              async.forEach(invite_trip, function (rtrip) {    
                end_trip.push(rtrip.trip_id);
              });  
              
              let no_invites_trip = c_trip_id.filter(x => !end_trip.includes(x))

              async.forEach(no_invites_trip, function (notrip) {    
                no_invite_trip.push(notrip.trip_id);
              }); 
                  
              if(end_trip.length > 0){    
                  // console.log("end_trip",end_trip.length)        
                let ternster_sql_query =
                  "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.to_user_id=" +
                  user.id +
                  "  LIMIT 1";
                let requester_sql_query =
                  "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and i.requester_trip_status != true AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.from_user_id=" +
                  user.id +
                  " LIMIT 1";
    
                db.sequelize.query(requester_sql_query).then(result => {
                  reqresults = result[0];
                  console.log("reqresults----" + reqresults);
                  db.sequelize.query(ternster_sql_query).then(result => {
                    ternresults = result[0];
                    console.log("ternresults------" + ternresults);
                    if (
                      reqresults != undefined &&
                      reqresults != null &&
                      reqresults != ""
                    ) {                 
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: reqresults,
                          ternsterAccounts: req.session.user.id,
                          service_type: "requester"
                        });
                    
                    } else if (
                      ternresults != undefined &&
                      ternresults != null &&
                      ternresults != ""
                    ) {                  
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: ternresults,
                          ternsterAccounts: req.session.user.id,
                          service_type: "ternster"
                        });                
                    } else {                 
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: ternresults,
                          ternsterAccounts: req.session.user.id,
                          service_type: undefined
                        });                 
                    }
                  });
                  
                });
              }
              else if(no_invite_trip.length>0){
                console.log("**********no_invite_trip*************", no_invite_trip.length);
                let ternster_no_invites =
                  "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' and t.user_id=" +user.id + " LIMIT 1";
                var tern_no_invite;
                  db.sequelize.query(ternster_no_invites).then(result => {
                    tern_no_invite = result[0];
                    console.log("tern_no_invite" , tern_no_invite);
                    if (
                      tern_no_invite != undefined &&
                      tern_no_invite != null &&
                      tern_no_invite != ""
                    ) {
                      TernsterAccounts.findOne({
                        where: { user_id: user.id }
                      }).then(ternsterAccounts => {
                        res.json({
                          status: "ok",
                          token: token,
                          trip: tern_no_invite,
                          ternsterAccounts: req.session.user.id,
                          service_type: "ternster"
                        });
                      });
                    } else {
                      TernsterAccounts.findOne({
                        where: { user_id: user.id }
                      }).then(ternsterAccounts => {
                        res.json({
                          status: "ok",
                          token: token,
                          trip: tern_no_invite,
                          ternsterAccounts: req.session.user.id,
                          service_type: undefined
                        });
                      });
                    }
                  });
              }else{  
                TernsterAccounts.findOne({
                  where: { user_id: user.id }
                }).then(ternsterAccounts => {
                  res.json({
                    status: "ok",
                    token: token,
                    user: user,
                    trip: 'no data',
                    ternsterAccounts: req.session.user.id,
                    service_type: undefined
                  });
                });
              }
            })  
          });
        })
      } else {
        res.json({
          status: "error",
          msg: "Your account has been blocked for 1 month"
        });
      }
    } else if (user.is_blocked && user.blocked_type == "permanent") {
      res.json({
        status: "error",
        msg: "Your account has been blocked permanently"
      });
    } else if (user.isVerified == 1) {
      console.log('userrrrrrrr', user);
      if(user.dataValues.Profile.dataValues.initial_login == 1) {
        Profiles.update({
          initial_login: 0
        }, {
          where: {
            user_id: user.id
          }
        }).then(uuser => {
          req.session.user = user;
          let userDetail = user.toJSON();
          delete userDetail.password;
          var token = jwt.sign(userDetail, global.jwt_secret, {
            expiresIn: "24h" //1 day
          });
          var reqresults;
          var ternresults;

          let end_date_trip = "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close'";

          db.sequelize.query(end_date_trip).then(trip_result => {
            let c_trip_id = [];
            async.forEach(trip_result[0], function (r) {
              // console.log('r...',r)
              c_trip_id.push(r.id);
            })
            let end_trip = []; 
            let no_invite_trip = []; 
            Invites.findAll({
              where: { trip_id: { [Op.in]: c_trip_id }}
            }).then(invite_trip => {
              async.forEach(invite_trip, function (rtrip) {    
                end_trip.push(rtrip.trip_id);
              });  
              
              let no_invites_trip = c_trip_id.filter(x => !end_trip.includes(x))

              async.forEach(no_invites_trip, function (notrip) {    
                no_invite_trip.push(notrip.trip_id);
              }); 
                  
              if(end_trip.length > 0){    
                  // console.log("end_trip",end_trip.length)        
                let ternster_sql_query =
                  "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.to_user_id=" +
                  user.id +
                  "  LIMIT 1";
                let requester_sql_query =
                  "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and i.requester_trip_status != true AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.from_user_id=" +
                  user.id +
                  " LIMIT 1";

                db.sequelize.query(requester_sql_query).then(result => {
                  reqresults = result[0];
                  console.log("reqresults----" + reqresults);
                  db.sequelize.query(ternster_sql_query).then(result => {
                    ternresults = result[0];
                    console.log("ternresults------" + ternresults);
                    if (
                      reqresults != undefined &&
                      reqresults != null &&
                      reqresults != ""
                    ) {                 
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: reqresults,
                          ternsterAccounts: req.session.user.id,
                          service_type: "requester"
                        });
                    
                    } else if (
                      ternresults != undefined &&
                      ternresults != null &&
                      ternresults != ""
                    ) {                  
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: ternresults,
                          ternsterAccounts: req.session.user.id,
                          service_type: "ternster"
                        });                
                    } else {                 
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: ternresults,
                          ternsterAccounts: req.session.user.id,
                          service_type: undefined
                        });                 
                    }
                  });
                  
                });
              }
              else if(no_invite_trip.length>0){
                console.log("**********no_invite_trip*************", no_invite_trip.length);
                let ternster_no_invites =
                  "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' and t.user_id=" +user.id + " LIMIT 1";
                var tern_no_invite;
                  db.sequelize.query(ternster_no_invites).then(result => {
                    tern_no_invite = result[0];
                    console.log("tern_no_invite" , tern_no_invite);
                    if (
                      tern_no_invite != undefined &&
                      tern_no_invite != null &&
                      tern_no_invite != ""
                    ) {
                      TernsterAccounts.findOne({
                        where: { user_id: user.id }
                      }).then(ternsterAccounts => {
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: tern_no_invite,
                          ternsterAccounts: req.session.user.id,
                          service_type: "ternster"
                        });
                      });
                    } else {
                      TernsterAccounts.findOne({
                        where: { user_id: user.id }
                      }).then(ternsterAccounts => {
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: tern_no_invite,
                          ternsterAccounts: req.session.user.id,
                          service_type: undefined
                        });
                      });
                    }
                  });
              }else{  
                TernsterAccounts.findOne({
                  where: { user_id: user.id }
                }).then(ternsterAccounts => {
                  res.json({
                    status: "ok",
                    token: token,
                    user: user,
                    trip: 'no data',
                    ternsterAccounts: req.session.user.id,
                    service_type: undefined
                  });
                });
              }
            })  
          });
        })
      }
      else {
        req.session.user = user;
        let userDetail = user.toJSON();
        delete userDetail.password;
        var token = jwt.sign(userDetail, global.jwt_secret, {
          expiresIn: "24h" //1 day
        });
        var reqresults;
        var ternresults;

        let end_date_trip = "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close'";

        db.sequelize.query(end_date_trip).then(trip_result => {
          let c_trip_id = [];
          async.forEach(trip_result[0], function (r) {
            // console.log('r...',r)
            c_trip_id.push(r.id);
          })
          let end_trip = []; 
          let no_invite_trip = []; 
          Invites.findAll({
            where: { trip_id: { [Op.in]: c_trip_id }}
          }).then(invite_trip => {
            async.forEach(invite_trip, function (rtrip) {    
              end_trip.push(rtrip.trip_id);
            });  
            
            let no_invites_trip = c_trip_id.filter(x => !end_trip.includes(x))

            async.forEach(no_invites_trip, function (notrip) {    
              no_invite_trip.push(notrip.trip_id);
            }); 
                
            if(end_trip.length > 0){    
                // console.log("end_trip",end_trip.length)        
              let ternster_sql_query =
                "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.to_user_id=" +
                user.id +
                "  LIMIT 1";
              let requester_sql_query =
                "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and i.requester_trip_status != true AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.from_user_id=" +
                user.id +
                " LIMIT 1";

              db.sequelize.query(requester_sql_query).then(result => {
                reqresults = result[0];
                console.log("reqresults----" + reqresults);
                db.sequelize.query(ternster_sql_query).then(result => {
                  ternresults = result[0];
                  console.log("ternresults------" + ternresults);
                  if (
                    reqresults != undefined &&
                    reqresults != null &&
                    reqresults != ""
                  ) {                 
                      res.json({
                        status: "ok",
                        token: token,
                        user: user,
                        trip: reqresults,
                        ternsterAccounts: req.session.user.id,
                        service_type: "requester"
                      });
                  
                  } else if (
                    ternresults != undefined &&
                    ternresults != null &&
                    ternresults != ""
                  ) {                  
                      res.json({
                        status: "ok",
                        token: token,
                        user: user,
                        trip: ternresults,
                        ternsterAccounts: req.session.user.id,
                        service_type: "ternster"
                      });                
                  } else {                 
                      res.json({
                        status: "ok",
                        token: token,
                        user: user,
                        trip: ternresults,
                        ternsterAccounts: req.session.user.id,
                        service_type: undefined
                      });                 
                  }
                });
                
              });
            }
            else if(no_invite_trip.length>0){
              console.log("**********no_invite_trip*************", no_invite_trip.length);
              let ternster_no_invites =
                "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' and t.user_id=" +user.id + " LIMIT 1";
              var tern_no_invite;
                db.sequelize.query(ternster_no_invites).then(result => {
                  tern_no_invite = result[0];
                  console.log("tern_no_invite" , tern_no_invite);
                  if (
                    tern_no_invite != undefined &&
                    tern_no_invite != null &&
                    tern_no_invite != ""
                  ) {
                    TernsterAccounts.findOne({
                      where: { user_id: user.id }
                    }).then(ternsterAccounts => {
                      res.json({
                        status: "ok",
                        token: token,
                        user: user,
                        trip: tern_no_invite,
                        ternsterAccounts: req.session.user.id,
                        service_type: "ternster"
                      });
                    });
                  } else {
                    TernsterAccounts.findOne({
                      where: { user_id: user.id }
                    }).then(ternsterAccounts => {
                      res.json({
                        status: "ok",
                        token: token,
                        user: user,
                        trip: tern_no_invite,
                        ternsterAccounts: req.session.user.id,
                        service_type: undefined
                      });
                    });
                  }
                });
            }else{  
              TernsterAccounts.findOne({
                where: { user_id: user.id }
              }).then(ternsterAccounts => {
                res.json({
                  status: "ok",
                  token: token,
                  user: user,
                  trip: 'no data',
                  ternsterAccounts: req.session.user.id,
                  service_type: undefined
                });
              });
            }
          })  
        });
      }
      
    } else if (user.isVerified == 0) {
      res.json({ status: "error", msg: "Please verify the token" });
    }
  })
}

function getHashCode(text) {
  var secret = "abcdeg"; //make this your secret!!
  var algorithm = "sha1"; //consider using sha256
  var hash, hmac;

  // Method 1 - Writing to a stream
  hmac = crypto.createHmac(algorithm, secret);
  hmac.write(text); // write in to the stream
  hmac.end(); // can't read from the stream until you call end()
  hash = hmac.read().toString("hex"); // read out hmac digest
  return hash;
}

function emailVerification(user, email, request, callback) {
  var encode_data = {};
  encode_data.name = user.name;
  encode_data.email = user.email;
  encode_data.date = new Date();
  // console.log('CHECKDATA', encode_data);

  var token = Buffer.from(JSON.stringify(encode_data)).toString("base64");
  token = token.replace(/[&\/\\#,+()$~%.'":*?<>{}=]/g, "");
  token = getHashCode(token);

  return Users.update(
    {
      verification_token: token
    },
    {
      where: { email: email }
    }
  ).then(cust => {
    var clientEmail = email;
    var host = global.getProtocol(request);
    var transporter = global.transporter();

    var maillist = [clientEmail];

    maillist.toString();
    var html =
      "<div><span>Here is your verification link. Please click</span><br>" +
      '<a href="' +
      host +
      "/authorize/" +
      token +
      '">' +
      host +
      "/authorize/" +
      token +
      "</a></div>";

    // var html = '<div style="width: 600px; margin: 80px auto 0; background: #f7f7f9; border-radius: 20px; text-align: center; padding: 20px; font-family:  Helvetica, sans-serif; border: 1px solid #cccccc;"> ' +
    // 	  '<img src="http://142.234.201.107:3003/assets/images/logo.webp" height="45" />' +
    // 	  '<div><h1 style="letter-spacing: 0.5px;font-size: 25px; line-height: 25px;margin: 30px 0 15px">' +
    // 	    'Verify your email address ' +
    // 	  '</h1><p>Please confirm that you want to use this as your Ternster account email address.<p><img src="https://ibb.co/DQ9mGgf" height="150" style="margin: 10px 0"/>' +
    // 	  '<br><a class="btn btn-primary" href="' + host + '/authorize/' + token +'"> Verify my email </a>' +
    // 	    '<p style="letter-spacing: 0.5px; font-size: 13px; line-height: 25px; margin: 25px 0 0;">';

    var mailOptions = {
      from: "botworldstatus@gmail.com",
      to: maillist,
      subject: "Email Verification",
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
        // console.log('Email sent: ' + info.cresponse);
        msg = "Mail Sent with reset link for changing password";
        callback(false, {
          status: "ok",
          msg: msg
        });
      }
    });
  });
}

function sendFeedbackemail(trip_id, user_id, email, request, callback) {
  var encode_data = {};
  encode_data.name = trip_id;
  encode_data.email = email;
  encode_data.date = new Date();
  // console.log('sendFeedbackemail', encode_data);

  var token = Buffer.from(JSON.stringify(encode_data)).toString("base64");
  token = token.replace(/[&\/\\#,+()$~%.'":*?<>{}=]/g, "");
  token = getHashCode(token);

  return FeedbackToken.create({
    trip_id: trip_id,
    user_id: user_id
    // verification_token: token,
  }).then(review => {
    var clientEmail = email;
    var host = global.getProtocol(request);
    var transporter = global.transporter();

    var maillist = [clientEmail];

    maillist.toString();
    var html =
      "<div><span>Here is your feedback form. Please click and submit it ...</span><br>" +
      '<a href="' +
      host +
      "/feedback/" +
      user_id +
      "/" +
      trip_id +
      "/" +
      token +
      '">' +
      host +
      "/feedback/" +
      user_id +
      "/" +
      trip_id +
      "/" +
      token +
      "</a></div>";
    // '<a href="' + host + '/feedback/' + trip_id +  token +  '">' +
    // host + '/feedback/' + trip_id + '</a></div>';

    var mailOptions = {
      from: "botworldstatus@gmail.com",
      to: maillist,
      subject: "Submit Feedback",
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
        // console.log('Email sent: ' + info.response);
        msg = "Mail Sent ";
        callback(false, {
          status: "ok",
          msg: msg
        });
      }
    });
  });
}

// function sendFeedbackemail(trip_id, email, request, callback) {

// 	var encode_data = {};
// 	encode_data.name = trip_id;
// 	encode_data.email = email;
// 	encode_data.date = new Date();

// 	var token = Buffer.from(JSON.stringify(encode_data)).toString('base64');
// 	token = token.replace(/[&\/\\#,+()$~%.'":*?<>{}=]/g, '');
// 	token = getHashCode(token);

// 	var clientEmail = email;
// 	var host = global.getProtocol(request);
// 	var transporter = global.transporter();

// 	var maillist = [
// 		clientEmail
// 	];

// 	maillist.toString();
// 	var html = '<div><span>Here is your feedback form. Please click and submit it ...</span><br>' +
// 		'<a href="' + host + '/feedback/' + trip_id + '">' +
// 		host + '/feedback/' + trip_id + '</a></div>';

// 	var mailOptions = {
// 		from: 'botworldstatus@gmail.com',
// 		to: maillist,
// 		subject: 'Submit Feedback',
// 		html: html
// 	};

// 	transporter.sendMail(mailOptions, function (error, info) {
// 		if (error) {
// 			console.log(error);
// 			callback(false, {
// 				'status': 'error',
// 				'error': global.errorCodes['1019'],
// 				'msg': 'Error Occured'
// 			});
// 			return false;
// 		} else {
// 			msg = "Mail Sent ";
// 			callback(false, {
// 				'status': 'ok',
// 				'msg': msg
// 			});
// 		}
// 	});

// }
module.exports = {
  userRegister(req, res, next) {
    console.log("checking the validations ....");
    // console.log("User data", req.body);
    return Users.findOne({
      where: { email: req.body.email }
    })
      .then(user => {
        if (user) {
          res.json({
            status: "error",
            msg: "Account already exists. Please create with other email"
          });
          return false;
        } else {
          var name = req.body.name;
          var email = req.body.email;
          var password = req.body.password;
          return Users.create({
            name: name,
            email: email,
            password: password
          })
          .then(user => {
            // console.log("User", user);
            Settings.create({
              user_id: user.id
              // profile: 1,
              // trips: 1,
            })
            .then(set_users => {                  
              wallet
                .create({ user_id: set_users.dataValues.user_id })
                .then(() => {
                  emailVerification(user, req.body.email, req, function(
                    err,
                    resp
                  ) {
                    if (err) {
                      next(err);
                    } else {
                      res.send({ status: "ok" });
                    }
                  });
                });                  
            })
            .catch(error => {
              next(error);
            });
          })
          .catch(error => {
            next(error);
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },

  updateConnection(req, res, next) {
    console.log("req.body action -----------", req.body);
    // if(  req.body.service_type=='ternster') {
    // 	return Trips.update({
    // 		is_connection_continued: '0'
    // 	}, {
    // 		where: { id: req.body.id }
    // 	}).then(ures => {
    // 		res.send({ 'status': 'ok' })
    // 	})
    // }
    // else {
    // 	Invites.update({
    // 		is_connection_continued: '0'
    // 	}, {
    // 		where: {
    // 			trip_id: req.body.id,
    // 			user_id:req.session.user.id
    // 		}
    // 	}).then(trip => {
    // 		res.send({ 'status': 'ok' });
    // 	})
    // }

    return Trips.update(
      {
        is_connection_continued: "0"
      },
      {
        where: { id: req.body.id }
      }
    ).then(ures => {
      Invites.update(
        {
          is_connection_continued: "0",
          status: "disconnect"
        },
        {
          where: {
            // trip_id: req.body.id,
            [Op.or]: [
              {
                from_user_id: { [Op.eq]: req.body.from_user_id },
                to_user_id: { [Op.eq]: req.body.to_user_id }
              },
              {
                from_user_id: { [Op.eq]: req.body.to_user_id },
                to_user_id: { [Op.eq]: req.body.from_user_id }
              }
            ]
          }
        }
      ).then(trip => {
        res.send({ status: "ok" });
      });
    });
  },
  
  sendFeedback(req, res, next) {
    // console.log("Trip data", req.body);

    // 	if(  req.body.service_type=='ternster'){
    // 	return Trips.findOne({
    // 		where: {
    // 			id: req.body.id,
    // 			trip_status: 'close'
    // 		}
    // 	}).then(trip => {
    // 		if (trip) {
    // 			res.json({ status: "error", msg: 'Trip already closed and have feedback.' });
    // 			return false;
    // 		}
    // 		else {
    // 			Trips.update({
    // 				trip_status: 'close'
    // 			}, {
    // 					where: { id: req.body.id }
    // 				}).then(trip => {
    // 					Users.findOne({
    // 						where: {
    // 							id: req.session.user.id
    // 						}
    // 					}).then(user => {
    // 						var id = req.body.id;
    //             var email = user.email;
    //             var user_id = req.session.user.id;

    //             sendFeedbackemail(id, user_id, email, req, function (err, resp) {

    // 							if (err) {
    // 								next(err);
    // 								// console.log("send mail finish with err " + err);
    // 								res.send({ 'status': "error", msg: '' })
    // 							}
    // 							else {
    // 								// console.log("send mail finish")

    // 								res.send({ 'status': "ok" });
    // 							}
    // 						});
    // 					}).catch(error => { next(error); });

    // 				}).catch(error => { next(error); });
    // 		}
    // 	}).catch(error => { next(error); });
    // }else{
    // 	Invites.update({
    // 		requester_trip_status: true
    // 	}, {
    // 			where: { trip_id: req.body.id,
    // 				user_id:req.session.user.id
    // 			 }
    // 		}).then(trip => {
    // 			Users.findOne({
    // 				where: {
    // 					id: req.session.user.id
    // 				}
    // 			}).then(user => {
    // 				var id = req.body.id;
    // 				var email = user.email;
    // 				var user_id = req.session.user.id;

    // 				sendFeedbackemail(id, user_id, email, req, function (err, resp) {

    // 					if (err) {
    // 						next(err);
    // 						// console.log("send mail finish with err " + err);
    // 						res.send({ 'status': "error", msg: '' })
    // 					}
    // 					else {
    // 						// console.log("send mail finish")

    // 						res.send({ 'status': "ok" });
    // 					}
    // 				});
    // 			}).catch(error => { next(error); });

    // 		}).catch(error => { next(error); });
    // }

    return Trips.findOne({
      where: {
        id: req.body.id,
        trip_status: "close"
      }
    })
      .then(trip => {
        if (trip) {
          res.json({
            status: "error",
            msg: "Trip already closed and have feedback."
          });
          return false;
        } else {
          Trips.update(
            {
              trip_status: "close"
            },
            {
              where: { id: req.body.id }
            }
          ).then(trip => {
            Invites.update(
              {
                requester_trip_status: true
              },
              {
                where: { trip_id: req.body.id, user_id: req.session.user.id }
              }
            )
              .then(trip => {
                Users.findOne({
                  where: {
                    id: req.session.user.id
                  }
                })
                  .then(user => {
                    var id = req.body.id;
                    var email = user.email;
                    var user_id = req.session.user.id;

                    sendFeedbackemail(id, user_id, email, req, function(
                      err,
                      resp
                    ) {
                      if (err) {
                        next(err);
                        // console.log("send mail finish with err " + err);
                        res.send({ status: "error", msg: "" });
                      } else {
                        // console.log("send mail finish")

                        res.send({ status: "ok" });
                      }
                    });
                  })
                  .catch(error => {
                    next(error);
                  });
              })
              .catch(error => {
                next(error);
              });
          });
        }
      })
      .catch(error => {
        next(error);
      });
  },

  socialLogin(req, res, next) {
    console.log("rq.o", req.body);
    var name = req.body.name;
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var provider = req.body.provider;
    var provider_id = req.body.provider_id;
    // var profile = req.body.profile;

    if(req.body.email) {
      return Users.findOne({
        where: { email: req.body.email },
        include: [{
          model: Profiles,
          attributes: [ 'initial_login' ]
        }]
      })
      .then(user => {
        if(user) {
          updateUserByLogin(user, provider, provider_id, req, res);
        } else {
          var name = req.body.name;
          var email = req.body.email;
          var password = name + email;
          var hashedpassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
          return Users.create({
            name: name,
            email: email,
            password: hashedpassword,
            google_id: provider == 'google' ? provider_id : null,
            facebook_id: provider == 'facebook' ? provider_id : null
          })
          .then(user => {
            // console.log("User", user);
            Settings.create({
              user_id: user.id
              // profile: 1,
              // trips: 1,
            })
            .then(set_users => {                  
              wallet
                .create({ user_id: set_users.dataValues.user_id })
                .then(() => {
                  emailVerification(user, req.body.email, req, function(
                    err,
                    resp
                  ) {
                    if (err) {
                      next(err);
                    } else {
                      res.send({ status: "ok" });
                    }
                  });
                });                  
            })
            .catch(error => {
              next(error);
            });
          })
          .catch(error => {
            next(error);
          });
        }
      })
      .catch(error => {
        next(error);
      });
    }
    else {
      return Users.findOne({
        where: { facebook_id: provider_id },
        include: [{
          model: Profiles,
          attributes: [ 'initial_login' ]
        }]
      }).then(user => {
        updateUserByLogin(user, provider, provider_id, req, res);
      })
    }
    
  },

  userLogin(req, res, next) {
    var email = req.body.email,
      password = req.body.password;
    return Users.findOne({
      where: { email: email },
      include: [{
        model: Profiles,
        attributes: [ 'initial_login' ]
      }]
    })
      .then(function(user) {
        if (!user) {
          res.json({ status: "error", msg: "Email or password is incorrect" });
        } else if (!user.validPassword(password)) {
          res.json({ status: "error", msg: "Email or password is incorrect" });
        } else {
          if (user.is_blocked && user.blocked_type == "temporary") {
            var date_filter = moment(user.blocked_from_date)
              .add(1, "month")
              .format("YYYY-MM-DD HH:mm:ss");
            var diffdate = moment.duration(
              moment(date_filter).diff(moment(new Date()))
            );
            if (diffdate.asDays() <= 0) {
              Users.update(
                {
                  is_blocked: 0,
                  blocked_type: null
                },
                {
                  where: { id: user.id }
                }
              ).then(ures => {
                req.session.user = user;
                let userDetail = user.toJSON();
                delete userDetail.password;
                var token = jwt.sign(userDetail, global.jwt_secret, {
                  expiresIn: "24h" //1 day
                });
                var reqresults;
                var ternresults;

                let end_date_trip = "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close'";

                db.sequelize.query(end_date_trip).then(trip_result => {
                  let c_trip_id = [];
                  async.forEach(trip_result[0], function (r) {
                    // console.log('r...',r)
                    c_trip_id.push(r.id);
                  })
                  console.log('r...',c_trip_id)
                  let end_trip = []; 
                  let no_invite_trip = []; 
                  Invites.findAll({
                    where: { trip_id: { [Op.in]: c_trip_id }}
                  }).then(invite_trip => {
                    console.log("Invites Id", invite_trip);
                    // console.log("Invites Id", invite_trip[0].trip_id);    
                    
                    async.forEach(invite_trip, function (rtrip) {    
                      end_trip.push(rtrip.trip_id);
                    });  
                    
                    let no_invites_trip = c_trip_id.filter(x => !end_trip.includes(x))

                    async.forEach(no_invites_trip, function (notrip) {    
                      no_invite_trip.push(notrip.trip_id);
                    }); 
                        
                    if(end_trip.length > 0){    
                        // console.log("end_trip",end_trip.length)        
                      let ternster_sql_query =
                        "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.to_user_id=" +
                        user.id +
                        "  LIMIT 1";
                      let requester_sql_query =
                        "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and i.requester_trip_status != true AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.from_user_id=" +
                        user.id +
                        " LIMIT 1";
          
                      db.sequelize.query(requester_sql_query).then(result => {
                        reqresults = result[0];
                        console.log("reqresults----" + reqresults);
                        db.sequelize.query(ternster_sql_query).then(result => {
                          ternresults = result[0];
                          console.log("ternresults------" + ternresults);
                          if (
                            reqresults != undefined &&
                            reqresults != null &&
                            reqresults != ""
                          ) {                 
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: reqresults,
                                ternsterAccounts: req.session.user.id,
                                service_type: "requester"
                              });
                          
                          } else if (
                            ternresults != undefined &&
                            ternresults != null &&
                            ternresults != ""
                          ) {                  
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: ternresults,
                                ternsterAccounts: req.session.user.id,
                                service_type: "ternster"
                              });                
                          } else {                 
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: ternresults,
                                ternsterAccounts: req.session.user.id,
                                service_type: undefined
                              });                 
                          }
                        });
                        
                      });
                    }
                    else if(no_invite_trip.length>0){
                      console.log("**********no_invite_trip*************", no_invite_trip.length);
                      let ternster_no_invites =
                        "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' and t.user_id=" +user.id + " LIMIT 1";
                      var tern_no_invite;
                        db.sequelize.query(ternster_no_invites).then(result => {
                          tern_no_invite = result[0];
                          console.log("tern_no_invite" , tern_no_invite);
                          if (
                            tern_no_invite != undefined &&
                            tern_no_invite != null &&
                            tern_no_invite != ""
                          ) {
                            TernsterAccounts.findOne({
                              where: { user_id: user.id }
                            }).then(ternsterAccounts => {
                              res.json({
                                status: "ok",
                                token: token,
                                trip: tern_no_invite,
                                ternsterAccounts: req.session.user.id,
                                service_type: "ternster"
                              });
                            });
                          } else {
                            TernsterAccounts.findOne({
                              where: { user_id: user.id }
                            }).then(ternsterAccounts => {
                              res.json({
                                status: "ok",
                                token: token,
                                trip: tern_no_invite,
                                ternsterAccounts: req.session.user.id,
                                service_type: undefined
                              });
                            });
                          }
                        });
                    }else{  
                      TernsterAccounts.findOne({
                        where: { user_id: user.id }
                      }).then(ternsterAccounts => {
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: 'no data',
                          ternsterAccounts: req.session.user.id,
                          service_type: undefined
                        });
                      });
                    }
                  })  
                });
              })
            } else {
              res.json({
                status: "error",
                msg: "Your account has been blocked for 1 month"
              });
            }
          } else if (user.is_blocked && user.blocked_type == "permanent") {
            res.json({
              status: "error",
              msg: "Your account has been blocked permanently"
            });
          } else if (user.isVerified == 1) {
            console.log('userrrrrrrr', user);
            if(user.dataValues.Profile.dataValues.initial_login == 1) {
              Profiles.update({
                initial_login: 0
              }, {
                where: {
                  user_id: user.id
                }
              }).then(uuser => {
                req.session.user = user;
                let userDetail = user.toJSON();
                delete userDetail.password;
                var token = jwt.sign(userDetail, global.jwt_secret, {
                  expiresIn: "24h" //1 day
                });
                var reqresults;
                var ternresults;

                let end_date_trip = "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close'";

                db.sequelize.query(end_date_trip).then(trip_result => {
                  let c_trip_id = [];
                  async.forEach(trip_result[0], function (r) {
                    // console.log('r...',r)
                    c_trip_id.push(r.id);
                  })
                    let end_trip = []; 
                    let no_invite_trip = []; 
                  Invites.findAll({
                    where: { trip_id: { [Op.in]: c_trip_id }}
                  }).then(invite_trip => {
                    async.forEach(invite_trip, function (rtrip) {    
                      end_trip.push(rtrip.trip_id);
                    });  
                    
                    let no_invites_trip = c_trip_id.filter(x => !end_trip.includes(x))

                    async.forEach(no_invites_trip, function (notrip) {    
                      no_invite_trip.push(notrip.trip_id);
                    }); 
                        
                    if(end_trip.length > 0){    
                        // console.log("end_trip",end_trip.length)        
                      let ternster_sql_query =
                        "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.to_user_id=" +
                        user.id +
                        "  LIMIT 1";
                      let requester_sql_query =
                        "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and i.requester_trip_status != true AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.from_user_id=" +
                        user.id +
                        " LIMIT 1";

                      db.sequelize.query(requester_sql_query).then(result => {
                        reqresults = result[0];
                        console.log("reqresults----" + reqresults);
                        db.sequelize.query(ternster_sql_query).then(result => {
                          ternresults = result[0];
                          console.log("ternresults------" + ternresults);
                          if (
                            reqresults != undefined &&
                            reqresults != null &&
                            reqresults != ""
                          ) {                 
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: reqresults,
                                ternsterAccounts: req.session.user.id,
                                service_type: "requester"
                              });
                          
                          } else if (
                            ternresults != undefined &&
                            ternresults != null &&
                            ternresults != ""
                          ) {                  
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: ternresults,
                                ternsterAccounts: req.session.user.id,
                                service_type: "ternster"
                              });                
                          } else {                 
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: ternresults,
                                ternsterAccounts: req.session.user.id,
                                service_type: undefined
                              });                 
                          }
                        });
                        
                      });
                    }
                    else if(no_invite_trip.length>0){
                      console.log("**********no_invite_trip*************", no_invite_trip.length);
                      let ternster_no_invites =
                        "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' and t.user_id=" +user.id + " LIMIT 1";
                      var tern_no_invite;
                        db.sequelize.query(ternster_no_invites).then(result => {
                          tern_no_invite = result[0];
                          console.log("tern_no_invite" , tern_no_invite);
                          if (
                            tern_no_invite != undefined &&
                            tern_no_invite != null &&
                            tern_no_invite != ""
                          ) {
                            TernsterAccounts.findOne({
                              where: { user_id: user.id }
                            }).then(ternsterAccounts => {
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: tern_no_invite,
                                ternsterAccounts: req.session.user.id,
                                service_type: "ternster"
                              });
                            });
                          } else {
                            TernsterAccounts.findOne({
                              where: { user_id: user.id }
                            }).then(ternsterAccounts => {
                              res.json({
                                status: "ok",
                                token: token,
                                user: user,
                                trip: tern_no_invite,
                                ternsterAccounts: req.session.user.id,
                                service_type: undefined
                              });
                            });
                          }
                        });
                    }else{  
                      TernsterAccounts.findOne({
                        where: { user_id: user.id }
                      }).then(ternsterAccounts => {
                        res.json({
                          status: "ok",
                          token: token,
                          user: user,
                          trip: 'no data',
                          ternsterAccounts: req.session.user.id,
                          service_type: undefined
                        });
                      });
                    }
                  })  
                });
              })
            }
            else {
              req.session.user = user;
              let userDetail = user.toJSON();
              delete userDetail.password;
              var token = jwt.sign(userDetail, global.jwt_secret, {
                expiresIn: "24h" //1 day
              });
              var reqresults;
              var ternresults;

              let end_date_trip = "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close'";

              db.sequelize.query(end_date_trip).then(trip_result => {
                let c_trip_id = [];
                async.forEach(trip_result[0], function (r) {
                  // console.log('r...',r)
                  c_trip_id.push(r.id);
                })
                  let end_trip = []; 
                  let no_invite_trip = []; 
                Invites.findAll({
                  where: { trip_id: { [Op.in]: c_trip_id }}
                }).then(invite_trip => {
                  async.forEach(invite_trip, function (rtrip) {    
                    end_trip.push(rtrip.trip_id);
                  });  
                  
                  let no_invites_trip = c_trip_id.filter(x => !end_trip.includes(x))

                  async.forEach(no_invites_trip, function (notrip) {    
                    no_invite_trip.push(notrip.trip_id);
                  }); 
                      
                  if(end_trip.length > 0){    
                      // console.log("end_trip",end_trip.length)        
                    let ternster_sql_query =
                      "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.to_user_id=" +
                      user.id +
                      "  LIMIT 1";
                    let requester_sql_query =
                      "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and i.requester_trip_status != true AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' WHEN i.request_type ='courier' AND t.payment_mode !='offline' THEN 'delivered' WHEN i.request_type ='courier' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd where dd.from_user_id=" +
                      user.id +
                      " LIMIT 1";

                    db.sequelize.query(requester_sql_query).then(result => {
                      reqresults = result[0];
                      console.log("reqresults----" + reqresults);
                      db.sequelize.query(ternster_sql_query).then(result => {
                        ternresults = result[0];
                        console.log("ternresults------" + ternresults);
                        if (
                          reqresults != undefined &&
                          reqresults != null &&
                          reqresults != ""
                        ) {                 
                            res.json({
                              status: "ok",
                              token: token,
                              user: user,
                              trip: reqresults,
                              ternsterAccounts: req.session.user.id,
                              service_type: "requester"
                            });
                        
                        } else if (
                          ternresults != undefined &&
                          ternresults != null &&
                          ternresults != ""
                        ) {                  
                            res.json({
                              status: "ok",
                              token: token,
                              user: user,
                              trip: ternresults,
                              ternsterAccounts: req.session.user.id,
                              service_type: "ternster"
                            });                
                        } else {                 
                            res.json({
                              status: "ok",
                              token: token,
                              user: user,
                              trip: ternresults,
                              ternsterAccounts: req.session.user.id,
                              service_type: undefined
                            });                 
                        }
                      });
                      
                    });
                  }
                  else if(no_invite_trip.length>0){
                    console.log("**********no_invite_trip*************", no_invite_trip.length);
                    let ternster_no_invites =
                      "SELECT t.id FROM trips t where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) <=7 and t.trip_status !='close' and t.user_id=" +user.id + " LIMIT 1";
                    var tern_no_invite;
                      db.sequelize.query(ternster_no_invites).then(result => {
                        tern_no_invite = result[0];
                        console.log("tern_no_invite" , tern_no_invite);
                        if (
                          tern_no_invite != undefined &&
                          tern_no_invite != null &&
                          tern_no_invite != ""
                        ) {
                          TernsterAccounts.findOne({
                            where: { user_id: user.id }
                          }).then(ternsterAccounts => {
                            res.json({
                              status: "ok",
                              token: token,
                              user: user,
                              trip: tern_no_invite,
                              ternsterAccounts: req.session.user.id,
                              service_type: "ternster"
                            });
                          });
                        } else {
                          TernsterAccounts.findOne({
                            where: { user_id: user.id }
                          }).then(ternsterAccounts => {
                            res.json({
                              status: "ok",
                              token: token,
                              user: user,
                              trip: tern_no_invite,
                              ternsterAccounts: req.session.user.id,
                              service_type: undefined
                            });
                          });
                        }
                      });
                  }else{  
                    TernsterAccounts.findOne({
                      where: { user_id: user.id }
                    }).then(ternsterAccounts => {
                      res.json({
                        status: "ok",
                        token: token,
                        user: user,
                        trip: 'no data',
                        ternsterAccounts: req.session.user.id,
                        service_type: undefined
                      });
                    });
                  }
                })  
              });
            }
            
          } else if (user.isVerified == 0) {
            res.json({ status: "error", msg: "Please verify the token" });
          }
        }
      })
      .catch(error => {
        next(error);
      });
  },

  logout(req, res, next) {
    req.logout();
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }

      // destroy session data
      req.session = null;
      res
        .clearCookie("connect.sid")
        .status(200)
        .json({ status: "ok" });
    });
  },

  sendOTP(req, res, next) {
    var mobileNumber = req.query.mobile;
    var token_url = req.query.token_url;

    // var smsApi = new api.SMSApi("arunkumar.b", "1882F654-33E1-BE0D-761D-C6DEDCEAC15E");

    var smsApi = new api.SMSApi(
      "business@ternster.com",
      "3C219417-B953-C24A-0FFD-C064AB8AE44A"
    );

    var smsMessage = new api.SmsMessage();
    var otp = Math.floor(1000 + Math.random() * 9000);
    smsMessage.source = "sdk";
    // smsMessage.to = "+918870158597";
    smsMessage.to =   req.query.mobile;

    smsMessage.body =
      "TERNSTER: Your unique otp is " +
      otp +
      ". Please do not share this code to anyone";

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    Users.findOne({
      where: { verification_token: token_url }
    }).then(user => {
      if (user) {
        if (req.query.isResend == "true") {
          // sendOtp.send(mobileNumber, "TERNSTER", function (error, data) {
          // 	res.send({ 'status': 'ok', data: data });
          // });
          smsApi
            .smsSendPost(smsCollection)
            .then(function(response) {
              // console.log(response.body);
              res.send({ status: "ok", otp: otp, data: response });
            })
            .catch(function(err) {
              console.error(err.body);
              res.send({ status: "error", data: response });
            });
        } else {
          Profiles.findOne({
            where: { contact: mobileNumber }
          }).then(profres => {
            if (profres) {
              res.send({
                status: "error",
                msg: "Entered mobile number is already exists."
              });
            } else {
              Profiles.findOne({
                where: { user_id: user.dataValues.id }
              }).then(prof => {
                if (!prof) {
                  Profiles.create({
                    user_id: user.dataValues.id,
                    email: user.dataValues.email,
                    first_name: user.name,
                    contact: mobileNumber
                  }).then(uprof => {
                    // sendOtp.send(mobileNumber, "TERNSTER", function (error, data) {
                    // 	console.log('Send OTP response', data);
                    // 	res.send({ 'status': 'ok', data: data });
                    // });
                    smsApi
                      .smsSendPost(smsCollection)
                      .then(function(response) {
                        // console.log(response.body);
                        res.send({ status: "ok", otp: otp, data: response });
                      })
                      .catch(function(err) {
                        console.error(err.body);
                        res.send({ status: "error", data: response });
                      });
                  });
                } else {
                  Profiles.update({
                    contact: mobileNumber
                  }).then(uprofile => {
                    // sendOtp.send(mobileNumber, "TERNSTER", function (error, data) {
                    // 	console.log('Send OTP response', data);
                    // 	res.send({ 'status': 'ok', data: data });
                    // });
                    smsApi
                      .smsSendPost(smsCollection)
                      .then(function(response) {
                        //console.log(response.body);
                        res.send({ status: "ok", otp: otp, data: response });
                      })
                      .catch(function(err) {
                        console.error(err.body);
                        res.send({ status: "error", data: response });
                      });
                  });
                }
              });
            }
          });
        }
      }
    });
  },
  verifyOTP(req, res, next) {
    var otpcode = req.query.otpcode;
    var UVerifyOTPCode = req.query.UVerifyOTP;
    var mobileNumber = "+91" + req.query.mobile;
    var token_url = req.query.token_url;
    const salt = bcrypt.genSaltSync(8);
    var hashedotp = bcrypt.hashSync(otpcode, salt);

    console.log("hashedotp", hashedotp);

    // sendOtp.verify(mobileNumber, otpcode, function (error, data) {
    //console.log('verify otp code', data); // data object with keys 'message' and 'type'
    if (UVerifyOTPCode == otpcode) {
      // console.log('OTP verified successfully');
      Users.findOne({
        where: { verification_token: token_url }
      }).then(user => {
        if (user) {
          return Users.update(
            {
              verification_token: null,
              isVerified: 1,
              sms_otp_hashed_code: getHashCode(otpcode),
              isSmsOtpVerified: 1
            },
            {
              where: { id: user.dataValues.id }
            }
          ).then(userupdatedres => {
            Users.findOne({
              where: { id: user.dataValues.id }
            }).then(user_data => {
              // console.log('user_data', user_data.dataValues);
              req.session.user = user_data;
              let userDetail = user_data.toJSON();
              delete userDetail.password;
              var token = jwt.sign(userDetail, global.jwt_secret, {
                expiresIn: "24h" //1 day
              });
              res.send({ status: "ok", token: token });
            });
          });
        }
      });
    }
    // else if (data.type == 'error') {
    // 	console.log('OTP verification failed');
    // 	res.send({ 'status': 'error' });
    // }
    else {
      // console.log('OTP verification failed');
      res.send({ status: "error" });
    }
    //});
  },

  checkVerification(req, res, next) {
    // console.log('verification', req.headers);
    var token = req.query.token;
    return Users.findOne({
      where: { verification_token: token }
    }).then(user => {
      if (user) {
        res.json({ status: "ok" });
      } else {
        res.json({ status: "error", msg: "Token does not exists" });
      }
    });
  },

  checkUpdateCloseTripToken(req, res, next) {
    var token = req.body.token;oci
    return FeedbackToken.update(
      {
        verification_token: token
      },
      {
        where: {
          user_id: req.body.user_id,
          trip_id: req.body.trip_id
        }
      }
    ).then(token => {
      res.send({ status: "ok" });
    });
  },

  checkFeedbackVerification(req, res, next) {
    var token = req.query.token;
    return FeedbackToken.findOne({
      where: { verification_token: token }
    }).then(token => {
      if (token) {
        res.json({ status: "ok" });
      } else {
        res.json({ status: "error", msg: "Token does not exists" });
      }
    });
  },

  documentUpload(req, res, next) {
    var filename = "";
    upload(req, res, function(err) {
      Profiles.findOne({
        where: { user_id: req.session.user.id }
      }).then(prof => {
        let oldProfilePicture = "";
        if (prof.profile_picture) {
          oldProfilePicture = prof.profile_picture;
        }

        if (err) {
          console.log("err", err);
          return res.status(422).send("an Error occured");
        }

        filename = req.file.filename;
        return res.send({
          status: "ok",
          oldProfilePicture: oldProfilePicture,
          filename
        });
      });
    });
  },

  coverPictureUpload(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var filename = "";
      var oldCoverPicture = "";

      coverPicUpload(req, res, function(err) {
        Profiles.findOne({
          where: { user_id: req.session.user.id }
        }).then(prof => {
          oldCoverPicture = prof.cover_picture;
          if (err) {
            return res.status(422).send("an Error occured");
          }

          // console.log('req.file', req.file);

          filename = req.file.filename;
          return res.send({
            status: "ok",
            oldCoverPicture: oldCoverPicture,
            filename
          });
        });
      });
    }
  },

  changeLogo(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var logo = req.body.logo;
      var userId = req.session.user.id;

      // console.log("oldCoverPicture", req.body);
      if (req.body.oldProfilePicture) {
        var filePath = "./uploads/profile_images/" + req.body.oldProfilePicture;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.log("File not exist");
        }
      }

      Profiles.update(
        {
          profile_picture: logo
        },
        {
          where: { user_id: userId }
        }
      ).then(prof => {
        res.send({ status: "ok" });
      });
    }
  },

  updateCoverPhoto(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var coverPic = req.body.picture;
      var userId = req.session.user.id;
      // console.log("oldCoverPicture", req.body);
      if (req.body.oldCoverPicture) {
        var filePath = "./uploads/cover_photos/" + req.body.oldCoverPicture;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.log("File not exist");
        }
      }

      Profiles.update(
        {
          cover_picture: coverPic
        },
        {
          where: { user_id: userId }
        }
      ).then(prof => {
        res.send({ status: "ok" });
      });
    }
  },

  getUserProfileData(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var userId = req.session.user.id;

      return Profiles.findOne({
        where: { user_id: userId },
        include: [
          {
            model: Users,
            attributes: ["is_kyc_verified", "email"],
            include: [
              {
                model: currency,
                as: "currency"
              }
            ]
          }
        ]
      })
        .then(user => {
          if (user) {
            res.send({ status: "ok", data: user });
          }
        })
        .catch(error => {
          next(error);
        });
    }
  },

  getUserAccountData(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      console.log("---------------inside-------------")
      var userId = req.session.user.id;
      return TernsterAccounts.findOne({
        where: { user_id: userId }
      })
        .then(user => {
            res.send({ status: "ok", data: user });
        })
        .catch(error => {
          next(error);
        });
    }
  },

  updateUserProfileData(req, res, next) {
    // console.log("User Body", req.body);
    if (typeof req.session.user !== "undefined") {
      let dateofbirth = moment(req.body.dob).format("YYYY-MM-DD HH:mm:ss");
      if(dateofbirth == "Invalid date"){
        dateofbirth = null;
      }
      var first_name = req.body.first_name;
      var last_name = req.body.last_name;
      var dob = dateofbirth != "" ? dateofbirth : null
      var gender = req.body.gender;
      var country = req.body.country;
      var state = req.body.state;
      var town = req.body.town;
      var email = req.body.email;
      var mobile = req.body.mobile;
      var kyc = req.body.kyc;
      var language = "";
      if (req.body.language) {
        language = req.body.language.replace(/,/g, ", ");
      }
      var interest = req.body.interest;
      var purpose = req.body.purposeOfTrip;
      var aboutMe = req.body.aboutMe;
      var facebookLink = req.body.facebookLink;
      var twitterLink = req.body.twitterLink;
      var instagramLink = req.body.instagramLink;
      // var account_no = req.body.account_no;
      // var ifsc_code = req.body.ifsc_code;
      // var account_holder_name = req.body.account_holder_name;
      // var bank_name = req.body.bank_name;
      // var bank_address = req.body.bank_address;

      var userId = req.session.user.id;

      return Profiles.update(
        {
          first_name: first_name,
          last_name: last_name,
          country: country,
          state: state,
          dob: dob,
          email: email,
          home_town: town,
          languages: language,
          contact: mobile,
          gender: gender,
          interest: interest,
          kyc_link: kyc,
          purpose_of_trip: purpose,
          about_me: aboutMe,
          facebook_id: facebookLink,
          twitter_id: twitterLink,
          instagram_id: instagramLink
        },
        {
          where: { user_id: userId }
        }
      )
        .then(updatedprof => {
          Users.update(
            {
              name: first_name
            },
            {
              where: { id: userId }
            }
          ).then(updateduser => {
            res.send({ status: "ok" });
            // TernsterAccounts.update({
            // 	account_no: account_no,
            // 	ifsc_code: ifsc_code,
            // 	account_holder_name: account_holder_name,
            // 	bank_name: bank_name,
            // 	bank_address: bank_address,
            // }, {
            // 		where: { user_id: userId }
            // 	}).then(updatedaccount => {
            // 		res.send({ 'status': 'ok' });
            // 	})
          });
        })
        .catch(error => {
          next(error);
        });
    }
  },
 

  updateUserBankDetails(req, res, next) {
    // console.log("User Body", req.body);
    if (typeof req.session.user !== "undefined") {
      var account_no = req.body.account_no;
      var ifsc_code = req.body.ifsc_code;
      var account_holder_name = req.body.account_holder_name;
      var bank_name = req.body.bank_name;
      var bank_address = req.body.bank_address;

      var userId = req.session.user.id;
      TernsterAccounts.update(
        {
          account_no: account_no,
          ifsc_code: ifsc_code,
          account_holder_name: account_holder_name,
          bank_name: bank_name,
          bank_address: bank_address
        },
        {
          where: { user_id: userId }
        }
      ).then(updatedaccount => {
        res.send({ status: "ok" });
      });
    }
  },

  getNotificationLists(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      return Notifications.findAll({
        where: {
          to_user_id: req.session.user.id,
          // is_archived: false,
          [Op.or]: [
            { request_status: { [Op.ne]: "disconnect" } },
            { request_status: { [Op.eq]: null } }
          ]
        },
        order: [["id", "DESC"]],
        include: [
          {
            model: Users,
            attributes: ["id", "name", "email", "status"],
            include: [{ model: Profiles }, { model: Settings }]
          },
          {
            model: Trips,
            include: [
              {
                model: Users,
                attributes: ["id", "name", "email", "status"]
              }
            ]
          }
        ]
      }).then(reqdata => {
        Invites.findAll({
          where: {
            [Op.or]: [
              {
                from_user_id: req.session.user.id
              },
              {
                to_user_id: req.session.user.id
              }
            ]
          }
        }).then(ires => {
          if (ires) {
            async.forEach(reqdata, function(rslt) {
              rslt.dataValues.can_show_profile = false;
              rslt.dataValues.can_show_msg = false;
              async.forEach(ires, function(irst) {
                if (
                  (irst.dataValues.from_user_id ==
                    rslt.dataValues.from_user_id &&
                    irst.dataValues.to_user_id == req.session.user.id) ||
                  (irst.dataValues.from_user_id == req.session.user.id &&
                    irst.dataValues.to_user_id == rslt.dataValues.from_user_id)
                ) {
                  if (irst.status == "accepted" || irst.status == "paid") {
                    // rslt.can_show_profile = true;
                    rslt.dataValues.can_show_profile = true;
                  }
                  if (irst.status == "paid") {
                    rslt.dataValues.can_show_msg = true;
                  }
                }
              });
            });
          }
          res.send({ status: "ok", reqdata: reqdata });
        });
        // console.log('reqdata', reqdata);
        // res.send({ 'status': 'ok', reqdata: reqdata });
      });
      // return Invites.findAll({
      // 	where: { to_user_id: req.session.user.id },
      // 	include: [
      // 		{
      // 			model: Users,
      // 			include: [ { model: Profiles } ]
      // 		},
      // 		{
      // 			model: Trips
      // 		}
      // 	]
      // }).then(reqdata => {
      // 	console.log('reqdata', reqdata);
      // 	res.send({ 'status': 'ok', reqdata: reqdata });
      // })
    }
  },

  updateNotification(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      return Notifications.update(
        {
          view_status: req.body.view_status
        },
        {
          // where: { id: { [Op.in]: req.body.notification_ids } }
          where: { id: req.body.id }
        }
      ).then(updatedRes => {
        res.send({ status: "ok" });
      });
    }
  },
  forgotPassword(req, res, next) {
    // console.log("User data", req.body);
    return Users.findOne({
      where: { email: req.body.email }
    })
      .then(user => {
        // console.log("user user", user)
        if (!user) {
          res.send({ status: "not ok", msg: "Please Enter Valid Email" });
        } else {
          if (user.password) {
            // console.log("User Email", user);
            var replace_password = user.password;
            replace_password = replace_password.toLowerCase();
            // replace_password = replace_password.replace(/\//g, '#');
            replace_password = replace_password.replace(
              /[&\/\\#,+()$~%.'":*?<>{}=]/g,
              ""
            );
            Users.update(
              {
                password_token: replace_password
              },
              {
                where: { email: user.email }
              }
            ).then(updatedres => {
              var clientEmail = user.email;
              var host = global.getProtocol(req);
              var transporter = global.transporter();

              // console.log('HOSTTHOSTHOST', host);

              var html =
                '<div style="background: #f9f9f9; padding: 100px 0; font-family: Whitney,Helvetica Neue,Helvetica,Arial,Lucida Grande,sans-serif;">' +
                '<div style="text-align: center; margin-bottom: 30px;">' +
                "</div>" +
                '<div style="width: 600px; margin: 0 auto; font-family: Verdana,sans-serif; background: #ffffff; padding: 25px 20px; text-align: center; color: #474747;">' +
                '<p style="font-size: 20px">Forgot Your Password  </p>' +
                "<p style='font-size: 15px;'> Click here get you a new password</p>" +
                '<a href="' +
                host +
                "/passwordreset/" +
                replace_password +
                '"  target="_blank" style="color: #fff;background-color:#1fbdfb;font-size: 15px;padding: 15px 30px;text-decoration: none; display: inline-block; margin: 10px 0;">Reset Password</a>' +
                " </div>" +
                "</div>";

              var mailOptions = {
                from: "botworldstatus@gmail.com",
                to: clientEmail,
                subject: "Ternster Reset Password Link",
                html: html
              };

              // console.log('mailOptions', mailOptions);

              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  console.log(error);
                  res.send({ status: "error" });
                  return false;
                } else {
                  // console.log('Email sent: ' + info.cresponse);
                  msg = "Reset Password link has been sent to your mail";
                  res.send({ status: "ok", msg: msg });
                }
              });
            });
          } else {
            res.send({
              status: "error",
              msg:
                "Your mail id has been registered from Google. Please log in with Google."
            });
          }
        }
      })
      .catch(error => {
        next(error);
      });
  },

  resetVerification(req, res, next) {
    var token = req.query.token;
    return Users.findOne({
      where: { password_token: token }
    }).then(user => {
      if (user) {
        res.json({ status: "ok" });
      } else {
        res.json({ status: "error", msg: "Token does not exists" });
      }
    });
  },

  resetPassword(req, res, next) {
    // console.log(req.body);
    return Users.findOne({
      where: {
        password_token: req.body.id
      }
    })
      .then(user => {
        // console.log("user", user);
        if (user) {
          var hashed_password = user.generateHash(req.body.password);
          return Users.update(
            {
              password: hashed_password
            },
            {
              where: { password_token: req.body.id }
            }
          )
            .then(reuser => {
              return Users.update(
                {
                  password_token: null
                },
                {
                  where: { id: user.id }
                }
              )
                .then(updateuser => {
                  res.send({
                    status: "ok",
                    msg: "Password is reset successfully",
                    id: user.id
                  });
                })
                .catch(error => {
                  next(error);
                });
            })
            .catch(error => {
              next(error);
            });
        }
      })
      .catch(error => {
        next(error);
      });
  },

  changePassword(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var old_password = req.body.old_password;
      var password = req.body.password;

      Users.findOne({
        where: {
          id: req.session.user.id,
          provider_id: { [Op.eq]: null }
        }
      })
        .then(user => {
          if (!user) {
            res.send({
              status: "error",
              error: "Credentials are not a valid one"
            });
            return false;
          } else if (!user.validPassword(old_password)) {
            res.send({
              status: "error",
              error: "Old password is not matched for requested user"
            });
            return false;
          } else {
            var hashed_password = user.generateHash(password);

            Users.update(
              {
                password: hashed_password
              },
              {
                where: { id: req.session.user.id }
              }
            )
              .then(updateduser => {
                res.send({ status: "ok", msg: "Password Updated" });
              })
              .catch(error => {
                next(error);
              });
          }
        })
        .catch(error => {
          next(error);
        });
    }
  },

  getAllUsers(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      return Users.findAll({
        where: { isVerified: 1 },
        attributes: ["id", "name", "email"],
        include: [
          {
            model: Profiles,
            attributes: [
              "id",
              "first_name",
              "last_name",
              "profile_picture",
              "cover_picture"
            ]
          },
          { model: Settings }
        ]
      })
        .then(users => {
          res.send({ status: "ok", users: users });
        })
        .catch(error => {
          next(error);
        });
    }
  },

  getAllUsersLanguages(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      return Profiles.findAll({
        attributes: ["languages"]
      })
        .then(languages => {
          let lang = [];
          async.forEach(languages, function(list) {
            if (list.dataValues.languages) {
              let lang_lists = list.dataValues.languages
                .split(",")
                .map(function(item) {
                  return item.trim();
                });
              async.forEach(lang_lists, function(list) {
                lang.push(list);
              });
            }
          });

          // Remove Duplicate
          let filter_languages = lang.filter(function(item, pos) {
            return lang.indexOf(item) == pos;
          });

          // console.log("lang", filter_languages);
          res.send({ status: "ok", languages: filter_languages });
        })
        .catch(error => {
          next(error);
        });
    }
  },

  getUserById(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      // console.log("session OrderBy", req.session.user.id, req.query.user_id);
      return Users.findOne({
        where: { id: req.query.user_id },
        attributes: [
          "id",
          "name",
          "email",
          "is_kyc_verified",
          "is_social_verified",
          "blocked_from_date",
          "blocked_to_date",
          "reduced_ratings",
          "is_blocked",
          "blocked_type"
        ],
        include: [{ model: Profiles }, { model: Settings }]
      })
        .then(user => {
          res.send({ status: "ok", user: user });
        })
        .catch(error => {
          next(error);
        });
    }
  },
  getLocationLists(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      CscLists.findAll({
        limit: 5,
        where: {
          name: Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            "LIKE",
            "%" + req.query.name + "%"
          )
        }
      })
        .then(lists => {
          res.send({ status: "ok", location_lists: lists });
        })
        .catch(error => {
          next(error);
        });
    }
  },
  CreateFeedback(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      return user_feedback
        .findOne({
          where: { trip_id: req.body.trip_id }
        })
        .then(userf => {
          if (!userf) {
            return user_feedback
              .create({
                description: req.body.description,
                rate: req.body.rate,
                trip_id: req.body.trip_id,
                user_id: req.body.user_id
              })
              .then(resss => {
                res.send({ status: "ok" });
              });
          } else {
            res.send({
              status: "error_p",
              msg: "Already feedback submitted for this trip..!"
            });
          }
        });
    }
  },
  verificationDetails(req, res, next) {
    // console.log("KYC Verification 1"+ res.req.body);
    var email = "";
    if (res.req.body.step != undefined) {
      if (res.req.body.step.id == "document-reading") {
        if (
          res.req.body.step.data != null ||
          res.req.body.step.data != undefined
        ) {
          if (res.req.body.metadata != undefined) {
            email = res.req.body.metadata.email;
          }
          // console.log('------------ Data Verification name--------- '+res.req.body.step.data.fullName.value);
          kyc_verification
            .create({
              user_id: 0,
              user_name: res.req.body.step.data.fullName.value,
              email: email,
              resource: res.req.body.resource,
              documentnumber: res.req.body.step.data.documentNumber.value,
              date_of_birth: res.req.body.step.data.dateOfBirth.value,
              status: res.req.body.step.id + " - " + res.req.body.step.status
            })
            .then(log => {
              if (email != "" && email != undefined && email != null) {
                Profiles.findOne({
                  where: { email: email }
                }).then(profres => {
                  kyc_verification
                    .update(
                      {
                        user_id: profres.user_id
                      },
                      {
                        where: {
                          email: email,
                          resource: res.req.body.resource
                        }
                      }
                    )
                    .then(kyc => {                      
                      Profiles.update(
                        {
                          kyc_status: "verified",
                          kyc_link: res.req.body.resource
                        },
                        {
                          where: {
                            id: profres.id
                          }
                        }
                      ).then(profup => {
                        Users.update({
                          is_kyc_verified : true},
                          {
                            where: {
                            id: profres.user_id
                          }
                        }).then(userup => {
                          console.log("KYC Verification Completed with mail "+ email);
                        return res.sendStatus(200);
                          })
                      });
                    });
                });
              } else {
                //   console.log("KYC Verification Completed without mail");
                return res.sendStatus(200);
              }
            });
        }
      } else {
        // console.log("KYC Verification 2"+ res.req.body);
        return res.sendStatus(100, "others");
      }
    } else {
      // console.log("KYC Verification 3"+ res.req.body);
      return res.sendStatus(300);
    }
  },
  GetPhonecodelist(req, res, next) {
         phone_code_list.findAll({        
       
      })
        .then(lists => {
          res.send({ status: "ok", data: lists });
        })
        .catch(error => {
          next(error);
        });
     
  },
};
