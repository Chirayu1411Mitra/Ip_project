import {
  Home,
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/authhook";
import { getMyGroups, getMyDeadlines } from "../../services/api";

const navLinks = [
  { to: "/",          label: "Dashboard", icon: <Home size={18} />,       end: true },
  { to: "/notes",     label: "Notes",     icon: <BookOpen size={18} />,   end: false },
  { to: "/doubts",    label: "Doubts",    icon: <HelpCircle size={18} />, end: false },
  { to: "/groups",    label: "Groups",    icon: <Users size={18} />,      end: false },
  { to: "/deadlines", label: "Deadlines", icon: <Clock size={18} />,      end: false },
  { to: "/profile",   label: "Profile",   icon: <UserCircle size={18} />, end: false },
];

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ groups: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
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
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

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
        <span className="text-xl font-bold text-gray-900">uConnect</span>
      </div>

      {/* Nav */}
      <nav className="flex-grow">
        <ul className="flex flex-col gap-1">
          {navLinks.map(({ to, label, icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
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
            <span>Groups Joined</span>
            <strong className="text-purple-600">{stats.groups}</strong>
          </li>
          <li className="flex justify-between">
            <span>Pending Tasks</span>
            <strong className="text-purple-600">{stats.pending}</strong>
          </li>
          <li className="flex justify-between">
            <span>Overdue</span>
            <strong className={stats.overdue > 0 ? "text-red-500" : "text-purple-600"}>
              {stats.overdue}
            </strong>
          </li>
        </ul>
      </div>

      {/* User mini card at bottom */}
      <button
        onClick={() => navigate("/profile")}
        className="mt-3 flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 transition-all text-left w-full"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          {user?.avatarURL ? (
            <img src={user.avatarURL} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
          ) : initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "User"}</p>
          <p className="text-xs text-gray-400 truncate">{user?.rollNo || user?.email || ""}</p>
        </div>
      </button>
    </div>
  );
};

export default Sidebar;
