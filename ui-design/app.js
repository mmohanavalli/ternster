const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
var expressValidator = require("express-validator");
var mysql = require("./server/config/db");
var global = require("./server/config/global");
var allowDomains = require("./server/config/allowDomains");
var checkAuthToken = require("./server/config/checkAuthToken");
var Sequelize = require("sequelize");
var db = require("./server/models");
var routes = require("./server/routes");
var fs = require("fs");
var session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequlizeModels = require("./server/models");
const expressStaticGzip = require("express-static-gzip");
const app = express();
const http = require("http").Server(app);
const closeTrip = require("./server/controllers/close_trip_app");
var moment = require('moment');

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, "/live")));
app.use("/static", express.static(path.join(__dirname, "/uploads")));

var myStore = new SequelizeStore({
  db: sequlizeModels.sequelize,
  table: "Sessions",
  checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
  expiration: 24 * 60 * 60 * 1000 // The maximum age (in milliseconds) of a valid session.
});

app.use(
  session({
    secret: global.generateToken("sessionrandomkeys"),
    resave: false,
    unset: "destroy",
    store: myStore,
    proxy: true,
    saveUninitialized: false,
    cookie: {
      expires: 60000 * 30 //30 mins
    }
  })
);
app.use(allowDomains);
app.use(checkAuthToken);

// Set our api routes
app.use("/api", routes);

// Catch all other routes and return the index file
app.use(
  "*",
  expressStaticGzip(path.resolve("live"), {
    enableBrotli: true,
    orderPreference: ["br", "gz"],
    setHeaders: function(res, path) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    }
  })
);

// Auto Close Trip Function Call when node restarts 

const autoclose = ()=>{
  console.log("Test");  
  closeTrip();
}
autoclose();

// Auto Close Trip Function Call every 23 hrs

var hr_23 = 82800000; // run per 23 hrs;
setInterval(()=>{
  closeTrip();
  console.log("Time", moment(new Date()));
}, 82800000);

module.exports = app;
