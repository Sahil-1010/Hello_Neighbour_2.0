import { Bell, Briefcase, Heart, MessageCircle, MapPin, CheckCircle, Check, UserCheck, Tag, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";

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
  report:       { icon: Flag,        color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" },
};

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
  const { notifications, markNotificationRead, markAllRead, unreadNotifCount } = useApp();

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
          {[
            { label: "Job alerts & requests", sublabel: "When someone applies or completes a job", on: true },
            { label: "Messages", sublabel: "New chat messages from neighbors", on: true },
            { label: "Community alerts", sublabel: "Warnings and help requests nearby", on: true },
            { label: "Promotions & offers", sublabel: "Local business deals and offers", on: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{pref.sublabel}</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${pref.on ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pref.on ? "translate-x-6" : "translate-x-1"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
