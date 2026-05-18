import { Link, useLocation } from "react-router-dom";
import { Home, Map, MessageCircle, Briefcase, Store, Building2, Bell } from "lucide-react";
import { useApp } from "../../context/AppContext";

const NAV_BY_ROLE = {
  normal: [
    { path: "/", icon: Home, label: "Home" },
    { path: "/nearby", icon: Map, label: "Nearby" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/jobs", icon: Briefcase, label: "Jobs" },
    { path: "/businesses", icon: Store, label: "Business" },
  ],
  worker: [
    { path: "/jobs", icon: Briefcase, label: "Jobs" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/notifications", icon: Bell, label: "Alerts" },
  ],
  business: [
    { path: "/business", icon: Building2, label: "Dashboard" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/notifications", icon: Bell, label: "Alerts" },
  ],
};

export default function BottomNav() {
  const location = useLocation();
  const { user, unreadMsgCount, unreadNotifCount } = useApp();

  const role = user?.role || "normal";
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.normal;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pb-safe lg:hidden transition-colors">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          const badge =
            path === "/chat" ? unreadMsgCount
            : path === "/notifications" ? unreadNotifCount
            : 0;

          return (
            <Link key={path} to={path} className="flex flex-col items-center gap-1 px-3 py-2 relative">
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50 dark:bg-emerald-900/30" : ""}`}>
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? "text-emerald-500" : "text-gray-400 dark:text-gray-500"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-emerald-500" : "text-gray-400 dark:text-gray-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
