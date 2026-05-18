const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetId:       { type: mongoose.Schema.Types.ObjectId, required: true },
    type:           { type: String, enum: ["user", "post", "job", "business", "neighborhood"], required: true },
    neighborhoodId: { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood" },
    neighborhood:   { type: String, default: "" },
    reason:         { type: String, required: true },
    description:    { type: String, default: "" },
    status:         { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
  },
  { timestamps: true }
);

// Prevent duplicate reports from same user on same target
reportSchema.index({ reportedBy: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
