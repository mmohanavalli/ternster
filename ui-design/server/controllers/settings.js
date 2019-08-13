var db = require('../models');
var Sequelize = require('sequelize');
var async = require('async');
var moment = require('moment');
var Settings = require('../models').Settings;

module.exports = {

	updateUserSettingsData(req, res, next) {
		// console.log("Settings Data", req.body);
		// console.log("session", req.session.user.id);
		if (typeof req.session.user !== 'undefined') {	
			var userId = req.session.user.id;
			return Settings.update({
				to_everyone: req.body.profile_to_everyone,
				only_to_connections: req.body.profile_only_connected,
				profile_image_show: req.body.donot_show_profile_picture,
				on_new_requests: req.body.on_new_request,
				on_new_messages: req.body.on_new_messages,
				on_new_comments: req.body.on_new_comments,				
			}, {
					where: { user_id: userId }
				}).then(trip => {
					res.send({ 'status': 'ok', msg: 'Settings Updated' });
				}).catch(error => { next(error); });
		}
	},

	getUserSettingsOptions(req, res, next) {
		// console.log("req setting", req.body);
		if (typeof req.session.user !== 'undefined') {
			return SettingsOptions.findAll().then(settingsOptions => {
				res.send({ 'status': 'ok', settingsoptions: settingsOptions });
			}).catch(error => { next(error); });
		}
	},

	getUserSettingsData(req, res, next) {
		// console.log("req setting", req.body);
		var userId = req.session.user.id;
		if (typeof req.session.user !== 'undefined') {
			return Settings.findOne({
				where: { user_id: userId },
				// include:[{
				// 	model: SettingsOptions	
				// }]
			}).then(settings => {
				// console.log("settings",settings);
				res.send({ 'status': 'ok', settings: settings });
			}).catch(error => { next(error); });
		}
	},
};
