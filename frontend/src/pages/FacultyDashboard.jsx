import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import facultyService from "../services/facultyService";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [studentActivity, setStudentActivity] = useState(null);
  const [bannedStudents, setBannedStudents] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showStudentActivity, setShowStudentActivity] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, announcementsData, activityData] = await Promise.all([
        facultyService.getStats(),
        facultyService.getAnnouncements(),
        facultyService.getStudentActivity(),
      ]);

      setStats(statsData);
      setAnnouncements(
        Array.isArray(announcementsData) ? announcementsData : [],
      );
      setStudentActivity(activityData);

      const filtered = activityData?.bannedStudents || [];
      setBannedStudents(filtered);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title || !formData.content) {
      setFormError("Title and content are required");
      return;
    }

    try {
      await facultyService.createAnnouncement(formData);
      setFormData({ title: "", content: "", priority: "normal" });
      setShowAnnouncementForm(false);
      fetchData();
    } catch (error) {
      setFormError(
        error?.response?.data?.message || "Failed to create announcement",
      );
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await facultyService.deleteAnnouncement(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-l-4 border-red-400";
      case "low":
        return "bg-gray-100 text-gray-700 border-l-4 border-gray-400";
      case "normal":
      default:
        return "bg-blue-100 text-blue-700 border-l-4 border-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Banner - Purple Brand */}
        <div className="rounded-2xl p-8 shadow-lg text-white relative overflow-hidden bg-gradient-to-br from-[#7c3aed] to-[#5b21b6]">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-purple-50">
                  Faculty Dashboard
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{user?.name}</h1>
              <p className="text-purple-200 text-lg">
                {user?.designation} • {user?.department}
              </p>
            </div>
          </div>
          
          {/* Decorative Background Blobs */}
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-10 -bottom-10 w-32 h-32 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Notes Uploaded",
              value: stats?.notesUploaded || 0,
              color: "from-purple-400 to-purple-600",
            },
            {
              label: "Announcements Posted",
              value: stats?.announcementsPosted || 0,
              color: "from-[#7c3aed] to-[#5b21b6]",
            },
            {
              label: "Total Students",
              value: stats?.totalStudents || 0,
              color: "from-green-400 to-green-600",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} text-white rounded-2xl p-6 shadow-lg`}
            >
              <p className="text-white text-opacity-90 mb-2">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Banned Students Alert */}
        {bannedStudents.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-3">
                  Banned Students ({bannedStudents.length})
                </h3>
                <div className="space-y-2">
                  {bannedStudents.map((student) => {
                    const daysRemaining = Math.ceil(
                      (new Date(student.bannedUntil) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <div key={student._id} className="text-red-700">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm">
                          Roll No: {student.rollNo} | {daysRemaining} days
                          remaining
                        </p>
                        <p className="text-sm italic">
                          Reason: {student.banReason}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
            <button
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
            >
              <Plus className="w-5 h-5" />
              New Announcement
            </button>
          </div>

          {/* Announcement Form */}
          {showAnnouncementForm && (
            <form
              onSubmit={handleCreateAnnouncement}
              className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {formError}
                </div>
              )}
              <input
                type="text"
                placeholder="Announcement Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              />
              <textarea
                placeholder="Announcement Content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows="4"
                className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
              />
              <div className="flex gap-3 items-center">
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  type="submit"
                  className="ml-auto text-white px-4 py-2 rounded-lg transition hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)" }}
                >
                  Post Announcement
                </button>
              </div>
            </form>
          )}

          {/* Announcements List */}
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No announcements yet
              </p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann._id}
                  className={`p-4 rounded-lg ${getPriorityColor(ann.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{ann.title}</h4>
                      <p className="text-sm mb-2">{ann.content}</p>
                      <p className="text-xs opacity-75">
                        by {ann.postedBy?.name}
                      </p>
                    </div>
                    {ann.postedBy?._id === user?._id && (
                      <button
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        className="ml-4 p-2 hover:bg-red-100 rounded transition"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student Activity Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <button
            onClick={() => setShowStudentActivity(!showStudentActivity)}
            className="w-full flex items-center justify-between p-4 hover:bg-purple-50 transition rounded-lg"
          >
            <h2 className="text-2xl font-bold text-gray-800">
              Student Activity
            </h2>
            {showStudentActivity ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>

          {showStudentActivity && (
            <>
              {/* Students Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left font-bold">Name</th>
                      <th className="p-3 text-left font-bold">Roll No</th>
                      <th className="p-3 text-left font-bold">Branch</th>
                      <th className="p-3 text-left font-bold">Sem</th>
                      <th className="p-3 text-center font-bold">Notes</th>
                      <th className="p-3 text-center font-bold">Doubts</th>
                      <th className="p-3 text-center font-bold">Downloads</th>
                      <th className="p-3 text-left font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentActivity?.students?.map((student) => (
                      <tr
                        key={student._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">{student.name}</td>
                        <td className="p-3">{student.rollNo}</td>
                        <td className="p-3">{student.branch}</td>
                        <td className="p-3">{student.semester}</td>
                        <td className="p-3 text-center">
                          {student.notesUploaded || 0}
                        </td>
                        <td className="p-3 text-center">
                          {student.doubtsAsked || 0}
                        </td>
                        <td className="p-3 text-center">
                          {student.downloads || 0}
                        </td>
                        <td className="p-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Notes and Doubts */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                {/* Recent Notes */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Doubts
                  </h3>
                  <div className="space-y-3">
                    {studentActivity?.recentDoubts?.slice(0, 5).map((doubt) => (
                      <div
                        key={doubt._id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="font-semibold text-sm mb-1">
                          {doubt.user?.name}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {doubt.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Doubts */}
                <div>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Recent Doubts
                  </h3>
                  <div className="space-y-3">
                    {studentActivity?.recentDoubts?.slice(0, 5).map((doubt) => (
                      <div
                        key={doubt._id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="font-semibold text-sm mb-1">
                          {doubt.user?.name}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {doubt.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
