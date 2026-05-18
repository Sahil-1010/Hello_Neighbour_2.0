const router = require("express").Router();
const Business = require("../models/Business");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");
const { createBulkNotifications } = require("../services/notification");

// GET /api/businesses?neighborhood=X&category=X&owner=X
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, category, owner } = req.query;
    const filter = {};

    if (owner) {
      filter.owner = owner; // fetch by specific owner (for Profile page)
    } else if (neighborhood) {
      filter.neighborhood = neighborhood;
    }
    if (category && category !== "All") filter.category = category;

    const query = Business.find(filter).populate("owner", "name username avatar").limit(100).sort({ createdAt: -1 });

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
      .populate("owner", "name username avatar")
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
            imageUrl: offer.imageUrl || "",
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
    const business = await Business.findById(req.params.id).populate("owner", "name username avatar");
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

    // Notify all users in the same neighborhood (non-blocking)
    const orConds = [];
    if (user.neighborhoodId) orConds.push({ neighborhoodId: user.neighborhoodId });
    if (user.neighborhood) orConds.push({ neighborhood: user.neighborhood });
    if (orConds.length > 0) {
      User.find({ _id: { $ne: req.user.id }, $or: orConds })
        .select("_id")
        .lean()
        .then((neighbors) => {
          if (neighbors.length > 0) {
            createBulkNotifications(
              neighbors.map((n) => n._id),
              {
                type:    "new_business",
                message: `New business "${business.name}" was added in your neighborhood!`,
                link:    `/businesses/${business._id}`,
              }
            );
          }
        })
        .catch(() => {});
    }

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

    const { title, description, discount, validUntil, imageUrl } = req.body;
    if (!title) return res.status(400).json({ message: "Offer title is required" });

    business.offers.push({ title, description, discount, validUntil, isActive: true, imageUrl: imageUrl || "" });
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

// POST /api/businesses/:id/connect — toggle follow/membership
router.post("/:id/connect", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const memberStrs = (business.members || []).map((id) => id.toString());
    const isConnected = memberStrs.includes(req.user.id);

    if (isConnected) {
      await Business.findByIdAndUpdate(req.params.id, { $pull: { members: req.user.id } });
      return res.json({ connected: false, memberCount: memberStrs.length - 1 });
    }

    await Business.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.user.id } });
    res.json({ connected: true, memberCount: memberStrs.length + 1 });
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
