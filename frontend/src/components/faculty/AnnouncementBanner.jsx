import React, { useEffect, useState } from "react";
import {
  Users, FileText, Bell, Plus, Trash2, ChevronDown, ChevronUp,
  BookOpen, HelpCircle, AlertTriangle, Loader2, X, Megaphone
} from "lucide-react";
import { useAuth } from "../../hooks/authhook.js";
import facultyService from "../../services/facultyService.js";
import AnnouncementBanner from "../faculty/FacultyBadge.jsx"; // Import the banner

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 border-red-100",
  normal: "bg-purple-50 text-purple-600 border-purple-100",
  low: "bg-gray-50 text-gray-500 border-gray-100",
};

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notesUploaded: 0, announcementsPosted: 0, totalStudents: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentDoubts, setRecentDoubts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);

  const [annForm, setAnnForm] = useState({ title: "", content: "", priority: "normal" });
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [annError, setAnnError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [s, a, activity] = await Promise.all([
          facultyService.getStats(),
          facultyService.getAnnouncements(),
          facultyService.getStudentActivity(),
        ]);
        if (!active) return;
        setStats(s);
        setAnnouncements(a);
        setStudents(activity.students);
        setRecentNotes(activity.recentNotes);
        setRecentDoubts(activity.recentDoubts);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setAnnError("");
    setAnnSubmitting(true);
    try {
      const newAnn = await facultyService.createAnnouncement(annForm);
      setAnnouncements((prev) => [newAnn, ...prev]);
      setStats((s) => ({ ...s, announcementsPosted: s.announcementsPosted + 1 }));
      setAnnForm({ title: "", content: "", priority: "normal" });
      setShowAnnouncementForm(false);
    } catch (err) {
      setAnnError(err?.response?.data?.message || "Failed to post");
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await facultyService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      setStats((s) => ({ ...s, announcementsPosted: Math.max(0, s.announcementsPosted - 1) }));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const bannedStudents = students.filter((s) => s.bannedUntil && new Date() < new Date(s.bannedUntil));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Syncing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* 1. Announcement Banner at the very top */}
      <AnnouncementBanner />

      {/* 2. Premium Purple Hero */}
      <div className="rounded-[32px] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-purple-200/50"
        style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
               Faculty Portal
             </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-1 tracking-tight">
            {user?.name ? `Hi, ${user.name.split(" ")[0]}!` : "Welcome Back"}
          </h1>
          <p className="text-purple-100 text-sm font-medium opacity-90">
            {user?.designation} • {user?.department}
          </p>
        </div>
        <div className="absolute -right-6 -top-6 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* 3. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Notes Uploaded", value: stats.notesUploaded, icon: <FileText size={22} />, color: "text-emerald-600 bg-emerald-50", border: "border-emerald-100" },
          { label: "Announcements", value: stats.announcementsPosted, icon: <Megaphone size={22} />, color: "text-purple-600 bg-purple-50", border: "border-purple-100" },
          { label: "Students Active", value: stats.totalStudents, icon: <Users size={22} />, color: "text-blue-600 bg-blue-50", border: "border-blue-100" },
        ].map(({ label, value, icon, color, border }) => (
          <div key={label} className={`bg-white rounded-[24px] p-6 border ${border} shadow-sm transition-transform hover:scale-[1.01]`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
            <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
            <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* 4. Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Broadcast Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Bell size={20} /></div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Broadcasts</h2>
              </div>
              <button
                onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-100"
              >
                {showAnnouncementForm ? <X size={18} /> : <Plus size={18} />}
                {showAnnouncementForm ? "Close" : "New Post"}
              </button>
            </div>

            {/* Post Form */}
            {showAnnouncementForm && (
              <div className="p-6 bg-purple-50/30 border-b border-purple-50 animate-in slide-in-from-top-2">
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Subject Heading"
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 outline-none focus:ring-2 focus:ring-purple-200"
                    required
                  />
                  <textarea
                    placeholder="Type message content here..."
                    value={annForm.content}
                    onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 outline-none min-h-[100px] resize-none"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={annForm.priority}
                      onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                      className="px-4 py-2 bg-white border border-purple-100 rounded-lg text-sm font-bold text-purple-600 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">Urgent</option>
                    </select>
                    <button type="submit" disabled={annSubmitting} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold">
                      {annSubmitting ? "Posting..." : "Publish"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List */}
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {announcements.map((ann) => (
                <div key={ann._id} className="p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`mt-1 w-2 h-2 rounded-full ${ann.priority === 'high' ? 'bg-red-500 animate-pulse' : 'bg-purple-400'}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">{ann.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ann.content}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">{formatDate(ann.createdAt)}</p>
                  </div>
                  {ann.postedBy?._id === user?._id && (
                    <button onClick={() => handleDeleteAnnouncement(ann._id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Activity Feeds */}
        <div className="space-y-6">
          <div className="bg-white rounded-[28px] border border-gray-100 p-6">
            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-purple-600" /> Recent Doubts
            </h3>
            <div className="space-y-3">
              {recentDoubts.slice(0, 3).map((doubt) => (
                <div key={doubt._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-800 line-clamp-2">{doubt.question}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">{doubt.user?.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-900 rounded-[28px] p-6 text-white shadow-lg shadow-purple-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-purple-300" /> Latest Notes
            </h3>
            <div className="space-y-4">
              {recentNotes.slice(0, 3).map((note) => (
                <div key={note._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-purple-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{note.title}</p>
                    <p className="text-[9px] text-purple-300 uppercase font-bold">{note.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;