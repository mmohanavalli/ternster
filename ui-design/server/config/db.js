var mysql = require('mysql');

require("dotenv").config();
function startConnection() {
  connection = mysql.createConnection({
		host : process.env.MYSQL_HOST,
		user : process.env.MYSQL_ROOT_USER,
		password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
		multipleStatements: true,
		charset: "utf8mb4",
		connectionLimit: 15,
		queueLimit: 30,
		acquireTimeout: 1000000
	});
  connection.connect(function(err) {
    if (err) {
      startConnection();
    }
  });
  connection.on('error', function(err) {
    if (err.fatal)
      startConnection();
  });
}

startConnection();

module.exports = connection;
