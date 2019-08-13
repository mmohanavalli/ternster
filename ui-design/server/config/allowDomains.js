var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Authtoken');
	
	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
			return res.status(200).end();
	}
	else {
		next();
	}
};

var checkAuthToken = function(req, res, next) {
	next();
};
module.exports = allowCrossDomain;
