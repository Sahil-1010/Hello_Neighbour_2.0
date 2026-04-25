import { useState, useEffect } from "react";
import { Flag, AlertTriangle, User, FileText, Briefcase, Building2, MapPin, Clock, CheckCircle, Eye } from "lucide-react";
import { api } from "../../services/api";
import { useApp } from "../../context/AppContext";

const typeConfig = {
  user:         { label: "User",         icon: User,         color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  post:         { label: "Post",         icon: FileText,     color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  job:          { label: "Job",          icon: Briefcase,    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  business:     { label: "Business",     icon: Building2,    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  neighborhood: { label: "Neighborhood", icon: MapPin,       color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
};

const statusConfig = {
  pending:  { label: "Pending",  icon: Clock,         color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  reviewed: { label: "Reviewed", icon: Eye,           color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  resolved: { label: "Resolved", icon: CheckCircle,   color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

const STATUS_FILTERS = ["all", "pending", "reviewed", "resolved"];
const TYPE_FILTERS   = ["all", "user", "post", "job", "business", "neighborhood"];

function ReportCard({ report }) {
  const tc = typeConfig[report.type] || typeConfig.user;
  const sc = statusConfig[report.status] || statusConfig.pending;
  const TypeIcon   = tc.icon;
  const StatusIcon = sc.icon;

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.color}`}>
          <TypeIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge text-[10px] ${tc.color}`}>{tc.label}</span>
            <span className={`badge text-[10px] flex items-center gap-1 ${sc.color}`}>
              <StatusIcon size={10} /> {sc.label}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{report.reason}</p>
          {report.type === "post" && report.postContent && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 mb-1.5 border-l-2 border-blue-300 dark:border-blue-600">
              <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-3">"{report.postContent}"</p>
            </div>
          )}
          {report.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{report.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { currentNeighborhood } = useApp();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeType, setActiveType] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeStatus !== "all") params.set("status", activeStatus);
    if (activeType !== "all") params.set("type", activeType);
    api.get(`/reports?${params.toString()}`)
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeStatus, activeType]);

  // Group by type
  const grouped = TYPE_FILTERS.filter((t) => t !== "all").reduce((acc, type) => {
    const items = reports.filter((r) => r.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <Flag size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentNeighborhood}</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-3">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 capitalize ${
              activeStatus === s
                ? "bg-emerald-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {s === "all" ? "All Statuses" : s}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-5">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 capitalize ${
              activeType === t
                ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {t === "all" ? "All Types" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No reports yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Your neighborhood is clean!</p>
        </div>
      ) : activeType !== "all" ? (
        <div className="space-y-3">
          {reports.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => {
            const tc = typeConfig[type];
            const Icon = tc.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} className="text-gray-500 dark:text-gray-400" />
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {tc.label} Reports ({items.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {items.map((r) => <ReportCard key={r.id} report={r} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      <div className="mt-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          Reporter identities are kept confidential. Reports are reviewed by community moderators and resolved within 48 hours.
        </p>
      </div>
    </div>
  );
}
