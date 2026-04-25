import { useState, useEffect } from "react";
import {
  Building2, TrendingUp, Eye, MessageCircle, Star, Plus, Edit3, Tag,
  ToggleLeft, ToggleRight, ChevronRight, BarChart3, Users, Clock, Phone, Trash2,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import Modal from "../../components/common/Modal";

// ── Static helpers ────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Restaurant", "Cafe", "Grocery", "Hospital", "Pharmacy", "Hotel",
  "Bakery", "Salon", "Gym", "Hardware", "Electronics", "Clothing",
  "Laundry", "Repair", "Education", "Other",
];

const CATEGORY_ICONS = {
  Restaurant: "🍽️", Cafe: "☕", Grocery: "🛒", Hospital: "🏥",
  Pharmacy: "💊", Hotel: "🏨", Bakery: "🥖", Salon: "💇",
  Gym: "🏋️", Hardware: "🔧", Electronics: "📱", Clothing: "👗",
  Laundry: "👕", Repair: "🛠️", Education: "📚", Other: "🏪",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, change, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            change > 0
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          }`}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function OfferCard({ offer, businessId, onUpdate, onDelete }) {
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const updated = await api.put(`/businesses/${businessId}/offers/${offer._id}`, {
        isActive: !offer.isActive,
      });
      onUpdate(updated);
    } catch (_) {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      const updated = await api.delete(`/businesses/${businessId}/offers/${offer._id}`);
      onDelete(updated);
    } catch (_) {}
  };

  return (
    <div className={`card p-4 transition-all ${!offer.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎉</span>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{offer.title}</p>
          </div>
          {offer.discount && (
            <span className="inline-block text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full mb-1">
              {offer.discount}
            </span>
          )}
          {offer.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{offer.description}</p>
          )}
          {offer.validUntil && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Valid until {new Date(offer.validUntil).toLocaleDateString()}
            </p>
          )}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {offer.isActive ? "Visible to neighbors" : "Hidden from public"}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`transition-colors disabled:opacity-50 ${offer.isActive ? "text-emerald-500" : "text-gray-400"}`}
            title={offer.isActive ? "Disable offer" : "Enable offer"}
          >
            {offer.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Business Modal ─────────────────────────────────────────────────────

function CreateBusinessModal({ isOpen, onClose, onCreated }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({
    name: "", category: "", description: "", phone: "", hours: "", image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      setError("Business name and category are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const created = await api.post("/businesses", {
        ...form,
        categoryIcon: CATEGORY_ICONS[form.category] || "🏪",
      });
      onCreated(created);
      addToast({ type: "success", message: "Business profile created! 🎉" });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Business Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business name *</label>
          <input type="text" value={form.name} onChange={update("name")} placeholder="e.g., The Corner Bakery" className="input" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
          <select value={form.category} onChange={update("category")} className="input" required>
            <option value="">Select a category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={update("description")}
            placeholder="Tell neighbors what makes your business special…"
            rows={3}
            className="input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={update("phone")} placeholder="+1 234 567 8900" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hours</label>
            <input type="text" value={form.hours} onChange={update("hours")} placeholder="Mon–Sat 8am–8pm" className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cover image URL</label>
          <input type="url" value={form.image} onChange={update("image")} placeholder="https://example.com/photo.jpg" className="input" />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button type="submit" disabled={loading || !form.name || !form.category} className="btn-primary flex-1 py-2.5 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </span>
            ) : "Create Business"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Create Offer Modal ────────────────────────────────────────────────────────

function CreateOfferModal({ isOpen, onClose, businessId, onCreated }) {
  const { addToast } = useApp();
  const [form, setForm] = useState({ title: "", description: "", discount: "", validUntil: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { setError("Offer title is required."); return; }
    setError("");
    setLoading(true);
    try {
      const updated = await api.post(`/businesses/${businessId}/offers`, form);
      onCreated(updated);
      addToast({ type: "success", message: "Offer published! 📢" });
      setForm({ title: "", description: "", discount: "", validUntil: "" });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Offer / Ad">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Offer title *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., 30% off all pastries this Friday" className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your offer…" rows={3} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Discount / Value</label>
            <input type="text" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="e.g., 30% off" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Valid until</label>
            <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              className="input" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button type="submit" disabled={loading || !form.title} className="btn-primary flex-1 py-2.5 disabled:opacity-50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing…
              </span>
            ) : "Publish Offer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── No Business Screen ────────────────────────────────────────────────────────

function NoBusiness({ onCreateClick }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-5xl">🏪</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set Up Your Business</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
        Create your business profile to start reaching customers in your neighborhood.
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
        Your profile will appear in the Business Directory and on the Nearby map for everyone in your area.
      </p>
      <div className="space-y-3 mb-8 text-left">
        {[
          "📢 Post offers and promotions",
          "⭐ Collect reviews from real customers",
          "💬 Receive direct messages from interested neighbors",
          "📊 Track profile views and engagement",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            {item}
          </div>
        ))}
      </div>
      <button onClick={onCreateClick} className="btn-primary px-8 py-3 text-base flex items-center gap-2 mx-auto">
        <Plus size={20} /> Create Business Profile
      </button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function BusinessDashboard() {
  const { user, addToast, addBusiness, updateBusiness } = useApp();
  const [myBusiness, setMyBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    api.get("/businesses/my")
      .then((data) => setMyBusiness(data[0] || null))
      .catch(() => {})
      .finally(() => setBusinessLoading(false));
  }, []);

  const handleBusinessCreated = (newBusiness) => {
    setMyBusiness(newBusiness);
    addBusiness(newBusiness); // sync with public business list
  };

  // Called when an offer is added or toggled — the server returns the full updated business
  const handleBusinessUpdated = (updated) => {
    setMyBusiness(updated);
    updateBusiness(updated); // sync with public business list
  };

  const stats = [
    { icon: Eye, label: "Profile Views", value: "1,247", change: 12, color: "bg-blue-500" },
    { icon: MessageCircle, label: "Inquiries", value: "34", change: 8, color: "bg-purple-500" },
    { icon: Users, label: "Followers", value: "312", change: 5, color: "bg-emerald-500" },
    { icon: Star, label: "Avg Rating", value: myBusiness?.rating || "—", change: null, color: "bg-amber-500" },
  ];

  const recentActivity = [
    { icon: "👁️", text: "15 people viewed your business profile", time: "1 hour ago" },
    { icon: "💬", text: "New message from a neighbor", time: "2 hours ago" },
    { icon: "⭐", text: "Someone left a 5-star review", time: "5 hours ago" },
    { icon: "📢", text: "Your offer reached 245 people", time: "1 day ago" },
  ];

  if (businessLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your business…</p>
        </div>
      </div>
    );
  }

  if (!myBusiness) {
    return (
      <>
        <NoBusiness onCreateClick={() => setShowCreateModal(true)} />
        <CreateBusinessModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleBusinessCreated}
        />
      </>
    );
  }

  const activeOffers = myBusiness.offers?.filter((o) => o.isActive) || [];
  const allOffers = myBusiness.offers || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your business profile and offerings</p>
        </div>
        <button onClick={() => setShowOfferModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span className="hidden sm:inline">New Offer</span>
        </button>
      </div>

      {/* Business Profile Card */}
      <div className="card overflow-hidden">
        <div className="h-36 relative">
          {myBusiness.image ? (
            <img src={myBusiness.image} alt={myBusiness.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <span className="text-6xl">{myBusiness.categoryIcon || "🏪"}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <span className={`badge ${myBusiness.isOpen ? "bg-emerald-500 text-white" : "bg-gray-600 text-white"}`}>
              {myBusiness.isOpen ? "● Open Now" : "● Closed"}
            </span>
          </div>
        </div>
        <div className="p-5 -mt-8">
          <div className="flex items-end justify-between mb-3">
            <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-2xl shadow-md border border-gray-100 dark:border-gray-600 flex items-center justify-center text-3xl">
              {myBusiness.categoryIcon || "🏪"}
            </div>
            <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 mt-8">
              <Edit3 size={14} /> Edit Profile
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{myBusiness.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{myBusiness.category}</p>
          {myBusiness.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{myBusiness.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {myBusiness.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{myBusiness.rating}</span>
                ({myBusiness.reviewCount} reviews)
              </span>
            )}
            {myBusiness.hours && (
              <span className="flex items-center gap-1.5"><Clock size={14} />{myBusiness.hours}</span>
            )}
            {myBusiness.phone && (
              <span className="flex items-center gap-1.5"><Phone size={14} />{myBusiness.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-500" />
          Performance Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Weekly Engagement</h3>
        <div className="flex items-end gap-2 h-24">
          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg bg-emerald-500/80 hover:bg-emerald-500 transition-all cursor-pointer" style={{ height: `${h}%` }} />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{["M","T","W","T","F","S","S"][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Offers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag size={18} className="text-emerald-500" />
              Manage Offers & Ads
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {activeOffers.length} of {allOffers.length} offers visible to neighbors
            </p>
          </div>
          <button
            onClick={() => setShowOfferModal(true)}
            className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
          >
            <Plus size={14} /> Add offer
          </button>
        </div>

        {allOffers.length === 0 ? (
          <div className="card p-8 text-center border-dashed border-2 border-gray-200 dark:border-gray-700">
            <p className="text-3xl mb-2">📢</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">No offers yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create an offer to attract more customers</p>
            <button onClick={() => setShowOfferModal(true)} className="btn-primary py-2 px-6 text-sm">
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {allOffers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                businessId={myBusiness._id || myBusiness.id}
                onUpdate={handleBusinessUpdated}
                onDelete={handleBusinessUpdated}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-3">Recent Activity</h2>
        <div className="card divide-y divide-gray-100 dark:divide-gray-700">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.text}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        businessId={myBusiness._id || myBusiness.id}
        onCreated={handleBusinessUpdated}
      />
      <CreateBusinessModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleBusinessCreated}
      />
    </div>
  );
}
