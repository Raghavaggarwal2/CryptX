const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { sendOTP } = require('../utils/mailer');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- SIGNUP FLOW ---

const requestSignup = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.oTPVerification.upsert({
      where: { email },
      update: { otp: otpHash, otpExpires, isVerified: false, type: "SIGNUP" },
      create: { email, otp: otpHash, otpExpires, isVerified: false, type: "SIGNUP" }
    });

    await sendOTP(email, otp);
    res.status(200).json({ message: "OTP sent to email." });
  } catch (error) {
    console.error("Request signup error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifySignup = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const verification = await prisma.oTPVerification.findUnique({ where: { email } });
    
    if (!verification || verification.type !== "SIGNUP") {
      return res.status(404).json({ error: "No pending signup found" });
    }
    if (verification.otpExpires < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const validOTP = await bcrypt.compare(otp, verification.otp);
    if (!validOTP) return res.status(400).json({ error: "Invalid OTP" });

    await prisma.oTPVerification.update({
      where: { email },
      data: { isVerified: true, otp: "", otpExpires: new Date() } // Clear OTP immediately
    });

    res.json({ message: "Email verified. Proceed to next step." });
  } catch (error) {
    console.error("Verify signup error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

const completeSignup = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const verification = await prisma.oTPVerification.findUnique({ where: { email } });
    if (!verification || !verification.isVerified || verification.type !== "SIGNUP") {
      return res.status(403).json({ error: "Email not verified" });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword }
    });

    // Cleanup verification record
    await prisma.oTPVerification.delete({ where: { email } });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { email: user.email, username: user.username } });
  } catch (error) {
    console.error("Complete signup error:", error);
    res.status(500).json({ error: "Signup completion failed" });
  }
};

// --- LOGIN FLOW ---

const login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { email: user.email, username: user.username } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// --- FORGOT PASSWORD FLOW ---

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: "If the email exists, an OTP was sent." });

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTPVerification.upsert({
      where: { email },
      update: { otp: otpHash, otpExpires, isVerified: false, type: "RESET" },
      create: { email, otp: otpHash, otpExpires, isVerified: false, type: "RESET" }
    });

    await sendOTP(email, otp);
    res.json({ message: "If the email exists, an OTP was sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Process failed" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid request" });

    const verification = await prisma.oTPVerification.findUnique({ where: { email } });
    if (!verification || verification.type !== "RESET") {
      return res.status(400).json({ error: "No reset request found" });
    }
    if (verification.otpExpires < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const validOTP = await bcrypt.compare(otp, verification.otp);
    if (!validOTP) return res.status(400).json({ error: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await prisma.oTPVerification.delete({ where: { email } });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Process failed" });
  }
};

module.exports = { requestSignup, verifySignup, completeSignup, login, forgotPassword, resetPassword };
