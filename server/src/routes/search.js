const router = require("express").Router();
const User = require("../models/User");
const Business = require("../models/Business");
const Post = require("../models/Post");
const { auth } = require("../middleware/auth");

// GET /api/search?q=<query> — search users, businesses, and posts within neighborhood
router.get("/", auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [], businesses: [], posts: [] });
    }

    const query = q.trim();
    const regex = new RegExp(query, "i");

    const currentUser = await User.findById(req.user.id).select("neighborhoodId neighborhood");

    // Build neighborhood filter
    const neighborhoodFilter = {};
    if (currentUser.neighborhoodId) {
      neighborhoodFilter.neighborhoodId = currentUser.neighborhoodId;
    } else if (currentUser.neighborhood) {
      neighborhoodFilter.neighborhood = currentUser.neighborhood;
    }

    const neighborhoodStr = currentUser.neighborhood || "";

    const [users, businesses, posts] = await Promise.all([
      User.find({
        ...neighborhoodFilter,
        _id: { $ne: req.user.id },
        $or: [{ name: regex }, { username: regex }, { bio: regex }, { skills: regex }],
      })
        .select("name username avatar role bio skills location")
        .limit(10),

      Business.find({
        ...(neighborhoodStr ? { neighborhood: neighborhoodStr } : {}),
        $or: [{ name: regex }, { description: regex }, { category: regex }],
      })
        .select("name category description image categoryIcon neighborhood")
        .limit(10),

      Post.find({
        ...(neighborhoodStr ? { neighborhood: neighborhoodStr } : {}),
        content: regex,
      })
        .populate("author", "name avatar role")
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      users: users.map((u) => ({ ...u.toObject(), id: u._id.toString() })),
      businesses: businesses.map((b) => ({ ...b.toObject(), id: b._id.toString() })),
      posts: posts.map((p) => {
        const obj = p.toObject();
        return {
          ...obj,
          id: obj._id.toString(),
          author: obj.author ? { ...obj.author, id: obj.author._id?.toString() } : obj.author,
        };
      }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
