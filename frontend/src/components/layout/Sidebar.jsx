import {
  Home,
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  UserCircle,
  X, // Added X icon for mobile close button
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import profileService from "../../services/profileServices";

const navLinks = [
  { to: "/", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/notes", label: "Notes", icon: <BookOpen size={18} /> },
  { to: "/doubts", label: "Doubts", icon: <HelpCircle size={18} /> },
  { to: "/groups", label: "Groups", icon: <Users size={18} /> },
  { to: "/deadlines", label: "Deadlines", icon: <Clock size={18} /> },
  { to: "/profile", label: "Profile", icon: <UserCircle size={18} /> },
];

const Sidebar = ({ onClose }) => {
  const [stats, setStats] = useState({
    notesUploaded: 0,
    doubtsAsked: 0,
    answersGiven: 0,
  });

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      try {
        const data = await profileService.dataStats();
        if (!isActive) return;

        setStats({
          notesUploaded: data.notesUploaded ?? 0,
          doubtsAsked: data.doubtsAsked ?? 0,
          answersGiven: data.answersGiven ?? 0,
        });
      } catch (error) {
        if (isActive) {
          setStats({ notesUploaded: 0, doubtsAsked: 0, answersGiven: 0 });
        }
      }
    };

    loadStats();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white p-5 shadow-sm border-r border-gray-100 w-[256px] overflow-y-auto">
      {/* Logo & Mobile Close Button */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
          >
            <BookOpen size={18} color="white" />
          </div>
          <span className="text-xl font-bold text-gray-900">CampusConnect</span>
        </div>

        {/* Close Button - Visible only on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="grow">
        <ul className="flex flex-col gap-1">
          {navLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => onClose && onClose()} // Close sidebar on mobile when navigating
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-white shadow-md shadow-purple-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }
                    : {}
                }
              >
                {icon}
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Stats */}
      <div
        className="mt-8 rounded-2xl p-4 shrink-0"
        style={{ background: "#f5f3ff" }}
      >
        <h2 className="text-xs uppercase tracking-wider font-semibold text-purple-400 mb-3">
          Quick Stats
        </h2>
        <ul className="text-sm space-y-2 text-gray-700">
          <li className="flex justify-between">
            <span>Notes Shared</span>
            <strong className="text-purple-600">{stats.notesUploaded}</strong>
          </li>
          <li className="flex justify-between">
            <span>Doubts Asked</span>
            <strong className="text-purple-600">{stats.doubtsAsked}</strong>
          </li>
          <li className="flex justify-between">
            <span>Answers Given</span>
            <strong className="text-purple-600">{stats.answersGiven}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
