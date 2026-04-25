const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/messages/conversations
router.get("/conversations", auth, async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id })
      .populate("participants", "name avatar role isOnline")
      .sort({ lastMessageAt: -1 });

    res.json(
      convs.map((c) => {
        const other = c.participants.find((p) => p._id.toString() !== req.user.id);
        return {
          id: c._id,
          user: other,
          lastMessage: c.lastMessage,
          timestamp: timeAgo(c.lastMessageAt),
          unread: c.unreadCount?.get(req.user.id) || 0,
        };
      })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/conversations  (start or get existing)
router.post("/conversations", auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    let conv = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
    }).populate("participants", "name avatar role isOnline");

    if (!conv) {
      conv = await Conversation.create({ participants: [req.user.id, recipientId] });
      conv = await conv.populate("participants", "name avatar role isOnline");
    }

    const other = conv.participants.find((p) => p._id.toString() !== req.user.id);
    res.json({ id: conv._id, user: other, lastMessage: conv.lastMessage, unread: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/conversations/:id
router.get("/conversations/:id", auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: 1 })
      .limit(100);

    // Reset unread for this user
    await Conversation.findByIdAndUpdate(req.params.id, {
      $set: { [`unreadCount.${req.user.id}`]: 0 },
    });

    res.json(
      messages.map((m) => ({
        id: m._id,
        senderId: m.senderId,
        text: m.text,
        timestamp: timeAgo(m.createdAt),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/conversations/:id  (send message)
router.post("/conversations/:id", auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });

    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      text: req.body.text,
    });

    const recipientId = conv.participants.find((p) => p.toString() !== req.user.id);
    const prevUnread = conv.unreadCount?.get(recipientId.toString()) || 0;

    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: req.body.text,
      lastMessageAt: new Date(),
      $set: { [`unreadCount.${recipientId}`]: prevUnread + 1 },
    });

    res.status(201).json({
      id: message._id,
      senderId: message.senderId,
      text: message.text,
      timestamp: "Just now",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;
