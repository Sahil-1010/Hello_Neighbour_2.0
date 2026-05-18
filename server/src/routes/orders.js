const router = require("express").Router();
const Order = require("../models/Order");
const Business = require("../models/Business");
const { auth } = require("../middleware/auth");

// POST /api/orders — place a new order
router.post("/", auth, async (req, res) => {
  try {
    const { businessId, items, budget, comment } = req.body;
    if (!businessId) return res.status(400).json({ message: "businessId is required" });

    const order = await Order.create({
      userId:     req.user.id,
      businessId,
      items:      (items || []).filter((i) => i?.name?.trim()),
      budget:     budget || "",
      comment:    comment || "",
    });

    const populated = await Order.findById(order._id)
      .populate("userId", "name avatar")
      .populate("businessId", "name categoryIcon neighborhood");

    res.status(201).json({ ...populated.toObject(), id: populated._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my — orders placed by the current user (all businesses)
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("businessId", "name categoryIcon neighborhood image")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders.map((o) => ({ ...o.toObject(), id: o._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/user/:businessId — orders placed by current user FOR a specific business
// Must be before /business/:businessId and /:id routes
router.get("/user/:businessId", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      userId:     req.user.id,
      businessId: req.params.businessId,
    })
      .populate("businessId", "name categoryIcon")
      .sort({ createdAt: -1 });
    res.json(orders.map((o) => ({ ...o.toObject(), id: o._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/business/:businessId — all orders for a specific business (owner only)
router.get("/business/:businessId", auth, async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const orders = await Order.find({ businessId: req.params.businessId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders.map((o) => ({ ...o.toObject(), id: o._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — owner updates order status + optional reply
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, ownerReply } = req.body;
    if (!["pending", "accepted", "partial", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id).populate("businessId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.businessId.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    order.status = status;
    if (ownerReply !== undefined) order.ownerReply = ownerReply;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate("userId", "name avatar")
      .populate("businessId", "name categoryIcon");
    res.json({ ...populated.toObject(), id: populated._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
