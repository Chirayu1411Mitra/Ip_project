import React, { useEffect, useState } from "react";
import { BookOpen, HelpCircle, Users, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authhook";
import StatCard from "../components/ui/StatCard";
import profileService from "../services/profileServices";

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
  const [profileStats, setProfileStats] = useState({
    notesUploaded: 0,
    doubtsAsked: 0,
    answersGiven: 0,
    downloadsReceived: 0,
  });

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      try {
        const stats = await profileService.dataStats();
        if (!isActive) return;

        setProfileStats({
          notesUploaded: stats.notesUploaded ?? 0,
          doubtsAsked: stats.doubtsAsked ?? 0,
          answersGiven: stats.answersGiven ?? 0,
          downloadsReceived: stats.downloadsReceived ?? 0,
        });
      } catch (error) {
        if (isActive) {
          setProfileStats({
            notesUploaded: 0,
            doubtsAsked: 0,
            answersGiven: 0,
            downloadsReceived: 0,
          });
        }
      }
    };

    if (user) {
      loadStats();
    }

    return () => {
      isActive = false;
    };
  }, [user]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      {/* Adjusted padding for mobile (px-4 py-6) and larger screens (sm:px-6 sm:py-8) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
        >
          <div className="relative z-10">
            <p className="text-purple-200 text-xs sm:text-sm font-medium mb-1">
              Welcome back 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {user?.name ? `Hi, ${user.name.split(" ")[0]}!` : "Hi there!"}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm">
              Ready to learn and collaborate today?
            </p>
          </div>
          {/* Decorative circles */}
          <div
            className="absolute -right-10 -top-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full opacity-10"
            style={{ background: "white" }}
          />
          <div
            className="absolute -right-4 -bottom-14 w-28 h-28 sm:w-36 sm:h-36 rounded-full opacity-10"
            style={{ background: "white" }}
          />
        </div>

        {/* Stats */}
        {/* Switched to md:grid-cols-4 and added responsive gap */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Notes Uploaded"
            value={profileStats.notesUploaded}
            icon={<BookOpen size={24} />}
            color="text-green-500 bg-green-500"
          />
          <StatCard
            label="Doubts Asked"
            value={profileStats.doubtsAsked}
            icon={<HelpCircle size={24} />}
            color="text-purple-500 bg-purple-500"
          />
          <StatCard
            label="Answers Given"
            value={profileStats.answersGiven}
            icon={<Users size={24} />}
            color="text-pink-500 bg-pink-500"
          />
          <StatCard
            label="Downloads"
            value={profileStats.downloadsReceived}
            icon={<Clock size={24} />}
            color="text-orange-500 bg-orange-500"
          />
        </div>

        {/* Feature cards */}
        <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4">
          Quick Access
        </h2>

        {/* Changed to grid-cols-1 for mobile, sm:grid-cols-2 for tablets/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {cards.map(({ label, desc, icon, to, color, bg }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all group flex sm:block items-center sm:items-start"
            >
              {/* Added responsive layout inside the button for 1-col view */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center sm:mb-3 shrink-0 mr-4 sm:mr-0"
                style={{ background: bg, color }}
              >
                {icon}
              </div>
              <div className="flex items-center sm:items-start justify-between w-full">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-300 group-hover:text-purple-500 transition-colors shrink-0 ml-2 sm:ml-0 sm:mt-0.5"
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
