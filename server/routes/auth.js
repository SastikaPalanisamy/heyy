const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Otp = require("../models/Otp");
const sendOTPMail = require("../utils/mailer");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Register OTP - persist OTP with expiry
router.post("/register-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const lowerEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: lowerEmail });
    if (existingUser) return res.status(400).json({ status: "error", message: "User already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await Otp.findOneAndUpdate(
      { email: lowerEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    const sent = await sendOTPMail(lowerEmail, otp);
    if (sent.success) res.json({ status: "ok", message: "OTP sent" });
    else res.status(500).json({ status: "error", message: "Mail failed" });
  } catch (err) { console.error(err); res.status(500).json({ status: "error" }); }
});

// Verify OTP (registration or reset) - checks persisted OTPs
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const lowerEmail = email.toLowerCase();
    const record = await Otp.findOne({ email: lowerEmail, otp });
    if (record && record.expiresAt > new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.json({ status: "ok" });
    }
    // Fallback: check user record (forgot-password flow stores otp on user)
    const user = await User.findOne({ email: lowerEmail, otp });
    if (user && user.otpExpiry && user.otpExpiry > new Date()) return res.json({ status: "ok" });
    res.status(400).json({ status: "error", message: "Invalid OTP" });
  } catch (err) { console.error(err); res.status(500).json({ status: "error" }); }
});

// Register new user (after OTP verified)
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, location, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email: email.toLowerCase(), location, password: hashed, role });
    await newUser.save();
    await Otp.deleteOne({ email: email.toLowerCase() });
    res.json({ status: "ok" });
  } catch (err) { console.error(err); res.status(500).json({ status: "error" }); }
});

// Forgot password - store OTP on user with expiry
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ status: "error", message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendOTPMail(user.email, otp);
    res.json({ status: "ok" });
  } catch (err) { console.error(err); res.status(500).json({ status: "error" }); }
});

// Reset password (using OTP)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ status: "error", message: "User not found" });
    if (!user.otp || !user.otpExpiry || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ status: "error", message: "Invalid or expired OTP" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    return res.json({ status: "ok" });
  } catch (err) { console.error(err); res.status(500).json({ status: "error" }); }
});

// Login - using bcrypt and return JWT + user info
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ status: "error", message: "Invalid credentials" });
    let match = false;
    try {
      match = await bcrypt.compare(password, user.password);
    } catch (e) {
      match = false;
    }

    // Support legacy plaintext-stored passwords: if direct equality, re-hash and accept
    if (!match) {
      if (user.password === password) {
        // re-hash and save
        try {
          user.password = await bcrypt.hash(password, 10);
          await user.save();
          match = true;
        } catch (e) {
          console.error('rehash error', e);
        }
      }
    }

    if (!match) return res.status(401).json({ status: "error", message: "Invalid credentials" });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { _id: user._id, fullName: user.fullName, email: user.email, location: user.location, role: user.role };
    return res.json({ status: "ok", token, user: safeUser, role: user.role });
  } catch (err) { console.error(err); res.status(500).json({ status: "error" }); }
});

module.exports = router;