import {
  Home,
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  UserCircle,
  GraduationCap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authhook";
import { getMyGroups, getMyDeadlines } from "../../services/api";

const studentLinks = [
  { to: "/", label: "Dashboard", icon: <Home size={20} />, end: true },
  { to: "/notes", label: "Notes", icon: <BookOpen size={20} />, end: false },
  {
    to: "/doubts",
    label: "Doubts",
    icon: <HelpCircle size={20} />,
    end: false,
  },
  { to: "/groups", label: "Groups", icon: <Users size={20} />, end: false },
  {
    to: "/deadlines",
    label: "Deadlines",
    icon: <Clock size={20} />,
    end: false,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <UserCircle size={20} />,
    end: false,
  },
];

const facultyLinks = [
  { to: "/", label: "Dashboard", icon: <Home size={20} />, end: true },
  {
    to: "/faculty",
    label: "Faculty Portal",
    icon: <GraduationCap size={20} />,
    end: false,
  },
  { to: "/notes", label: "Notes", icon: <BookOpen size={20} />, end: false },
  {
    to: "/doubts",
    label: "Doubts",
    icon: <HelpCircle size={20} />,
    end: false,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <UserCircle size={20} />,
    end: false,
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ groups: 0, pending: 0, overdue: 0 });

  const isFaculty = user?.role === "faculty";
  const navLinks = isFaculty ? facultyLinks : studentLinks;

  useEffect(() => {
    const fetchStats = async () => {
      if (isFaculty) return; // Skip for faculty
      try {
        const [groupsRes, deadlinesRes] = await Promise.all([
          getMyGroups(),
          getMyDeadlines(),
        ]);

        const groups = groupsRes.data.data || [];
        const deadlines = deadlinesRes.data.data || [];

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const pending = deadlines.filter((d) => {
          const due = new Date(d.dueDate);
          due.setHours(0, 0, 0, 0);
          return !d.completed && due >= now;
        }).length;

        const overdue = deadlines.filter((d) => {
          const due = new Date(d.dueDate);
          due.setHours(0, 0, 0, 0);
          return !d.completed && due < now;
        }).length;

        setStats({ groups: groups.length, pending, overdue });
      } catch {
        // non-critical — silently ignore
      }
    };
    fetchStats();
  }, [isFaculty]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Unified Premium Purple Gradient for the platform
  const brandGradient = "bg-gradient-to-br from-[#7c3aed] to-[#5b21b6]";

  return (
    <div className="w-64 min-w-[256px] flex-shrink-0 flex flex-col h-screen bg-white p-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 z-20">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8 px-2 mt-2">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 ${brandGradient}`}
        >
          <BookOpen size={20} className="text-white" />
        </div>
        <span className="text-2xl font-black text-gray-900 tracking-tight">
          uConnect
        </span>
      </div>

      {/* Faculty Profile Badge */}
      {isFaculty && (
        <div className="mb-6 px-4 py-3 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">
            Faculty Member
          </p>
          <p className="text-sm font-bold text-purple-900 truncate">
            {user?.designation}
          </p>
          <p className="text-xs font-medium text-purple-600 truncate">
            {user?.department}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-grow overflow-y-auto custom-scrollbar pr-1 -mr-1">
        <ul className="flex flex-col gap-1.5">
          {navLinks.map(({ to, label, icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? `${brandGradient} text-white shadow-md shadow-purple-200 translate-x-1`
                      : "text-gray-500 hover:bg-purple-50 hover:text-purple-700"
                  }`
                }
              >
                {icon}
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Student Quick Stats */}
      {!isFaculty && (
        <div className="mt-auto pt-4 rounded-2xl p-5 bg-purple-50/50 border border-purple-50 mb-4">
          <h2 className="text-[10px] uppercase tracking-widest font-black text-purple-400 mb-4">
            Quick Stats
          </h2>
          <ul className="text-sm space-y-3 font-medium text-gray-600">
            <li className="flex justify-between items-center">
              <span>Groups</span>
              <strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                {stats.groups}
              </strong>
            </li>
            <li className="flex justify-between items-center">
              <span>Tasks</span>
              <strong className="text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                {stats.pending}
              </strong>
            </li>
            <li className="flex justify-between items-center">
              <span>Overdue</span>
              <strong
                className={`${stats.overdue > 0 ? "text-red-700 bg-red-100" : "text-purple-700 bg-purple-100"} px-2 py-0.5 rounded-md`}
              >
                {stats.overdue}
              </strong>
            </li>
          </ul>
        </div>
      )}

      {/* Bottom User Card */}
      <button
        onClick={() => navigate("/profile")}
        className="mt-2 flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left w-full group"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow ${brandGradient}`}
        >
          {user?.avatarURL ? (
            <img
              src={user.avatarURL}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
            {user?.name || "User"}
          </p>
          <p className="text-xs font-medium text-gray-400 truncate">
            {user?.rollNo || user?.email || ""}
          </p>
        </div>
      </button>
    </div>
  );
};

export default Sidebar;
