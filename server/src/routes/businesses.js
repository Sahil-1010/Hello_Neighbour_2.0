const router = require("express").Router();
const Business = require("../models/Business");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

// GET /api/businesses?neighborhood=X&category=X
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

// GET /api/businesses/my — owner sees their own businesses only
// Must be BEFORE /:id so "my" is not parsed as an ObjectId
router.get("/my", auth, requireRole("business"), async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id })
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 });
    res.json(businesses.map((b) => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/businesses/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate("owner", "name avatar");
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json({ ...business.toObject(), id: business._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/businesses — business owners only
router.post("/", auth, requireRole("business"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.neighborhood)
      return res.status(400).json({ message: "Complete onboarding before creating a business" });

    const businessData = {
      ...req.body,
      owner:        req.user.id,
      neighborhood: user.neighborhood,
    };

    // Attach owner's geolocation so the business can be found via radius queries
    if (hasValidGeo(user.geoLocation)) {
      businessData.geoLocation = user.geoLocation;
    }

    const business = await Business.create(businessData);
    res.status(201).json({ ...business.toObject(), id: business._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/businesses/:id — owner only
router.put("/:id", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const allowed = ["name", "description", "image", "hours", "phone", "isOpen", "offers", "category", "categoryIcon"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const updated = await Business.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/businesses/:id — owner only
router.delete("/:id", auth, requireRole("business"), async (req, res) => {
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

function hasValidGeo(geo) {
  return (
    geo?.coordinates?.length === 2 &&
    (geo.coordinates[0] !== 0 || geo.coordinates[1] !== 0)
  );
}

module.exports = router;
