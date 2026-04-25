const mongoose = require("mongoose");

const neighborhoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    center: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat] — GeoJSON order
    },
    radius:    { type: Number, default: 5000 },   // meters
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

neighborhoodSchema.index({ center: "2dsphere" });

module.exports = mongoose.model("Neighborhood", neighborhoodSchema);
