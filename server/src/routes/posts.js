const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

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

router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const alreadyLiked = post.likedBy.includes(req.user.id);
    if (alreadyLiked) {
      post.likedBy.pull(req.user.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(req.user.id);
      post.likes += 1;
    }
    await post.save();
    res.json({ likes: post.likes, isLiked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/comments", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = { author: user.name, avatar: user.avatar, text: req.body.text, userId: req.user.id, time: "Just now" };
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
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
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
    id: obj._id?.toString(),
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
