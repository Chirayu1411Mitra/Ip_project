import React from "react";
import { BookOpen, HelpCircle, Users, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authhook";

const cards = [
  {
    label: "Notes Library",
    desc: "Browse and download study materials",
    icon: <BookOpen size={22} />,
    to: "/notes",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    label: "Doubts Forum",
    desc: "Ask questions, get answers from peers",
    icon: <HelpCircle size={22} />,
    to: "/doubts",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    label: "Study Groups",
    desc: "Collaborate with your classmates",
    icon: <Users size={22} />,
    to: "/groups",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    label: "Deadlines",
    desc: "Track your assignments & exams",
    icon: <Clock size={22} />,
    to: "/deadlines",
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <div
          className="rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <div className="relative z-10">
            <p className="text-purple-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-3xl font-bold mb-2">
              {user?.name ? `Hi, ${user.name.split(" ")[0]}!` : "Hi there!"}
            </h1>
            <p className="text-purple-200 text-sm">
              Ready to learn and collaborate today?
            </p>
          </div>
          {/* Decorative circles */}
          <div
            className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: "white" }}
          />
          <div
            className="absolute -right-4 -bottom-14 w-36 h-36 rounded-full opacity-10"
            style={{ background: "white" }}
          />
        </div>

        {/* Feature cards */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 gap-4">
          {cards.map(({ label, desc, icon, to, color, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: bg, color }}
              >
                {icon}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-300 group-hover:text-purple-500 transition-colors mt-0.5 flex-shrink-0"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
