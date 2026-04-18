import React, { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import notesService from "../../services/notesService";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Other",
];

const FileUploader = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setSubject("");
    setSemester("");
    setDescription("");
    setError("");
    setUploading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(selectedFile.name.replace(".pdf", ""));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(".pdf", ""));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF file");
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!subject) {
      setError("Please select a subject");
      return;
    }
    if (!semester) {
      setError("Please select a semester");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("subject", subject);
      formData.append("semester", semester);
      formData.append("description", description.trim());

      await notesService.uploadNote(formData);
      handleClose();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err?.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal - Adjusted border radius for mobile */}
      <div className="relative bg-white rounded-2xl sm:rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header - Adjusted padding */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Upload Note</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Share your study materials with peers
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form - Adjusted padding and spacing */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-red-600">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Drop Zone - Adjusted padding */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? "border-[#7C3AED] bg-purple-50"
                : file
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-input"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate max-w-xs px-2">
                  {file.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium mt-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#7C3AED]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600">
                  Drop your PDF here or{" "}
                  <span className="text-[#7C3AED]">browse</span>
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400">PDF only, max 10 MB</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="upload-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linear Algebra Chapter 3 Notes"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
            />
          </div>

          {/* Subject + Semester Row - Stacked on mobile (grid-cols-1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                id="upload-subject-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 cursor-pointer transition-all"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                Semester <span className="text-red-400">*</span>
              </label>
              <select
                id="upload-semester-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 cursor-pointer transition-all"
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="upload-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the notes..."
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            id="upload-submit-btn"
            type="submit"
            disabled={uploading}
            className={`w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm font-bold text-white transition-all duration-200 ${
              uploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] hover:shadow-lg hover:shadow-purple-200 active:scale-[0.98]"
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              "Upload Note"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUploader;