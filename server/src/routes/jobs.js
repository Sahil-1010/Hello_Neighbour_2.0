const router = require("express").Router();
const Job = require("../models/Job");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/jobs?neighborhood=X&status=pending&category=Plumbing
router.get("/", auth, async (req, res) => {
  try {
    const { neighborhood, status, category } = req.query;
    const filter = {};
    if (neighborhood) filter.neighborhood = neighborhood;
    if (status && status !== "all") filter.status = status;
    if (category && category !== "All") filter.category = category;
    const jobs = await Job.find(filter)
      .populate("postedBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(jobs.map((j) => formatJob(j)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/jobs
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const job = await Job.create({
      ...req.body,
      postedBy: req.user.id,
      neighborhood: user.neighborhood,
    });
    const populated = await job.populate("postedBy", "name avatar");
    res.status(201).json(formatJob(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/jobs/:id/apply
router.put("/:id/apply", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "pending") return res.status(400).json({ message: "Job is not accepting applications" });
    if (job.applicantList.includes(req.user.id))
      return res.status(400).json({ message: "Already applied" });

    job.applicantList.push(req.user.id);
    job.applicants += 1;
    await job.save();
    res.json({ applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/jobs/:id/status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    job.status = req.body.status;
    if (req.body.assignedTo) job.assignedTo = req.body.assignedTo;
    await job.save();

    if (req.body.status === "completed" && job.assignedTo) {
      await User.findByIdAndUpdate(job.assignedTo, { $inc: { jobsCompleted: 1 } });
    }

    const populated = await job.populate([
      { path: "postedBy", select: "name avatar" },
      { path: "assignedTo", select: "name avatar" },
    ]);
    res.json(formatJob(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    await job.deleteOne();
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function formatJob(job) {
  const obj = job.toObject ? job.toObject() : job;
  return { ...obj, postedAt: timeAgo(obj.createdAt) };
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;
