var global = require('../config/global');
var jwt = require('jsonwebtoken');
var db = require('../models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op //Sequelize exposes symbol operators that can be used for to create more complex comparisons -
var async = require('async');
var moment = require('moment');
var Trips = require('../models').Trips;
var Perks = require('../models').Perks;
var Users = require('../models').Users;
var Profiles = require('../models').Profiles;
var Travel_Modes = require('../models').Travel_Modes;
var Invites = require('../models').Invites;
var Notifications = require('../models').Notifications;
var Favorites = require('../models').Favorites;
var FavoriteUser = require('../models').FavoriteUser;
var Settings = require('../models').Settings;
var Comments = require('../models').Comments;
var Currency = require('../models').Currency;
var _ = require('lodash');

var CourierRequestors = require('../models').CourierRequestors;
var AssistantRequestors = require('../models').AssistantRequestors;
var CompanionRequestors = require('../models').CompanionRequestors;
var TripService = require('../models').TripService;


function groupBy(dataToGroupOn, fieldNameToGroupOn, fieldNameForGroupName, fieldNameForChildren) {
  var result = _.chain(dataToGroupOn)
    .groupBy(fieldNameToGroupOn)
    .toPairs()
    .map(function (currentItem) {
      return _.zipObject([fieldNameForGroupName, fieldNameForChildren], currentItem);
    }).value();
  return result;
}

function createCourier(data, from_date, to_date, req, callback) {
  if (data.is_courier) {
    // console.log("datacourier", data);
    Trips.create({
      user_id: req.session.user.id,
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'courier',
      is_courier: true,
      is_assistance: false,
      is_companion: false,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      base_currency_id: data.base_currency_id,
      courier_budget: data.courier_budget,
      weight_unit: data.weight_unit,
      weight: data.weight,
      balance_weight: data.weight,
      assistance_budget: null,
      payment_mode: data.payment_mode,
      description: data.description,
      perks_id: '0,0,0,0,0',
      is_new: false,
      status: 'active',
      service_log_id: data.service_log_id,

    }).then(trip => {
      callback(false, {
        'status': 'ok',
        'trip_id': trip.dataValues.id
      });
    });
  } else {
    callback(false, {
      'status': 'error',
      'msg': 'Courier un selected'
    });
  }

}

function createAssistance(data, from_date, to_date, req, callback) {
  // console.log("createAssistance", data);
  if (data.is_assistance) {
    Trips.create({
      user_id: req.session.user.id,
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'assistance',
      is_courier: false,
      is_assistance: true,
      is_companion: false,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      base_currency_id: data.base_currency_id,
      courier_budget: null,
      weight_unit: data.weight_unit,
      weight: null,
      balance_weight: 'nil',
      assistance_budget: data.assistance_budget,
      payment_mode: data.payment_mode,
      description: data.description,
      perks_id: '0,0,0,0,0',
      is_new: false,
      status: 'active',
      service_log_id: data.service_log_id,

    }).then(trip => {
      // console.log("trip",trip)
      callback(false, {
        'status': 'ok',
        'trip_id': trip.dataValues.id
      });
    });
  } else {
    callback(false, {
      'status': 'error',
      'msg': 'Assistance un selected'
    });
  }
}

function createCompanion(data, from_date, to_date, req, callback) {
  // console.log("createCompanion", data);
  if (data.is_companion) {
    Trips.create({
      user_id: req.session.user.id,
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'companion',
      is_courier: false,
      is_assistance: false,
      is_companion: true,
      currency_code: null,
      currency_symbol: null,
      base_currency_id: null,
      courier_budget: null,
      weight_unit: data.weight_unit,
      weight: null,
      balance_weight: 'nil',
      assistance_budget: null,
      payment_mode: 'offline',
      description: data.description,
      perks_id: data.perks,
      is_new: false,
      status: 'active',
      service_log_id: data.service_log_id,

    }).then(trip => {
      callback(false, {
        'status': 'ok',
        'trip_id': trip.dataValues.id
      });
    });
  } else {
    callback(false, {
      'status': 'error',
      'msg': 'Companion un selected'
    });
  }
}

function updateCourier(data, courierSelected, courier_id, courierAction, from_date, to_date, req) {
  // console.log("updatecourier", data);
  console.log("courier-----Selected", courierSelected);

  console.log("courier---Action", courierAction);
  if (courierAction == 'update' && courierSelected == true) {
    console.log("trip_id---courier_id", courier_id);
    return Trips.update({
      trip_name: req.body.trip_name,
      mode: req.body.mode,
      departure: req.body.departure,
      destination: req.body.destination,
      trip_plan: req.body.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'courier',
      is_courier: true,
      is_assistance: false,
      is_companion: false,
      currency_code: req.body.currency_code,
      currency_symbol: req.body.currency_symbol,
      base_currency_id: req.body.base_currency_id,
      courier_budget: req.body.courier_budget,
      assistance_budget: null,
      weight_unit: req.body.weight_unit,
      weight: req.body.weight,
      balance_weight: req.body.weight,
      payment_mode: req.body.payment_mode,
      description: req.body.description,
      perks_id: '0,0,0,0,0',
    }, {
        where: { id: courier_id, service_log_id: req.body.service_log_id }
      })

    // .then(tripsdata => {
    //   console.log("tripsdata", tripsdata)
    //   if (tripsdata) {
    //     console.log("updated", tripsdata);
    //     // return 'Courier updated';
    //   } 
    //   // else {
    //   //   return 'Courier un selected';
    //   // }
    // });
  } else if (courierAction == 'delete') {

    console.log('%%%%%%%%%%%%%%%%%');
    console.log('courier_id', courier_id);
    console.log('req.body', req.body);
    return Trips.destroy({
      where: { id: courier_id, service_log_id: req.body.service_log_id }
    }).then(deletedres => {
      console.log('req.body.id', req.body.id);
      var ids = req.body.id.split(',');
      console.log('idsssssssssssss', ids);
      const index = ids.indexOf(courier_id.toString());
      console.log('courieridd', courier_id);
      console.log('inde', index);

      if (index >= 0) {
        ids.splice(index, 1);
      }

      console.log('ids', ids);

      TripService.update({
        trip_ids: ids.toString()
      }, {
          where: { id: data.service_log_id }
        }).then(serviceupdate => {
          console.log('Courier deleted');
        })
    })
  } else if (courierAction == 'create' && courierSelected == true) {
    // console.log("else create in update assistance data", data);
    return Trips.create({
      user_id: req.session.user.id,
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'courier',
      is_courier: true,
      is_assistance: false,
      is_companion: false,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      courier_budget: data.courier_budget,
      assistance_budget: null,
      weight_unit: data.weight_unit,
      weight: data.weight,
      balance_weight: data.weight,
      base_currency_id: data.base_currency_id,
      payment_mode: data.payment_mode,
      description: data.description,
      perks_id: '0,0,0,0,0',
      status: 'active',
      service_log_id: data.service_log_id,
    }).then(trip => {
      let serviceIds = [];
      serviceIds.push(req.body.id, trip.id);
      TripService.update({
        trip_ids: serviceIds.toString()
      }, {
          where: { id: data.service_log_id }
        }).then(serviceupdate => {
          console.log('Courier created');
        })
    });
  } else {
    console.log('Courier un selected');
  }

}

function updateAssistance(data, assistanceSelected, assistance_id, assistanceAction, from_date, to_date, req) {
  console.log("assistanceAction", assistanceAction);
  if (assistanceAction == 'update' && assistanceSelected == true) {
    console.log("updateAssistance ", data);
    return Trips.update({
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'assistance',
      is_courier: false,
      is_assistance: true,
      is_companion: false,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      base_currency_id: data.base_currency_id,
      courier_budget: null,
      weight_unit: data.weight_unit,
      weight: null,
      balance_weight: 'nil',
      assistance_budget: data.assistance_budget,
      payment_mode: data.payment_mode,
      description: data.description,
      perks_id: '0,0,0,0,0',
      service_log_id: data.service_log_id,
    }, {
        where: { id: assistance_id, service_log_id: req.body.service_log_id }
      })

    // .then(tripsdata => {
    //   if (tripsdata) {
    //     console.log('Assistance updated');
    //   } else {
    //     console.log('Assistance un selected');
    //   }
    // });
  }
  else if (assistanceAction == 'delete') {

    console.log('%%%%%%%%%%%%%%%%%');
    console.log('assistance_id', assistance_id);
    console.log('req.body', req.body);
    return Trips.destroy({
      where: { id: assistance_id, service_log_id: req.body.service_log_id }
    }).then(deletedres => {
      var ids = req.body.id.split(',');
      const index = ids.indexOf(assistance_id.toString());

      if (index >= 0) {
        ids.splice(index, 1);
      }

      TripService.update({
        trip_ids: ids.toString()
      }, {
          where: { id: data.service_log_id }
        }).then(serviceupdate => {
          console.log('Assistance deleted');
        })
    })
  }
  else if (assistanceAction == 'create' && assistanceSelected == true) {
    // console.log("else create in update assistance data", data);
    return Trips.create({
      user_id: req.session.user.id,
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'assistance',
      is_courier: false,
      is_assistance: true,
      is_companion: false,
      currency_code: data.currency_code,
      currency_symbol: data.currency_symbol,
      courier_budget: null,
      assistance_budget: data.assistance_budget,
      base_currency_id: data.base_currency_id,
      weight_unit: data.weight_unit,
      weight: null,
      balance_weight: 0,
      payment_mode: data.payment_mode,
      description: data.description,
      perks_id: '0,0,0,0,0',
      status: 'active',
      service_log_id: data.service_log_id,
    })
      .then(trip => {
        let serviceIds = [];
        serviceIds.push(req.body.id, trip.id);
        console.log('serviceIds', serviceIds.toString())
        TripService.update({
          trip_ids: serviceIds.toString()
        }, {
            where: { id: data.service_log_id }
          })
        // .then(serviceupdate => {
        //   console.log("serviceupdate for assistance", serviceupdate);
        //   console.log('Assistance created');
        // })

      });
  } else {
    console.log('Courier un selected');
  }
}

function updateCompanion(data, companionSelected, companion_id, companionAction, from_date, to_date, req) {
  // console.log("companionAction", companionAction);
  if (companionAction == 'update' && companionSelected == true) {
    return Trips.update({
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'companion',
      is_courier: false,
      is_assistance: false,
      is_companion: true,
      currency_code: null,
      currency_symbol: null,
      base_currency_id: null,
      courier_budget: null,
      weight_unit: data.weight_unit,
      weight: null,
      balance_weight: 'nil',
      assistance_budget: null,
      payment_mode: 'offline',
      description: data.description,
      perks_id: data.perks,
    }, {
        where: { id: companion_id, service_log_id: req.body.service_log_id }
      })
    // .then(tripsdata => {
    //   if (tripsdata) {
    //     console.log('Companion updated');
    //   } else {
    //     console.log('Companion un selected');
    //   }
    // });

  }
  else if (companionAction == 'delete') {

    console.log('%%%%%%%%%%%%%%%%%');
    console.log('companion_id', companion_id);
    console.log('req.body', req.body);
    return Trips.destroy({
      where: { id: companion_id, service_log_id: req.body.service_log_id }
    }).then(deletedres => {
      var ids = req.body.id.split(',');
      const index = ids.indexOf(companion_id.toString());

      if (index >= 0) {
        ids.splice(index, 1);
      }

      TripService.update({
        trip_ids: ids.toString()
      }, {
          where: { id: data.service_log_id }
        }).then(serviceupdate => {
          console.log('Companion deleted');
        })
    })
  }
  else if (companionAction == 'create' && companionSelected == true) {
    return Trips.create({
      user_id: req.session.user.id,
      trip_name: data.trip_name,
      mode: data.mode,
      departure: data.departure,
      destination: data.destination,
      trip_plan: data.trip_plan,
      unplanned_days: data.unplanned_days,
      trip_unplanned_days: data.unplanned_days,
      from_date: from_date,
      to_date: to_date,
      type: 'companion',
      is_courier: false,
      is_assistance: false,
      is_companion: true,
      currency_code: null,
      currency_symbol: null,
      courier_budget: null,
      weight_unit: data.weight_unit,
      weight: null,
      balance_weight: 0,
      assistance_budget: null,
      payment_mode: 'offline',
      description: data.description,
      perks_id: data.perks,
      status: 'active',
      service_log_id: data.service_log_id,

    }).then(trip => {
      // console.log("companion req.body.id", req.body.id);
      let serviceIds = [];
      serviceIds.push(req.body.id, trip.id);
      TripService.update({
        trip_ids: serviceIds.toString()
      }, {
          where: { id: data.service_log_id }
        })
      // .then(serviceupdate => {
      //   if (serviceupdate) {
      //     console.log('Companion created');
      //   } else {
      //     console.log('Companion un selected');
      //   }
      // })

    });
  } else {
    console.log('Companion un selected');
  }
}

module.exports = {

  createTrip(req, res, next) {
    // console.log("create trips", req.body);
    if (typeof req.session.user !== 'undefined') {

      // let from_date = moment(req.body.from_date).utc().format('YYYY-MM-DD HH:mm:ss');
      // let to_date = moment(req.body.to_date).utc().format('YYYY-MM-DD HH:mm:ss');
      let from_date = moment(req.body.from_date).format('YYYY-MM-DD HH:mm:ss');
      let to_date = moment(req.body.to_date).format('YYYY-MM-DD HH:mm:ss');

      // return Trips.findOne({
      //   where: { user_id: req.session.user.id }
      // }).then(user => {
      //   // console.log("User",user);
      //   let newuser = false;
      //   if (!user) {
      //     newuser = true;
      //   } else {
      //     Trips.update({
      //       is_new: false,
      //     }, {
      //         where: { user_id: req.session.user.id }
      //       }).then(update_trip => {
      //         console.log("updated");
      //       })
      //   }
      // console.log("new user", newuser)
      createCourier(req.body, from_date, to_date, req, function (err, courier_resp) {
        // console.log("respc", courier_resp);
        createAssistance(req.body, from_date, to_date, req, function (err, assistance_resp) {
          // console.log("respa", assistance_resp);
          createCompanion(req.body, from_date, to_date, req, function (err, companion_resp) {
            if (err) {
              next(err);
            }
            else {
              let tripids = [];
              if (courier_resp.trip_id) {
                tripids.push(courier_resp.trip_id);
              }
              if (assistance_resp.trip_id) {
                tripids.push(assistance_resp.trip_id);
              }
              if (companion_resp.trip_id) {
                tripids.push(companion_resp.trip_id);
              }
              // tripids.push(courier_resp.trip_id, assistance_resp.trip_id, companion_resp.trip_id);
              // console.log("tripidsssssssssssssss",tripids);
              let type = 'courier';
              if (req.body.is_courier) {
                type = 'courier';
              } else if (req.body.is_assistance) {
                type = 'assistance';
              } else {
                type = 'companion';
              }
              TripService.create({
                user_id: req.session.user.id,
                trip_ids: tripids.toString(),
              }).then(tripservice => {
                Trips.update({
                  service_log_id: tripservice.dataValues['id'],
                },
                  {
                    where: { id: { [Op.in]: tripids } }
                  }).then(trip => {
                    res.send({ 'status': 'ok', msg: 'successfully created', type: type });
                  });
              }).catch(error => { next(error); });
            }
          });
        });
      });
      // }).catch(error => { next(error); });
    }
  },

  updateTrip(req, res, next) {
    // console.log("create trips", req.body);
    if (typeof req.session.user !== 'undefined') {

      let from_date = moment(req.body.from_date).format('YYYY-MM-DD HH:mm:ss');
      let to_date = moment(req.body.to_date).format('YYYY-MM-DD HH:mm:ss')

      return Trips.update({
        trip_name: req.body.trip_name,
        mode: req.body.mode,
        departure: req.body.departure,
        destination: req.body.destination,
        trip_plan: req.body.trip_plan,
        from_date: from_date,
        to_date: to_date,
        type: req.body.type,
        currency_code: req.body.currency_code,
        currency_symbol: req.body.currency_symbol,
        courier_budget: req.body.courier_budget,
        assistance_budget: req.body.assistance_budget,
        weight_unit: req.body.weight_unit,
        weight: req.body.weight,
        balance_weight: req.body.weight,
        payment_mode: req.body.payment_mode,
        description: req.body.description,
        perks_id: req.body.perks,
      }, {
          where: { id: req.body.id }
        }).then(trip => {
          // console.log("trip", trip);
          res.send({ 'status': 'ok', msg: 'successfully updated', trip: trip });
        }).catch(error => { next(error); });
    }
  },

  updateServiceTrip(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      console.log("Yes here  ----------------------------")
      let from_date = moment(req.body.from_date).format('YYYY-MM-DD HH:mm:ss');
      let to_date = moment(req.body.to_date).format('YYYY-MM-DD HH:mm:ss');
      let trip_service = req.body.trip_id_with_type;
      let courierSelected = req.body.is_courier;
      let assistanceSelected = req.body.is_assistance;
      let companionSelected = req.body.is_companion;
      let courierAction = 'create';
      let assistanceAction = 'create';
      let companionAction = 'create';
      let courier_id;
      let assistance_id;
      let companion_id;
      let val = [];
      var courier_result = trip_service.map(function (list) {
        // console.log("list", list);
        console.log("courierAction", courierAction)
        // if (list.trip_type == 'courier' || courierSelected == true) {
        // if (courierSelected == true) {

        console.log("Yes here  also ----------Courier------------------");

        courier_id = list.id;
        if (list.trip_type == 'courier' && list.action) {
          console.log('99999999999999999999');
          courierAction = list.action;
          return updateCourier(req.body, courierSelected, courier_id, courierAction, from_date, to_date, req)
        }
        // }       

      });

      var assistance_result = trip_service.map(function (list) {
        // if ( assistanceSelected == true) {
        console.log("Yes here  also ----------Assistance------------------");
        assistance_id = list.id;
        console.log('assisssssssssss@@@@@@@2', list);
        if (list.trip_type == 'assistance' && list.action) {
          assistanceAction = list.action;
          console.log("updae assistance going");
          return updateAssistance(req.body, assistanceSelected, assistance_id, assistanceAction, from_date, to_date, req)
        }
        // }
      });
      var companion_result = trip_service.map(function (list) {
        // if (companionSelected == true){
        console.log("Yes here  also ------------Companion----------------");
        companion_id = list.id;
        if (list.trip_type == 'companion' && list.action) {
          companionAction = list.action;
          return updateCompanion(req.body, companionSelected, companion_id, companionAction, from_date, to_date, req);
        }
        // }
      });

      Promise.all([courier_result, assistance_result, companion_result]).then(function (values) {
        // Promise.all(courier_result).then(function (values) {

        console.log("After all updated>>>>", values);
        res.send({ 'status': 'ok', msg: 'successfully updated' });
      });
      // res.send({ 'status': 'ok', msg: 'successfully updated'});
    }
  },


  getAllPerks(req, res, next) {
    // console.log("req setting", req.body);
    if (typeof req.session.user !== 'undefined') {
      return Perks.findAll().then(perks => {
        res.send({ 'status': 'ok', perks: perks });
      }).catch(error => { next(error); });
    }
  },

  getAllTrips(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      // console.log("session", req.session.user.id);
      return Trips.findAll({
        where: { user_id: { [Op.ne]: req.session.user.id } },
        order: [['id', 'DESC']],
      }).then(trips => {
        // console.log("trips",trips);
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); });

    }
  },

  getTripsByServiceLogId(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      return Trips.findAll({
        where: { service_log_id: req.query.serviceLogId },
      }).then(trips => {
        // console.log("trips",trips);
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); });
    }
  },

  getTripById(req, res, next) {
    if (typeof req.session.user !== 'undefined') {


      var sql_query_currency = "SELECT c.* FROM `users` u join currency c on u.currency_id=c.id WHERE u.id= '" + req.session.user.id + "'";
      db.sequelize.query(sql_query_currency).then(currency_result => {
        var tripId = req.query.tripId;
        return Trips.findOne({
          where: { id: tripId },
          include: [
            {
              model: Travel_Modes,
            },
            {
              model: Currency,
            },
            {
              model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
              include: [
                { model: Profiles },
                { model: Settings },
              ]
            },
            {
              model: Favorites,
              where: { trip_id: tripId, user_id: req.session.user.id },
              required: false
            },

            // {
            //   model: Invites,
            //   where: { trip_id: tripId, user_id: req.session.user.id },
            //   required: false
            // },

            {
              model: Invites,
              where: {
                trip_id: tripId,
                [Op.or]: [
                  {
                    from_user_id: req.session.user.id
                  },
                  {
                    to_user_id: req.session.user.id
                  }
                ]
              },
              required: false
            },

          ]
        }).then(trips => {
          res.send({ 'status': 'ok', currency_result: currency_result[0], trips: trips });
        }).catch(error => { next(error); });
      });
    }
  },

  getTripEditById(req, res, next) {
    // console.log("edit_trip", req.query.tripIds);
    let tripids = [];
    // console.log("edit_trip", tripids);
    if (typeof req.session.user !== 'undefined') {
      // console.log("session", req.session.user.id);
      return Trips.findAll({
        where: { id: { [Op.in]: req.query.tripIds.split(',') } },
        include: [
          {
            model: Invites, attributes: ['trip_id'],
          },
        ]
      }).then(trips => {
        //   console.log("edit__--__trips",trips);
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); });

    }
  },

  getServiceByTripId(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      var serviceId = req.query.serviceId;
      return TripService.findOne({
        where: { id: serviceId }
      }).then(serviceTrip => {
        let serviceTripType = [];
        if (serviceTrip) {
          let service_trip_id = serviceTrip.trip_ids.split(',')
          // console.log("service_trip_id", service_trip_id)
          service_trip_id = service_trip_id.filter(v => v != '');
          console.log("service_trip_id after space split", service_trip_id)
          async.forEach(service_trip_id, function (services, callback) {
            if (services) {
              Trips.findOne({
                where: { id: services }
              }).then(trips => {
                // console.log('trips view lists', trips);
                if (trips) {
                  serviceTripType.push({ id: trips.dataValues.id, trip_type: trips.dataValues.type, action: 'update' })
                }
                callback();
              }).catch(error => { next(error); });
            }
          },
            function (err) {
              res.send({ 'status': 'ok', serviceTrip: serviceTrip, serviceTripType: serviceTripType });
            })
          console.log("service_trip_id>>", serviceTripType);


        } else {
          res.send({ 'status': 'nodata' });
        }
      })
    }
  },

  getTripByNotification(req, res, next) {
    if (typeof req.session.user !== 'undefined') {


      var sql_query_currency = "SELECT c.* FROM `users` u join currency c on u.currency_id=c.id WHERE u.id= '" + req.session.user.id + "'";
      db.sequelize.query(sql_query_currency).then(currency_result => {

        return Notifications.findOne({
          where: { id: req.query.notification_id },
          order: [['id', 'DESC']],
          include: [
            {
              model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
              include: [{ model: Profiles }, { model: Settings }]
            },
            {
              model: Trips,
              include: [
                {
                  model: Travel_Modes,
                },
                {
                  model: Currency,
                },
                {
                  model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                  include: [{ model: Profiles }, { model: Settings }]
                },
              ],
            },
          ]
        }).then(notificationdata => {
          // console.log('notificationdata', notificationdata);
          Notifications.findOne({
            where: {
              is_archived: 0,
              trip_id: notificationdata.trip_id,
              [Op.or]: [
                {
                  from_user_id: notificationdata.from_user_id,
                  to_user_id: notificationdata.to_user_id
                },
                {
                  from_user_id: notificationdata.to_user_id,
                  to_user_id: notificationdata.from_user_id
                }
              ]
            }
          }).then(updatednotification => {
            // console.log('updatednotification', updatednotification);
            notificationdata.request_status = updatednotification.dataValues.request_status;

            if (notificationdata.request_type == 'courier') {
              CourierRequestors.findOne({
                where: { id: notificationdata.request_id },
                order: [['id', 'DESC']],
                include: [
                  {
                    model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                  },
                ]
              }).then(courier_reqdata => {
                res.send({ 'status': 'ok', currency_result: currency_result[0], tripnotification: notificationdata, requestdata: courier_reqdata });
              })
            } else if (notificationdata.request_type == 'assistance') {
              AssistantRequestors.findOne({
                where: { id: notificationdata.request_id },
                order: [['id', 'DESC']],
                include: [
                  {
                    model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                  },
                ]
              }).then(assistance_reqdata => {
                res.send({ 'status': 'ok', currency_result: currency_result[0], tripnotification: notificationdata, requestdata: assistance_reqdata });
              })
            } else if (notificationdata.request_type == 'companion') {
              CompanionRequestors.findOne({
                where: { id: notificationdata.request_id },
                order: [['id', 'DESC']],
                include: [
                  {
                    model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                  },
                ]
              }).then(companion_reqdata => {
                res.send({ 'status': 'ok', currency_result: currency_result[0], tripnotification: notificationdata, requestdata: companion_reqdata });
              })
            }
            else {
              res.send({ 'status': 'ok', currency_result: currency_result[0], tripnotification: notificationdata });
            }
          })
        })
      });
    }
  },

  getUserDetailsByTripsLimit(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      // console.log("session OrderBy", req.session.user.id, req.query.user_id);
      return Users.findOne({
        attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status', "reduced_ratings"],
        where: { id: req.query.user_id },

        include: [
          {
            model: Trips,
            limit: 3,
            order: [['id', 'desc']]
          },
          { model: Profiles },
          { model: Settings },
        ],
      }).then(trips => {
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); });

    }
  },

  getUserDetailsByTrips(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      // console.log("session OrderBy", req.session.user.id, req.query.user_id);
      return Users.findOne({
        attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
        where: { id: req.query.user_id },
        include: [
          {
            model: Trips,
            // order: [['id', 'desc']]
          },
          { model: Profiles },
          // {model: Settings},
        ],
        order: [[{ model: Trips }, 'id', 'desc']],

      }).then(trips => {
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); });

    }
  },

  getAllUserInvitesCountByTrips(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      return Invites.findAll({
        where: { to_user_id: req.query.user_id },
        attributes: ['trip_id', [Sequelize.fn('count', Sequelize.col('trip_id')), 'count']],
        group: ['Invites.trip_id'],
        raw: true,
        include: [
          {
            model: Trips,
            where: { status: 'active' },
          }
        ],
        // order:[[{ model: Trips},  'count', 'desc']],
      }).then(trips => {
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); })
    }
  },

  /****************Search*************** */

  getAllTripsBySearch(req, res, next) {
    let trip_plan = 'unplanned';

    if (typeof req.session.user !== 'undefined') {
      // var sql_query = "SELECT tr.id as trip_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan, tr.from_date, tr.to_date, tr.type, tr.currency_code,  tr.courier_budget, tr.weight, tr.description, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' where tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "' and tr.from_date >= '" + req.body.start + "' and tr.to_date <='" + req.body.end + "'";

      var sql_query_currency = "SELECT c.* FROM `users` u join currency c on u.currency_id=c.id WHERE u.id= '" + req.session.user.id + "'";
      db.sequelize.query(sql_query_currency).then(currency_result => {
        var sql_query = '';
        if (req.body.selectedDuration == 'custom' && req.body.mode != '') {

          var sql_query = "SELECT crr.currency_rate,tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days,tr.trip_unplanned_days, tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget,tr.courier_budget, tr.weight_unit, tr.weight, cr.code, tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN settings on usr.id = settings.user_id LEFT JOIN currency cr on cr.code = tr.currency_code LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id LEFT JOIN currency crr ON tr.currency_code=crr.code where tr.balance_weight!='0' and tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "'  and  DATE(tr.from_date) >= '" + req.body.start + "' and DATE(tr.to_date) <='" + req.body.end + "'";
        }
        else if (req.body.mode == '' && req.body.any_time) {
          // var sql_query = "SELECT tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days,  tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget, tr.courier_budget, tr.weight_unit,tr.weight,tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified,usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id INNER JOIN settings on usr.id = settings.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id  where tr.status='active' and tr.user_id != '" + req.session.user.id + "' and  (tr.mode = '7' OR tr.mode = '6' OR tr.mode = '5' OR tr.mode = '4' OR tr.mode = '3' OR tr.mode = '2' OR tr.mode = '1') and (tr.from_date >= '" + req.body.start + "' OR tr.trip_plan = 'unplanned')";

          var sql_query = "SELECT crr.currency_rate, tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days, tr.trip_unplanned_days, tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget, tr.courier_budget, tr.weight_unit,tr.weight, cr.code, tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified,usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id INNER JOIN settings on usr.id = settings.user_id LEFT JOIN currency cr on cr.code = tr.currency_code LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id LEFT JOIN currency crr ON tr.currency_code=crr.code where tr.balance_weight!='0' and tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode in (1,2,3,4,5,6) and (DATE(tr.from_date) >= '" + req.body.start + "' OR tr.trip_plan = 'unplanned')";
        }
        else if (req.body.selectedDuration == 'custom' && req.body.mode == '' && !req.body.any_time) {

          var sql_query = "SELECT crr.currency_rate,tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days, tr.trip_unplanned_days,tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget,tr.courier_budget, tr.weight_unit, tr.weight, cr.code, tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN settings on usr.id = settings.user_id LEFT JOIN currency cr on cr.code = tr.currency_code LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id LEFT JOIN currency crr ON tr.currency_code=crr.code where tr.balance_weight!='0' and tr.status='active' and tr.user_id != '" + req.session.user.id + "'   and  DATE(tr.from_date) >= '" + req.body.start + "' and DATE(tr.to_date) <='" + req.body.end + "'";
        }
        else if (req.body.mode == '' && !req.body.any_time) {
          // var sql_query = "SELECT tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days,  tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget, tr.courier_budget, tr.weight_unit,tr.weight,tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified,usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id INNER JOIN settings on usr.id = settings.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id  where tr.status='active' and tr.user_id != '" + req.session.user.id + "' and  (tr.mode = '7' OR tr.mode = '6' OR tr.mode = '5' OR tr.mode = '4' OR tr.mode = '3' OR tr.mode = '2' OR tr.mode = '1') and (tr.from_date >= '" + req.body.start + "' OR tr.trip_plan = 'unplanned')";

          var sql_query = "SELECT crr.currency_rate, tr.id as trip_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days,tr.trip_unplanned_days, tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.courier_budget, tr.weight_unit, tr.weight, tr.balance_weight, tr.payment_mode, tr.description, tr.is_new,tr.trip_status, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, cr.code, usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN settings on usr.id = settings.user_id LEFT JOIN currency cr on cr.code = tr.currency_code LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id LEFT JOIN currency crr ON tr.currency_code=crr.code where tr.balance_weight!='0' and tr.status='active' and tr.user_id != '" + req.session.user.id + "' and (tr.unplanned_days in ('" + req.body.selectedDuration + "') OR (DATE(tr.from_date) >= '" + req.body.start + "' and DATE(tr.to_date) <='" + req.body.end + "')) and DATEDIFF(DATE(tr.to_date), DATE(tr.from_date)) <= '" + req.body.selectedDuration + "'";

        }
        else if ((req.body.selectedDuration == '' && req.body.any_time) || req.body.any_time) {
          // var sql_query = "SELECT tr.id as trip_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days,  tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget, tr.courier_budget, tr.weight_unit,tr.weight, tr.payment_mode, tr.description, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified,usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id INNER JOIN settings on usr.id = settings.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id  where tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "' and (tr.from_date >= '" + req.body.start + "')";
          console.log('----------------------', req.body.end);

          var sql_query = "SELECT crr.currency_rate,tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days,tr.trip_unplanned_days,  tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget, tr.courier_budget, tr.weight_unit,tr.weight, cr.code, tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified,usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id INNER JOIN settings on usr.id = settings.user_id LEFT JOIN currency cr on cr.code = tr.currency_code LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id LEFT JOIN currency crr ON tr.currency_code=crr.code where tr.balance_weight!='0' and tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "' and (DATE(tr.from_date) >= '" + req.body.start + "' OR (tr.unplanned_days = '30' OR tr.unplanned_days = '60' OR tr.unplanned_days = '15' OR tr.unplanned_days = '7' ))";
        }
        else {
          // var sql_query = "SELECT tr.id as trip_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days, tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.courier_budget, tr.weight, tr.payment_mode, tr.description, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN settings on usr.id = settings.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id  where tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "' and (tr.unplanned_days ='" + req.body.selectedDuration + "' OR (DATE(tr.from_date) BETWEEN '" + req.body.start + "' and '" + req.body.end + "' and DATE(tr.to_date) BETWEEN '" + req.body.start + "' and '" + req.body.end + "'))";

          var sql_query = "SELECT crr.currency_rate, tr.id as trip_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days, tr.trip_unplanned_days,tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.courier_budget, tr.weight_unit, tr.weight, tr.balance_weight, tr.payment_mode, tr.description, tr.is_new,tr.trip_status, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, cr.code, usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN settings on usr.id = settings.user_id LEFT JOIN currency cr on cr.code = tr.currency_code LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id LEFT JOIN currency crr ON tr.currency_code=crr.code where tr.balance_weight!='0' and tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "' and (tr.unplanned_days in ('" + req.body.selectedDuration + "') OR (DATE(tr.from_date) >= '" + req.body.start + "' and DATE(tr.to_date) <='" + req.body.end + "')) and DATEDIFF(DATE(tr.to_date), DATE(tr.from_date)) <= '" + req.body.selectedDuration + "'";

          // var sql_query = "SELECT tr.id as trip_id, tr.service_log_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan,  tr.unplanned_days, tr.from_date, tr.to_date, tr.type, tr.currency_symbol, tr.currency_code, tr.assistance_budget,tr.courier_budget, tr.weight_unit, tr.weight,tr.balance_weight, tr.payment_mode, tr.description,tr.trip_status, tr.is_new, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, usr.is_social_verified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id, ivt.id as invite_id, ivt.user_id as ivt_user_id, ivt.from_user_id as ivt_from_user_id, ivt.to_user_id as ivt_to_user_id, ivt.status as ivt_status, ivt.request_id, ivt.request_type, ivt.updated_at as invite_updated_at FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id LEFT JOIN settings on usr.id = settings.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id  Left Join invites ivt on ivt.user_id = '" + req.session.user.id + "' and ivt.trip_id = tr.id  where tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "'  and (tr.unplanned_days ='" + req.body.selectedDuration + "' OR (tr.from_date >= '" + req.body.start + "' and tr.to_date <='" + req.body.end + "'))";

        }

        // let from_date_start = moment(req.body.start).format('YYYY-MM-DD 00:00:00');
        // let from_date_end = moment(req.body.start).format('YYYY-MM-DD 23:59:59');
        // let to_date_start = moment(req.body.end).format('YYYY-MM-DD 00:00:00');
        // let to_date_end = moment(req.body.end).format('YYYY-MM-DD 23:59:59');

        // var sql_query = "SELECT tr.id as trip_id, tr.user_id, tr.perks_id, tr.trip_name, tr.mode, tm.mode_name, tm.image, tr.departure, tr.destination, tr.trip_plan, tr.from_date, tr.to_date, tr.type, tr.currency_code,  tr.courier_budget, tr.weight, tr.description, tr.created_at, tr.updated_at, sr.from_user_id, sr.to_user_id, sr.status, usr.name, usr.email, usr.is_kyc_verified, usr.isVerified, prof.first_name, prof.last_name, prof.languages, prof.profile_picture, prof.cover_picture, settings.to_everyone, settings.only_to_connections, settings.profile_image_show, settings.on_new_requests,settings.on_new_messages, settings.on_new_comments, fav.user_id as fav_user_id , fav.trip_id as fav_trip_id FROM trips tr INNER JOIN travel_modes tm on tm.id = tr.mode INNER JOIN users usr on usr.id = tr.user_id INNER JOIN profiles prof on usr.id = prof.user_id INNER JOIN settings on usr.id = settings.user_id LEFT JOIN invites sr on sr.trip_id = tr.id and sr.user_id = '" + req.session.user.id + "' Left Join favorites fav on fav.user_id = '" + req.session.user.id + "' and fav.trip_id = tr.id where tr.status='active' and tr.user_id != '" + req.session.user.id + "' and tr.mode = '" + req.body.mode + "' and (tr.from_date BETWEEN '" + from_date_start + "' and '" + from_date_end + "' and tr.to_date BETWEEN '" + to_date_start + "' and '" + to_date_end + "')";



        if (req.body.departure != null && req.body.departure != '') {
          sql_query += " and tr.departure LIKE '%" + req.body.departure + "%'";
        }

        if (req.body.destination != null && req.body.destination != '') {
          sql_query += " and tr.destination LIKE '%" + req.body.destination + "%'";
        }

        if (req.body.type != null && req.body.type != '') {
          sql_query += " and tr.type = '" + req.body.type + "'";
        }

        if (req.body.language != null && req.body.language != '') {
          sql_query += " and prof.languages LIKE '%" + req.body.language + "%'"
        }

        if (req.body.confirmed_types) {
          trip_plan = 'planned'
          sql_query += " and tr.trip_plan LIKE '" + trip_plan + "%'"
        }

        if (req.body.id_verified) {
          sql_query += " and usr.is_kyc_verified = " + req.body.id_verified;
        }

        if (req.body.social_verified) {
          sql_query += " and usr.is_social_verified = " + req.body.social_verified;
        }

        if (req.body.any_time) {

        }

        sql_query += " ORDER BY trip_id DESC";

        db.sequelize.query(sql_query).then(result_count => {
          var result_count = result_count[0];

          var exact_sql_query = sql_query;
          exact_sql_query += " LIMIT 6 OFFSET " + req.body.offset;

          db.sequelize.query(exact_sql_query).then(result => {
            var result = result[0];
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
                async.forEach(result, function (rslt) {
                  rslt.can_show_profile = false;
                  rslt.can_show_msg = false;
                  async.forEach(ires, function (irst) {
                    if ((irst.from_user_id == rslt.user_id && irst.to_user_id == req.session.user.id) ||
                      (irst.from_user_id == req.session.user.id && irst.to_user_id == rslt.user_id)) {
                      if (irst.status == 'accepted' || irst.status == 'paid') {
                        rslt.can_show_profile = true;
                      }
                      if (irst.status == 'paid') {
                        rslt.can_show_msg = true;
                      }
                    }
                  })
                });

                Comments.findAll({
                  order: [['created_at', 'DESC']],
                  include: [
                    {
                      model: Users,
                      attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                      include: [{
                        model: Profiles,
                      }]
                    }
                  ]
                }).then(cmnts => {
                  if (cmnts) {
                    var reply_msg_lists = [];

                    async.forEach(cmnts, function (cmnt) {
                      if (cmnt.is_reply_msg == 1) {
                        reply_msg_lists.push(cmnt);
                      }
                    });

                    // console.log('reply_msg_lists', reply_msg_lists);
                    var comment_lists = [];

                    if (reply_msg_lists.length > 0) {
                      var group_by_lists = groupBy(reply_msg_lists, 'reply_to_msg_id', 'msg_id', 'data');
                    }

                    async.forEach(cmnts, function (cmnt) {
                      if (cmnt.is_reply_msg == 0) {
                        var reply_msgs = [];

                        async.forEach(group_by_lists, function (glist) {
                          if (glist.msg_id == cmnt.id) {
                            reply_msgs = glist.data
                          }
                        })

                        comment_lists.push({
                          id: cmnt.id,
                          user_id: cmnt.user_id,
                          comment: cmnt.comment,
                          trip_id: cmnt.trip_id,
                          is_reply_msg: cmnt.is_reply_msg,
                          reply_to_msg_id: cmnt.reply_to_msg_id,
                          is_liked: cmnt.is_liked,
                          created_at: cmnt.created_at,
                          reply_datas: reply_msgs,
                          User: cmnt.User
                        })
                      }
                    });

                    var comments_by_trips = groupBy(comment_lists, 'trip_id', 'trip_id', 'data');
                    var result_lists = [];
                    async.forEach(result, function (reslt) {
                      if (comments_by_trips.some(trip => trip.trip_id == reslt.trip_id)) {
                        async.forEach(comments_by_trips, function (ctrip) {
                          if (ctrip.trip_id == reslt.trip_id) {
                            result_lists.push({
                              comments: ctrip.data,
                              trip: reslt
                            })
                          }
                        })
                      }
                      else {
                        result_lists.push({
                          comments: [],
                          trip: reslt
                        })
                      }
                    })
                    res.send({ 'status': 'ok', currency_result: currency_result[0], result_count: result_count, trips: result, result_lists: result_lists });
                    // res.send({ 'status': 'ok', comments: comment_lists });
                  }
                })
              }
              else {
                Comments.findAll({
                  order: [['created_at', 'DESC']],
                  include: [
                    {
                      model: Users,
                      attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                      include: [{
                        model: Profiles,
                      }]
                    }
                  ]
                }).then(cmnts => {
                  if (cmnts) {
                    var reply_msg_lists = [];

                    async.forEach(cmnts, function (cmnt) {
                      if (cmnt.is_reply_msg == 1) {
                        reply_msg_lists.push(cmnt);
                      }
                    });

                    // console.log('reply_msg_lists', reply_msg_lists);
                    var comment_lists = [];

                    if (reply_msg_lists.length > 0) {
                      var group_by_lists = groupBy(reply_msg_lists, 'reply_to_msg_id', 'msg_id', 'data');
                    }

                    async.forEach(cmnts, function (cmnt) {
                      if (cmnt.is_reply_msg == 0) {
                        var reply_msgs = [];

                        async.forEach(group_by_lists, function (glist) {
                          if (glist.msg_id == cmnt.id) {
                            reply_msgs = glist.data
                          }
                        })

                        comment_lists.push({
                          id: cmnt.id,
                          user_id: cmnt.user_id,
                          comment: cmnt.comment,
                          trip_id: cmnt.trip_id,
                          is_reply_msg: cmnt.is_reply_msg,
                          reply_to_msg_id: cmnt.reply_to_msg_id,
                          is_liked: cmnt.is_liked,
                          created_at: cmnt.created_at,
                          reply_datas: reply_msgs,
                          User: cmnt.User
                        })
                      }
                    });

                    var comments_by_trips = groupBy(comment_lists, 'trip_id', 'trip_id', 'data');
                    var result_lists = [];
                    async.forEach(result, function (reslt) {
                      if (comments_by_trips.some(trip => trip.trip_id == reslt.trip_id)) {
                        async.forEach(comments_by_trips, function (ctrip) {
                          if (ctrip.trip_id == reslt.trip_id) {
                            result_lists.push({
                              comments: ctrip.data,
                              trip: reslt
                            })
                          }
                        })
                      }
                      else {
                        result_lists.push({
                          comments: [],
                          trip: reslt
                        })
                      }
                    })
                    res.send({ 'status': 'ok', currency_result: currency_result[0], result_count: result_count, trips: result, result_lists: result_lists });
                    // res.send({ 'status': 'ok', comments: comment_lists });
                  }
                })
              }
            })
          });
          // async.forEach(result, function(reslt) {
          //   reslt.checkvalue = true;
          // })


          // console.log("result",result)
          // res.send({ 'status': 'ok', trips: result });
        })

      });
    }
  },

  /****************** My Trips ********************/

  getMyTrips(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      return Trips.findAll({
        attributes: ['id', 'user_id', 'trip_name', 'departure', 'destination', 'from_date', 'to_date',
          'trip_plan', 'unplanned_days', 'type', 'balance_weight', 'weight', 'service_log_id', 'trip_status'],
        where: {
          user_id: req.session.user.id,
          type: req.query.type,
          status: 'active',
        },
        order: [['id', 'DESC']],
        include: [
          {
            model: Invites,
          }],
      }).then(mytrips => {
        res.send({ 'status': 'ok', mytrips: mytrips });
      }).catch(error => { next(error); });
    }
  },


  /****************** Request **********************/
  getAllIncomingRequestByTrips(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      return Invites.findAll({
        where: {
          to_user_id: req.session.user.id,
          status: { [Op.ne]: 'disconnect' }
        },
        order: [['id', 'DESC']],
        include: [
          {
            model: Trips,
            attributes: ['id', 'user_id', 'trip_name', 'departure', 'destination', 'from_date', 'to_date', 'trip_plan',
              'unplanned_days', 'type', 'currency_symbol', 'assistance_budget', 'courier_budget', 'balance_weight', 'weight', 'weight_unit', 'payment_mode','trip_status'],
            where: { type: req.query.type, status: 'active', }
          },
          {
            model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
            include: [
              {
                model: Profiles,
                attributes: ['id', 'user_id', 'profile_picture']
              },
              { model: Settings },
            ]
          },
        ]
      }).then(trips => {
        // console.log("trips", trips);
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

          let courier_request_ids = [];
          let assistance_request_ids = [];
          let companion_request_ids = [];
          async.forEach(trips, function (trip) {

            trip.can_show_profile = false;
            trip.can_show_msg = false;
            async.forEach(ires, function (irst) {
              if ((irst.from_user_id == trip.user_id && irst.to_user_id == req.session.user.id) ||
                (irst.from_user_id == req.session.user.id && irst.to_user_id == trip.user_id)) {
                if (irst.status == 'accepted' || irst.status == 'paid' || irst.status == 'delivered') {
                  trip.dataValues.can_show_profile = true;
                }
                if (irst.status == 'paid' || irst.status == 'delivered') {
                  trip.dataValues.can_show_msg = true;
                }
              }
            })

            if (trip.request_type == 'courier') {
              // var ids = trip.request_id.split(',');
              var ids = trip.request_id;
              // for (var i = 0; i < ids.length; i++) {
              courier_request_ids.push(ids);
              // }
            }
            else if (trip.request_type == 'assistance') {
              // var ids = trip.request_id.split(',');
              var ids = trip.request_id;
              // for (var i = 0; i < ids.length; i++) {
              assistance_request_ids.push(ids);
              // }
            }
            else if (trip.request_type == 'companion') {
              if (trip.request_id) {
                // var ids = trip.request_id.split(',');
                var ids = trip.request_id;
                // for (var i = 0; i < ids.length; i++) {
                companion_request_ids.push(ids);
                // }
              }
            }
          });

          CourierRequestors.findAll({
            where: { id: { [Op.in]: courier_request_ids } }
          }).then(cdata => {
            AssistantRequestors.findAll({
              where: { id: { [Op.in]: assistance_request_ids } }
            }).then(adata => {
              CompanionRequestors.findAll({
                where: { id: { [Op.in]: companion_request_ids } }
              }).then(comdata => {
                var groupByUserId = groupBy(trips, 'trip_id', 'id', 'data');

                res.send({ 'status': 'ok', trips: groupByUserId, courierdata: cdata, assistantdata: adata, companiondata: comdata });
              })
            })
          })
        });
      }).catch(error => { next(error); })
    }
  },

  getAllInvitesByTrips(req, res, next) {
    // console.log("getAllInvitesByTrips", req.query.type);
    if (typeof req.session.user !== 'undefined') {
      return Invites.findAll({
        where: { from_user_id: req.session.user.id, status: { [Op.ne]: 'disconnect' } },
        order: [['id', 'DESC']],
        include: [
          {
            model: Trips,
            attributes: ['id', 'user_id', 'trip_name', 'departure', 'destination', 'from_date', 'to_date',
              'trip_plan', 'unplanned_days', 'type', 'balance_weight', 'weight'],
            where: { type: req.query.type, status: 'active', user_id: { [Op.ne]: req.session.user.id } },
            include: [
              {
                model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'],
                include: [
                  // { model: Profiles },
                ]
              }
            ]
          }
        ]
      }).then(trips => {
        res.send({ 'status': 'ok', trips: trips });
      }).catch(error => { next(error); })
    }
  },

  invitesToTrip(req, res, next) {
    console.log('req.body.weight_courier', req.body);
    // console.log('req.body.session', req.session.user.id); 
    // console.log("req.body.request_courier_weight", typeof(req.body.request_courier_weight));
    if (typeof req.session.user !== 'undefined') {
      Invites.create({
        user_id: req.session.user.id,
        from_user_id: req.session.user.id,
        to_user_id: req.body.to_user_id,
        trip_id: req.body.trip_id,
        status: req.body.status,
        request_id: req.body.request_id,
        request_type: req.body.request_type,
        requestor_message: req.body.message,
        service_log_id: req.body.service_log_id
      }).then(invites => {

        if (invites) {
          Notifications.create({
            from_user_id: req.session.user.id,
            to_user_id: req.body.to_user_id,
            trip_id: req.body.trip_id,
            request_id: req.body.request_id,
            request_type: req.body.request_type,
            request_status: req.body.status,
            request_courier_weight: req.body.request_courier_weight,
            request_members: req.body.request_members
          }).then(notifyRes => {
            if (req.body.request_type == 'courier') {
              CourierRequestors.update({
                // assigned_trip_id: req.body.trip_id,  
                assigned_trip_id: null,

              }, {
                  where: { id: req.body.request_id }
                }).then(reqresult => {
                  res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                })
            }
            else if (req.body.request_type == 'assistance') {
              AssistantRequestors.update({
                assigned_trip_id: null
              }, {
                  where: { id: req.body.request_id }
                }).then(reqresult => {
                  res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                })
            }
            else {
              res.send({ 'status': "ok", msg: "Request sent sucessfully" });
            }
          })
        }
      }).catch(error => { next(error); });
    }
  },

  invitesUnplannedToTrip(req, res, next) {
    // console.log('req.body_unplanned', req.body);
    if (typeof req.session.user !== 'undefined') {
      Invites.create({
        user_id: req.session.user.id,
        from_user_id: req.session.user.id,
        to_user_id: req.body.to_user_id,
        trip_id: req.body.trip_id,
        status: req.body.status,
        request_id: req.body.request_id,
        request_type: req.body.request_type,
        requestor_message: req.body.message
      }).then(invites => {

        if (invites) {
          Notifications.create({
            from_user_id: req.session.user.id,
            to_user_id: req.body.to_user_id,
            trip_id: req.body.trip_id,
            request_id: req.body.request_id,
            request_type: req.body.request_type,
            request_status: req.body.status,
            request_courier_weight: req.body.request_courier_weight,
            request_members: req.body.request_members
          }).then(notifyRes => {
            if (req.body.request_type == 'courier') {
              CourierRequestors.update({
                // assigned_trip_id: req.body.trip_id,
                assigned_trip_id: null,
                from_date: req.body.from_date,
                to_date: req.body.to_date,
              }, {
                  where: { id: req.body.request_id }
                }).then(reqresult => {
                  res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                })
            }
            else if (req.body.request_type == 'assistance') {
              AssistantRequestors.update({
                assigned_trip_id: null,
                from_date: req.body.from_date,
                to_date: req.body.to_date
              }, {
                  where: { id: req.body.request_id }
                }).then(reqresult => {
                  res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                })
            }
            else {
              res.send({ 'status': "ok", msg: "Request sent sucessfully" });
            }
          })
        }
      }).catch(error => { next(error); });
    }
  },

  getIsDisConnected(req, res, next) {
    console.log("getIsDisConnected", req.body);
    if (typeof req.session.user !== 'undefined') {
      Invites.update({
        is_disconnect: '1',
        status: 'disconnect',
        updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      },
        {
          where: {
            from_user_id: req.body.from_user_id,
            to_user_id: req.body.to_user_id,
            trip_id: req.body.trip_id
          }
        }).then(invites => {
          Notifications.update({
            is_disconnect: '1',
            request_status: 'disconnect',
            updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          }, {
              where: {
                from_user_id: req.body.from_user_id,
                to_user_id: req.body.to_user_id,
                trip_id: req.body.trip_id
              }
            }).then(invites => {
              Notifications.update({
                is_disconnect: '1',
                request_status: 'disconnect',
                updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
              }, {
                  where: {
                    from_user_id: req.body.to_user_id,
                    to_user_id: req.body.from_user_id,
                    trip_id: req.body.trip_id
                  }
                })
            }).then(invites => {
              Trips.update({
                trip_plan: 'unplanned',
                unplanned_days: req.body.trip_unplanned_days,
                updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                from_date : req.body.created_from_date,
                to_date : req.body.created_to_date
              },
                {
                  where: {
                    trip_id: req.body.trip_id
                  }
                })
            })
        }).catch(error => { next(error); });
    }
  },

  updateTripInviteStatus(req, res, next) {
    // console.log("req.body", req.body);
    if (typeof req.session.user !== 'undefined') {
      Invites.update({
        user_id: req.body.user_id,
        from_user_id: req.body.from_user_id,
        to_user_id: req.body.to_user_id,
        trip_id: req.body.trip_id,
        status: req.body.status,
        package_status: req.body.package_status,
        updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      },
        {
          where: {
            from_user_id: req.body.from_user_id,
            to_user_id: req.body.to_user_id,
            trip_id: req.body.trip_id
          }
        }).then(invites => {
          Notifications.update({
            is_archived: true,
            // request_status: req.body.status,
            package_status: req.body.package_status,
            updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          }, {
              where: {
                from_user_id: req.body.from_user_id,
                to_user_id: req.body.to_user_id,
                trip_id: req.body.trip_id
              }
            }).then(destroyRes => {
              Notifications.create({
                to_user_id: req.body.from_user_id,
                from_user_id: req.body.to_user_id,
                trip_id: req.body.trip_id,
                request_id: req.body.request_id,
                request_type: req.body.request_type,
                request_status: req.body.status,
                request_members: req.body.request_members,
                request_courier_weight: req.body.request_courier_weight,
                package_status: req.body.package_status,
                updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
              }).then(result => {
                if (req.body.type == 'courier') {
                  Trips.update({
                    balance_weight: req.body.balanced_weight
                  }, {
                      where: { id: req.body.trip_id }
                    }).then(tripres => {
                      if (req.body.payment_mode == 'offline' && req.body.status != 'rejected' && req.body.request_type == 'courier') {
                        CourierRequestors.update({
                          assigned_trip_id: req.body.trip_id,
                          package_status: req.body.package_status,
                        }, {
                            where: { id: req.body.request_id }
                          }
                        ).then(tripres => {
                          var message = '';
                          if (req.body.status == 'accepted') {
                            message = "Request sent successfully";
                          }
                          else {
                            message = "Request declined successfully";
                          }
                          res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                        })
                      } else {
                        var message = '';
                        if (req.body.status == 'accepted') {
                          message = "Request sent successfully";
                        }
                        else {
                          message = "Request declined successfully";
                        }
                        res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                      }

                    })
                }
                else {
                  var message = '';
                  if (req.body.status == 'accepted') {
                    message = "Request sent successfully";
                  }
                  else {
                    message = "Request declined successfully";
                  }
                  res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                }
              })
            })
        }).catch(error => { next(error); });
    }
  },

  updateUnplannedTripInviteStatus(req, res, next) {
    // console.log("req.body", req.body);
    if (typeof req.session.user !== 'undefined') {
      Invites.update({
        user_id: req.body.user_id,
        from_user_id: req.body.from_user_id,
        to_user_id: req.body.to_user_id,
        trip_id: req.body.trip_id,
        status: req.body.status,
        package_status: req.body.package_status,
        updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      },
        {
          where: {
            from_user_id: req.body.from_user_id,
            to_user_id: req.body.to_user_id,
            trip_id: req.body.trip_id
          }
        }).then(invites => {
          Notifications.update({
            is_archived: true,
            request_status: req.body.status,
            package_status: req.body.package_status,
            updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          }, {
              where: {
                from_user_id: req.body.from_user_id,
                to_user_id: req.body.to_user_id,
                trip_id: req.body.trip_id
              }
            }).then(destroyRes => {
              Notifications.create({
                to_user_id: req.body.from_user_id,
                from_user_id: req.body.to_user_id,
                trip_id: req.body.trip_id,
                request_id: req.body.request_id,
                request_type: req.body.request_type,
                request_status: req.body.status,
                request_members: req.body.request_members,
                request_courier_weight: req.body.request_courier_weight,
                package_status: req.body.package_status,
                updated_at: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
              }).then(result => {
                if (req.body.type == 'courier') {
                  if (req.body.status == 'accepted') {
                  Trips.update({
                    from_date: req.body.from_date,
                    to_date: req.body.to_date,
                    balance_weight: req.body.balanced_weight,
                    trip_plan: 'planned',
                    unplanned_days: '0',
                  }, {
                      where: { id: req.body.trip_id }
                    }).then(tripres => {

                      if (req.body.payment_mode == 'offline' && req.body.request_type == 'courier') {
                        CourierRequestors.update({
                          assigned_trip_id: req.body.trip_id,
                          package_status: req.body.package_status,
                        }, {
                            where: { id: req.body.request_id }
                          }
                        ).then(tripres => {
                          var message = '';
                          if (req.body.status == 'accepted') {
                            message = "Request sent successfully";
                          }
                          res.send({ 'status': "ok", msg: "Request message sucessfully" });
                        })
                      } else {
                        var message = '';
                        if (req.body.status == 'accepted') {
                          message = "Request sent successfully";
                        }
                        res.send({ 'status': "ok", msg: "Request message sucessfully" });
                      }
                    })
                  }
                  else{
                    res.send({ 'status': "ok", msg: "Request declined sucessfully" });
                  }
                }
                else {
                  if (req.body.status == 'accepted') {
                  Trips.update({
                    from_date: req.body.from_date,
                    to_date: req.body.to_date,
                    trip_plan: 'planned',
                    unplanned_days: '0',
                  }, {
                      where: { id: req.body.trip_id }
                    }).then(tripres => {
                      var message = '';
                      if (req.body.status == 'accepted') {
                        message = "Request sent successfully";
                      }
                      else {
                        message = "Request declined successfully";
                      }
                      res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                    })
                  }
                  else{
                    res.send({ 'status': "ok", msg: "Request sent sucessfully" });
                  }
                }
              })
            })
        }).catch(error => { next(error); });
    }
  },

  getInvitesByCancelled(req, res, next) {
    let type = req.query.type;
    let status = 'withdraw'
    if(type == 'ternster'){
      status = 'cancelled'
    }
    if (typeof req.session.user !== 'undefined') {
      return Invites.findAll({
        where: {
          trip_id: req.query.trip_id,
          status: status
        },
      }).then(invites => {
        res.send({ 'status': 'ok', requested_user: invites });
      }).catch(error => { next(error); })
    }
  },

  viewProfileByStatus(req, res, next) {
    // console.log("getAllInvitesByTrips", req.query);
    console.log('@@@@@@@@@@@@@@%%%%%%%%%%%%%%%%%5');
    if (typeof req.session.user !== 'undefined') {
      return Invites.findOne({
        where: {
          // from_user_id: req.query.from_user_id,
          // to_user_id: req.query.to_user_id,
          // status: 'accepted'
          // trip_id: req.query.trip_id,
          // service_log_id: req.query.service_log_id,
          [Op.and]: [
            {
              [Op.or]: [
                {
                  from_user_id: req.query.from_user_id,
                  to_user_id: req.query.to_user_id,
                },
                {
                  from_user_id: req.query.to_user_id,
                  to_user_id: req.query.from_user_id,
                },
              ],
            },
            {
              [Op.or]: [
                {
                  status: 'accepted'
                },
                {
                  status: 'paid'
                },
              ]
            }
          ]
        },
      }).then(invites => {
        res.send({ 'status': 'ok', invites: invites });
      }).catch(error => { next(error); })
    }
  },



  // acceptTripInvites(req, res, next) {
  //   if (typeof req.session.user !== 'undefined') {
  //     Invites.update({
  //       user_id: req.body.user_id,
  //       from_user_id: req.body.from_user_id,
  //       to_user_id: req.body.to_user_id,
  //       trip_id: req.body.trip_id,
  //       status: req.body.status
  //     },
  //       {
  //         where: {
  //           from_user_id: req.body.from_user_id,
  //           to_user_id: req.body.to_user_id,
  //           trip_id: req.body.trip_id
  //         }
  //       }).then(invites => {
  //         Notifications.destroy({
  //           where: {
  //             from_user_id: req.body.from_user_id,
  //             to_user_id: req.body.to_user_id,
  //             trip_id: req.body.trip_id
  //           }
  //         }).then(destroyRes => {
  //           Notifications.create({
  //             to_user_id: req.body.from_user_id,
  //             from_user_id: req.body.to_user_id,
  //             trip_id: req.body.trip_id,
  //             request_status: req.body.status
  //           }).then(result => {
  //             res.send({ 'status': "ok", msg: "Request sent sucessfully" });
  //           })
  //         })
  //       }).catch(error => { next(error); });
  //   }
  // },

  // deleteTripInvites(req, res, next) {
  //   if (typeof req.session.user !== 'undefined') {
  //     Invites.update({
  //       user_id: req.body.user_id,
  //       from_user_id: req.body.from_user_id,
  //       to_user_id: req.body.to_user_id,
  //       trip_id: req.body.trip_id,
  //       status: req.body.status
  //     },
  //       {
  //         where: {
  //           from_user_id: req.body.from_user_id,
  //           to_user_id: req.body.to_user_id,
  //           trip_id: req.body.trip_id
  //         }
  //       }).then(deleteRequest => {
  //         Notifications.destroy({
  //           where: {
  //             from_user_id: req.body.from_user_id,
  //             to_user_id: req.body.to_user_id,
  //             trip_id: req.body.trip_id
  //           }
  //         }).then(destroyRes => {
  //           Notifications.create({
  //             to_user_id: req.body.from_user_id,
  //             from_user_id: req.body.to_user_id,
  //             trip_id: req.body.trip_id,
  //             request_status: req.body.status
  //           }).then(result => {
  //             res.send({ 'status': "ok", msg: "Request deleted sucessfully" });
  //           })
  //         })
  //       }).catch(error => { next(error); });
  //   }
  // },

  /*****************Favorites*******************/

  addFavorites(req, res, next) {
    // console.log("create trips", req.query.trip_id);
    if (typeof req.session.user !== 'undefined') {
      // console.log("session", req.session.user);
      return Favorites.create({
        user_id: req.session.user.id,
        trip_id: req.query.tripId,
      }).then(favorites => {
        // console.log(trip)
        res.send({ 'status': 'ok', msg: 'Trip added to Favourites !' });
      }).catch(error => { next(error); });
    }
  },

  addToFavoriteUser(req, res, next) {
    console.log("create trips", req.query);
    if (typeof req.session.user !== 'undefined') {
      // console.log("session", req.session.user);
      return FavoriteUser.create({
        user_id: req.session.user.id,
        fav_user_id: req.query.favUserId,
      }).then(favoriteuser => {
        // console.log(trip)
        res.send({ 'status': 'ok', msg: 'Traveller added to Favourites !' });
      }).catch(error => { next(error); });
    }
  },

  getFavUser(req, res, next) {
    console.log(req.query);
    if (typeof req.session.user !== 'undefined') {
      return FavoriteUser.findOne({
        // where: { user_id: { [Op.eq]: req.session.user.id, fav_user_id: req.query.fav_user_id } },
        where: { fav_user_id: req.query.fav_user_id, user_id: req.session.user.id }
      })
        .then(fav_user => {
          res.send({ 'status': 'ok', fav_user: fav_user });
        }).catch(error => { next(error); });

    }
  },

  getFavoritesTripsByUser(req, res, next) {
    console.log("req setting", req.query);
    if (typeof req.session.user !== 'undefined') {
      return FavoriteUser.findAll({
        where: { user_id: { [Op.eq]: req.session.user.id } },
        include: [
          { model: Profiles },
          { model: Settings },
          // { model: Invites, attributes: ['id', 'user_id', 'from_user_id', 'to_user_id', 'status'] },
        ]
      }).then(users => {
        // console.log("users>>>>>>",users);
        res.send({ 'status': 'ok', tripusers: users });
      }).catch(error => { next(error); });
    }
  },

  getFavoritesTrips(req, res, next) {
    // console.log("req setting", req.query);
    if (typeof req.session.user !== 'undefined') {
      return Favorites.findAll({
        where: { user_id: { [Op.eq]: req.session.user.id } },
        include: [
          // {
          //   model: Users,
          //   include: [
          //     { model: Profiles },
          //   ]
          // },
          {
            model: Trips, attributes: ['id', 'user_id', 'departure', 'destination', 'from_date', 'to_date', 'type'],
          }
        ],
      })
        .then(trips => {
          // console.log("fav>>>>>>>>>>", trips)
          res.send({ 'status': 'ok', trips: trips });
        }).catch(error => { next(error); });

    }
  },

  // getFavoritesTripsByUser(req, res, next) {
  //   var sql_query = "SELECT tr.user_id FROM `favorites` as fav INNER join  trips as tr on tr.id = fav.trip_id where fav.user_id=" + req.session.user.id + " GROUP BY tr.user_id";

  //   var userIds = [];
  //   db.sequelize.query(sql_query).then(result => {
  //     result = result[0];
  //     for (i = 0; i < result.length; i++) {
  //       userIds.push(result[i].user_id)
  //     }
  //     // console.log("userIds", userIds)

  //     if (typeof req.session.user !== 'undefined') {
  //       return Users.findAll({
  //         attributes: ['id', 'name', 'email','is_kyc_verified','isVerified', 'is_social_verified','status'],
  //         where: { id: { [Op.ne]: req.session.user.id, [Op.in]: userIds } },
  //         include: [
  //           { model: Profiles },
  //           { model: Settings },
  //         ]
  //       }).then(users => {
  //         // console.log("users>>>>>>",users);
  //         res.send({ 'status': 'ok', tripusers: users });
  //       }).catch(error => { next(error); });
  //     }

  //   });

  //   // Dont delete this .. this will use for based on trip type

  //   // if (typeof req.session.user !== 'undefined') {
  //   //   return Favorites.findAll({
  //   //     where: { user_id: { [Op.eq]: req.session.user.id } },
  //   //     include: [
  //   //       {
  //   //         model: Trips,
  //   //         where: { user_id: { [Op.ne]: req.session.user.id } },
  //   //         include: [
  //   //           {
  //   //             model: Users,
  //   //             include: [
  //   //               { model: Profiles },
  //   //               { model: Settings },
  //   //             ]
  //   //           },
  //   //           {
  //   //             model: Invites,
  //   //             where: { user_id: req.session.user.id },
  //   //             required: false
  //   //           },
  //   //         ]
  //   //       }
  //   //     ],
  //   //   }).then(trips => {
  //   //     res.send({ 'status': 'ok', tripusers: trips });
  //   //   }).catch(error => { next(error); });
  //   // }
  // },


  removeTripFromFavorites(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      var trip_id = req.query.trip_id;
      return Favorites.destroy({
        where: { trip_id: trip_id, user_id: req.session.user.id }
      }).then(deluserfav => {
        res.send({ 'status': 'ok', msg: 'Deleted successfully', trips: deluserfav });
      }).catch(error => { next(error); });
    }
  },

  // removeUserFromFavorites(req, res, next) {
  //   let fav_user_id = req.session.user.id;
  //   let trip_user_id = req.query.trip_user_id;

  //   var sql_query = "delete favorites from favorites inner join trips on trips.id = favorites.trip_id  where favorites.user_id=" + fav_user_id + " and trips.user_id = " + trip_user_id;
  //   // console.log("sql_query", sql_query);
  //   var userIds = [];
  //   db.sequelize.query(sql_query).then(result => {
  //     result = result[0];
  //     res.send({ 'status': 'ok', msg: 'Deleted successfully' });
  //     // console.log("userIds", userIds)
  //   })
  // },

  removeFromFavoriteUser(req, res, next) {
    // console.log("remove_fav", req.query);
    if (typeof req.session.user !== 'undefined') {
      var fav_user_id = req.query.favUserId;
      return FavoriteUser.destroy({
        where: { fav_user_id: fav_user_id, user_id: req.session.user.id }
      }).then(deluserfav => {
        res.send({ 'status': 'ok', msg: 'Deleted successfully', trips: deluserfav });
      }).catch(error => { next(error); });
    }
  },

  getModesOfTravels(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      return Travel_Modes.findAll().then(result => {
        res.send({ 'status': 'ok', modes: result });
      })
    }
  },

  deleteTrip(req, res, next) {
    // console.log("Trips Data", req.body);
    if (typeof req.session.user !== 'undefined') {
      // console.log("session", req.session.user);
      var trip_id = req.query.tripId;
      return Trips.update({
        status: 'inactive',
      }, {
          where: { id: trip_id }
        }).then(trips => {
          res.send({ 'status': 'ok', msg: 'Deleted successfully', trips: trips });
        }).catch(error => { next(error); });
    }
  },
  getTripStatus(req, res, next) {
    if (typeof req.session.user !== 'undefined') {
      return Trips.findOne({
        where: { id: req.query.tripId },
        attributes: ['user_id'],
        include: [
          {
            model: Invites,
            where: {
              [Op.or]: [
                { status: { [Op.eq]: 'accepted' } },
                { status: { [Op.eq]: 'paid' } }
              ]
            },
            attributes: ['user_id', 'status'],
            include: [{ model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'] }]
          },
          { model: Users, attributes: ['id', 'name', 'email', 'is_kyc_verified', 'isVerified', 'is_social_verified', 'status'] }
        ]
      }).then(result => {
        res.send({ 'status': 'ok', result: result });
      })
    }
  },

  getCompletedTrips(req, res, next) {
    let auto_close_sql_query =
      "SELECT * from (SELECT t.id,i.from_user_id,i.to_user_id,i.request_type, t.from_date, t.to_date,t.trip_name,t.trip_status FROM trips t JOIN invites i ON t.id =i.trip_id where DATEDIFF(CURRENT_DATE(),DATE(to_date)) >0 and DATEDIFF(CURRENT_DATE(),DATE(to_date)) > 5 and t.trip_status !='close' AND i.status = (CASE WHEN i.request_type ='companion' THEN 'accepted' WHEN i.request_type !='companion' AND t.payment_mode !='offline' THEN 'paid' WHEN i.request_type !='companion' AND t.payment_mode ='offline' THEN 'accepted' END) ) as dd ";
    db.sequelize.query(auto_close_sql_query).then(auto_close_sql_query => {
      res.send({ 'status': 'ok', trips: auto_close_sql_query[0] });
    });
  },

  closeCompletedTrips(req, res, next) {
    // console.log("Close Trip", req.body.invites_data)
    let close_conn_trip = [];
    Trips.update({
      trip_status: 'close',
      is_connection_continued: '0'
    }, {
        where: { id: { [Op.in]: req.body.trip_id } }
      })
      .then(tripres => {
        // let i=0;
        async.forEach(req.body.invites_data, function (invites, callback) {
          //     i=i+1;
          // console.log("-------------------------i--values--",i);
          Invites.update({
            is_connection_continued: '0',
            status: 'disconnect'
          },
            {
              where: {
                // from_user_id: invites.from_user_id,
                // to_user_id: invites.to_user_id,
                [Op.or]: [
                  {
                    from_user_id: { [Op.eq]: invites.from_user_id },
                    to_user_id: { [Op.eq]: invites.to_user_id }
                  },
                  {
                    from_user_id: { [Op.eq]: invites.to_user_id },
                    to_user_id: { [Op.eq]: invites.from_user_id }
                  }
                ],

              }
            })
            .then(trips => {
              // res.send({ 'status': 'ok', closed_trip:trip })
              if (trips) {
                close_conn_trip.push({ trips: trips })
              }
              callback();
            }).catch(error => { next(error); });
        },
          function (err) {
            res.send({ 'status': 'ok', close_conn: close_conn_trip });
          })
      })
  }

};
