const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["job_request", "reaction", "comment", "message", "job_completed", "nearby", "job_applied", "job_assigned", "offer"],
      required: true,
    },
    message: { type: String, required: true },
    avatar: { type: String, default: "" },
    link: { type: String, default: "/" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
