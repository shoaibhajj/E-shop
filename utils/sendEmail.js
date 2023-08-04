const nodemailer = require("nodemailer");
//Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter (service that will send emails like "gmail","mailgun","mailtrap","sendgrid")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false  port = 587 , if secure true port = 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define eamil options like( from ,to , subject , email content )
  const mailOptions = {
    from: "E-shop App <shoaibhajhussen@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
