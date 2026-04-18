import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Calendar, User } from "lucide-react";

const NoteCard = ({ note }) => {
  const navigate = useNavigate();

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

  return (
    <div
      id={`note-card-${note._id}`}
      onClick={() => navigate(`/notes/${note._id}`)}
      className="bg-white rounded-[24px] border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-50 hover:-translate-y-1 hover:border-purple-100 group"
    >
      {/* Top Row: Icon + Subject Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] rounded-2xl flex items-center justify-center shadow-md shadow-purple-100 group-hover:shadow-lg group-hover:shadow-purple-200 transition-shadow">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSubjectColor(note.subject)}`}
        >
          {note.subject}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-[#7C3AED] transition-colors">
        {note.title}
      </h3>

      {/* Description */}
      {note.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {note.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <User size={14} />
          <span className="font-medium">
            {note.uploadedBy?.name || "Unknown"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={14} />
          <span>{formatDate(note.createdAt)}</span>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Download size={14} />
          <span>{note.downloads} downloads</span>
        </div>
        <span className="text-xs text-gray-300 font-medium">
          {formatFileSize(note.fileSize)}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;
