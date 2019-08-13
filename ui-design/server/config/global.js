var sha256 = require("sha256");
var aesjs = require("aes-js");
var CryptoJS = require("crypto-js");
var nodemailer = require("nodemailer");
var async = require("async");
require("dotenv").config();
const express = require("express");
var app = express();
var moment = require("moment");
var mysql = require("mysql");

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

var tst = "test";

var global = {
  sha256Salt: process.env.sha256Salt,
  dev_eth_key: process.env.dev_eth_key, // Etherium Key
  domain_name: ["tokenmagic.io"],
  secret: process.env.secret,
  jwt_secret: process.env.jwt_secret,
  errorCodes: {},
  clientId: process.env.clientId,
  client_secret: process.env.client_secret
};

// global.mysqlConnect = function() {
//   var connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'root',
//     password : 'blaze.ws'
//   });

//   return connection;
// }

global.generateSecretToken = function(key) {
  let results = sha256(key + global.sha256Salt);
  return results;
};

global.generateToken = function(key) {
  let date = new Date();
  let results = sha256(key + date + global.sha256Salt);
  return results;
};
global.allowPublicUrl = function(url) {
  var publicUrl = [
    "/UserRegister",
    "/UserLogin",
    "/KYCVerification",
    "/socialLogin",
    "/Logout",
    "/SendOTP",
    "/GetPhonecodelist",
    "/VerifyOTP",
    "/CheckVerification",
    "/static",
    "/ForgotPassword",
    "/ResetVerification",
    "/ResetPassword",
    // "/countries",
    // "/state_of_countries",
    // "/cities_of_state",
    "/GetCurrencyList",
    "/getCitiesList",
    "/updateCitiesWithCountry"
  ];
  for (var i = 0; i < publicUrl.length; i++)
    if (url.indexOf(publicUrl[i]) > -1) return true;
  return false;
};
global.getProtocol = function(req) {
  if (app.get("env") == "production") {
    // return "https://"+(req.headers['x-forwarded-host']).replace(/[^a-zA-Z\.]/g, "");
    return "https://ternster.hyperbig.com";
  } else {
    return "http://localhost:4200";
  }
};
global.setErrorCodes = function() {
  ErrorCodes.findAll({ attributes: ["id", "message", "description"] })
    .then(ErrorCodeList => {
      let errorFormatedObj = {};
      async.forEach(ErrorCodeList, function(record) {
        errorFormatedObj[record.id] = record.get();
        errorFormatedObj[record.id]["error_code"] = record.id;
        delete errorFormatedObj[record.id]["id"];
      });
      global.errorCodes = errorFormatedObj;
    })
    .catch(error => {
      return { status: false, error };
    });
  console.log("error codes");
};

global.transporter = function() {
  var transporter_det = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true, // use SSL
    service: "gmail",
    auth: {
      user: "botworldstatus@gmail.com",
      pass: "Welcome$123"
    }
  });

  return transporter_det;
};

global.getDateFormat = function(df) {
  // console.log("df###########",df);
  var changed_df = moment(df).format("MMM DD, YYYY");
  return changed_df;
};

module.exports = global;

/* ------------ To encrypt, decrypt values using aes */
var key = new Buffer([
  "coinwallet",
  "book",
  "ethBitLite",
  "145667",
  "278239",
  "35334",
  "45656",
  87565,
  89657,
  90857,
  24678,
  45798,
  44610,
  34511,
  56782,
  23613
]);
//var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];//32 bytes * 8 bits/byte = 256 bits
//var key = [ 145667, 278239, 35334, 45656, 87565, 89657, 90857, 24678, 45798, 44610, 34511, 56782, 23613, 78914, 45715, 23416 ];//32 bytes * 8 bits/byte = 256 bits

//Function to encrypt datas
global.encryptData = function(value_to_encrypt, dynamic_key, is_new_key) {
  //console.log(value_to_encrypt);
  //console.log(dynamic_key);
  if (is_new_key) {
    var encryptedHexAddress = CryptoJS.AES.encrypt(
      value_to_encrypt,
      dynamic_key.toString()
    );
    return encryptedHexAddress.toString();
  } else {
    var textBytes = aesjs.utils.utf8.toBytes(value_to_encrypt);
    // The counter is optional, and if omitted will begin at 1
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5)); //key declared globally in global.js
    //console.log(aesCtr.encrypt(textBytes));
    var encryptedAddresss = aesCtr.encrypt(textBytes);
    // To print or store the binary data, you may convert it to hex
    var encryptedHexAddress = aesjs.utils.hex.fromBytes(encryptedAddresss);
    //console.log(encryptedHexAddress);
    return encryptedHexAddress;
  }
};
//Function to decrypt datas
global.decryptData = function(value_to_decrypt, dynamic_key, is_new_key) {
  if (is_new_key) {
    var bytes = CryptoJS.AES.decrypt(value_to_decrypt, dynamic_key);
    var decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    //console.log(decryptedText);
  } else {
    // When ready to decrypt the hex string, convert it back to bytes
    var encryptedBytes = aesjs.utils.hex.toBytes(value_to_decrypt);
    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    //console.log(decryptedText);
  }
  return decryptedText;
};
