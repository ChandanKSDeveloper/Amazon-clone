import nodemailer from "nodemailer";

const TOKEN = process.env.MAILTRAP_TOKEN;

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const message = {
    from : `${process.env.MAILTRAP_FROM_NAME} <${process.env.MAILTRAP_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  await transporter.sendMail(message);      
};

export default sendEmail;
