var express = require('express'),
  router = express.Router();
var ChatMessages = require('../models').ChatMessages;
const moment = require('moment');

var socketFunctions = {};
socketFunctions.open = function (io) {
	io.on('connection', function (socket) {
		console.log('socket function inside');
		socket.on('send_request', function(data) {
			io.emit('alert_notification', data);
		});

		socket.on('alert_comment_notification', function(data) {
			io.emit('alert_notification_comment', data);
		});

		socket.on('msg_transfer', function(data) {
			io.emit('send_msg', data);
		});

		socket.on('login_submit', function() {
			io.emit('login_alert');
		});

		socket.on('scroll_element', function(data) {
			io.emit('scroll_alert', data);
		});

		socket.on('cancel_trip', function(data) {
			io.emit('cancel_trip_alert', data);
		});

		socket.on('page_identification', function(data) {
			io.emit('page_identify', data);
		});

		socket.on('emit_navigate_to_chat', function(data) {
			io.emit('on_navigate_to_chat', data);
		});

	// 	socket.on('emit_chat_message', function(msgdata) {
	// 		console.log('msgdata', msgdata);

	// 		if(msgdata.type == 'create') {
	// 			return ChatMessages.create({
	// 				from_user: msgdata.fromUser,
	// 				from_user_id: msgdata.fromUserId,
	// 				message: msgdata.text,
	// 				to_user_id: msgdata.toUserId,
	// 				chat_request_raised: msgdata.chat_request_raised,
	// 				is_accepted: msgdata.is_accepted,
	// 				is_rejected: msgdata.is_rejected
	// 			}).then(cmsg => {
	// 				// socket.emit("message_data", msgdata); 
	// 				io.emit('message_data', msgdata);
	// 			})
	// 		}
	// 		else if(msgdata.type == 'update') {
	// 			return ChatMessages.update({
	// 				chat_request_raised: msgdata.chat_request_raised,
	// 				is_accepted: msgdata.is_accepted,
	// 				is_rejected: msgdata.is_rejected
	// 			}, {
	// 				where: { to_user_id: msgdata.fromUserId, from_user_id: msgdata.toUserId }
	// 			}).then(updmsg => {
	// 				io.emit('message_data', msgdata);
	// 			})
	// 		}
	// 	});

	// 	socket.on('online-status', function(statusdata) {
	// 		console.log('statusdata', statusdata);
	// 		io.emit('internet_status_data', statusdata);
	// 	});

	// 	socket.on('request_message', function(statusdata) {
	// 		io.emit('request_message_data', statusdata);
	// 	});

	// 	socket.on('accept_request', function(statusdata) {
	// 		io.emit('accepted_data', statusdata);
	// 	});

	// 	socket.on('disconnect', function () {
 //      console.log('user disconnected');
 //    }); 
	});
}

module.exports = socketFunctions;