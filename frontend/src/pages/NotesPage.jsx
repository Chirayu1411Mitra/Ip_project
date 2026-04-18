import React, { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Loader2 } from "lucide-react";
import NoteCard from "../components/notes/NoteCard";
import SearchBar from "../components/notes/SearchBar";
import SubjectFilter from "../components/notes/SubjectFilter";
import FileUploader from "../components/notes/FileUploader";
import notesService from "../services/notesService";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notesService.getNotes({
        page: pagination.page,
        limit: pagination.limit,
        subject: selectedSubject,
        semester: selectedSemester,
      });
      setNotes(data.notes);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
      }));
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedSubject, selectedSemester]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    try {
      const data = await notesService.searchNotes(query, 1);
      setNotes(data.notes);
      setPagination({
        page: 1,
        limit: 12,
        total: data.pagination.total,
        pages: data.pagination.pages,
      });
    } catch (err) {
      console.error("Search failed:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    if (!searchQuery) {
      fetchNotes();
    }
  }, [fetchNotes, searchQuery]);

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadSuccess = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearchQuery("");
    setSelectedSubject("");
    setSelectedSemester("");
    fetchNotes();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notes Hub 📚</h1>
          <p className="text-gray-400 mt-1 font-medium">
            Browse and share study materials with your peers
          </p>
        </div>
        <button
          id="upload-note-btn"
          onClick={() => setIsUploaderOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white rounded-2xl font-semibold text-sm shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 active:scale-[0.97] transition-all duration-200"
        >
          <Plus size={18} />
          Upload Note
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
        <SubjectFilter
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
          selectedSemester={selectedSemester}
          onSemesterChange={handleSemesterChange}
        />
      </div>

      {/* Search indicator */}
      {searchQuery && (
        <p className="text-sm text-gray-400">
          Showing results for{" "}
          <span className="font-semibold text-[#7C3AED]">"{searchQuery}"</span>
          {" · "}
          {pagination.total} result{pagination.total !== 1 && "s"}
        </p>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
            <p className="text-sm text-gray-400 font-medium">
              Loading notes...
            </p>
          </div>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[28px] border border-gray-100">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#7C3AED] opacity-50" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            No notes found
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {searchQuery
              ? "Try a different search term"
              : "Be the first to share your notes!"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-200 transition-all"
            >
              Upload your first note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            id="pagination-prev"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pagination.page <= 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-purple-50 hover:text-[#7C3AED]"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter((page) => {
              // Show first, last, and nearby pages
              return (
                page === 1 ||
                page === pagination.pages ||
                Math.abs(page - pagination.page) <= 1
              );
            })
            .map((page, idx, arr) => (
              <React.Fragment key={page}>
                {idx > 0 && arr[idx - 1] !== page - 1 && (
                  <span className="text-gray-300 px-1">…</span>
                )}
                <button
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    page === pagination.page
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white shadow-md shadow-purple-200"
                      : "text-gray-600 hover:bg-purple-50 hover:text-[#7C3AED]"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}

          <button
            id="pagination-next"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              pagination.page >= pagination.pages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-purple-50 hover:text-[#7C3AED]"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploader
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default NotesPage;
