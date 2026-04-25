const router = require("express").Router();
const Business = require("../models/Business");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

// GET /api/businesses?neighborhood=X&category=X&lat=X&lng=X
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, category, lat, lng } = req.query;
    const filter = {};

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const hasGeo =
      !isNaN(parsedLat) && !isNaN(parsedLng) &&
      (parsedLat !== 0 || parsedLng !== 0);

    if (hasGeo) {
      filter.geoLocation = {
        $near: {
          $geometry: { type: "Point", coordinates: [parsedLng, parsedLat] },
          $maxDistance: 5000,
        },
      };
    } else if (neighborhood) {
      filter.neighborhood = neighborhood;
    }

    if (category && category !== "All") filter.category = category;

    // $near returns results pre-sorted by distance; skip manual sort when geo is active
    const query = Business.find(filter).populate("owner", "name avatar").limit(100);
    if (!hasGeo) query.sort({ createdAt: -1 });

    const businesses = await query;
    res.json(businesses.map((b) => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/businesses/my — owner sees their own businesses only
// No role gate — owner can still view their businesses after switching roles
// Must be BEFORE /:id so "my" is not parsed as an ObjectId
router.get("/my", auth, async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id })
      .populate("owner", "name avatar")
      .sort({ createdAt: -1 });
    res.json(businesses.map((b) => ({ ...b.toObject(), id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/businesses/offers?neighborhood=X — active offers for home feed
// Must be BEFORE /:id so "offers" is not parsed as a MongoDB ObjectId
router.get("/offers", auth, async (req, res) => {
  try {
    const { neighborhood } = req.query;
    const filter = {};
    if (neighborhood) filter.neighborhood = neighborhood;

    const businesses = await Business.find(filter)
      .select("name categoryIcon category neighborhood offers image")
      .limit(50);

    const offerItems = [];
    businesses.forEach((biz) => {
      (biz.offers || [])
        .filter((o) => o.isActive)
        .forEach((offer) => {
          offerItems.push({
            id: offer._id.toString(),
            businessId: biz._id.toString(),
            businessName: biz.name,
            categoryIcon: biz.categoryIcon || "🏪",
            category: biz.category,
            businessImage: biz.image || "",
            title: offer.title,
            description: offer.description || "",
            discount: offer.discount || "",
            validUntil: offer.validUntil || null,
            createdAt: offer.createdAt,
          });
        });
    });

    res.json(offerItems);
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

// POST /api/businesses/:id/rate — any authenticated user except the owner
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const value = Number(req.body.value);
    if (!value || value < 1 || value > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() === req.user.id)
      return res.status(400).json({ message: "Cannot rate your own business" });

    const idx = business.ratings.findIndex((r) => r.userId.toString() === req.user.id);
    if (idx >= 0) {
      business.ratings[idx].value = value;
    } else {
      business.ratings.push({ userId: req.user.id, value });
    }

    const total = business.ratings.reduce((s, r) => s + r.value, 0);
    business.rating = Math.round((total / business.ratings.length) * 10) / 10;
    business.reviewCount = business.ratings.length;
    await business.save();

    res.json({ rating: business.rating, reviewCount: business.reviewCount });
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
      offers:       [],   // always start empty; offers added via /:id/offers
    };

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

    const allowed = ["name", "description", "image", "hours", "phone", "isOpen", "category", "categoryIcon"];
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

// ── Offer sub-routes ──────────────────────────────────────────────────────────

// POST /api/businesses/:id/offers — add an offer
router.post("/:id/offers", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, discount, validUntil } = req.body;
    if (!title) return res.status(400).json({ message: "Offer title is required" });

    business.offers.push({ title, description, discount, validUntil, isActive: true });
    await business.save();

    res.status(201).json({ ...business.toObject(), id: business._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/businesses/:id/offers/:offerId — toggle or update isActive
router.put("/:id/offers/:offerId", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const offer = business.offers.id(req.params.offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.isActive = req.body.isActive !== undefined ? req.body.isActive : !offer.isActive;
    await business.save();

    res.json({ ...business.toObject(), id: business._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/businesses/:id/offers/:offerId
router.delete("/:id/offers/:offerId", auth, requireRole("business"), async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    business.offers.pull(req.params.offerId);
    await business.save();

    res.json({ ...business.toObject(), id: business._id.toString() });
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
