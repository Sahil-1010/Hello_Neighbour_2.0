const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:           { type: String, required: true },
    orderId:        { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
