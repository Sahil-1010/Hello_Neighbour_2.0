const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    description:  { type: String, default: "" },
    category:     { type: String, required: true },
    categoryIcon: { type: String, default: "💼" },
    budget:       { type: String, required: true },
    location:     { type: String, default: "" },
    neighborhood: { type: String, required: true },
    urgency:      { type: String, enum: ["urgent", "normal", "low"], default: "normal" },
    status:       { type: String, enum: ["pending", "ongoing", "completed"], default: "pending" },

    // Geospatial — copied from poster's location at creation time
    geoLocation: {
      type:        { type: String, enum: ["Point"] },
      coordinates: [Number], // [longitude, latitude]
    },

    postedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    applicants:   { type: Number, default: 0 },
    applicantList:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

jobSchema.index({ geoLocation: "2dsphere" }, { sparse: true });

module.exports = mongoose.model("Job", jobSchema);
