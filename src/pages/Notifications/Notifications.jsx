import { useState, useEffect } from "react";
import { Bell, Briefcase, Heart, MessageCircle, MapPin, CheckCircle, Check, UserCheck, Tag, Flag, UserPlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e2e8f0'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%2394a3b8'/%3E%3Cellipse cx='20' cy='34' rx='12' ry='9' fill='%2394a3b8'/%3E%3C/svg%3E";

function ConnectionRequestCard({ requesterId, onAccept, onReject }) {
  const { fetchUserById } = useApp();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserById(requesterId).then(setPerson).catch(() => {});
  }, [requesterId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async () => {
    setLoading(true);
    try { await onAccept(requesterId); } catch {}
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    try { await onReject(requesterId); } catch {}
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-700">
      <Link to={`/profile/${requesterId}`}>
        <img
          src={person?.avatar || DEFAULT_AVATAR}
          alt={person?.name || "User"}
          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          <Link to={`/profile/${requesterId}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
            {person?.name || "Someone"}
          </Link>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">wants to connect with you</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50"
        >
          <Check size={12} /> Accept
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
        >
          <X size={12} /> Decline
        </button>
      </div>
    </div>
  );
}

const notifIcons = {
  job_request:  { icon: Briefcase,   color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
  job_applied:  { icon: Briefcase,   color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
  job_assigned: { icon: UserCheck,   color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" },
  job_completed:{ icon: CheckCircle, color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" },
  offer:        { icon: Tag,         color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" },
  reaction:     { icon: Heart,       color: "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400" },
  comment:      { icon: MessageCircle, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" },
  message:      { icon: MessageCircle, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" },
  nearby:       { icon: MapPin,      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" },
  report:            { icon: Flag,      color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
  connection_request: { icon: UserCheck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" },
  new_business: { icon: Tag, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" },
};

const DEFAULT_PREFS = [
  { key: "jobs",      label: "Job alerts & requests",  sublabel: "When someone applies or completes a job", on: true },
  { key: "messages",  label: "Messages",               sublabel: "New chat messages from neighbors",        on: true },
  { key: "community", label: "Community alerts",        sublabel: "Warnings and help requests nearby",       on: true },
  { key: "promos",    label: "Promotions & offers",     sublabel: "Local business deals and offers",         on: false },
];

function loadPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem("hn_notif_prefs") || "null");
    if (!saved) return DEFAULT_PREFS;
    return DEFAULT_PREFS.map((p) => ({ ...p, on: saved[p.key] ?? p.on }));
  } catch {
    return DEFAULT_PREFS;
  }
}

function NotifItem({ notif, onRead }) {
  const config = notifIcons[notif.type] || notifIcons.nearby;
  const Icon = config.icon;

  return (
    <Link
      to={notif.link}
      onClick={() => !notif.isRead && onRead(notif.id)}
      className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 ${
        !notif.isRead ? "bg-emerald-50/40 dark:bg-emerald-900/10" : ""
      }`}
    >
      <div className="relative flex-shrink-0">
        {notif.avatar ? (
          <div className="relative">
            <img src={notif.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${config.color} rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center`}>
              <Icon size={10} />
            </div>
          </div>
        ) : (
          <div className={`w-11 h-11 ${config.color} rounded-full flex items-center justify-center`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${!notif.isRead ? "text-gray-900 dark:text-white font-medium" : "text-gray-700 dark:text-gray-300"}`}>
          {notif.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.timestamp}</p>
      </div>

      {!notif.isRead && (
        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </Link>
  );
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllRead, unreadNotifCount, user, acceptConnectionRequest, rejectConnectionRequest } = useApp();
  const [prefs, setPrefs] = useState(loadPrefs);
  const pendingRequests = user?.connectionRequests || [];

  const togglePref = (key) => {
    setPrefs((prev) => {
      const next = prev.map((p) => (p.key === key ? { ...p, on: !p.on } : p));
      const map = Object.fromEntries(next.map((p) => [p.key, p.on]));
      localStorage.setItem("hn_notif_prefs", JSON.stringify(map));
      return next;
    });
  };

  const todayNotifs = notifications.slice(0, 4);
  const earlierNotifs = notifications.slice(4);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadNotifCount > 0 && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
              {unreadNotifCount} unread notification{unreadNotifCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadNotifCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <Check size={16} />
            Mark all read
          </button>
        )}
      </div>

      {/* Connection Requests */}
      {pendingRequests.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
            <UserPlus size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
              Connection Requests
            </span>
            <span className="ml-auto badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]">
              {pendingRequests.length}
            </span>
          </div>
          {pendingRequests.map((id) => (
            <ConnectionRequestCard
              key={id.toString()}
              requesterId={id.toString()}
              onAccept={acceptConnectionRequest}
              onReject={rejectConnectionRequest}
            />
          ))}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🔔
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">All caught up!</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">You have no notifications right now.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Today */}
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Today</span>
          </div>
          {todayNotifs.map((notif) => (
            <NotifItem key={notif.id} notif={notif} onRead={markNotificationRead} />
          ))}

          {earlierNotifs.length > 0 && (
            <>
              <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 border-t">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Earlier</span>
              </div>
              {earlierNotifs.map((notif) => (
                <NotifItem key={notif.id} notif={notif} onRead={markNotificationRead} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Preferences */}
      <div className="card p-5 mt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
        </div>
        <div className="space-y-3">
          {prefs.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{pref.sublabel}</p>
              </div>
              <button
                onClick={() => togglePref(pref.key)}
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${pref.on ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
                aria-label={`Toggle ${pref.label}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pref.on ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
