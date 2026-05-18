const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  avatar: { type: String, default: "" },
  text:   { type: String, required: true },
  time:   { type: String, default: "Just now" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const responseSchema = new mongoose.Schema({
  businessId:      { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  businessOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message:         { type: String, default: "" },
  proposedBudget:  { type: String, default: "" },
  selectedItems:   [String],
  status:          { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
}, { timestamps: true });

const postSchema = new mongoose.Schema(
  {
    author:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:         { type: String, required: true },
    type:            { type: String, enum: ["general", "warning", "help", "offer"], default: "general" },
    reportCount:     { type: Number, default: 0 },
    orderCategories: [String],
    orderBudget:     { type: String, default: "" },
    orderItems:      [String],
    responses:       [responseSchema],
    image:        { type: String, default: null },
    neighborhood: { type: String, required: true },


    // Geospatial — copied from author's location at post-creation time
    geoLocation: {
      type:        { type: String, enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
    },

    editCount:   { type: Number, default: 0 },
    isEdited:    { type: Boolean, default: false },

    likes:       { type: Number, default: 0 },
    likedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes:    { type: Number, default: 0 },
    dislikedBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentList: [commentSchema],
  },
  { timestamps: true }
);

// Sparse so existing posts without geoLocation are not indexed
postSchema.index({ geoLocation: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Post", postSchema);
