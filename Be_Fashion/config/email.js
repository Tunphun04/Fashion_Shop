const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

let transporter = null;

if (EMAIL_USER && EMAIL_PASSWORD && EMAIL_USER.trim() !== '' && EMAIL_PASSWORD.trim() !== '') {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.warn('⚠️  Email service error:', error.message);
      console.warn('⚠️  Email features disabled. Reset links will be logged to console.');
      transporter = null;
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('ℹ️  Email not configured. Email features disabled.');
}

module.exports = transporter;