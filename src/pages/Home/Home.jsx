import { useState } from "react";
import {
  Plus, Tag, Home as HomeIcon, AlertTriangle, HelpCircle, Gift,
  Flame, Users, Briefcase, Wrench, Store, MapPin,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import PostCard from "../../components/common/PostCard";
import CreatePostModal from "../../components/home/CreatePostModal";
import { Link, useNavigate } from "react-router-dom";
import { CategoryIcon } from "../../utils/categoryIcons";

const filters = [
  { id: "all",     label: "All",    icon: HomeIcon },
  { id: "warning", label: "Alerts", icon: AlertTriangle },
  { id: "help",    label: "Help",   icon: HelpCircle },
  { id: "offer",   label: "Offers", icon: Gift },
];

// ── Offer Feed Card ────────────────────────────────────────────────────────────
function OfferFeedCard({ offer }) {
  const navigate = useNavigate();
  return (
    <div className="card overflow-hidden border border-emerald-100 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10">
      {offer.imageUrl && (
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-36 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <CategoryIcon category={offer.category} size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{offer.businessName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{offer.category}</p>
          </div>
          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex-shrink-0 text-[10px] flex items-center gap-1">
            <Gift size={10} /> Offer
          </span>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{offer.title}</h3>
        {offer.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">{offer.description}</p>
        )}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {offer.discount && (
              <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1 text-xs">
                <Tag size={10} /> {offer.discount}
              </span>
            )}
            {offer.validUntil && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Until {new Date(offer.validUntil).toLocaleDateString()}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate(`/businesses/${offer.businessId}`)}
            className="btn-primary py-1.5 px-4 text-xs flex-shrink-0"
          >
            View Business →
          </button>
        </div>
      </div>
    </div>
  );
}

const POST_TYPE_ACTIONS = [
  { icon: AlertTriangle, label: "Alert" },
  { icon: HelpCircle,   label: "Help" },
  { icon: Gift,         label: "Offer" },
  { icon: Plus,         label: "Post" },
];

function CreatePostBar({ onOpen }) {
  const { user } = useApp();
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        <button
          onClick={onOpen}
          className="flex-1 text-left px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
        >
          What's happening in your neighborhood?
        </button>
      </div>
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {POST_TYPE_ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={onOpen}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RightSidebar() {
  const { filteredJobs, filteredBusinesses, nearbyUsers, currentNeighborhood } = useApp();
  const pendingJobs = filteredJobs.filter((j) => j.status === "pending").slice(0, 2);
  const workerCount = nearbyUsers.filter((u) => u.role === "worker").length;

  const communityStats = [
    { label: "Members",     value: nearbyUsers.length || "—",                                    icon: Users },
    { label: "Active Jobs", value: filteredJobs.filter((j) => j.status === "pending").length,   icon: Briefcase },
    { label: "Workers",     value: workerCount || "—",                                           icon: Wrench },
    { label: "Businesses",  value: filteredBusinesses.length || "—",                             icon: Store },
  ];

  return (
    <div className="space-y-4">
      {/* Nearby Jobs */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
            <Flame size={15} className="text-orange-500" />
            Nearby Jobs
          </span>
          <Link to="/jobs" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700">
            See all →
          </Link>
        </div>
        <div className="space-y-2">
          {pendingJobs.map((job) => (
            <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{job.budget}</p>
              </div>
            </div>
          ))}
          {pendingJobs.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">No open jobs right now</p>
          )}
        </div>
      </div>

      {/* Community Stats */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">{currentNeighborhood}</h3>
        <div className="grid grid-cols-2 gap-3">
          {communityStats.map(({ label, value, icon: StatIcon }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
              <StatIcon size={16} className="text-emerald-500 mx-auto mb-1" />
              <div className="text-base font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Tags */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {["#cleanup", "#plumbing", "#bakery", "#safety", "#gardening", "#community", "#pets"].map((tag) => (
            <button key={tag} className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded-full font-medium transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { filteredPosts, offers, currentNeighborhood } = useApp();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const displayedPosts =
    activeFilter === "all"
      ? filteredPosts
      : filteredPosts.filter((p) => p.type === activeFilter);

  const displayedOffers = (activeFilter === "all" || activeFilter === "offer") ? offers : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      {/* Main Feed */}
      <div className="space-y-4">
        <div className="card overflow-hidden">
          <CreatePostBar onOpen={() => setShowCreatePost(true)} />
        </div>

        {/* Neighborhood indicator */}
        <div className="flex items-center gap-2 px-1">
          <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{currentNeighborhood}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">· {filteredPosts.length} posts</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map(({ id, label, icon: FilterIcon }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeFilter === id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <FilterIcon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Business Offers */}
        {displayedOffers.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1 flex items-center gap-1.5">
              <Gift size={12} className="text-emerald-500" />
              Active Business Offers
            </p>
            {displayedOffers.map((offer) => (
              <OfferFeedCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        {/* Posts */}
        {displayedPosts.length === 0 && displayedOffers.length === 0 ? (
          <div className="card p-12 text-center">
            <HomeIcon size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No posts in this category yet.</p>
          </div>
        ) : displayedPosts.length > 0 ? (
          <div className="space-y-4">
            {displayedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block">
        <RightSidebar />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="xl:hidden fixed bottom-20 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30"
      >
        <Plus size={24} />
      </button>

      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
    </div>
  );
}
