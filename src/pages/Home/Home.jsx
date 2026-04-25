import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "../../context/AppContext";
import PostCard from "../../components/common/PostCard";
import CreatePostModal from "../../components/home/CreatePostModal";
import { users } from "../../data/mockData";
import { Link } from "react-router-dom";

const filters = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "warning", label: "Alerts", icon: "⚠️" },
  { id: "help", label: "Help", icon: "🆘" },
  { id: "offer", label: "Offers", icon: "🎉" },
];

function StoriesRow() {
  const { user } = useApp();
  const storyUsers = [user, ...users.slice(0, 5)];
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
      <div className="flex gap-3 px-4 py-4 overflow-x-auto hide-scrollbar">
        {storyUsers.map((u, i) => (
          <button key={u?.id || i} className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
            <div className={`p-0.5 rounded-2xl ${i === 0 ? "bg-gradient-to-br from-gray-300 to-gray-400" : "bg-gradient-to-br from-emerald-400 to-teal-500"}`}>
              <div className="bg-white dark:bg-gray-800 p-0.5 rounded-[14px]">
                <div className="relative">
                  <img src={u?.avatar} alt={u?.name} className="w-14 h-14 rounded-[12px] object-cover" />
                  {i === 0 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <Plus size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium w-16 text-center truncate">
              {i === 0 ? "Your story" : u?.name?.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

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
        {[{ emoji: "⚠️", label: "Alert" }, { emoji: "🆘", label: "Help" }, { emoji: "🎉", label: "Offer" }, { emoji: "💬", label: "Post" }].map((a) => (
          <button key={a.label} onClick={onOpen} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <span>{a.emoji}</span>
            <span className="hidden sm:inline">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RightSidebar() {
  const { filteredJobs, currentNeighborhood } = useApp();
  const pendingJobs = filteredJobs.filter((j) => j.status === "pending").slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Nearby Jobs */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
            🔥 Nearby Jobs
          </span>
          <Link to="/jobs" className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700">
            See all →
          </Link>
        </div>
        <div className="space-y-2">
          {pendingJobs.map((job) => (
            <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <span className="text-xl">{job.categoryIcon}</span>
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
          {[
            { label: "Members", value: "1,247", icon: "👥" },
            { label: "Active Jobs", value: "34", icon: "💼" },
            { label: "Workers", value: "89", icon: "🔧" },
            { label: "Businesses", value: "19", icon: "🏪" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-base font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">{stat.label}</div>
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
  const { filteredPosts, currentNeighborhood } = useApp();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const displayedPosts =
    activeFilter === "all"
      ? filteredPosts
      : filteredPosts.filter((p) => p.type === activeFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      {/* Main Feed */}
      <div className="space-y-4">
        {/* Stories + create bar */}
        <div className="card overflow-hidden">
          <StoriesRow />
          <CreatePostBar onOpen={() => setShowCreatePost(true)} />
        </div>

        {/* Neighborhood indicator */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">📍 {currentNeighborhood}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">· {filteredPosts.length} posts</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeFilter === f.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {displayedPosts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No posts in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
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
