import { Link, useLocation } from "react-router-dom";
import { Home, Map, MessageCircle, Briefcase, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/nearby", icon: Map, label: "Nearby" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/jobs", icon: Briefcase, label: "Jobs" },
  { path: "/profile/1", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const { unreadMsgCount } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe lg:hidden">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          const isChat = path === "/chat";

          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-1 px-4 py-2 relative"
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-emerald-50" : ""}`}>
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? "text-emerald-500" : "text-gray-400"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isChat && unreadMsgCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadMsgCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${isActive ? "text-emerald-500" : "text-gray-400"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
