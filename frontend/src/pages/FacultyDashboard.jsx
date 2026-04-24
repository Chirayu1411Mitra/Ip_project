import React, { useEffect, useState } from "react";
import { 
  FileText, Bell, Plus, Trash2, 
  BookOpen, HelpCircle, Loader2, X, Megaphone, PlusCircle, Upload, File, X as XIcon 
} from "lucide-react";
import { useAuth } from "../hooks/authhook";
import facultyService from "../services/facultyService";
import FacultyBadge from "../components/faculty/FacultyBadge"; 

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notesUploaded: 0, announcementsPosted: 0, totalStudents: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "", priority: "normal" });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a, activity] = await Promise.all([
          facultyService.getStats(),
          facultyService.getAnnouncements(),
          facultyService.getStudentActivity(),
        ]);
        setStats({
          ...s,
          totalStudents: activity.activeStudentsCount || 0,
        });
        setAnnouncements(a);
        setRecentNotes(activity.recentNotes || []);
        setRecentDoubts(activity.recentDoubts || []);
      } catch (err) {
        console.error("Dashboard sync error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", annForm.title);
      formData.append("content", annForm.content);
      formData.append("priority", annForm.priority);
      
      // Add files to formData
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      
      const newAnnouncement = await facultyService.createAnnouncement(formData);
      setAnnouncements([newAnnouncement, ...announcements]);
      setAnnForm({ title: "", content: "", priority: "normal" });
      setSelectedFiles([]);
      setShowAnnouncementForm(false);
    } catch (err) {
      console.error("Failed to post announcement:", err);
      alert("Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        await facultyService.deleteAnnouncement(id);
        setAnnouncements(announcements.filter((a) => a._id !== id));
      } catch (err) {
        console.error("Failed to delete announcement:", err);
        alert("Failed to delete announcement");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      
      {/* Search & Top Bar could go here to match student ref */}

      {/* Hero Banner - Switched to Faculty Blue */}
      <div className="rounded-[24px] p-10 text-white relative overflow-hidden shadow-sm"
        style={{ background: "linear-gradient(135deg, #7c3aed,#6d28d9)" }}>
        <div className="relative z-10">
          <p className="text-purple-100 text-sm font-medium mb-2">Welcome back 👋</p>
          <h1 className="text-4xl font-bold mb-2">
            Hi, {user?.name?.split(" ")[0] || "Professor"}!
          </h1>
          <p className="text-purple-100 opacity-90">Ready to manage your classes and announcements today?</p>
        </div>
        {/* Abstract circles to match student ref */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
      </div>

      {/* Stats Grid - Matches Student card style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Notes Uploaded", value: stats.notesUploaded, icon: <FileText size={20} />, color: "text-emerald-500" },
          { label: "Announcements", value: stats.announcementsPosted, icon: <Megaphone size={20} />, color: "text-purple-500" },
          { label: "Doubts Resolved", value: stats.answersGiven || 0, icon: <HelpCircle size={20} />, color: "text-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start relative overflow-hidden">
            <div className={`p-2 rounded-lg bg-gray-50 ${stat.color} mb-4`}>{stat.icon}</div>
            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            <span className="text-sm text-gray-400 font-medium mt-1">{stat.label}</span>
            {/* Tiny green trend icon to match reference */}
            <div className="absolute top-6 right-6 text-emerald-500">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/></svg>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-800 mt-10">Quick Access</h2>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Announcements Management Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Bell size={20} /></div>
              <h3 className="font-bold text-gray-900">Department Broadcasts</h3>
            </div>
            <button 
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="text-purple-600 hover:bg-purple-50 p-2 rounded-full transition-colors"
            >
              {showAnnouncementForm ? <X size={20}/> : <PlusCircle size={20}/>}
            </button>
          </div>

          <div className="p-6 grow">
            {showAnnouncementForm ? (
              <form onSubmit={handlePostAnnouncement} className="space-y-4 animate-in fade-in">
                 <input 
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-100 outline-none" 
                  placeholder="Subject Heading"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({...annForm, title: e.target.value})}
                />
                <textarea 
                  className="w-full p-3 bg-gray-50 border-none rounded-xl h-24 focus:ring-2 focus:ring-blue-100 outline-none" 
                  placeholder="Message content..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm({...annForm, content: e.target.value})}
                />
                
                {/* File Upload Section */}
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
                  <label className="flex items-center justify-center cursor-pointer gap-2">
                    <Upload size={18} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Click to upload files or drag and drop</span>
                    <input 
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                    />
                  </label>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Selected Files ({selectedFiles.length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File size={16} className="text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 flex-shrink-0"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <select
                    value={annForm.priority}
                    onChange={(e) => setAnnForm({...annForm, priority: e.target.value})}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    Publish
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{ann.title}</p>
                      <p className="text-xs text-gray-500">Posted on {new Date(ann.createdAt).toLocaleDateString()}</p>
                      {ann.files && ann.files.length > 0 && (
                        <p className="text-xs text-purple-600 mt-1">{ann.files.length} file(s) attached</p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(ann._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Activity Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><HelpCircle size={20} /></div>
            <h3 className="font-bold text-gray-900">Unresolved Doubts</h3>
          </div>
          <div className="space-y-4">
            {recentDoubts.length > 0 ? recentDoubts.map(doubt => (
              <div key={doubt._id} className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {doubt.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{doubt.question}</p>
                    <p className="text-xs text-gray-400">{doubt.subject} • {doubt.user?.name}</p>
                  </div>
                </div>
                <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-gray-400 text-sm">All caught up! No pending doubts.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;