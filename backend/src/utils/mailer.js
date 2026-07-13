const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // upgrades to secure via STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (toEmail, otp) => {
  const mailOptions = {
    from: `"CryptX Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your CryptX Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #1e3a8a; text-align: center;">CryptX</h2>
        <p>Hello,</p>
        <p>Please use the following 6-digit One-Time Password (OTP) to verify your account or reset your password. This code will expire in 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #15803d; background: #dcfce7; padding: 15px 25px; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Secure Password Manager • CryptX</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${toEmail}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Could not send email");
  }
};

module.exports = { sendOTP };
