import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, MessageCircle, UserPlus, Briefcase, FileText, Award,
  Calendar, Clock, Edit2, Check, X, Loader,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import PostCard from "../../components/common/PostCard";
import Modal from "../../components/common/Modal";

const roleColors = {
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  worker: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  business: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600"
          }
        />
      ))}
    </div>
  );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ isOpen, onClose, profileUser }) {
  const { user, setUser, addToast } = useApp();
  const [form, setForm] = useState({
    name:     profileUser.name || "",
    username: profileUser.username || "",
    bio:      profileUser.bio || "",
    avatar:   profileUser.avatar || "",
    location: profileUser.location || "",
  });
  const [saving, setSaving] = useState(false);

  // Keep form in sync if modal re-opens
  useEffect(() => {
    setForm({
      name:     profileUser.name || "",
      username: profileUser.username || "",
      bio:      profileUser.bio || "",
      avatar:   profileUser.avatar || "",
      location: profileUser.location || "",
    });
  }, [profileUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.put(`/users/${user.id}`, form);
      // Save new token if role changed (shouldn't happen in edit profile, but just in case)
      if (data.token) localStorage.setItem("hn_token", data.token);
      setUser((prev) => ({ ...prev, ...data }));
      addToast({ type: "success", message: "Profile updated!" });
      onClose();
    } catch (err) {
      addToast({ type: "error", message: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="md">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="input"
            minLength={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="input resize-none"
            placeholder="Tell your neighbors about yourself..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar URL</label>
          <input
            type="url"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="Street or area"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, posts, startConversation, fetchUserById, addToast, connectUser } = useApp();

  const isOwnProfile = id === user?.id;

  const [profileUser, setProfileUser] = useState(isOwnProfile ? user : null);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [showEdit, setShowEdit] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // When viewing own profile, keep in sync with global user state
  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(user);
      return;
    }
    setLoading(true);
    fetchUserById(id)
      .then((data) => setProfileUser(data))
      .catch(() => addToast({ type: "error", message: "Could not load profile" }))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep own-profile view up to date when global user changes
  useEffect(() => {
    if (isOwnProfile) setProfileUser(user);
  }, [user, isOwnProfile]);

  // Sync connection state when user or profile changes
  useEffect(() => {
    if (isOwnProfile || !user) return;
    const list = user.connectionList || [];
    setIsConnected(list.some((c) => c.toString() === id || c === id));
  }, [user, id, isOwnProfile]);

  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      const data = await connectUser(id);
      setIsConnected(data.connected);
      setProfileUser((prev) =>
        prev
          ? { ...prev, connections: Math.max(0, (prev.connections || 0) + (data.connected ? 1 : -1)) }
          : prev
      );
      addToast({ type: "success", message: data.connected ? "Connected!" : "Disconnected" });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Could not connect" });
    } finally {
      setConnecting(false);
    }
  };

  const handleMessage = async () => {
    if (startingChat) return;
    setStartingChat(true);
    try {
      await startConversation(id);
      navigate(`/chat?userId=${id}`);
    } catch (err) {
      addToast({ type: "error", message: err.message || "Could not open conversation" });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
        <Loader size={20} className="animate-spin" />
        Loading profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-4xl mb-3">👤</p>
        <p className="text-gray-500 dark:text-gray-400">Profile not found.</p>
      </div>
    );
  }

  const userPosts = posts.filter((p) => p.author?.id === id || p.author?._id?.toString() === id).slice(0, 3);
  const displayPosts = isOwnProfile ? posts.slice(0, 3) : userPosts;

  const stats = [
    { label: "Posts", value: profileUser.postsCount ?? 0 },
    { label: "Jobs Done", value: profileUser.jobsCompleted ?? 0 },
    { label: "Rating", value: profileUser.rating > 0 ? profileUser.rating : "—" },
    { label: "Connected", value: profileUser.connections ?? 0 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Cover + Avatar */}
      <div className="card overflow-hidden">
        <div className="h-40 relative">
          {profileUser.coverImage ? (
            <img src={profileUser.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-gray-800 shadow-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  {profileUser.name?.[0] || "?"}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setShowEdit(true)}
                className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 mt-12"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 mt-12">
                <button
                  onClick={handleMessage}
                  disabled={startingChat}
                  className="flex items-center gap-1.5 btn-secondary py-2 px-3 text-sm disabled:opacity-60"
                >
                  {startingChat ? <Loader size={14} className="animate-spin" /> : <MessageCircle size={15} />}
                  Message
                </button>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className={`py-2 px-4 text-sm flex items-center gap-1.5 disabled:opacity-60 ${isConnected ? "btn-secondary" : "btn-primary"}`}
                >
                  {connecting ? <Loader size={14} className="animate-spin" /> : <UserPlus size={15} />}
                  {isConnected ? "Connected" : "Connect"}
                </button>
              </div>
            )}
          </div>

          {/* Name & Role */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {profileUser.businessName || profileUser.name}
              </h1>
              <span className={`badge ${roleColors[profileUser.role]} capitalize`}>
                {profileUser.role}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">@{profileUser.username}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              {profileUser.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-500" />
                  {profileUser.location}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {profileUser.joinedDate || new Date(profileUser.createdAt).getFullYear() || "2024"}
              </span>
            </div>
          </div>

          {profileUser.bio && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{profileUser.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 py-4 border-t border-gray-100 dark:border-gray-700">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-bold text-gray-900 dark:text-white text-lg">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Info */}
      {profileUser.role === "worker" && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-emerald-500" />
            Work Profile
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {profileUser.jobsCompleted || 0}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Jobs Done</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {profileUser.rating > 0 ? profileUser.rating : "—"}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Avg Rating</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {profileUser.hourlyRate || "—"}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Hourly Rate</div>
            </div>
          </div>

          {profileUser.skills?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills & Services</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Business Info */}
      {profileUser.role === "business" && (
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-emerald-500" />
            Business Details
          </h2>
          <div className="space-y-3">
            {profileUser.businessName && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{profileUser.businessName}</span>
              </div>
            )}
            {profileUser.category && (
              <div className="flex items-center gap-2">
                <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                  {profileUser.category}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} className="text-gray-400 dark:text-gray-500" />
              <span>Mon–Sat: 8 AM – 8 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Rating summary (no fake reviews) */}
      {profileUser.rating > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              Rating
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.rating}</span>
              <StarRating rating={profileUser.rating} />
              <span className="text-sm text-gray-400 dark:text-gray-500">({profileUser.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText size={18} className="text-emerald-500" />
          Recent Activity
        </h2>
        {displayPosts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          profileUser={profileUser}
        />
      )}
    </div>
  );
}
