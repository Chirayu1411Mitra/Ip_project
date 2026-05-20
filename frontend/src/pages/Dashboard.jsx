import React from "react";
import {
  BookOpen,
  HelpCircle,
  Users,
  Clock,
  ArrowRight,
  User,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authhook";
import AnnouncementBanner from "../components/faculty/AnnouncementBanner";

const studentCards = [
  {
    label: "Doubts Forum",
    desc: "Ask questions, get answers from peers",
    icon: <HelpCircle size={22} />,
    to: "/doubts",
    color: "#059669", // Emerald
    bg: "#ecfdf5",
  },
  {
    label: "Study Groups",
    desc: "Collaborate with your classmates",
    icon: <Users size={22} />,
    to: "/groups",
    color: "#7c3aed", // Purple
    bg: "#f5f3ff",
  },
  {
    label: "Deadlines",
    desc: "Track your assignments & exams",
    icon: <Clock size={22} />,
    to: "/deadlines",
    color: "#d97706", // Amber
    bg: "#fffbeb",
  },
  {
    label: "My Profile",
    desc: "Update your bio and preferences",
    icon: <User size={22} />,
    to: "/profile",
    color: "#2563eb", // Blue
    bg: "#eff6ff",
  },
];

const facultyCards = [
  {
    label: "Faculty Portal",
    desc: "Manage announcements & students",
    icon: <GraduationCap size={22} />,
    to: "/faculty",
    color: "#7c3aed", // Updated to Purple to match brand
    bg: "#f5f3ff",
  },
  {
    label: "Doubts Forum",
    desc: "Answer student questions",
    icon: <HelpCircle size={22} />,
    to: "/doubts",
    color: "#059669", // Emerald
    bg: "#ecfdf5",
  },
  {
    label: "My Profile",
    desc: "View your profile settings",
    icon: <User size={22} />,
    to: "/profile",
    color: "#2563eb", // Blue
    bg: "#eff6ff",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const isFaculty = user?.role === "faculty";
  const cards = isFaculty ? facultyCards : studentCards;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen custom-scrollbar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Show announcements for students only */}
        {!isFaculty && <AnnouncementBanner />}

        {/* Unified Premium Purple Hero */}
        <div className="rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] shadow-lg shadow-purple-200/50">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-purple-50">
                  {isFaculty ? "Faculty Dashboard" : "Student Dashboard"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mb-1.5 tracking-tight truncate">
                {user?.name
                  ? `Hi, ${user.name.split(" ")[0]}! 👋`
                  : "Welcome back! 👋"}
              </h1>
              <p className="text-sm sm:text-base text-purple-200 font-medium truncate">
                {isFaculty
                  ? `${user?.designation} • ${user?.department}`
                  : user?.branch && user?.semester
                    ? `${user.branch} • Semester ${user.semester}`
                    : "Ready to learn and collaborate today?"}
              </p>
            </div>

            {/* Avatar */}
            <button
              onClick={() => navigate("/profile")}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center text-white text-xl font-bold shrink-0 hover:border-white/60 hover:scale-105 transition-all bg-white/10 backdrop-blur-sm shadow-sm"
              title="View Profile"
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
            </button>
          </div>

          {/* Decorative Background Blobs */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-10 -bottom-10 w-32 h-32 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight">
            {isFaculty ? "Faculty Tools" : "Quick Access"}
          </h2>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 cols on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {cards.map(({ label, desc, icon, to, color, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="text-left bg-white rounded-2xl sm:rounded-[24px] border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col h-full"
            >
              <div className="flex items-start justify-between w-full mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-purple-600 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-auto">
                <p className="font-bold text-gray-900 text-base mb-1">
                  {label}
                </p>
                <p className="text-sm text-gray-500 font-medium leading-snug">
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
