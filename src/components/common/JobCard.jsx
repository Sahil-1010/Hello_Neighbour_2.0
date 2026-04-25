import { MapPin, Clock, Users, DollarSign, AlertCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  ongoing: { label: "Ongoing", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
};

const urgencyConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
  normal: null,
  low: { label: "Low priority", className: "bg-gray-100 text-gray-600" },
};

export default function JobCard({ job, onApply, showActions = true }) {
  const { user } = useApp();
  const status = statusConfig[job.status];
  const urgency = urgencyConfig[job.urgency];
  const isOwner = job.postedBy?.id === user?.id;

  return (
    <div className="card p-4 hover:shadow-card-hover transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {job.categoryIcon && <span className="text-lg">{job.categoryIcon}</span>}
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{job.title}</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${status.className}`}>{status.label}</span>
            {urgency && (
              <span className={`badge ${urgency.className} flex items-center gap-1`}>
                {job.urgency === "urgent" && <AlertCircle size={10} />}
                {urgency.label}
              </span>
            )}
            <span className="badge bg-gray-100 text-gray-600">{job.category}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-emerald-600 text-sm">{job.budget}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">{job.description}</p>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {job.postedAt}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {job.applicants} applicants
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <img
            src={job.postedBy?.avatar}
            alt={job.postedBy?.name}
            className="w-7 h-7 rounded-full object-cover"
          />
          <div>
            <p className="text-xs text-gray-500">Posted by</p>
            <p className="text-xs font-medium text-gray-700">{job.postedBy?.name}</p>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {job.status === "ongoing" && job.assignedTo && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <img
                  src={job.assignedTo.avatar}
                  alt={job.assignedTo.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>{job.assignedTo.name}</span>
              </div>
            )}
            {!isOwner && job.status === "pending" && user?.role === "worker" && (
              <button
                onClick={() => onApply && onApply(job.id)}
                className="btn-primary py-1.5 px-4 text-sm"
              >
                Apply
              </button>
            )}
            {isOwner && (
              <span className="badge bg-gray-100 text-gray-500 text-xs">Your job</span>
            )}
            {!isOwner && job.status !== "pending" && (
              <button className="btn-secondary py-1.5 px-4 text-sm">View</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
