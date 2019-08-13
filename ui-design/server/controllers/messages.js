var global = require('../config/global');
var Sequelize = require('sequelize');
var db = require('../models');
const Op = Sequelize.Op
var async = require('async');
var moment = require('moment');

var Users = require('../models').Users;
var Messages = require('../models').Messages;
var Invites = require('../models').Invites;
var Trips = require('../models').Trips;
var Profiles = require('../models').Profiles;
var Settings = require('../models').Settings;
var UserMessagesDelete = require('../models').UserMessagesDelete;


function getUnique(array){
	var uniqueArray = [];
	
	// Loop through array values
	for(i=0; i < array.length; i++){
			if(uniqueArray.indexOf(array[i]) === -1) {
					uniqueArray.push(array[i]);
			}
	}
	return uniqueArray;
}


module.exports = {

	// getAllAcceptedTrips(req, res, next) {
	// 	if (typeof req.session.user !== 'undefined') {
	// 		Invites.findAll({
	// 			where: {
	// 				[Op.or]: [
	// 					{status: 'accepted'},
	// 					{status: 'paid'},
	// 					{status: 'delivered'},
	// 				  ],
	// 				[Op.and]: [
	// 					{
	// 						[Op.or]: [
	// 							{ from_user_id: { [Op.eq]: req.session.user.id } },
	// 							{ to_user_id: { [Op.eq]: req.session.user.id } }
	// 						],
	// 					}, 
	// 					{
	// 						[Op.or]: [
	// 							{ archived_user_id: { [Op.ne]: req.session.user.id } },
	// 							{ archived_user_id: null }
	// 						]
	// 					}
	// 				]
	// 			},
	// 			include: [
	// 				{ model: Trips }
	// 			]
	// 		}).then(trips => {
	// 			res.send({ 'status': 'ok', trips: trips });
	// 		})
	// 	}
	// },

	getAllAcceptedTrips(req, res, next) {
		if (typeof req.session.user !== 'undefined') {

			Invites.findAll({
				where: {
					is_connection_continued: 1,
					[Op.and]: [
						{
							[Op.or]: [
								// { status: 'accepted' },
								{ status: 'paid' },
								{ status: 'delivered' }
							]
						},
						{
							[Op.or]: [
								{ from_user_id: req.session.user.id },
								{ to_user_id: req.session.user.id }
							]
						}
					]
				},
				attributes: [ 'from_user_id', 'to_user_id', 'status', 'last_message' ],
				order: [['updated_at', 'DESC']]
			}).then(invdata => {

				var user_lists = [];
				async.forEach(invdata, function (user) {
					user_lists.push(user.from_user_id, user.to_user_id);
				})

				var unique_ids = getUnique(user_lists);
				res.send({ status: 'ok', message: unique_ids, data: invdata });
			})

			// var mysql_query = '';
			// mysql_query = "SELECT user_id,from_user_id, to_user_id, status, last_message from invites where (status='accepted' OR status='paid' OR status='delivered') AND (from_user_id='" + req.session.user.id + "' OR to_user_id='" + req.session.user.id + "') AND (from_user_id='" + req.session.user.id + "' OR to_user_id='" + req.session.user.id + "') AND is_connection_continued='1' GROUP BY user_id,from_user_id,to_user_id,status,last_message";
			// db.sequelize.query(mysql_query).then(mysql_query => {	
			// 	// console.log("mysql_query", mysql_query[0]);
			// 	var mysql_query = mysql_query[0];
			// 	var msg_lists = [];	
			// 	async.forEach(mysql_query, function (queryData) {
			// 		msg_lists.push(queryData.user_id, queryData.to_user_id);
			// 	});
			// 	var inv_status = mysql_query.status;
			// 	var lastmsg = mysql_query.last_message;
			// 	console.log("msg_lists", msg_lists);
			// 	console.log("find_duplicate_in_array", getUnique(msg_lists));		
			// 	console.log('status', inv_status);
			// 	console.log('lasmsg', lastmsg);				
			// 	res.send({ 'status': 'ok', message: getUnique(msg_lists), invite_status: mysql_query.status, last_message: mysql_query.last_message });
			// });
		}
	},

	sendMessage(req, res, next) {
		console.log("Sendmessage", req.body);
		if (typeof req.session.user !== 'undefined') {
			Messages.create({
				user_id: req.body.from_user_id,
				user_name: req.body.from_user_name,
				from_user_id: req.body.from_user_id,
				to_user_id: req.body.to_user_id,
				message: req.body.message,
				// trip_id: req.body.trip_id
			}).then(result => {
				if (result) {
					Invites.update({
						last_message: req.body.message,
					}, {
						where: { 
							// trip_id: req.body.trip_id,
							[Op.or]: [
								{ 
									from_user_id: { [Op.eq]: req.body.from_user_id },
									to_user_id: { [Op.eq]: req.body.to_user_id } 
								},
								{ 
									from_user_id: { [Op.eq]: req.body.to_user_id },
									to_user_id: { [Op.eq]: req.body.from_user_id } 
								}
							],
						}
					}).then(iresp => {
						res.send({ 'status': 'ok', msg_data: result });
					})
				}
				// res.send({ 'status': 'ok', msg_data: result });
			})
		}
	},

	deleteChat(req, res, next) {
		console.log("deleteChat", req.body);
		if (typeof req.session.user !== 'undefined') {

			Invites.update({
				is_archived: 1,
				archived_user_id: req.session.user.id,
			}, {
				where: {
					// trip_id: req.body.trip_id,
					[Op.or]: [
						{ 
							from_user_id: { [Op.eq]: req.body.from_user_id },
							to_user_id: { [Op.eq]: req.body.to_user_id } 
						},
						{ 
							from_user_id: { [Op.eq]: req.body.to_user_id },
							to_user_id: { [Op.eq]: req.body.from_user_id } 
						}
					],
				}
			}).
			then(result => {
				res.send({ 'status': 'ok', msg_data: result });
			})
		}
	},

	deleteMessageChat(req, res, next){
		console.log("deleteMessageChat", req.body);
		if (typeof req.session.user !== 'undefined') {
			UserMessagesDelete.create({
				user_id: req.body.from_user_id,
				from_user_id: req.body.from_user_id,
				to_user_id: req.body.to_user_id,
			}).then(notifyRes => {
				console.log("notifyRes", notifyRes);
			Messages.update({
				is_delete: 'true',
			}, {
				where: {
					user_id: req.body.from_user_id,
					from_user_id:  req.body.from_user_id ,
					to_user_id: req.body.to_user_id  ,
				}
			}).then(result => {
				res.send({ 'status': 'ok', msg_data: result });
			})
		});
		}
	},

	getAllMessagesByTripId(req, res, next) {
		console.log("getAllMessagesByTripId", req.query);
		if (typeof req.session.user !== 'undefined') {
			Messages.findAll({
				where: { 
					// trip_id: req.query.trip_id,
					// user_id: req.session.user.id,
					is_delete: { [Op.ne]: 'true' },
					[Op.or]: [
						{ 
							from_user_id: { [Op.eq]: req.query.from_user_id },
							to_user_id: { [Op.eq]: req.query.to_user_id } 
						},
						{ 
							from_user_id: { [Op.eq]: req.query.to_user_id },
							to_user_id: { [Op.eq]: req.query.from_user_id } 
						}
					],
				},				
			}).then(result => {
				res.send({ 'status': 'ok', msgs: result });
			})		
		}
	},

	listMessagesByChat(req, res, next){
		console.log("listMessagesByChat", req.query);
		if (typeof req.session.user !== 'undefined') {
			Messages.findAll({
				where: { 
					 is_delete: { [Op.ne]: 'true' },
					//  user_id : req.query.from_user_id,
					//  from_user_id: req.query.from_user_id ,
					//  to_user_id: req.query.to_user_id ,
					[Op.or]: [
						{
							from_user_id: req.query.from_user_id ,
					 		to_user_id: req.query.to_user_id
						},
						{
							from_user_id: req.query.to_user_id ,
					 		to_user_id: req.query.from_user_id
						}
					]
				},				
			}).then(result => {
				res.send({ 'status': 'ok', message: result });
			})		
		}
	},

	getMessageNotificationLists(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			Messages.findAll({
				order: [['id', 'DESC']],
				where: { to_user_id: req.session.user.id, chat_view_status_by_to_user: { [Op.ne]: 'read' } },
				include: [{ model: Users, attributes: ['id', 'name', 'email', 'status'],
				include: [{ model: Profiles },{ model: Settings }] }]
			}).then(msgs => {
				res.send({ 'status': 'ok', msgs: msgs });
			})
		}
	},

	updateMessageNotification(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			Messages.update({
				view_status: req.body.view_status
			}, {
					where: { id: { [Op.in]: req.body.notification_ids } }
				}).then(result => {
					res.send({ 'status': 'ok' });
				})
		}
	},

	listAllMessagesByUser(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			Messages.findAll({
				where: { to_user_id: req.session.user.id, chat_view_status_by_to_user: 'unread' }
			}).then(result => {
				res.send({ 'status': 'ok', result: result });
			})
		}
	},

	updateMessageChatViewStatus(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			Invites.update({
				updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
			}, {
				where: {
					[Op.or]: [
						{ 
							from_user_id: { [Op.eq]: req.query.from_user_id },
							to_user_id: { [Op.eq]: req.query.to_user_id } 
						},
						{ 
							from_user_id: { [Op.eq]: req.query.to_user_id },
							to_user_id: { [Op.eq]: req.query.from_user_id } 
						}
					],
				}
			}).then(ires => {
				if(req.query.type == 'from') {
					Messages.update({
						chat_view_status_by_from_user: 'read',
					}, {
						where: {
							// trip_id: req.query.trip_id,
							[Op.or]: [
								{ 
									from_user_id: { [Op.eq]: req.query.from_user_id },
									to_user_id: { [Op.eq]: req.query.to_user_id } 
								},
								{ 
									from_user_id: { [Op.eq]: req.query.to_user_id },
									to_user_id: { [Op.eq]: req.query.from_user_id } 
								}
							],
						}
					}).then(result => {
						res.send({ 'status': 'ok' });
					})
				}
				else if(req.query.type == 'to') {
					// console.log('req.query', req.query);
					Messages.update({
						chat_view_status_by_to_user: 'read',
						updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
					}, {
						where: {
							// trip_id: req.query.trip_id,
							[Op.or]: [
								{ 
									from_user_id: { [Op.eq]: req.query.from_user_id },
									to_user_id: { [Op.eq]: req.query.to_user_id } 
								},
								{ 
									from_user_id: { [Op.eq]: req.query.to_user_id },
									to_user_id: { [Op.eq]: req.query.from_user_id } 
								}
							],
						}
					}).then(result => {
						res.send({ 'status': 'ok' });
					})
				}
			})
		}
	}
}

