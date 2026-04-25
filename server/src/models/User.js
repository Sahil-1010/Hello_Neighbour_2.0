const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contact: { type: String, required: true, unique: true, trim: true }, // email or phone
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["normal", "worker", "business"], default: "normal" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    // Profile
    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    neighborhood: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    joinedDate: { type: String, default: () => new Date().getFullYear().toString() },
    // Worker
    skills: [String],
    hourlyRate: { type: String, default: "" },
    jobsCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // Business
    businessName: { type: String, default: "" },
    category: { type: String, default: "" },
    connections: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
