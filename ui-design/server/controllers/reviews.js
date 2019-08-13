var Sequelize = require('sequelize');
var db = require('../models');
var async = require('async');
var moment = require('moment');
var Users = require('../models').Users;
var Profiles = require('../models').Profiles;
var Trips = require('../models').Trips;
var TripReviews = require('../models').TripReviews;
var Comments = require('../models').Comments;
var Notifications = require('../models').Notifications;
var LikedComment = require('../models').LikedComment;
var _ = require('lodash');

function groupBy(dataToGroupOn, fieldNameToGroupOn, fieldNameForGroupName, fieldNameForChildren) {
  var result = _.chain(dataToGroupOn)
    .groupBy(fieldNameToGroupOn)
    .toPairs()
    .map(function (currentItem) {
        return _.zipObject([fieldNameForGroupName, fieldNameForChildren], currentItem);
    }).value();
  return result;
}

module.exports = {

	postFeedback(req, res, next) {
		console.log("req.body feedback",req.body);
		if (typeof req.session.user !== 'undefined') {
			var message = req.body.message;
			var trip_id = parseInt(req.body.trip_id);

			TripReviews.create({
				user_id: req.session.user.id,
				message: message,
				trip_id: trip_id,
				rating: req.body.rate
			}).then(cmnt => {
				res.send({ 'status': 'ok' });
			})
		}
	},


	// CreateFeedback(req, res, next) {
	// 	if (typeof req.session.user !== 'undefined') {

	// 		return user_feedback.findOne({
	// 			where: { trip_id: req.body.trip_id }
	// 		}).then(userf => {
	// 			if (!userf) {
	// 				return user_feedback.create({
	// 					description: req.body.description,
	// 					rate: req.body.rate,
	// 					trip_id: req.body.trip_id,
	// 					user_id: req.body.user_id
	// 				}).then(resss => {
	// 					res.send({ 'status': 'ok' });
	// 				})
	// 			}
	// 			else {
	// 				res.send({ 'status': 'error_p', msg: 'Already feedback submitted for this trip..!' });
	// 			}
	// 		})
	// 	}
	// }

	postTripComments(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			var message = req.body.message;
			var trip_id = req.body.trip_id;

			Comments.create({
				user_id: req.session.user.id,
				comment: message,
				trip_id: trip_id
			}).then(cmnt => {
				if(req.session.user.id != req.body.trip_user_id) {
					Notifications.create({
						from_user_id: req.session.user.id,
						to_user_id: req.body.trip_user_id,
						trip_id: trip_id,
						is_comment: 1,
						comment_id: cmnt.id
					}).then(createnotify => {
						res.send({ 'status': 'ok' });
					})
				}
				else {
					res.send({ 'status': 'ok' });
				}
			})
		}
	},

	postReplyComments(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			var message = req.body.message;
			var user_id = req.session.user.id;
			var trip_id = req.body.trip_id;
			var reply_msg_id = req.body.reply_msg_id;

			TripReviews.create({
				user_id: user_id,
				message: message,
				trip_id: trip_id,
				reply_to_msg_id: reply_msg_id,
				is_reply_msg: 1
			}).then(cmnt => {
				if(cmnt) {
					res.send({ 'status': 'ok' });
				}
			})
		}
	},

	postTripReplyComments(req, res, next) {
		if (typeof req.session.user !== 'undefined') {
			var message = req.body.message;
			var user_id = req.session.user.id;
			var trip_id = req.body.trip_id;
			var reply_msg_id = req.body.reply_msg_id;

			Comments.create({
				user_id: user_id,
				comment: message,
				trip_id: trip_id,
				reply_to_msg_id: reply_msg_id,
				is_reply_msg: 1
			}).then(cmnt => {
				if(cmnt) {
					if(req.session.user.id != req.body.trip_user_id) {
						Notifications.create({
							from_user_id: req.session.user.id,
							to_user_id: req.body.trip_user_id,
							trip_id: trip_id,
							is_reply_comment: 1,
							is_comment: 1,
							comment_id: cmnt.id
						}).then(createreplynotify => {
							res.send({ 'status': 'ok' });
						})
					}
					else {
						res.send({ 'status': 'ok' });
					}
				}
			})
		}
	},

	listAllComments(req, res, next) {
		var tripId = req.query.tripId;

		TripReviews.findAll({
			where: { trip_id: tripId },
			order: [['created_at', 'DESC']],
			include: [
				{ model: Users, attributes: ['id', 'name', 'email', 'status'],
					include:[{
						model: Profiles,
					}] 
				},
				{
					model: Trips, attributes: ['id', 'user_id']
				}
			]
		}).then(cmnts => {
			if(cmnts) {
				var reply_msg_lists = [];

				async.forEach(cmnts, function(cmnt) {
					if(cmnt.is_reply_msg == 1) {
						reply_msg_lists.push(cmnt);
					}
				});

				// console.log('reply_msg_lists', reply_msg_lists);
				var comment_lists = [];

				if(reply_msg_lists.length > 0) {
					var group_by_lists = groupBy(reply_msg_lists, 'reply_to_msg_id', 'msg_id', 'data');
				}

				async.forEach(cmnts, function(cmnt) {
					if(cmnt.is_reply_msg == 0) {
						var reply_msgs = [];

						async.forEach(group_by_lists, function(glist) {
							if(glist.msg_id == cmnt.id) {
								reply_msgs = glist.data
							}
						})
						
						comment_lists.push({
							id: cmnt.id,
							user_id: cmnt.user_id,
							message: cmnt.message,
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

				res.send({ 'status': 'ok', comments: comment_lists });
			}
		})
	},

	listAllTripComments(req, res, next) {
		var tripId = req.query.tripId;

		Comments.findAll({
			where: { trip_id: tripId },
			order: [['created_at', 'DESC']],
			include: [
				{ model: Users, attributes: ['id', 'name', 'email', 'status'],
					include:[{
						model: Profiles,
					}] 
				},
				{
					model: Trips, attributes: ['id', 'user_id']
				},
				// {
				// 	model: LikedComment,
				// }
			]
		}).then(cmnts => {
			if(cmnts) {
				var reply_msg_lists = [];

				async.forEach(cmnts, function(cmnt) {
					if(cmnt.is_reply_msg == 1) {
						reply_msg_lists.push(cmnt);
					}
				});

				// console.log('reply_msg_lists', reply_msg_lists);
				var comment_lists = [];

				if(reply_msg_lists.length > 0) {
					var group_by_lists = groupBy(reply_msg_lists, 'reply_to_msg_id', 'msg_id', 'data');
				}

				async.forEach(cmnts, function(cmnt) {
					if(cmnt.is_reply_msg == 0) {
						var reply_msgs = [];

						async.forEach(group_by_lists, function(glist) {
							if(glist.msg_id == cmnt.id) {
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
							User: cmnt.User,
							Trips: cmnt.Trip,							
							// LikedComment: cmnt.LikedComment,							
						})
					}
				});

				res.send({ 'status': 'ok', comments: comment_lists });
			}
		})
	},
	
	likeReviewComments(req, res, next) {
		var comment_id = req.query.id;

		TripReviews.update({
			is_liked: req.query.is_like
		}, {
			where: { id: comment_id }
		}).then(updres => {
			if(updres) {
				res.send({ 'status': 'ok', msg: 'Updated Successfully' });
			}
		})
	},

	// likeTripComments(req, res, next) {
	// 	var comment_id = req.query.id;

	// 	Comments.update({
	// 		is_liked: req.query.is_like
	// 	}, {
	// 		where: { id: comment_id }
	// 	}).then(updres => {
	// 		if(updres) {
	// 			// if(req.session.user.id != req.query.user_id) {
	// 			// 	Notifications.create({
	// 			// 		from_user_id: req.session.user.id,
	// 			// 		to_user_id: req.query.user_id,
	// 			// 		trip_id: req.query.trip_id,
	// 			// 		is_liked_comment: 1,
	// 			// 		is_comment: 1,
	// 			// 		comment_id: comment_id
	// 			// 	}).then(createreplynotify => {
	// 			// 		res.send({ 'status': 'ok', msg: 'Updated Successfully' });
	// 			// 	})
	// 			// }
	// 			// else {
	// 				res.send({ 'status': 'ok', msg: 'Updated Successfully' });
	// 			// }
	// 		}
	// 	})
	// },

	likeTripComments(req, res, next) {
		// console.log("likeTripComments *************888", req.query)
		LikedComment.findOne({
			where :{
				user_id: req.query.user_id,
				trip_id: req.query.trip_id,
				comment_id: req.query.comment_id
			}
		}).then(comments => {
			if(comments){
				// console.log("unLikeTripComments *************888", comments)
				LikedComment.update({
					is_liked: req.query.is_liked,
				},{
					where :{
						user_id: req.query.user_id,
						trip_id: req.query.trip_id,
						comment_id: req.query.comment_id
					}
				}).then(like_comment => {
					res.send({ 'status': 'ok', msg: 'Updated Successfully' });
				})
			}else{
				LikedComment.create({
					user_id: req.query.user_id,
					trip_id: req.query.trip_id,
					is_liked: req.query.is_liked,
					comment_id: req.query.comment_id
				}).then(like_comment => {
					res.send({ 'status': 'ok', msg: 'Updated Successfully' });
				})
			}
		})
				
			},

	getLikedTripComments(req, res, next) {
		console.log("getLikedTripComments", req.query)
		LikedComment.findAll({
			where: { trip_id: req.query.tripId, user_id: req.session.user.id },
		}).then(likes => {
					res.send({ 'status': 'ok', like_comment : likes });
			})
	},

	// replyLikeTripComments(req, res, next) {
	// 	var comment_id = req.query.id;

	// 	Comments.update({
	// 		is_liked: req.query.is_like
	// 	}, {
	// 		where: { id: comment_id }
	// 	}).then(updres => {
	// 		if(updres) {
	// 			res.send({ 'status': 'ok', msg: 'Updated Successfully' });
	// 		}
	// 	})
	// },


	replyLikeTripComments(req, res, next) {
		// console.log("likeTripComments *************888", req.query)
		LikedComment.findOne({
			where :{
				user_id: req.query.user_id,
				trip_id: req.query.trip_id,
				comment_id: req.query.comment_id
			}
		}).then(comments => {
			if(comments){
				// console.log("unLikeTripComments *************888", comments)
				LikedComment.update({
					is_liked: req.query.is_liked,
				},{
					where :{
						user_id: req.query.user_id,
						trip_id: req.query.trip_id,
						comment_id: req.query.comment_id
					}
				}).then(like_comment => {
					res.send({ 'status': 'ok', msg: 'Updated Successfully' });
				})
			}else{
				LikedComment.create({
					user_id: req.query.user_id,
					trip_id: req.query.trip_id,
					is_liked: req.query.is_liked,
					comment_id: req.query.comment_id
				}).then(like_comment => {
					res.send({ 'status': 'ok', msg: 'Updated Successfully' });
				})
			}
		})				
			},

	getRatings(req, res, next){
		console.log("persondata",req.query);
	// 	return TripReviews.findAll({
	// 		where: { user_id: req.query.user_id }
	// 	}).then(reviews => {
	// 		res.send({ 'status': 'ok', reviews: reviews });
	// 	}).catch(error => { next(error); });
	// }
		var one_star_query = 'Select * from trip_reviews where user_id=' +req.query.user_id +' and rating=1';
		var two_star_query = 'Select * from trip_reviews where user_id=' +req.query.user_id +' and rating=2';
		var three_star_query = 'Select * from trip_reviews where user_id=' +req.query.user_id +' and rating=3';
		var four_star_query = 'Select * from trip_reviews where user_id=' +req.query.user_id +' and rating=4';
		var five_star_query = 'Select * from trip_reviews where user_id=' +req.query.user_id +' and rating=5';
		db.sequelize.query(one_star_query).then(one_star_query => {
			db.sequelize.query(two_star_query).then(two_star_query => {
				db.sequelize.query(three_star_query).then(three_star_query => {
					db.sequelize.query(four_star_query).then(four_star_query => {
						db.sequelize.query(five_star_query).then(five_star_query => {		
							Users.findOne({
								where: { id: req.session.user.id },
								attributes: [ 'id', 'name', 'reduced_ratings' ]
							}).then(userdata => {
								res.send({ 'status': 'ok', star1:one_star_query[0], star2:two_star_query[0], star3:three_star_query[0], star4:four_star_query[0], star5:five_star_query[0], userData: userdata });
							})				
						});
					});
				});	
			});
		});
	}
}