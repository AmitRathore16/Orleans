const express = require("express");
const { User } = require("../models/user.js"); // Importing the User model
const bcryptjs = require("bcryptjs"); // For password hashing
const authRouter = express.Router();
const jwt = require("jsonwebtoken"); // For token generation
const auth = require("../middlewares/auth.js"); // Auth middleware

// ---------- CHANGE: import sendOtpEmail from routes/sendOtp.js ----------
const sendOtpEmail = require("./sendotp.js"); // <-- changed path to match your folder structure

// ---------- CHANGE: OTP store ----------
const otpStore = {}; // { email: { otp: 123456, expires: Date } }

// -------------------- SIGN UP (send OTP only) --------------------
authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ---------- Validation ----------
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // ---------- Generate OTP ----------
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // Expires in 5 min

    // ---------- Send OTP ----------
    await sendOtpEmail(email, otp); // <-- call sendOtpEmail function
    console.log(`OTP ${otp} sent to ${email}`); // <-- optional debug log

    res.json({ msg: "OTP sent to your email" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Failed to send OTP", error: e.message });
  }
});

// -------------------- VERIFY OTP & CREATE USER --------------------
authRouter.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!otpStore[email]) {
      return res.status(400).json({ msg: "No OTP found for this email" });
    }

    const validOtp = otpStore[email];

    // ---------- Check if OTP expired ----------
    if (Date.now() > validOtp.expires) {
      delete otpStore[email];
      return res.status(400).json({ msg: "OTP expired" });
    }

    // ---------- Check if OTP matches ----------
    if (parseInt(otp) !== validOtp.otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // ---------- OTP valid, create user ----------
    const hashedPassword = await bcryptjs.hash(password, 8);
    let user = new User({ name, email, password: hashedPassword });
    user = await user.save();

    // ---------- Remove OTP after success ----------
    delete otpStore[email];

    res.json({ msg: "Signup successful", user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -------------------- SIGN IN (unchanged) --------------------
authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, "PasswordKey");
    res.json({ token, ...user._doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -------------------- TOKEN VALIDATION (unchanged) --------------------
authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "PasswordKey");
    if (!verified) return res.json(false);
    const user = await User.findById(verified.id);
    if (!user) return res.json(false);
    return res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -------------------- GET USER DATA (unchanged) --------------------
authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
