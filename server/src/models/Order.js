const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    items:      [{ name: { type: String, required: true } }],
    budget:     { type: String, default: "" },
    comment:    { type: String, default: "" },
    status:     { type: String, enum: ["pending", "accepted", "partial", "rejected"], default: "pending" },
    ownerReply: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
