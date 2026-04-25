const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { createNotification } = require("../services/notification");

router.get("/conversations", auth, async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id })
      .populate("participants", "name avatar role isOnline")
      .sort({ lastMessageAt: -1 });
    res.json(
      convs.map((c) => {
        const other = c.participants.find((p) => p._id.toString() !== req.user.id);
        return {
          id: c._id.toString(),
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

router.post("/conversations", auth, async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Prevent self-messaging
    if (recipientId === req.user.id)
      return res.status(400).json({ message: "You cannot message yourself" });

    // Same-neighborhood check
    const [sender, recipient] = await Promise.all([
      User.findById(req.user.id).select("neighborhood neighborhoodId"),
      User.findById(recipientId).select("neighborhood neighborhoodId"),
    ]);

    if (!recipient) return res.status(404).json({ message: "User not found" });

    const senderHasNeighborhood = sender?.neighborhood || sender?.neighborhoodId;
    const recipientHasNeighborhood = recipient?.neighborhood || recipient?.neighborhoodId;

    if (senderHasNeighborhood && recipientHasNeighborhood) {
      const sameById =
        sender.neighborhoodId &&
        recipient.neighborhoodId &&
        sender.neighborhoodId.toString() === recipient.neighborhoodId.toString();
      const sameByName =
        sender.neighborhood &&
        recipient.neighborhood &&
        sender.neighborhood === recipient.neighborhood;

      if (!sameById && !sameByName) {
        return res.status(403).json({ message: "You can only message people in your neighborhood" });
      }
    }

    let conv = await Conversation.findOne({ participants: { $all: [req.user.id, recipientId] } })
      .populate("participants", "name avatar role isOnline");
    if (!conv) {
      conv = await Conversation.create({ participants: [req.user.id, recipientId] });
      conv = await conv.populate("participants", "name avatar role isOnline");
    }
    const other = conv.participants.find((p) => p._id.toString() !== req.user.id);
    res.json({ id: conv._id.toString(), user: other, lastMessage: conv.lastMessage, unread: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/conversations/:id", auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).limit(100);
    await Conversation.findByIdAndUpdate(req.params.id, { $set: { [`unreadCount.${req.user.id}`]: 0 } });
    res.json(messages.map((m) => ({
      id: m._id.toString(),
      senderId: m.senderId.toString(),
      text: m.text,
      timestamp: timeAgo(m.createdAt),
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/conversations/:id", auth, async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    const message = await Message.create({ conversationId: req.params.id, senderId: req.user.id, text: req.body.text });
    const recipientId = conv.participants.find((p) => p.toString() !== req.user.id);
    const prevUnread = conv.unreadCount?.get(recipientId.toString()) || 0;
    await Conversation.findByIdAndUpdate(req.params.id, {
      lastMessage: req.body.text,
      lastMessageAt: new Date(),
      $set: { [`unreadCount.${recipientId}`]: prevUnread + 1 },
    });

    // Notify recipient
    const senderUser = await User.findById(req.user.id).select("name avatar");
    createNotification({
      userId:  recipientId,
      type:    "message",
      message: `New message from ${senderUser.name}`,
      avatar:  senderUser.avatar,
      link:    "/chat",
    });

    res.status(201).json({ id: message._id.toString(), senderId: message.senderId.toString(), text: message.text, timestamp: "Just now" });
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
