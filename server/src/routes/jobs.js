const router = require("express").Router();
const Job = require("../models/Job");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");
const { createNotification } = require("../services/notification");

// GET /api/jobs — all jobs in neighborhood
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
    res.json(jobs.map(formatJob));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/jobs/my — worker's applied/assigned/completed jobs
// Must be BEFORE /:id routes so "my" is not parsed as a MongoDB ObjectId
router.get("/my", auth, requireRole("worker"), async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [{ applicantList: req.user.id }, { assignedTo: req.user.id }],
    })
      .populate("postedBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json(jobs.map(formatJob));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/jobs
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const jobData = { ...req.body, postedBy: req.user.id, neighborhood: user.neighborhood };

    if (hasValidGeo(user.geoLocation)) {
      jobData.geoLocation = user.geoLocation;
    }

    const job = await Job.create(jobData);
    const populated = await job.populate("postedBy", "name avatar");
    res.status(201).json(formatJob(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/jobs/:id/apply — workers only
router.put("/:id/apply", auth, requireRole("worker"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!["open", "applied", "pending"].includes(job.status))
      return res.status(400).json({ message: "Job is not accepting applications" });
    if (job.applicantList.map((id) => id.toString()).includes(req.user.id))
      return res.status(400).json({ message: "Already applied" });

    job.applicantList.push(req.user.id);
    job.applicants += 1;
    if (job.applicants === 1 && ["open", "pending"].includes(job.status)) {
      job.status = "applied";
    }
    await job.save();

    // Notify the job poster
    const worker = await User.findById(req.user.id).select("name avatar");
    createNotification({
      userId:  job.postedBy,
      type:    "job_applied",
      message: `${worker.name} applied to your job: "${job.title}"`,
      avatar:  worker.avatar,
      link:    "/jobs",
    });

    res.json({ applicants: job.applicants });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/jobs/:id/status — poster manages status and worker assignment
router.put("/:id/status", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    job.status = req.body.status;
    if (req.body.assignedTo) job.assignedTo = req.body.assignedTo;
    await job.save();

    // Notify worker on assignment
    if (req.body.status === "ongoing" && req.body.assignedTo) {
      const poster = await User.findById(req.user.id).select("name");
      createNotification({
        userId:  req.body.assignedTo,
        type:    "job_assigned",
        message: `You've been assigned to "${job.title}" by ${poster?.name}`,
        link:    "/jobs",
      });
    }

    // Increment worker's jobsCompleted + notify on completion
    if (req.body.status === "completed" && job.assignedTo) {
      await User.findByIdAndUpdate(job.assignedTo, { $inc: { jobsCompleted: 1 } });
      createNotification({
        userId:  job.assignedTo,
        type:    "job_completed",
        message: `Job "${job.title}" marked as completed. Great work!`,
        link:    "/jobs",
      });
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

// PUT /api/jobs/:id/close — poster only, marks job as closed
router.put("/:id/close", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });
    if (job.status === "closed")
      return res.status(400).json({ message: "Job is already closed" });

    job.status = "closed";
    await job.save();

    const populated = await job.populate([
      { path: "postedBy", select: "name avatar" },
      { path: "assignedTo", select: "name avatar" },
    ]);
    res.json(formatJob(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/jobs/:id/comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text is required" });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const commenter = await User.findById(req.user.id).select("name avatar");
    job.comments.push({
      userId:     req.user.id,
      userName:   commenter.name,
      userAvatar: commenter.avatar,
      text:       text.trim(),
    });
    await job.save();

    // Notify job poster (unless they're the one commenting)
    if (job.postedBy.toString() !== req.user.id) {
      createNotification({
        userId:  job.postedBy,
        type:    "comment",
        message: `${commenter.name} commented on your job: "${job.title}"`,
        avatar:  commenter.avatar,
        link:    "/jobs",
      });
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasValidGeo(geo) {
  return (
    geo?.coordinates?.length === 2 &&
    (geo.coordinates[0] !== 0 || geo.coordinates[1] !== 0)
  );
}

function formatJob(job) {
  const obj = job.toObject ? job.toObject() : job;
  return { ...obj, id: obj._id?.toString(), postedAt: timeAgo(obj.createdAt) };
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

module.exports = router;
