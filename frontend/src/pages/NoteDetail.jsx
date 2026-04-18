import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
  HardDrive,
  Eye,
  Loader2,
} from "lucide-react";
import notesService from "../services/notesService";
import { useAuth } from "../hooks/authhook";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const data = await notesService.getNoteById(id);
        setNote(data);
      } catch (err) {
        console.error("Failed to fetch note:", err);
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await notesService.deleteNote(id);
      navigate("/notes");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = () => {
    if (note?.downloadUrl) {
      window.open(note.downloadUrl, "_blank");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubjectColor = (subject) => {
    const colors = {
      Mathematics: "bg-blue-50 text-blue-600 border-blue-100",
      Physics: "bg-orange-50 text-orange-600 border-orange-100",
      Chemistry: "bg-green-50 text-green-600 border-green-100",
      "Computer Science": "bg-purple-50 text-purple-600 border-purple-100",
      Electronics: "bg-cyan-50 text-cyan-600 border-cyan-100",
      Mechanical: "bg-red-50 text-red-600 border-red-100",
      Civil: "bg-amber-50 text-amber-600 border-amber-100",
      Electrical: "bg-yellow-50 text-yellow-600 border-yellow-100",
    };
    return colors[subject] || "bg-gray-50 text-gray-600 border-gray-100";
  };

  const isOwner = user && note?.uploadedBy?._id === user._id;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">
            Loading note...
          </p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Note not found</h2>
        <button
          onClick={() => navigate("/notes")}
          className="mt-4 text-sm text-[#7C3AED] font-medium hover:underline"
        >
          Back to Notes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        id="note-detail-back-btn"
        onClick={() => navigate("/notes")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#7C3AED] font-medium text-sm transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Notes
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Preview — Left Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm truncate max-w-[300px]">
                  {note.fileName}
                </span>
              </div>
              <button
                id="note-download-btn"
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all backdrop-blur-sm"
              >
                <Download size={16} />
                Download
              </button>
            </div>

            {/* PDF iframe */}
            {note.downloadUrl ? (
              <iframe
                src={note.downloadUrl}
                title={note.title}
                className="w-full border-0"
                style={{ height: "600px" }}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50">
                <p className="text-gray-400 text-sm">Preview not available</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel — Right */}
        <div className="space-y-6">
          {/* Note Info Card */}
          <div className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSubjectColor(note.subject)}`}
              >
                {note.subject}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                Sem {note.semester}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {note.title}
            </h1>

            {note.description && (
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {note.description}
              </p>
            )}

            {/* Meta Grid */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <User size={16} className="text-[#7C3AED]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Uploaded by</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {note.uploadedBy?.name || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Uploaded on</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <HardDrive size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">File size</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatFileSize(note.fileSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Eye size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Downloads</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {note.downloads}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            id="note-download-btn-large"
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 active:scale-[0.97] transition-all duration-200"
          >
            <Download size={18} />
            Download PDF
          </button>

          {/* Delete Button — Only for uploader */}
          {isOwner && (
            <>
              {showDeleteConfirm ? (
                <div className="bg-red-50 rounded-2xl border border-red-100 p-4 space-y-3">
                  <p className="text-sm text-red-600 font-medium">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      id="note-confirm-delete-btn"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {deleting ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      {deleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="note-delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <Trash2 size={16} />
                  Delete Note
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
