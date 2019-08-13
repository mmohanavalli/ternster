const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const handelbars = require("handlebars");
require("dotenv").config();

const mail = () => {
  let transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });
  return transporter;
};

const sendMail = (templateLocation, sender, subject, content) => {
  const templatePath = path.resolve(__dirname, templateLocation);
  const template = fs.readFileSync(templatePath, "UTF-8");
  const compliedTemplate = handelbars.compile(template, {
    noEscape: true
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: sender,
    subject: subject,
    html: compliedTemplate(content)
  };
  return mail().sendMail(mailOptions);
};

module.exports = sendMail;
