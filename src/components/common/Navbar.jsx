import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, Search, MapPin, ChevronDown, LogOut, User, Settings,
  Moon, Sun, Building2, Check,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const roleLabels = {
  normal: { label: "Community Member", emoji: "👋", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  worker: { label: "Worker", emoji: "🔧", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  business: { label: "Business Owner", emoji: "🏪", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
};

function NeighborhoodDropdown({ onClose }) {
  const { currentNeighborhood, switchNeighborhood, neighborhoods } = useApp();
  return (
    <div className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-30 animate-fade-in">
      <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        Switch Neighborhood
      </p>
      {neighborhoods.map((name) => {
        const isActive = name === currentNeighborhood;
        return (
          <button
            key={name}
            onClick={() => { switchNeighborhood(name); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-sm">🏘️</div>
            <p className={`flex-1 text-left text-sm font-medium ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-800 dark:text-gray-200"}`}>
              {name}
            </p>
            {isActive && <Check size={15} className="text-emerald-500 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function RoleSwitcher({ onClose }) {
  const { user, switchRole } = useApp();
  const roles = [
    { value: "normal", label: "Community Member", emoji: "👋" },
    { value: "worker", label: "Worker", emoji: "🔧" },
    { value: "business", label: "Business Owner", emoji: "🏪" },
  ];
  return (
    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-1">
      <p className="px-4 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        Switch Role
      </p>
      {roles.map((r) => (
        <button
          key={r.value}
          onClick={() => { switchRole(r.value); onClose(); }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
            user?.role === r.value
              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <span>{r.emoji}</span>
          {r.label}
          {user?.role === r.value && <Check size={14} className="ml-auto" />}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { user, unreadNotifCount, logout, isDarkMode, toggleDarkMode, currentNeighborhood } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };
  const rl = roleLabels[user?.role] || roleLabels.normal;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-base">🏘️</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg hidden sm:block">
            Hello<span className="text-emerald-500">Neighbour</span>
          </span>
        </Link>

        {/* Neighborhood switcher */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => { setShowNeighborhood(!showNeighborhood); setShowUserMenu(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <MapPin size={13} className="text-emerald-500" />
            <span className="font-medium truncate max-w-[130px]">{currentNeighborhood}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${showNeighborhood ? "rotate-180" : ""}`} />
          </button>
          {showNeighborhood && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNeighborhood(false)} />
              <div className="relative z-30">
                <NeighborhoodDropdown onClose={() => setShowNeighborhood(false)} />
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search neighbors, jobs, posts..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={20} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            {isDarkMode
              ? <Sun size={20} className="text-amber-400" />
              : <Moon size={20} />
            }
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell size={20} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNeighborhood(false); }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20" />
              <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                    <span className={`badge mt-1.5 ${rl.color}`}>
                      {rl.emoji} {rl.label}
                    </span>
                  </div>

                  {/* Nav links */}
                  <Link
                    to={`/profile/${user?.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} className="text-gray-400" /> View Profile
                  </Link>
                  <Link
                    to="/businesses"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Building2 size={16} className="text-gray-400" /> Business Directory
                  </Link>
                  {user?.role === "business" && (
                    <Link
                      to="/business"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} className="text-gray-400" /> Business Dashboard
                    </Link>
                  )}

                  {/* Role switcher */}
                  <RoleSwitcher onClose={() => setShowUserMenu(false)} />

                  {/* Logout */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search neighbors, jobs, posts..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>
          {/* Mobile neighborhood selector */}
          <div className="mt-2 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {[{ name: "Downtown Heights" }, { name: "Riverside Gardens" }, { name: "Oak Park District" }].map((h) => (
              <button
                key={h.name}
                onClick={() => { setShowSearch(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap flex-shrink-0"
              >
                <MapPin size={11} className="text-emerald-500" />
                {h.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
