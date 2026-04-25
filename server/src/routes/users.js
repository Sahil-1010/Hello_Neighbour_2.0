const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// GET /api/users — same-neighborhood users (excludes self)
// Primary filter: neighborhoodId match. Falls back to neighborhood string.
// Does NOT use geolocation — that was causing users from other neighborhoods to appear.
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, role } = req.query;
    const currentUser = await User.findById(req.user.id).select("neighborhoodId neighborhood");

    const filter = { _id: { $ne: req.user.id } };

    if (currentUser.neighborhoodId) {
      filter.neighborhoodId = currentUser.neighborhoodId;
    } else if (currentUser.neighborhood || neighborhood) {
      filter.neighborhood = currentUser.neighborhood || neighborhood;
    }

    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("-__v -password -otp -otpExpiry")
      .limit(100);
    res.json(users.map((u) => ({ ...u.toObject(), id: u._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v -password -otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/neighborhood — set neighborhood + geolocation during onboarding
// Must be before PUT /:id
router.put("/me/neighborhood", auth, async (req, res) => {
  try {
    const { neighborhood, location, lat, lng } = req.body;
    const update = { neighborhood, location };

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      update.geoLocation = { type: "Point", coordinates: [parsedLng, parsedLat] };
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select(
      "-__v -password -otp -otpExpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ...user.toObject(), id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id — update own profile
// Returns a new JWT token when role is changed so backend guards stay consistent
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized" });

    const allowed = [
      "name", "bio", "avatar", "coverImage", "location",
      "skills", "hourlyRate", "businessName", "category", "role",
    ];
    const updates = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    // Username update: check uniqueness
    if (req.body.username !== undefined) {
      const candidate = req.body.username.toLowerCase().trim();
      if (candidate.length < 3)
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      const existing = await User.findOne({
        username: candidate,
        _id: { $ne: req.params.id },
      });
      if (existing)
        return res.status(409).json({ message: "Username is already taken" });
      updates.username = candidate;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select(
      "-__v -password -otp -otpExpiry"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const result = { ...user.toObject(), id: user._id.toString() };

    // Issue a new token when role changes so requireRole() guards use the new role
    if (req.body.role && req.body.role !== req.user.role) {
      result.token = signToken(user);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/block — toggle block
router.post("/:id/block", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id)
      return res.status(400).json({ message: "Cannot block yourself" });

    const me = await User.findById(req.user.id);
    const isBlocked = (me.blockedUsers || []).map((id) => id.toString()).includes(targetId);

    if (isBlocked) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: targetId } });
      return res.json({ blocked: false });
    }

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: targetId } });
    res.json({ blocked: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/mute — toggle mute
router.post("/:id/mute", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id)
      return res.status(400).json({ message: "Cannot mute yourself" });

    const me = await User.findById(req.user.id);
    const isMuted = (me.mutedUsers || []).map((id) => id.toString()).includes(targetId);

    if (isMuted) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { mutedUsers: targetId } });
      return res.json({ muted: false });
    }

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { mutedUsers: targetId } });
    res.json({ muted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/connect — toggle connection between current user and target
router.post("/:id/connect", auth, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user.id)
      return res.status(400).json({ message: "Cannot connect with yourself" });

    const [me, them] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetId),
    ]);

    if (!them) return res.status(404).json({ message: "User not found" });

    const alreadyConnected = (me.connectionList || [])
      .map((id) => id.toString())
      .includes(targetId);

    if (alreadyConnected) {
      await Promise.all([
        User.findByIdAndUpdate(req.user.id, {
          $pull: { connectionList: targetId },
          $inc: { connections: -1 },
        }),
        User.findByIdAndUpdate(targetId, {
          $pull: { connectionList: req.user.id },
          $inc: { connections: -1 },
        }),
      ]);
      return res.json({ connected: false });
    }

    await Promise.all([
      User.findByIdAndUpdate(req.user.id, {
        $addToSet: { connectionList: targetId },
        $inc: { connections: 1 },
      }),
      User.findByIdAndUpdate(targetId, {
        $addToSet: { connectionList: req.user.id },
        $inc: { connections: 1 },
      }),
    ]);

    res.json({ connected: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
