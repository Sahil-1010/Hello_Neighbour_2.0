const router = require("express").Router();
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// GET /api/users?neighborhood=X&role=worker
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, role } = req.query;
    const filter = {};
    if (neighborhood) filter.neighborhood = neighborhood;
    if (role) filter.role = role;
    const users = await User.find(filter).select("-__v").limit(100);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/neighborhood  (must be before /:id)
router.put("/me/neighborhood", auth, async (req, res) => {
  try {
    const { neighborhood, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { neighborhood, location },
      { new: true }
    ).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id  (own profile only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized" });

    const allowed = ["name", "bio", "avatar", "coverImage", "location", "neighborhood",
      "skills", "hourlyRate", "businessName", "category", "role"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-__v");
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
