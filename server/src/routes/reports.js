const router = require("express").Router();
const Report = require("../models/Report");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// POST /api/reports — create a report
router.post("/", auth, async (req, res) => {
  try {
    const { targetId, type, reason, description } = req.body;

    if (!targetId || !type || !reason) {
      return res.status(400).json({ message: "targetId, type, and reason are required" });
    }

    // Prevent self-report
    if (targetId === req.user.id) {
      return res.status(400).json({ message: "You cannot report yourself" });
    }

    const reporter = await User.findById(req.user.id).select("neighborhoodId neighborhood");

    const existing = await Report.findOne({ reportedBy: req.user.id, targetId });
    if (existing) {
      return res.status(409).json({ message: "You have already reported this content" });
    }

    const report = await Report.create({
      reportedBy:     req.user.id,
      targetId,
      type,
      reason,
      description:    description || "",
      neighborhoodId: reporter.neighborhoodId || null,
      neighborhood:   reporter.neighborhood || "",
    });

    res.status(201).json({ id: report._id.toString(), message: "Report submitted" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already reported this content" });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reports — neighborhood-scoped reports (reportedBy is NOT exposed)
router.get("/", auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    const currentUser = await User.findById(req.user.id).select("neighborhoodId neighborhood");

    const filter = {};
    if (currentUser.neighborhoodId) filter.neighborhoodId = currentUser.neighborhoodId;
    else if (currentUser.neighborhood) filter.neighborhood = currentUser.neighborhood;
    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.type = type;

    const reports = await Report.find(filter)
      .select("-reportedBy -__v")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(
      reports.map((r) => ({
        ...r.toObject(),
        id: r._id.toString(),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
