import { useState } from "react";
import {
  Building2, TrendingUp, Eye, MessageCircle, Star, Plus, Edit3, Tag,
  Briefcase, ToggleLeft, ToggleRight, ChevronRight, BarChart3, Users, Clock,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { businesses, jobs } from "../../data/mockData";
import Modal from "../../components/common/Modal";

function StatCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${change > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function OfferCard({ offer, onToggle }) {
  const [active, setActive] = useState(true);
  return (
    <div className={`card p-4 transition-all ${!active ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎉</span>
            <p className="font-semibold text-gray-900 text-sm">{offer}</p>
          </div>
          <p className="text-xs text-gray-500">Posted 3 days ago · 45 views</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActive(!active)}
            className={`transition-colors ${active ? "text-emerald-500" : "text-gray-400"}`}
          >
            {active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <Edit3 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateOfferModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ title: "", description: "", discount: "", validUntil: "" });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Offer / Ad">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., 30% off all pastries this Friday"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your offer in detail..."
            rows={3}
            className="input resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount / Value</label>
            <input
              type="text"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="e.g., 30% off"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid until</label>
            <input
              type="date"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              className="input"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button
            onClick={onClose}
            disabled={!form.title}
            className="btn-primary flex-1 py-2.5 disabled:opacity-50"
          >
            Publish Offer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function BusinessDashboard() {
  const { user } = useApp();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const business = businesses[0];
  const businessJobs = jobs.filter((j) => j.status !== "completed").slice(0, 3);

  const stats = [
    { icon: Eye, label: "Profile Views", value: "1,247", change: 12, color: "bg-blue-500" },
    { icon: MessageCircle, label: "Inquiries", value: "34", change: 8, color: "bg-purple-500" },
    { icon: Users, label: "Followers", value: "312", change: 5, color: "bg-emerald-500" },
    { icon: Star, label: "Avg Rating", value: "4.7", change: null, color: "bg-amber-500" },
  ];

  const recentActivity = [
    { icon: "👁️", text: "15 people viewed your business profile", time: "1 hour ago" },
    { icon: "💬", text: "New message from Sarah Johnson", time: "2 hours ago" },
    { icon: "⭐", text: "James Wilson left a 5-star review", time: "5 hours ago" },
    { icon: "📢", text: "Your Friday offer reached 245 people", time: "1 day ago" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your business profile and offerings</p>
        </div>
        <button
          onClick={() => setShowOfferModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Offer</span>
        </button>
      </div>

      {/* Business Profile Card */}
      <div className="card overflow-hidden">
        <div className="h-36 relative">
          <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <span className={`badge ${business.isOpen ? "bg-emerald-500 text-white" : "bg-gray-600 text-white"}`}>
              {business.isOpen ? "● Open Now" : "● Closed"}
            </span>
          </div>
        </div>
        <div className="p-5 -mt-8">
          <div className="flex items-end justify-between mb-3">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center text-3xl">
              🏪
            </div>
            <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 mt-8">
              <Edit3 size={14} />
              Edit Profile
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{business.name}</h2>
          <p className="text-sm text-gray-500 mb-1">{business.category}</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{business.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-900">{business.rating}</span>
              ({business.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {business.hours}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-500" />
          Performance Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Weekly chart placeholder */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Weekly Engagement</h3>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg bg-emerald-500/80 hover:bg-emerald-500 transition-all cursor-pointer"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-gray-400">
                {["M", "T", "W", "T", "F", "S", "S"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Offers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Tag size={18} className="text-emerald-500" />
            Active Offers & Ads
          </h2>
          <button
            onClick={() => setShowOfferModal(true)}
            className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1"
          >
            <Plus size={14} /> Add offer
          </button>
        </div>
        <div className="space-y-3">
          {business.offers.map((offer, i) => (
            <OfferCard key={i} offer={offer} />
          ))}
        </div>
      </div>

      {/* Job Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Briefcase size={18} className="text-emerald-500" />
            Job Requests
          </h2>
          <a href="/jobs" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
            View all <ChevronRight size={14} />
          </a>
        </div>
        <div className="space-y-3">
          {businessJobs.map((job) => (
            <div key={job.id} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{job.categoryIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{job.title}</p>
                <p className="text-xs text-gray-500">{job.budget} · {job.postedAt}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge text-[10px] ${
                  job.status === "pending" ? "bg-amber-100 text-amber-700" :
                  job.status === "ongoing" ? "bg-blue-100 text-blue-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {job.status}
                </span>
                <button className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Recent Activity</h2>
        <div className="card divide-y divide-gray-100">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{item.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateOfferModal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} />
    </div>
  );
}
