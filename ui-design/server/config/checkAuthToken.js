var global = require('../config/global');
var mysql = require('../config/db');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var session = require('express-session');
var base64 = require('base-64');
var async = require('async');

function checkCapsInString(strings, callback){
	strings = strings.replace(/\//g,'');
	strings = strings.replace(/[^a-zA-Z ]/g, "");
	var i=0;
	var character='';
	var capsExist = false;
	while (i <= strings.length){
		character = strings.charAt(i);    
		if (!isNaN(character * 1)){
		}else{
			if (character == character.toUpperCase()) {
				capsExist = true;
			}
		}
		i++;
	}
	callback(false, capsExist);
}

var checkAuthToken = function (req, res, next) {
	var url = req.url;

  var split_url = url.split('?');  
  split_url = split_url[0];
	split_url = split_url.substr(1);
	
	if ('/robots.txt' == req.url) {
    res.type('text/plain')
    res.send("User-agent: *\nDisallow: /");
    return;
	}
	
	if (global.allowPublicUrl(req.originalUrl)) {
    next();
  } else {
		checkCapsInString(split_url, function (error, capsExist) {
			if (error) {
				next(error);																				
			} else {							 
		    if(capsExist == false) {
			    next();
		    } else {															  
	        var userTokenDetails = (typeof req.headers.authorization !== 'undefined') ? req.headers.authorization : 'NoAccess';
	        userTokenDetails = userTokenDetails.split(" ");  

      		if (userTokenDetails.length > 1) {	
						var token = userTokenDetails[1];			
            var user_det = jwt.decode(token);
									   
			      if (!req.session.user) { //req.session = {};
							//res.send({ 'status': 'error', 'error': global.errorCodes['1005'] }); return false;												
							req.session.user = user_det;
					  }

					  if (!req.session.user || typeof req.session.user.id == undefined || user_det == null) { //req.session = {};
							res.send({ 'status': 'error', 'error': global.errorCodes['1003'] }); return false;
					  } else {
					  	next();
					  }
		      }
		      else {
						res.send( { 'status': 'error', 'error': global.errorCodes['1001'] });
		        return false;
		      }
    		}
			}
		})
	}
}


module.exports = checkAuthToken;