const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/posts?neighborhood=X&type=warning
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, type } = req.query;
    const filter = {};
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

// POST /api/posts
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.create({
      author: req.user.id,
      content: req.body.content,
      type: req.body.type || "general",
      image: req.body.image || null,
      neighborhood: user.neighborhood,
    });

    await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });
    const populated = await post.populate("author", "name avatar role businessName location isOnline");
    res.status(201).json(formatPost(populated, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id/like
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy.pull(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    await post.save();
    res.json({ likes: post.likes, isLiked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/comments
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      author: user.name,
      avatar: user.avatar,
      text: req.body.text,
      userId: req.user.id,
      time: "Just now",
    };
    post.commentList.push(comment);
    await post.save();
    res.status(201).json(post.commentList[post.commentList.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
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

function formatPost(post, userId) {
  const obj = post.toObject ? post.toObject() : post;
  return {
    ...obj,
    isLiked: obj.likedBy?.some((id) => id.toString() === userId),
    comments: obj.commentList?.length || 0,
    timestamp: timeAgo(obj.createdAt),
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
