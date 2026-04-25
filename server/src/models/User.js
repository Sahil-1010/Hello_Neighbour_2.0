const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    username: { type: String, trim: true },
    role: { type: String, enum: ["normal", "worker", "business"], default: "normal" },
    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    neighborhood: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    joinedDate: { type: String, default: () => new Date().getFullYear().toString() },
    // Worker fields
    skills: [String],
    hourlyRate: { type: String, default: "" },
    jobsCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    // Business fields
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
