var global = require("../config/global");
var jwt = require("jsonwebtoken");
var crypto = require("crypto");
var base64 = require("base-64");
var bcrypt = require("bcrypt");
var multer = require("multer");
var Sequelize = require("sequelize");
var fs = require("fs");
const Op = Sequelize.Op;
var async = require("async");
var db = require("../models");
var moment = require("moment");

var CourierRequestors = require("../models").CourierRequestors;
var AssistantRequestors = require("../models").AssistantRequestors;
var CompanionRequestors = require("../models").CompanionRequestors;
var Users = require("../models").Users;
var Invites = require("../models").Invites;
var Notifications = require("../models").Notifications;
var Payments = require("../models").Payments;
const Wallet = require("../models").Wallet;

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    // callback(null, './src/assets/uploads');
    callback(null, "./uploads/item_images");
  },
  filename: function(req, file, callback) {
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length
    );
    callback(null, file.fieldname + "_" + Date.now() + ext);
  }
});

var uploadPackageImage = multer({
  storage: storage
}).single("photo");

var uploadItemImage = multer({
  storage: storage
}).single("itemphoto");

function sendOtpToEmail(reqdata, email, request, callback) {
  console.log("requestvvvvvvvvvvvv", request);

  var otp = Math.floor(1000 + Math.random() * 9000);

  return CourierRequestors.update(
    {
      receiver_otp: otp
    },
    {
      where: { id: reqdata }
    }
  ).then(cust => {
    console.log("email", email);
    var clientEmail = email;
    var host = global.getProtocol(request);
    var transporter = global.transporter();

    var maillist = [clientEmail];

    maillist.toString();

    var html =
      "<div><span>Hi " +
      request.body.receiver_name +
      ", </span></div><br>" +
      "<div><span>Please get verified while receiving your package </span></div>" +
      "<div><span>Your Package - " +
      request.body.package_name +
      "(" +
      request.body.package_weight +
      " " +
      request.body.weight_unit +
      ") </span></div>" +
      "<div><span> Your package OTP is " +
      otp +
      "</span></div>";

    // var html = '<div><span>Your package OTP is here ' + otp + ', please get verified while receiving your package</span><br></div>';

    var mailOptions = {
      from: "botworldstatus@gmail.com",
      to: maillist,
      subject: "Receiver OTP",
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
        console.log("Email sent: " + info.cresponse);
        msg = "Mail Sent with reset link for changing password";
        callback(false, {
          status: "ok",
          reqdata: cust
        });
      }
    });
  });
}

module.exports = {
  itemImageUpload(req, res, next) {
    var filename = [];
    uploadItemImage(req, res, function(err) {
      if (err) {
        // An error occurred when uploading
        console.log(err);
        return res.status(422).send("an Error occured");
      }
      // console.log('req.file', req);
      filename = req.file.filename;
      return res.send({
        status: "ok",
        filename
      });
    });
  },

  packageImageUpload(req, res, next) {
    var filename = [];
    uploadPackageImage(req, res, function(err) {
      if (err) {
        // An error occurred when uploading
        console.log(err);
        return res.status(422).send("an Error occured");
      }
      // console.log('req.file', req);
      filename = req.file.filename;
      return res.send({
        status: "ok",
        filename
      });
    });
  },

  sendPackageCode(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      sendOtpToEmail(req.body, req, function(err, resp) {
        if (err) {
          next(err);
        } else {
          console.log("resp", resp.reqdata.id);
          res.send({
            status: "ok",
            msg: "Request sent sucessfully",
            reqid: resp.reqdata.id
          });
        }
      });
    }
  },

  verifyPackageOTP(req, res, next) {
    console.log("verify>>>", req.body);
    if (typeof req.session.user !== "undefined") {
      CourierRequestors.findOne({
        where: {
          id: req.body.id,
          receiver_otp: req.body.receiver_otp
        }
      }).then(result => {
        if (result) {
          CourierRequestors.update(
            {
              package_status: "delivered"
            },
            {
              where: { id: req.body.id, user_id: req.body.req_user_id }
            }
          ).then(result => {
            Invites.update(
              {
                status: "delivered",
                package_status: "delivered"
              },
              {
                where: {
                  from_user_id: req.body.from_user_id,
                  to_user_id: req.body.to_user_id,
                  trip_id: req.body.trip_id
                }
              }
            ).then(result => {
              console.log("Invites Updated");
              Notifications.update(
                {
                  package_status: "assigned",
                  is_archived: true
                },
                {
                  where: {
                    from_user_id: req.body.from_user_id,
                    to_user_id: req.body.to_user_id,
                    trip_id: req.body.trip_id
                  }
                }
              ).then(result => {
                console.log("Notifications Updated");
                Notifications.create({
                  from_user_id: req.body.to_user_id,
                  to_user_id: req.body.from_user_id,
                  trip_id: req.body.trip_id,
                  request_status: "delivered",
                  view_status: "unread",
                  request_id: req.body.id,
                  request_type: req.body.type,
                  request_courier_weight: req.body.package_weight,
                  package_status: "delivered"
                }).then(result => {
                  Payments.findOne({
                    where: {
                      trip_id: req.body.trip_id,
                      [Op.or]: [
                        { trip_user_id: req.session.user.id },
                        { requestor_id: req.session.user.id }
                      ],
                      is_credited: 0,
                      status: "success"
                    }
                  }).then(payment => {
                    if (payment) {
                      Wallet.decrement(["pending_balance", "pending_balance"], {
                        by: payment.converted_payment.toFixed(2),
                        where: { user_id: payment.trip_user_id }
                      }).then(() => {
                        Wallet.increment(
                          ["available_balance", "available_balance"],
                          {
                            by: payment.converted_payment.toFixed(2),
                            where: { user_id: payment.trip_user_id }
                          }
                        ).then(() => {
                          Payments.update(
                            { is_credited: 1 },
                            { where: { id: payment.id } }
                          ).then(() => {
                            res.send({
                              status: "ok",
                              msg: "OTP verified successfully"
                            });
                          });
                        });
                      });
                    } else {
                      res.send({
                        status: "ok",
                        msg: "OTP verified successfully"
                      });
                    }
                  });
                });
              });
            });
          });
        } else {
          res.send({ error: "Please enter valid OTP" });
        }
      });
    }
  },

  createCourierRequest(req, res, next) {
    console.log("req.body.", req.body);

    if (typeof req.session.user !== "undefined") {
      CourierRequestors.create({
        user_id: req.session.user.id,
        // assigned_trip_id: req.body.trip_id,
        from_date: req.body.from_date,
        to_date: req.body.to_date,
        package_name: req.body.package_name,
        package_description: req.body.package_description,
        package_weight: req.body.package_weight,
        weight_unit: req.body.weight_unit,
        size: req.body.size,
        item_name: req.body.item_name,
        item_weight: req.body.item_weight,
        item_value: req.body.item_value,
        package_images: req.body.package_images,
        item_images: req.body.item_images,
        receiver_name: req.body.receiver_name,
        receiver_email_id: req.body.receiver_email_id,
        receiver_contact_no: req.body.receiver_contact_no,
        package_status: "created",
        trip_request_status: "open"
      }).then(result => {
        if (result) {
          sendOtpToEmail(result.id, req.body.receiver_email_id, req, function(
            err,
            resp
          ) {
            if (err) {
              next(err);
            } else {
              res.send({
                status: "ok",
                msg: "Request sent sucessfully",
                result: result
              });
            }
          });
        }
      });
    }
  },

  createAssistantRequest(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      AssistantRequestors.create({
        user_id: req.session.user.id,
        departure: req.body.departure,
        destination: req.body.destination,
        from_date: req.body.from_date,
        to_date: req.body.to_date,
        members: req.body.members,
        description: req.body.description,
        requested: req.body.requested
        // assigned_trip_id: req.body.assigned_trip_id
      }).then(result => {
        if (result) {
          res.send({ status: "ok", result: result });
        }
      });
    }
  },

  createCompanionRequest(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      CompanionRequestors.create({
        user_id: req.session.user.id,
        assigned_trip_id: req.body.assigned_trip_id,
        from_date: req.body.from_date,
        to_date: req.body.to_date,
        description: req.body.description
      }).then(result => {
        if (result) {
          res.send({ status: "ok", result: result });
        }
      });
    }
  },

  // getCourierRequest(req, res, next) {
  // 	console.log("getAssistantRequest");
  // 	if(typeof req.session.user !== 'undefined') {
  // 			CourierRequestors.findAll({
  // 				where: { user_id: req.session.user.id }
  // 			}).then(courier => {
  // 				if(courier) {
  // 					res.send({ 'status': 'ok', courier: courier });
  // 				}else{
  // 					res.send({ 'status': 'nodata' });
  // 				}
  // 			})
  // 	}
  // },

  // getAssistantRequest(req, res, next) {
  // 	console.log("getAssistantRequest");
  // 	if(typeof req.session.user !== 'undefined') {
  // 			AssistantRequestors.findOne({
  // 				where: { user_id: req.session.user.id }
  // 			}).then(assistance => {
  // 				if(assistance) {
  // 					res.send({ 'status': 'ok', assistance: assistance });
  // 				}else{
  // 					res.send({ 'status': 'nodata' });
  // 				}
  // 			})
  // 	}
  // },

  getCourierReqById(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var reqId = req.query.reqId;
      return CourierRequestors.findOne({
        where: { id: reqId }
      }).then(courier => {
        if (courier) {
          res.send({ status: "ok", courier: courier });
        } else {
          res.send({ status: "nodata" });
        }
      });
    }
  },

  getAssistanceReqById(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var reqId = req.query.reqId;
      return AssistantRequestors.findOne({
        where: { id: reqId }
      }).then(assistance => {
        if (assistance) {
          res.send({ status: "ok", assistance: assistance });
        } else {
          res.send({ status: "nodata" });
        }
      });
    }
  },

  updateCourierRequest(req, res, next) {
    console.log("param_data", req.body);
    if (typeof req.session.user !== "undefined") {
      CourierRequestors.update(
        {
          user_id: req.session.user.id,
          from_date: req.body.from_date,
          to_date: req.body.to_date,
          package_name: req.body.package_name,
          package_description: req.body.package_description,
          package_weight: req.body.package_weight,
          size: req.body.size,
          item_name: req.body.item_name,
          item_weight: req.body.item_weight,
          item_value: req.body.item_value,
          package_images: req.body.package_images,
          item_images: req.body.item_images,
          receiver_contact_no: req.body.receiver_contact_no,
          receiver_email_id: req.body.receiver_email_id,
          receiver_name: req.body.receiver_name
        },
        {
          where: { id: req.body.id }
        }
      ).then(result => {
        if (result) {
          res.send({ status: "ok", result: result });
        }
      });
    }
  },

  updateAssistantRequest(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      AssistantRequestors.update(
        {
          user_id: req.session.user.id,
          departure: req.body.departure,
          destination: req.body.destination,
          from_date: req.body.from_date,
          to_date: req.body.to_date,
          members: req.body.members,
          description: req.body.description,
          requested: req.body.requested
        },
        {
          where: { id: req.body.id }
        }
      ).then(result => {
        if (result) {
          res.send({ status: "ok", result: result });
        }
      });
    }
  },

  getRequests(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      if (req.query.type == "courier") {
        CourierRequestors.findAll({
          where: { user_id: req.session.user.id }
        }).then(result => {
          if (result) {
            res.send({ status: "ok", result: result });
          }
        });
      }
    }
  },

  getRequestorData(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      if (req.query.type == "courier") {
        var trip_id = req.query.trip_id ? req.query.trip_id : null;
        var courier_cndtn = {};
        if (req.query.is_trip_base == "true") {
          courier_cndtn = {
            user_id: req.query.user_id,
            assigned_trip_id: trip_id
          };
        } else {
          courier_cndtn = {
            user_id: req.query.user_id
          };
        }

        CourierRequestors.findAll({
          where: courier_cndtn,
          order: [["id", "DESC"]]
        }).then(result => {
          if (result) {
            res.send({ status: "ok", result: result });
          }
        });
      } else {
        AssistantRequestors.findAll({
          where: { user_id: req.query.user_id },
          order: [["id", "DESC"]]
        }).then(result => {
          if (result) {
            res.send({ status: "ok", result: result });
          }
        });
      }
    }
  },

  getAllRequestorDataByTrip(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var trip_id = req.query.trip_id;
      var user_type = req.query.user_type;
      let user_id = req.session.user.id;
      var invite_condition = {
        from_user_id: user_id
      };
      if (user_type == "ternster") {
        user_id = req.query.user_id;
        invite_condition = {
          to_user_id: user_id
        };
      }
      console.log("--------------User type----------", user_type);
      if (req.query.type == "courier") {
        CourierRequestors.findAll({
          where: { id: { [Op.in]: req.query.request_id.split(",") } },
          order: [["id", "DESC"]],
          include: [
            { model: Users, attributes: ["id", "name", "email", "status"] },
            { model: Invites, where: invite_condition }
          ]
        }).then(result => {
          if (result) {
            // console.log("courier result",result.id);
            data = result.filter((obj, pos, arr) => {
              return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
            });

            res.send({ status: "ok", result: data });
          }
        });
      } else if (req.query.type == "assistance") {
        AssistantRequestors.findAll({
          // where: { assigned_trip_id: trip_id },
          where: { id: { [Op.in]: req.query.request_id.split(",") } },
          order: [["id", "DESC"]],
          include: [
            { model: Users, attributes: ["id", "name", "email", "status"] }
          ]
        }).then(result => {
          if (result) {
            res.send({ status: "ok", result: result });
          }
        });
      } else if (req.query.type == "companion") {
        CompanionRequestors.findAll({
          where: { assigned_trip_id: trip_id },
          order: [["id", "DESC"]],
          include: [
            { model: Users, attributes: ["id", "name", "email", "status"] }
          ]
        }).then(result => {
          if (result) {
            res.send({ status: "ok", result: result });
          }
        });
      }
    }

    // if (typeof req.session.user !== 'undefined') {
    // 	var trip_id = req.query.trip_id;
    // 	var tab = req.query.tab;
    // 	if (req.query.type == 'courier') {
    // 		var courier_condition = {
    // 			assigned_trip_id: trip_id
    // 		}
    // 		if(tab != 'incomingTrip'){
    // 			courier_condition = {
    // 				assigned_trip_id: trip_id, user_id: req.session.user.id
    // 			}
    // 		}
    // 		CourierRequestors.findAll({
    // 			where: courier_condition,
    // 			order: [['id', 'DESC']],
    // 			include: [
    // 				{ model: Users, attributes: ['id', 'name', 'email', 'status'], }
    // 			]
    // 		}).then(result => {
    // 			if (result) {
    // 				res.send({ 'status': 'ok', result: result });
    // 			}
    // 		})
    // 	}
    // 	else if (req.query.type == 'assistance') {
    // 		AssistantRequestors.findAll({
    // 			where: { assigned_trip_id: trip_id },
    // 			order: [['id', 'DESC']],
    // 			include: [
    // 				{ model: Users, attributes: ['id', 'name', 'email', 'status'], }
    // 			]
    // 		}).then(result => {
    // 			if (result) {
    // 				res.send({ 'status': 'ok', result: result });
    // 			}
    // 		})
    // 	}
    // 	else if (req.query.type == 'companion') {
    // 		CompanionRequestors.findAll({
    // 			where: { assigned_trip_id: trip_id },
    // 			order: [['id', 'DESC']],
    // 			include: [
    // 				{ model: Users, attributes: ['id', 'name', 'email', 'status'], }
    // 			]
    // 		}).then(result => {
    // 			if (result) {
    // 				res.send({ 'status': 'ok', result: result });
    // 			}
    // 		})
    // 	}
    // }
  },

  itemDeleteImage(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      // console.log("itemDeleteImage", req.query.image);
      var filePath = "./uploads/item_images/" + req.query.image;
      // console.log("filePath", filePath);
      if (fs.existsSync(filePath)) {
        // console.log("filePath123", filePath);
        fs.unlinkSync(filePath);
        // console.log("File deleted");
        return res.send({
          status: "ok"
        });
      } else {
        console.log("File not exist");
      }
    }
  },

  itemEditAndDeletePackageImage(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      // console.log("itemDeleteImage", req.body.del_image);
      var filePath = "./uploads/item_images/" + req.body.del_image;
      // console.log("filePath", filePath);
      if (fs.existsSync(filePath)) {
        // console.log("filePath123", filePath);
        fs.unlinkSync(filePath);
        // console.log("File deleted");
        CourierRequestors.update(
          {
            package_images: req.body.images
          },
          {
            where: { id: req.body.id }
          }
        ).then(result => {
          if (result) {
            return res.send({
              status: "ok"
            });
          }
        });
      } else {
        console.log("File not exist");
      }
    }
  },

  itemEditAndDeleteItemImage(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      // console.log("itemDeleteImage", req.body.del_image);
      var filePath = "./uploads/item_images/" + req.body.del_image;
      // console.log("filePath", filePath);
      if (fs.existsSync(filePath)) {
        // console.log("filePath123", filePath);
        fs.unlinkSync(filePath);
        // console.log("File deleted");
        CourierRequestors.update(
          {
            item_images: req.body.images
          },
          {
            where: { id: req.body.id }
          }
        ).then(result => {
          if (result) {
            return res.send({
              status: "ok"
            });
          }
        });
      } else {
        console.log("File not exist");
      }
    }
  },

  deleteCourierRequest(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      CourierRequestors.destroy({
        where: { id: req.query.id }
      }).then(drow => {
        res.send({ status: "ok" });
      });
    }
  },

  deleteAssistanceRequest(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      AssistantRequestors.destroy({
        where: { id: req.query.id }
      }).then(drow => {
        res.send({ status: "ok" });
      });
    }
  },

  getAllRequestorDataById(req, res, next) {
    if (typeof req.session.user !== "undefined") {
      var reqIds = req.query.reqids.split(",");
      if (req.query.reqtype == "courier") {
        CourierRequestors.findAll({
          where: { id: { [Op.in]: reqIds } }
        }).then(result => {
          let sql_query = "select * from admin_settings LIMIT 1 ";
          db.sequelize.query(sql_query).then(adminresult => {
            var admin = adminresult[0];
            res.send({ status: "ok", result: result, admin_settings: admin });
          });
        });
      } else if (req.query.reqtype == "assistance") {
        AssistantRequestors.findAll({
          where: { id: { [Op.in]: reqIds } }
        }).then(result => {
          let sql_query = "select * from admin_settings LIMIT 1 ";
          db.sequelize.query(sql_query).then(adminresult => {
            var admin = adminresult[0];
            res.send({ status: "ok", result: result, admin_settings: admin });
          });
        });
      }
    }
  }
};
