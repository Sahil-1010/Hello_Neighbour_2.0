const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    discount:    { type: String, default: "" },
    imageUrl:    { type: String, default: "" },
    validUntil:  { type: Date },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

const businessSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category:     { type: String, required: true },
    categoryIcon: { type: String, default: "🏪" },
    description:  { type: String, default: "" },
    image:        { type: String, default: "" },
    neighborhood: { type: String, required: true },

    // Geospatial — copied from owner's location at creation time
    geoLocation: {
      type:        { type: String, enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
    },

    neighborhoodId: { type: mongoose.Schema.Types.ObjectId, ref: "Neighborhood", default: null },

    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    ratings:     [{
      userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      value:     { type: Number, min: 1, max: 5, required: true },
      createdAt: { type: Date, default: Date.now },
    }],

    isOpen:   { type: Boolean, default: true },
    hours:    { type: String, default: "" },
    phone:    { type: String, default: "" },
    distance: { type: String, default: "" },
    offers:   [offerSchema],
    members:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

businessSchema.index({ geoLocation: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Business", businessSchema);
