const router = require("express").Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// GET /api/users?neighborhood=X&role=worker&lat=40.7&lng=-74.0&radius=5000
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, role, lat, lng, radius = 5000 } = req.query;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const hasValidCoords = !isNaN(parsedLat) && !isNaN(parsedLng) && (parsedLat !== 0 || parsedLng !== 0);

    const filter = { _id: { $ne: req.user.id } }; // exclude self

    if (hasValidCoords) {
      // Radius-based query using 2dsphere index — returns results sorted by distance
      filter.geoLocation = {
        $near: {
          $geometry: { type: "Point", coordinates: [parsedLng, parsedLat] },
          $maxDistance: parseInt(radius), // meters
        },
      };
    } else if (neighborhood) {
      filter.neighborhood = neighborhood;
    }

    if (role) filter.role = role;

    const users = await User.find(filter).select("-__v").limit(100);
    res.json(users.map((u) => ({ ...u.toObject(), id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/neighborhood — set neighborhood + geolocation during onboarding
// Must be before PUT /:id to avoid Express treating "me" as an id param
router.put("/me/neighborhood", auth, async (req, res) => {
  try {
    const { neighborhood, location, lat, lng } = req.body;
    const update = { neighborhood, location };

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      // GeoJSON stores [longitude, latitude]
      update.geoLocation = {
        type: "Point",
        coordinates: [parsedLng, parsedLat],
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id — update own profile
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized" });

    const allowed = [
      "name", "bio", "avatar", "coverImage", "location", "neighborhood",
      "skills", "hourlyRate", "businessName", "category", "role",
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-__v");
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
