const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { sendOtp } = require("../services/otp");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : user;
  const { password, otp, otpExpiry, __v, ...safe } = obj;
  return { ...safe, id: safe._id?.toString() };
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, username, contact, password, role } = req.body;

    if (!name || !username || !contact || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (username.length < 3)
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(409).json({ message: "Username already taken" });
    if (await User.findOne({ contact }))
      return res.status(409).json({ message: "Email/phone already registered" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      contact,
      password,
      role: role || "normal",
      otp,
      otpExpiry,
      isVerified: false,
    });

    const result = await sendOtp(contact, otp);

    res.status(201).json({
      message: result.sent
        ? `Verification code sent to your ${result.channel}.`
        : "Account created. Check console for OTP (dev mode).",
      userId: user._id,
      ...(result.devMode && { otp }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: "userId and otp are required" });

    const user = await User.findById(userId).select("+otp +otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      message: "Account verified successfully",
      token: signToken(user),
      user: sanitize(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select("+otp +otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const result = await sendOtp(user.contact, otp);

    res.json({
      message: result.sent ? `OTP resent to your ${result.channel}.` : "OTP resent",
      ...(result.devMode && { otp }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    const user = await User.findOne({ username: username.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid username or password" });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Account not verified. Please complete OTP verification.",
        userId: user._id,
        needsVerification: true,
      });

    await User.findByIdAndUpdate(user._id, { isOnline: true });
    res.json({ token: signToken(user), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitize(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
