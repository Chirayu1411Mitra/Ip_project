import React, { useState, useRef, useEffect } from "react";
import { Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authhook";
import NotificationBell from "../NotificationBell";

const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="h-16 w-full bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      {/* Search */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </span>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition"
          placeholder="Search notes, doubts, groups..."
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification Bell from NotifContext */}
        <NotificationBell />

        {/* Avatar + name */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.name?.split(" ")[0] ?? "User"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Header;
