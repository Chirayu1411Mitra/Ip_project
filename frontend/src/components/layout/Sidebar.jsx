import {
  Home,
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../services/api";

const navLinks = [
  { to: "/",          label: "Dashboard", icon: <Home size={18} /> },
  { to: "/notes",     label: "Notes",     icon: <BookOpen size={18} /> },
  { to: "/doubts",    label: "Doubts",    icon: <HelpCircle size={18} /> },
  { to: "/groups",    label: "Groups",    icon: <Users size={18} /> },
  { to: "/deadlines", label: "Deadlines", icon: <Clock size={18} /> },
  { to: "/profile",   label: "Profile",   icon: <UserCircle size={18} /> },
];

const Sidebar = () => {
  const [stats, setStats] = useState({ notes: 0, answers: 0, groups: 0 });

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((data) => {
        setStats({
          notes:   data.notes   ?? 0,
          answers: data.answers ?? 0,
          groups:  data.groups  ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{ minWidth: "256px", width: "256px" }}
      className="flex flex-col h-screen bg-white p-5 shadow-sm border-r border-gray-100"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <BookOpen size={18} color="white" />
        </div>
        <span className="text-xl font-bold text-gray-900">CampusConnect</span>
      </div>

      {/* Nav */}
      <nav className="flex-grow">
        <ul className="flex flex-col gap-1">
          {navLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-white"
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
      <div className="mt-auto pt-4 rounded-2xl p-4" style={{ background: "#f5f3ff" }}>
        <h2 className="text-xs uppercase tracking-wider font-semibold text-purple-400 mb-3">
          Quick Stats
        </h2>
        <ul className="text-sm space-y-2 text-gray-700">
          <li className="flex justify-between">
            <span>Notes Shared</span>
            <strong className="text-purple-600">{stats.notes}</strong>
          </li>
          <li className="flex justify-between">
            <span>Answers Given</span>
            <strong className="text-purple-600">{stats.answers}</strong>
          </li>
          <li className="flex justify-between">
            <span>Groups Joined</span>
            <strong className="text-purple-600">{stats.groups}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
