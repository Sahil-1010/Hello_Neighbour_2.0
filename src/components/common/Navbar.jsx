import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, MapPin, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function Navbar() {
  const { user, unreadNotifCount, logout } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-base">🏘️</span>
          </div>
          <span className="font-bold text-gray-900 text-lg hidden sm:block">
            Hello<span className="text-emerald-500">Neighbour</span>
          </span>
        </Link>

        {/* Location */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors ml-2 flex-shrink-0">
          <MapPin size={14} className="text-emerald-500" />
          <span className="font-medium truncate max-w-[140px]">{user?.neighborhood || "Set location"}</span>
          <ChevronDown size={12} className="text-gray-400" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search neighbors, jobs, posts..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile search */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search size={20} />
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
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
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    <span className="badge bg-emerald-100 text-emerald-700 mt-1 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to={`/profile/${user?.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} className="text-gray-400" />
                    View Profile
                  </Link>
                  {user?.role === "business" && (
                    <Link
                      to="/business"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} className="text-gray-400" />
                      Business Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search neighbors, jobs, posts..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>
      )}
    </header>
  );
}
