const router = require("express").Router();
const Business = require("../models/Business");
const { auth, requireRole } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, category } = req.query;
    const filter = {};
    if (neighborhood) filter.neighborhood = neighborhood;
    if (category && category !== "All") filter.category = category;
    const businesses = await Business.find(filter)
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(businesses.map((b) => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("owner", "name avatar");
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json({ ...business.toObject(), id: business._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Business owners only
router.post("/", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ ...business.toObject(), id: business._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    const allowed = ["name", "description", "image", "hours", "phone", "isOpen", "offers", "category", "categoryIcon"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const updated = await Business.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    await business.deleteOne();
    res.json({ message: "Business deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
