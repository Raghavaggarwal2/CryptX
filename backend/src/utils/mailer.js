const path = require('path');
// Load .env reliably from the backend root regardless of execution directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const sendOTP = async (toEmail, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;

  if (!apiKey) {
    console.error("Brevo Error: BREVO_API_KEY is not set in environment variables.");
    throw new Error("Email configuration error: BREVO_API_KEY missing");
  }

  if (!senderEmail) {
    console.error("Brevo Error: EMAIL_USER is not set in environment variables.");
    throw new Error("Email configuration error: EMAIL_USER missing");
  }

  const requestBody = {
    sender: {
      name: "CryptX Security",
      email: senderEmail
    },
    to: [
      {
        email: toEmail
      }
    ],
    subject: 'Your CryptX Verification Code',
    htmlContent: `
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
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Brevo API error:", JSON.stringify(errorData));
      const reason = errorData.message || response.statusText;
      throw new Error(`Brevo Error: ${reason}`);
    }
    
    console.log(`OTP sent to ${toEmail} via Brevo.`);
  } catch (error) {
    console.error("Error sending OTP email:", error.message || error);
    throw error;
  }
};

module.exports = { sendOTP };
