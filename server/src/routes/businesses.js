const router = require("express").Router();
const Business = require("../models/Business");
const auth = require("../middleware/auth");

// GET /api/businesses?neighborhood=X&category=Cafe
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
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/businesses/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("owner", "name avatar");
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json(business);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/businesses
router.post("/", auth, async (req, res) => {
  try {
    const business = await Business.create({ ...req.body, owner: req.user.id });
    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/businesses/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const allowed = ["name", "description", "image", "hours", "phone", "isOpen", "offers", "category", "categoryIcon"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const updated = await Business.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/businesses/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    await business.deleteOne();
    res.json({ message: "Business deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
