import { Link } from "react-router-dom";
import { Star, MapPin, MessageCircle, UserPlus } from "lucide-react";

const roleColors = {
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  worker: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  business: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export default function ProfileCard({ person, compact = false }) {
  if (compact) {
    return (
      <Link
        to={`/profile/${person.id}`}
        className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all duration-200 group"
      >
        <div className="relative flex-shrink-0">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {person.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
            {person.businessName || person.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`badge ${roleColors[person.role]} capitalize text-[10px]`}>
              {person.role}
            </span>
            {person.distance && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                <MapPin size={10} />
                {person.distance}
              </span>
            )}
          </div>
          {person.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300">{person.rating}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">({person.reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-200">
      {/* Header gradient */}
      <div className="h-16 bg-gradient-to-r from-emerald-400 to-teal-500" />

      {/* Avatar */}
      <div className="px-4 pb-4 -mt-7">
        <div className="flex items-end justify-between mb-3">
          <div className="relative">
            <img
              src={person.avatar}
              alt={person.name}
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-800 shadow-sm"
            />
            {person.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div className="flex gap-2 mt-7">
            <Link
              to="/chat"
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <MessageCircle size={16} />
            </Link>
            <button className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5">
              <UserPlus size={14} />
              Connect
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${person.id}`}
              className="font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {person.businessName || person.name}
            </Link>
            <span className={`badge ${roleColors[person.role]} capitalize text-[10px]`}>
              {person.role}
            </span>
          </div>

          {person.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} />
              <span>{person.location}</span>
              {person.distance && <span className="text-emerald-600 dark:text-emerald-400 font-medium">· {person.distance}</span>}
            </div>
          )}

          {person.bio && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{person.bio}</p>
          )}

          {person.skills && person.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {person.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px]">
                  {skill}
                </span>
              ))}
              {person.skills.length > 3 && (
                <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px]">
                  +{person.skills.length - 3}
                </span>
              )}
            </div>
          )}

          {person.rating && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{person.rating}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">({person.reviewCount} reviews)</span>
              </div>
              {person.hourlyRate && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-auto">
                  {person.hourlyRate}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
