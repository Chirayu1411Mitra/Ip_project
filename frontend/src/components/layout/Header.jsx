import React, { useState } from "react";
import { Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authhook";
import NotificationBell from "../NotificationBell";
import { getProfilePictureSrc } from "../../utils/profilePicture";

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
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const profilePictureSrc = getProfilePictureSrc(user);

  return (
    // Adjusted height, padding, and gaps for mobile vs tablet/desktop
    <div className="h-14 sm:h-16 w-full bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 shadow-sm gap-2 sm:gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-[160px] sm:max-w-xs md:max-w-none md:w-80">
        <span className="absolute inset-y-0 left-2 sm:left-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
        </span>
        <input
          type="text"
          className="block w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl bg-gray-50 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition"
          placeholder="Search..."
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell from NotifContext */}
        <NotificationBell />

        {/* Avatar + name */}
        <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-100">
          {profilePictureSrc ? (
            <img
              src={profilePictureSrc}
              alt={user?.name || "User"}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
            >
              {initials}
            </div>
          )}
          {/* Hide name on mobile, show on sm+ screens */}
          <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-[100px] lg:max-w-[150px]">
            {user?.name?.split(" ")[0] ?? "User"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 ml-1 sm:ml-0 shrink-0"
          title="Logout"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default Header;
