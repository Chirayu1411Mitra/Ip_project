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
  { to: "/", label: "Home", icon: <Home size={18} /> },
  { to: "/notes", label: "Notes", icon: <BookOpen size={18} /> },
  { to: "/doubts", label: "Doubts", icon: <HelpCircle size={18} /> },
  { to: "/groups", label: "Groups", icon: <Users size={18} /> },
  { to: "/deadlines", label: "Deadlines", icon: <Clock size={18} /> },
  { to: "/profile", label: "Profile", icon: <UserCircle size={18} /> },
];
const Sidebar = () => {
  const [stats, setStats] = useState({
    notes: 0,
    answers: 0,
    groups: 0,
  });

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((data) => {
        setStats({
          notes: data.notes,
          answers: data.answers,
          groups: data.groups,
        });
      })
      .catch(() => []);
  }, []);
  return (
    <div className="flex flex-col w-1/4 h-screen bg-amber-50 p-6 shadow-sm">
      <div className="flex justify-center items-center w-full h-24 mb-8 bg-white rounded-xl overflow-hidden border border-amber-100">
        <img
          src="/assets/logo.png"
          alt="logo"
          className="max-h-full object-contain"
        />
        <h1 className="text-2xl font-bold text-amber-900 mb-6">UConnect</h1>
      </div>
      <nav className="flex-grow">
        <ul className="flex flex-col gap-4 text-lg font-medium text-amber-800">
          {navLinks.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-200 text-amber-900" // active state
                      : "text-amber-800 hover:bg-amber-100" // default + hover
                  }`
                }
              >
                {icon} {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-6 border-t border-amber-200">
        <h2 className="text-sm uppercase tracking-wider font-bold text-amber-900/50 mb-3">
          Quick Stats
        </h2>
        <ul className="text-sm space-y-2 text-amber-800">
          <li className="flex justify-between">
            <span>Notes Shared:</span> <strong>{stats.notes}</strong>
          </li>
          <li className="flex justify-between">
            <span>Answers Given:</span> <strong>{stats.answers}</strong>
          </li>
          <li className="flex justify-between">
            <span>Groups Joined:</span> <strong>{stats.groups}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
