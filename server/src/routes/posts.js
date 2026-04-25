const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, type } = req.query;
    const filter = {};

    // Neighborhood string is the stable primary filter (works with all existing data)
    if (neighborhood) filter.neighborhood = neighborhood;
    if (type && type !== "all") filter.type = type;

    const posts = await Post.find(filter)
      .populate("author", "name avatar role businessName location isOnline")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts.map((p) => formatPost(p, req.user.id)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const postData = {
      author:       req.user.id,
      content:      req.body.content,
      type:         req.body.type || "general",
      image:        req.body.image || null,
      neighborhood: user.neighborhood,
    };

    // Attach author's geolocation so the post can be found via radius queries later
    if (hasValidGeo(user.geoLocation)) {
      postData.geoLocation = user.geoLocation;
    }

    const post = await Post.create(postData);
    await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });
    const populated = await post.populate("author", "name avatar role businessName location isOnline");
    res.status(201).json(formatPost(populated, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle like (removes dislike if present)
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const alreadyLiked = post.likedBy.map((id) => id.toString()).includes(req.user.id);
    if (alreadyLiked) {
      post.likedBy.pull(req.user.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user.id);
      post.likes += 1;
      // Remove dislike if switching to like
      const wasDisliked = post.dislikedBy.map((id) => id.toString()).includes(req.user.id);
      if (wasDisliked) {
        post.dislikedBy.pull(req.user.id);
        post.dislikes = Math.max(0, post.dislikes - 1);
      }
    }
    await post.save();
    res.json({ likes: post.likes, isLiked: !alreadyLiked, dislikes: post.dislikes, isDisliked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle dislike (removes like if present)
router.put("/:id/dislike", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const alreadyDisliked = post.dislikedBy.map((id) => id.toString()).includes(req.user.id);
    if (alreadyDisliked) {
      post.dislikedBy.pull(req.user.id);
      post.dislikes = Math.max(0, post.dislikes - 1);
    } else {
      post.dislikedBy.push(req.user.id);
      post.dislikes += 1;
      // Remove like if switching to dislike
      const wasLiked = post.likedBy.map((id) => id.toString()).includes(req.user.id);
      if (wasLiked) {
        post.likedBy.pull(req.user.id);
        post.likes = Math.max(0, post.likes - 1);
      }
    }
    await post.save();
    res.json({ dislikes: post.dislikes, isDisliked: !alreadyDisliked, likes: post.likes, isLiked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/comments", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = {
      author: user.name,
      avatar: user.avatar,
      text:   req.body.text,
      userId: req.user.id,
      time:   "Just now",
    };
    post.commentList.push(comment);
    await post.save();
    res.status(201).json(post.commentList[post.commentList.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasValidGeo(geo) {
  return (
    geo?.coordinates?.length === 2 &&
    (geo.coordinates[0] !== 0 || geo.coordinates[1] !== 0)
  );
}

function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : post;
  const author = obj.author ? { ...obj.author, id: obj.author._id?.toString() } : obj.author;
  return {
    ...obj,
    author,
    id: obj._id?.toString(),
    isLiked:    obj.likedBy?.some((id) => id.toString() === userId),
    isDisliked: obj.dislikedBy?.some((id) => id.toString() === userId),
    comments:   obj.commentList?.length || 0,
    timestamp:  timeAgo(obj.createdAt),
  };
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;
