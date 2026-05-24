import { useEffect, useState, useRef } from "react";
import { Book, Upload, Trash2, Download, Search, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { getNotes, uploadNote, deleteNote } from "../services/api";
import { useAuth } from "../context/AuthContext";

const COMMON_SUBJECTS = ["Math", "Physics", "Computer Science", "Chemistry", "Biology", "English", "Other"];

function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState(COMMON_SUBJECTS[0]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchNotes();
  }, [filter]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await getNotes(filter);
      setNotes(res.data.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !subject) {
      setUploadError("Please fill all required fields and select a PDF file.");
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subject", subject);
    formData.append("file", file);

    try {
      await uploadNote(formData);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setSubject(COMMON_SUBJECTS[0]);
      setFile(null);
      fetchNotes(); // refresh notes list
    } catch (err) {
      setUploadError(err?.response?.data?.message || "Failed to upload note.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const myUploads = notes.filter((n) => n.uploadedBy?._id === user?._id).length;
  
  // Get unique subjects for tabs (include 'All' and any new custom subjects)
  const availableSubjects = ["All", ...new Set(notes.map((n) => n.subject))];
  // Add common subjects if they don't exist in notes
  COMMON_SUBJECTS.forEach(s => {
    if (!availableSubjects.includes(s)) availableSubjects.push(s);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-screen custom-scrollbar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Study Notes
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">
              Access and share PDF notes with your peers.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-purple-200 transition-all active:scale-95"
          >
            <Upload size={18} />
            Upload Note
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {
              label: "Total Notes",
              value: notes.length,
              icon: <Book size={18} />,
              bg: "bg-purple-50",
              text: "text-purple-600",
              border: "border-purple-100",
            },
            {
              label: "My Uploads",
              value: myUploads,
              icon: <Upload size={18} />,
              bg: "bg-emerald-50",
              text: "text-emerald-600",
              border: "border-emerald-100",
            },
            {
              label: "Subjects Available",
              value: new Set(notes.map(n => n.subject)).size,
              icon: <FileText size={18} />,
              bg: "bg-amber-50",
              text: "text-amber-600",
              border: "border-amber-100",
            },
          ].map(({ label, value, icon, bg, text, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border ${border} flex items-center gap-4 transition-transform hover:-translate-y-1 duration-200`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${text}`}>
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-gray-800 leading-none mb-1 truncate">{value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {availableSubjects.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                filter === s
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200 border border-transparent"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-sm font-bold tracking-wide animate-pulse">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Book className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-600 mb-1">No notes found</p>
            <p className="text-sm text-gray-400">Be the first to upload a note for this subject!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => {
              const canDelete = user?.role === "faculty" || user?._id === note.uploadedBy?._id;
              
              return (
                <div key={note._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-3xl -z-0"></div>
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      {note.subject}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 relative z-10">{note.title}</h3>
                  {note.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 relative z-10">{note.description}</p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {note.uploadedBy?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
                        {note.uploadedBy?.name || "Unknown"}
                      </span>
                    </div>
                    
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download size={14} />
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Upload size={20} className="text-purple-600" /> Upload Note
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6">
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
                    {uploadError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Chapter 1: Thermodynamics"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-medium"
                    >
                      {COMMON_SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of the content..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">PDF File</label>
                    <div
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                        file ? "border-purple-300 bg-purple-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files[0])}
                        className="hidden"
                      />
                      {file ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          <p className="text-sm font-bold text-gray-700 truncate max-w-full px-4">
                            {file.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-xs text-red-500 font-medium hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 mb-2 cursor-pointer">
                            <Upload size={20} />
                          </div>
                          <p className="text-sm font-bold text-gray-600 cursor-pointer">Click to select PDF</p>
                          <p className="text-xs text-gray-400">Max size: 20MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !file || !title}
                    className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesPage;
