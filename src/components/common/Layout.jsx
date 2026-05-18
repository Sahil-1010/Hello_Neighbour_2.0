import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import ToastContainer from "./Toast";
import { Home, Map, MessageCircle, Briefcase, Bell, Building2, Store, Flag, X, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

// roles: undefined = visible to all roles; array = only those roles
const sidebarItems = [
  { path: "/", icon: Home, label: "Home Feed", roles: ["normal"] },
  { path: "/nearby", icon: Map, label: "Nearby", roles: ["normal"] },
  { path: "/businesses", icon: Store, label: "Businesses", roles: ["normal"] },
  { path: "/chat", icon: MessageCircle, label: "Messages" },
  { path: "/jobs", icon: Briefcase, label: "Jobs & Tasks", roles: ["normal", "worker"] },
  { path: "/notifications", icon: Bell, label: "Notifications" },
  { path: "/reports", icon: Flag, label: "Reports" },
  { path: "/business", icon: Building2, label: "My Business", roles: ["business"] },
];

function Sidebar() {
  const location = useLocation();
  const { user, unreadNotifCount, unreadMsgCount } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 py-4 px-3 overflow-y-auto transition-colors">
      {sidebarItems.map(({ path, icon: Icon, label, roles }) => {
        if (roles && !roles.includes(user?.role || "normal")) return null;
        const isActive =
          path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
        const badge =
          path === "/notifications" ? unreadNotifCount
          : path === "/chat" ? unreadMsgCount
          : 0;

        return (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
              isActive
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span className={`text-sm font-medium ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
              {label}
            </span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </Link>
        );
      })}

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
        <Link
          to={`/profile/${user?.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function AIAssistantButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-4 z-[9990] flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl px-3 py-2.5 transition-all hover:scale-105 active:scale-95 group"
        title="Hello Neighbour AI"
      >
        <img
          src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png"
          alt="AI"
          className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
        />
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-[10px] text-emerald-200 font-medium">Hello Neighbour</span>
          <span className="text-xs font-bold">AI Assistant</span>
        </div>
        <Sparkles size={14} className="text-emerald-200 hidden sm:block" />
      </button>

      {/* Placeholder modal */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl rounded-b-none sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center gap-3">
              <img
                src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png"
                alt="AI"
                className="w-10 h-10 rounded-full border-2 border-white/40"
              />
              <div className="flex-1">
                <p className="font-bold text-white">Hello Neighbour AI</p>
                <p className="text-xs text-emerald-100">Your neighbourhood assistant</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            {/* Placeholder body */}
            <div className="px-5 py-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🤖
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Hello Neighbour AI will help you discover local services, answer neighbourhood questions, and connect with the right people.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
      <BottomNav />
      <ToastContainer />
      <AIAssistantButton />
    </div>
  );
}
