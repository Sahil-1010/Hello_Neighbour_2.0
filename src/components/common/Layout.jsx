import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { Home, Map, MessageCircle, Briefcase, User, Bell, Building2, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";

const sidebarItems = [
  { path: "/", icon: Home, label: "Home Feed" },
  { path: "/nearby", icon: Map, label: "Nearby" },
  { path: "/chat", icon: MessageCircle, label: "Messages" },
  { path: "/jobs", icon: Briefcase, label: "Jobs & Tasks" },
  { path: "/notifications", icon: Bell, label: "Notifications" },
  { path: "/business", icon: Building2, label: "Business" },
  { path: "/profile/1", icon: User, label: "My Profile" },
];

function Sidebar() {
  const location = useLocation();
  const { user, unreadNotifCount, unreadMsgCount } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white border-r border-gray-100 py-4 px-3 overflow-y-auto">
      {sidebarItems.map(({ path, icon: Icon, label }) => {
        const isActive =
          path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
        const isBusiness = path === "/business";
        const showBadge =
          path === "/notifications"
            ? unreadNotifCount
            : path === "/chat"
            ? unreadMsgCount
            : 0;

        if (isBusiness && user?.role !== "business") return null;

        return (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {showBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {showBadge > 9 ? "9+" : showBadge}
                </span>
              )}
            </div>
            <span className={`text-sm font-medium ${isActive ? "text-emerald-600" : ""}`}>
              {label}
            </span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </Link>
        );
      })}

      <div className="mt-auto pt-4 border-t border-gray-100">
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
