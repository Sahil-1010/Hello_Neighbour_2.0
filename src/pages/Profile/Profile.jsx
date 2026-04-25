import { useParams, Link } from "react-router-dom";
import { Star, MapPin, MessageCircle, UserPlus, Briefcase, FileText, Award, Calendar, Clock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { users, currentUser as defaultUser } from "../../data/mockData";
import PostCard from "../../components/common/PostCard";

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
          className={star <= Math.floor(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <img src={review.avatar} alt={review.author} className="w-8 h-8 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.author}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <span className="text-xs text-gray-400 dark:text-gray-500">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.text}</p>
    </div>
  );
}

const mockReviews = [
  { id: 1, author: "Emma Davis", avatar: "https://i.pravatar.cc/150?img=5", rating: 5, date: "2 weeks ago", text: "Excellent work! Very professional, punctual, and thorough. Would definitely hire again!" },
  { id: 2, author: "Carlos Mendez", avatar: "https://i.pravatar.cc/150?img=33", rating: 4, date: "1 month ago", text: "Really helpful and friendly. Got the job done quickly at a fair price." },
  { id: 3, author: "Lisa Park", avatar: "https://i.pravatar.cc/150?img=44", rating: 5, date: "2 months ago", text: "Amazing experience. Very reliable and communicated well throughout. Highly recommended!" },
];

export default function Profile() {
  const { id } = useParams();
  const { user, posts } = useApp();

  const profileUser =
    parseInt(id) === 1
      ? { ...defaultUser, ...user }
      : users.find((u) => u.id === parseInt(id)) || users[0];

  const isOwnProfile = parseInt(id) === user?.id || parseInt(id) === 1;
  const userPosts = posts.slice(0, 3);

  const stats = [
    { label: "Posts", value: profileUser.postsCount || 12 },
    { label: "Rating", value: profileUser.rating || "—" },
    { label: "Reviews", value: profileUser.reviewCount || 0 },
    { label: "Connected", value: profileUser.connections || 47 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Cover + Avatar */}
      <div className="card overflow-hidden">
        <div className="h-40 relative">
          <img
            src={profileUser.coverImage || "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80"}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
            </div>

            {isOwnProfile ? (
              <button className="btn-secondary py-2 px-4 text-sm">Edit Profile</button>
            ) : (
              <div className="flex gap-2 mt-12">
                <Link
                  to="/chat"
                  className="flex items-center gap-1.5 btn-secondary py-2 px-3 text-sm"
                >
                  <MessageCircle size={15} />
                  Message
                </Link>
                <button className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                  <UserPlus size={15} />
                  Connect
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

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-500" />
                {profileUser.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {profileUser.joinedDate || "2024"}
              </span>
            </div>
          </div>

          {/* Bio */}
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
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{profileUser.jobsCompleted || 43}</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Jobs Done</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{profileUser.rating || 4.8}</div>
              <div className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Avg Rating</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{profileUser.hourlyRate || "$45/hr"}</div>
              <div className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Hourly Rate</div>
            </div>
          </div>

          {profileUser.skills && profileUser.skills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills & Services</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.skills.map((skill) => (
                  <span key={skill} className="badge bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1">
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
            <div className="flex items-center gap-2">
              <span className="badge bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">{profileUser.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} className="text-gray-400 dark:text-gray-500" />
              <span>Mon–Sat: 8 AM – 8 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {profileUser.rating && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              Reviews ({profileUser.reviewCount})
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.rating}</span>
              <StarRating rating={profileUser.rating} />
            </div>
          </div>
          <div className="space-y-3">
            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div>
        <h2 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText size={18} className="text-emerald-500" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
