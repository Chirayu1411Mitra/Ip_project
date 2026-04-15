import React from "react";
import { FileText, HelpCircle, MessageSquare, Download, TrendingUp } from "lucide-react";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>{icon}</div>
      <TrendingUp size={18} className="text-green-500" />
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome back! 👋</h1>
        <p className="text-gray-400 mt-1 font-medium">Here's what's happening with your studies today.</p>
      </div>

      {/* Top 4 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Notes Uploaded" value="12" icon={<FileText />} color="text-green-500 bg-green-500" />
        <StatCard label="Doubts Asked" value="8" icon={<HelpCircle />} color="text-purple-500 bg-purple-500" />
        <StatCard label="Answers Given" value="24" icon={<MessageSquare />} color="text-pink-500 bg-pink-500" />
        <StatCard label="Downloads Received" value="156" icon={<Download />} color="text-orange-500 bg-orange-500" />
      </div>

      {/* Bottom Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          {/* List items go here */}
          <div className="space-y-6">
             <p className="text-gray-400 text-sm">No recent activity found.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Upcoming Deadlines</h2>
          <div className="text-center text-gray-400 text-sm py-10">All clear for now!</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;