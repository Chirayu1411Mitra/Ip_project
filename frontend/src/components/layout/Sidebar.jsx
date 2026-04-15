import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, FileText, HelpCircle, Users, 
  Calendar, User, BookOpen, X 
} from "lucide-react";
import { NavLink } from "react-router-dom";
import api from "../../services/api";

const navLinks = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/notes", label: "Notes", icon: <FileText size={20} /> },
  { to: "/doubts", label: "Doubts", icon: <HelpCircle size={20} /> },
  { to: "/groups", label: "Groups", icon: <Users size={20} /> },
  { to: "/deadlines", label: "Deadlines", icon: <Calendar size={20} /> },
  { to: "/profile", label: "Profile", icon: <User size={20} /> },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [stats, setStats] = useState({ notes: 12, answers: 24, groups: 3 });

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => {
        const data = res.data || res;
        setStats({
          notes: data.notes || 12,
          answers: data.answers || 24,
          groups: data.groups || 3,
        });
      })
      .catch(() => console.log("Using default stats"));
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-[55]
        flex flex-col w-72 h-screen bg-white border-r border-gray-100 p-6
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Close button for mobile */}
        <button className="lg:hidden absolute right-4 top-4 text-gray-400" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-md shadow-purple-100">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#7C3AED]">CampusConnect</span>
        </div>

        <nav className="flex-grow">
          <ul className="flex flex-col gap-2">
            {navLinks.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink to={to} end onClick={() => setIsOpen(false)} className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all ${
                    isActive ? "bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white shadow-lg shadow-purple-100" 
                             : "text-gray-500 hover:bg-gray-50 hover:text-[#7C3AED]"
                  }`
                }>
                  {icon} {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto bg-[#F5F3FF] rounded-[24px] p-5 border border-purple-50">
          <h2 className="text-xs uppercase tracking-widest font-bold text-[#7C3AED] opacity-70 mb-4 px-1">Quick Stats</h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-sm font-medium px-1">
              <span className="text-gray-500">Notes Shared</span>
              <span className="text-[#10B981] font-bold">{stats.notes}</span>
            </li>
            <li className="flex justify-between items-center text-sm font-medium px-1">
              <span className="text-gray-500">Answers Given</span>
              <span className="text-[#FF4D8D] font-bold">{stats.answers}</span>
            </li>
            <li className="flex justify-between items-center text-sm font-medium px-1">
              <span className="text-gray-500">Groups Joined</span>
              <span className="text-[#7C3AED] font-bold">{stats.groups}</span>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;