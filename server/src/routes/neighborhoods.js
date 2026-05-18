const router = require("express").Router();
const Neighborhood = require("../models/Neighborhood");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const BUFFER_METERS = 400; // edge zone width — user within buffer of edge is allowed to create

// Haversine distance between two points in meters
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/neighborhoods?lat=X&lng=X&search=X
router.get("/", auth, async (req, res) => {
  try {
    const { lat, lng, search } = req.query;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const hasGeo =
      !isNaN(parsedLat) && !isNaN(parsedLng) &&
      (parsedLat !== 0 || parsedLng !== 0);

    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    let neighborhoods;
    if (hasGeo && !search) {
      neighborhoods = await Neighborhood.find({
        ...filter,
        center: {
          $near: {
            $geometry: { type: "Point", coordinates: [parsedLng, parsedLat] },
            $maxDistance: 50000,
          },
        },
      })
        .populate("createdBy", "name")
        .limit(20);
    } else {
      neighborhoods = await Neighborhood.find(filter)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(50);
    }

    res.json(
      neighborhoods.map((n) => {
        const obj = { ...n.toObject(), id: n._id.toString(), memberCount: n.members.length };
        // Include distance from user when coordinates were provided
        if (hasGeo && n.center?.coordinates?.length === 2) {
          const [nLng, nLat] = n.center.coordinates;
          obj.distance = Math.round(haversine(parsedLat, parsedLng, nLat, nLng));
        }
        return obj;
      })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/neighborhoods/my — must be before /:id
router.get("/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("neighborhoodId");
    if (!user?.neighborhoodId)
      return res.status(404).json({ message: "Not in a neighborhood yet" });
    const n = user.neighborhoodId;
    res.json({ ...n.toObject(), id: n._id.toString(), memberCount: n.members.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/neighborhoods — create and auto-join
router.post("/", auth, async (req, res) => {
  try {
    const { name, lat, lng, location, radius } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Neighborhood name is required" });

    if (await Neighborhood.findOne({ name: { $regex: `^${name.trim()}$`, $options: "i" } }))
      return res.status(409).json({ message: "A neighborhood with this name already exists" });

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const hasGeo = !isNaN(parsedLat) && !isNaN(parsedLng);
    const newRadius = parseInt(radius) || 5000;

    // ── Geo buffer check ───────────────────────────────────────────────────────
    // Only enforced when user has valid coordinates
    if (hasGeo) {
      const nearby = await Neighborhood.find({
        center: {
          $near: {
            $geometry: { type: "Point", coordinates: [parsedLng, parsedLat] },
            $maxDistance: newRadius + BUFFER_METERS,
          },
        },
      });

      for (const n of nearby) {
        const [nLng, nLat] = n.center.coordinates;
        const dist = haversine(parsedLat, parsedLng, nLat, nLng);
        const edgeStart = n.radius - BUFFER_METERS;

        if (dist < edgeStart) {
          // Case A: clearly inside — reject
          return res.status(409).json({
            message: `You are already within the "${n.name}" neighborhood. You cannot create a new one from inside it.`,
          });
        }
        // Case B: dist >= edgeStart && dist <= n.radius → edge zone → allow (fall through)
      }
      // Case C: no nearby neighborhood → allow (fall through)
    }

    const neighborhoodData = {
      name:      name.trim(),
      createdBy: req.user.id,
      members:   [req.user.id],
      radius:    newRadius,
    };
    if (hasGeo) {
      neighborhoodData.center = { type: "Point", coordinates: [parsedLng, parsedLat] };
    }

    const neighborhood = await Neighborhood.create(neighborhoodData);

    const userUpdate = {
      neighborhood:   neighborhood.name,
      neighborhoodId: neighborhood._id,
    };
    if (hasGeo) userUpdate.geoLocation = { type: "Point", coordinates: [parsedLng, parsedLat] };
    if (location) userUpdate.location = location;

    await User.findByIdAndUpdate(req.user.id, userUpdate);

    res.status(201).json({
      ...neighborhood.toObject(),
      id: neighborhood._id.toString(),
      memberCount: 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/neighborhoods/:id/join
router.post("/:id/join", auth, async (req, res) => {
  try {
    const { lat, lng, location } = req.body;
    const neighborhood = await Neighborhood.findById(req.params.id);
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood not found" });

    const membersStr = neighborhood.members.map((m) => m.toString());
    if (!membersStr.includes(req.user.id)) {
      neighborhood.members.push(req.user.id);
      await neighborhood.save();
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const hasGeo = !isNaN(parsedLat) && !isNaN(parsedLng);

    const userUpdate = {
      neighborhood:   neighborhood.name,
      neighborhoodId: neighborhood._id,
    };
    if (hasGeo) userUpdate.geoLocation = { type: "Point", coordinates: [parsedLng, parsedLat] };
    if (location) userUpdate.location = location;

    await User.findByIdAndUpdate(req.user.id, userUpdate);

    res.json({
      ...neighborhood.toObject(),
      id: neighborhood._id.toString(),
      memberCount: neighborhood.members.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/neighborhoods/:id/leave
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood not found" });

    neighborhood.members.pull(req.user.id);
    await neighborhood.save();

    await User.findByIdAndUpdate(req.user.id, {
      $unset: { neighborhoodId: "", neighborhood: "", geoLocation: "" },
    });

    res.json({ message: "Left neighborhood successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/neighborhoods/:id — single neighborhood details
router.get("/:id", auth, async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id).populate("createdBy", "name");
    if (!neighborhood) return res.status(404).json({ message: "Neighborhood not found" });
    res.json({
      ...neighborhood.toObject(),
      id: neighborhood._id.toString(),
      memberCount: neighborhood.members.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
