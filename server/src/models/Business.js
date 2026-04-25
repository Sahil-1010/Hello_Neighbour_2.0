const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    categoryIcon: { type: String, default: "🏪" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    neighborhood: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    hours: { type: String, default: "" },
    phone: { type: String, default: "" },
    distance: { type: String, default: "" },
    offers: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);
