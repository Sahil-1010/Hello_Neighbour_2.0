import { useState } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { useApp } from "../../context/AppContext";
import JobCard from "../../components/common/JobCard";
import Modal from "../../components/common/Modal";
import { workerCategories } from "../../data/mockData";

const statusFilters = [
  { id: "all", label: "All Jobs", icon: "💼" },
  { id: "pending", label: "Pending", icon: "⏳" },
  { id: "ongoing", label: "Ongoing", icon: "🔄" },
  { id: "completed", label: "Completed", icon: "✅" },
];

const urgencyOptions = [
  { value: "urgent", label: "Urgent", description: "Need it ASAP" },
  { value: "normal", label: "Normal", description: "Within a few days" },
  { value: "low", label: "Low priority", description: "Whenever available" },
];

function CreateJobModal({ isOpen, onClose }) {
  const { addJob } = useApp();
  const [form, setForm] = useState({ title: "", description: "", category: "", categoryIcon: "💼", budget: "", location: "", urgency: "normal" });

  const categoryMap = {
    Plumbing: "🔧", Electrical: "⚡", Cleaning: "🧹", Gardening: "🌿",
    Carpentry: "🪚", "Pet Care": "🐾", Moving: "📦", Tutoring: "📚", Other: "💼",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.budget) return;
    addJob({ ...form, categoryIcon: categoryMap[form.category] || "💼" });
    setForm({ title: "", description: "", category: "", categoryIcon: "💼", budget: "", location: "", urgency: "normal" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post a Job" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job title *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Fix leaking kitchen pipe" className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input bg-white dark:bg-gray-700" required>
            <option value="">Select a category</option>
            {Object.keys(categoryMap).map((cat) => (
              <option key={cat} value={cat}>{categoryMap[cat]} {cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the job in detail..." rows={3} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Budget *</label>
            <input type="text" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g., $50 – $100" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Street or area" className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Urgency</label>
          <div className="grid grid-cols-3 gap-2">
            {urgencyOptions.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setForm({ ...form, urgency: opt.value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.urgency === opt.value ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"}`}>
                <p className={`text-xs font-semibold ${form.urgency === opt.value ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>{opt.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button type="submit" disabled={!form.title || !form.category || !form.budget} className="btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
            Post Job
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Jobs() {
  const { filteredJobs, user, applyForJob, currentNeighborhood } = useApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const displayed = filteredJobs.filter((job) => {
    const matchStatus = statusFilter === "all" || job.status === statusFilter;
    const matchCat = categoryFilter === "All" || job.category === categoryFilter;
    const matchSearch = !search || job.title.toLowerCase().includes(search.toLowerCase()) || job.description.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const pendingCount = filteredJobs.filter((j) => j.status === "pending").length;
  const ongoingCount = filteredJobs.filter((j) => j.status === "ongoing").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="section-title">Jobs & Tasks</h1>
          <p className="section-subtitle">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{currentNeighborhood}</span>
            {" · "}Find work or post a task
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span className="hidden sm:inline">Post a Job</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Jobs", value: filteredJobs.length, color: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700", text: "text-gray-900 dark:text-white", icon: "💼" },
          { label: "Pending", value: pendingCount, color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50", text: "text-amber-700 dark:text-amber-400", icon: "⏳" },
          { label: "Ongoing", value: ongoingCount, color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50", text: "text-blue-700 dark:text-blue-400", icon: "🔄" },
        ].map((stat) => (
          <div key={stat.label} className={`card p-4 border ${stat.color} text-center`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search & filter toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="input pl-9" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 px-4 ${showFilters ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400" : ""}`}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {workerCategories.map((cat) => (
              <button key={cat.name} onClick={() => setCategoryFilter(cat.name)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  categoryFilter === cat.name
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1">
        {statusFilters.map((f) => {
          const count = f.id === "all" ? filteredJobs.length : filteredJobs.filter((j) => j.status === f.id).length;
          return (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                statusFilter === f.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}>
              <span>{f.icon}</span>
              {f.label}
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${statusFilter === f.id ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Job cards */}
      {displayed.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No jobs found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or post a new job.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayed.map((job) => (
            <JobCard key={job.id} job={job} onApply={applyForJob} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowCreateModal(true)} className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30">
        <Plus size={24} />
      </button>

      <CreateJobModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
