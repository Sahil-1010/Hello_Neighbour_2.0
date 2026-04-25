import { useState } from "react";
import { MapPin, Clock, Users, AlertCircle, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useApp } from "../../context/AppContext";

const statusConfig = {
  open:      { label: "Open",      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  applied:   { label: "Applied",   className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  pending:   { label: "Pending",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  ongoing:   { label: "Ongoing",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  completed: { label: "Completed", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  closed:    { label: "Closed",    className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
};

const urgencyConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  normal: null,
  low: { label: "Low priority", className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
};

export default function JobCard({ job, onApply, showActions = true }) {
  const { user, addJobComment, closeJob, updateJobStatus } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const status = statusConfig[job.status];
  const urgency = urgencyConfig[job.urgency];
  const isOwner = job.postedBy?.id === user?.id || job.postedBy?._id === user?.id;

  const applicantIds = (job.applicantList || []).map((id) => id?.toString?.() ?? id);
  const hasApplied = applicantIds.includes(user?.id);

  const comments = job.comments || [];

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addJobComment(job.id, commentText.trim());
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-4 hover:shadow-card-hover transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {job.categoryIcon && <span className="text-lg">{job.categoryIcon}</span>}
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight">{job.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${status.className}`}>{status.label}</span>
            {urgency && (
              <span className={`badge ${urgency.className} flex items-center gap-1`}>
                {job.urgency === "urgent" && <AlertCircle size={10} />}
                {urgency.label}
              </span>
            )}
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{job.category}</span>
            {hasApplied && !isOwner && (
              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Applied</span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{job.budget}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-3">{job.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
        {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>}
        <span className="flex items-center gap-1"><Clock size={12} />{job.postedAt}</span>
        <span className="flex items-center gap-1"><Users size={12} />{job.applicants} applicants</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {job.postedBy?.avatar ? (
            <img src={job.postedBy.avatar} alt={job.postedBy?.name} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {job.postedBy?.name?.[0] || "?"}
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Posted by</p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{job.postedBy?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Comments toggle */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <MessageSquare size={13} />
            {comments.length}
            {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showActions && (
            <>
              {job.status === "ongoing" && job.assignedTo && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {job.assignedTo.avatar ? (
                    <img src={job.assignedTo.avatar} alt={job.assignedTo.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400">
                      {job.assignedTo.name?.[0]}
                    </div>
                  )}
                  <span>{job.assignedTo.name}</span>
                </div>
              )}
              {!isOwner && ["open", "applied", "pending"].includes(job.status) && user?.role === "worker" && !hasApplied && (
                <button onClick={() => onApply && onApply(job.id)} className="btn-primary py-1.5 px-4 text-sm">
                  Apply
                </button>
              )}
              {isOwner && ["open", "applied", "pending"].includes(job.status) && (
                <>
                  <button
                    onClick={async () => { try { await updateJobStatus(job.id, "ongoing"); } catch {} }}
                    className="py-1.5 px-3 text-xs rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    Start
                  </button>
                  <button
                    onClick={async () => { try { await closeJob(job.id); } catch {} }}
                    className="py-1.5 px-3 text-xs rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
              {isOwner && job.status === "ongoing" && (
                <button
                  onClick={async () => { try { await updateJobStatus(job.id, "completed"); } catch {} }}
                  className="py-1.5 px-3 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  Complete
                </button>
              )}
              {isOwner && job.status === "completed" && (
                <button
                  onClick={async () => { try { await closeJob(job.id); } catch {} }}
                  className="py-1.5 px-3 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Archive
                </button>
              )}
              {isOwner && job.status === "closed" && (
                <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">Closed</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No comments yet</p>
          ) : (
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {comments.map((c, i) => (
                <div key={c._id ?? i} className="flex gap-2">
                  {c.userAvatar ? (
                    <img src={c.userAvatar} alt={c.userName} className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5">
                      {c.userName?.[0] || "?"}
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5 flex-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.userName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="input text-xs py-1.5 flex-1"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="btn-primary py-1.5 px-3 text-xs disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
