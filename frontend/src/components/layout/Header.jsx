import React from "react";
import { Bell, LogOut, Search, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authhook";

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "AS";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <header className="h-20 w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
        <div className="relative group hidden sm:block w-72 lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] border-none rounded-xl text-sm placeholder-gray-400 focus:ring-2 focus:ring-purple-100 transition-all" placeholder="Search anything..." />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative p-2.5 cursor-pointer group">
          <Bell className="w-6 h-6 text-gray-600 group-hover:text-[#7C3AED]" />
          <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#FF4D8D] text-white text-[10px] font-bold border-2 border-white flex items-center justify-center">3</span>
        </div>

        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#B192EF] flex items-center justify-center text-white font-bold text-sm">{getInitials(user?.name)}</div>
          <span className="text-sm font-semibold text-gray-700 hidden md:block">{user?.name || "Ananya"}</span>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;