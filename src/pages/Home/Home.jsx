import { useState } from "react";
import { Plus, Briefcase, AlertTriangle, HelpCircle, Tag, Flame } from "lucide-react";
import { useApp } from "../../context/AppContext";
import PostCard from "../../components/common/PostCard";
import JobCard from "../../components/common/JobCard";
import CreatePostModal from "../../components/home/CreatePostModal";
import { users } from "../../data/mockData";

const filters = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "warning", label: "Alerts", icon: "⚠️" },
  { id: "help", label: "Help", icon: "🆘" },
  { id: "offer", label: "Offers", icon: "🎉" },
  { id: "jobs", label: "Jobs", icon: "💼" },
];

function StoriesRow() {
  const { user } = useApp();
  const storyUsers = [user, ...users.slice(0, 5)];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex gap-3 px-4 py-4 overflow-x-auto hide-scrollbar">
        {storyUsers.map((u, i) => (
          <button key={u.id || i} className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
            <div
              className={`p-0.5 rounded-2xl ${
                i === 0
                  ? "bg-gradient-to-br from-gray-300 to-gray-400"
                  : "bg-gradient-to-br from-emerald-400 to-teal-500"
              }`}
            >
              <div className="bg-white p-0.5 rounded-[14px]">
                <div className="relative">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-14 h-14 rounded-[12px] object-cover"
                  />
                  {i === 0 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Plus size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-600 font-medium w-16 text-center truncate">
              {i === 0 ? "Your story" : u.name.split(" ")[0]}
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
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <button
          onClick={onOpen}
          className="flex-1 text-left px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-all"
        >
          What's happening in {user?.neighborhood}?
        </button>
      </div>
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
        {[
          { emoji: "⚠️", label: "Alert" },
          { emoji: "🆘", label: "Help" },
          { emoji: "🎉", label: "Offer" },
          { emoji: "💬", label: "Post" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={onOpen}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <span>{action.emoji}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NearbyJobsWidget() {
  const { jobs } = useApp();
  const pendingJobs = jobs.filter((j) => j.status === "pending").slice(0, 2);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="font-semibold text-gray-900 text-sm">Nearby Jobs</span>
        </div>
        <a href="/jobs" className="text-xs text-emerald-600 font-medium hover:text-emerald-700">
          See all →
        </a>
      </div>
      <div className="space-y-2">
        {pendingJobs.map((job) => (
          <div key={job.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <span className="text-xl">{job.categoryIcon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
              <p className="text-xs text-emerald-600 font-medium">{job.budget}</p>
            </div>
            <span className="badge bg-amber-100 text-amber-700 flex-shrink-0">{job.applicants} applied</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { posts } = useApp();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const filteredPosts =
    activeFilter === "all" || activeFilter === "jobs"
      ? posts
      : posts.filter((p) => p.type === activeFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      {/* Main Feed */}
      <div className="space-y-4">
        {/* Stories */}
        <div className="card overflow-hidden -mx-0">
          <StoriesRow />
          <div className="p-4">
            <CreatePostBar onOpen={() => setShowCreatePost(true)} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 text-sm">No posts in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block space-y-4">
        <NearbyJobsWidget />

        {/* Community Stats */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Downtown Heights</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Members", value: "1,247", icon: "👥" },
              { label: "Active Jobs", value: "34", icon: "💼" },
              { label: "Workers", value: "89", icon: "🔧" },
              { label: "Businesses", value: "23", icon: "🏪" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-base font-bold text-gray-900">{stat.value}</div>
                <div className="text-[10px] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {["#cleanup", "#plumbing", "#bakery", "#safety", "#gardening", "#community", "#pets"].map(
              (tag) => (
                <button
                  key={tag}
                  className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full font-medium transition-colors"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button — mobile */}
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
