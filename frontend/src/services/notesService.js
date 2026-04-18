import api from "./api";

const notesService = {
  /**
   * Get paginated notes with optional filters
   */
  getNotes: async ({ page = 1, limit = 12, subject = "", semester = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    if (subject) params.set("subject", subject);
    if (semester) params.set("semester", semester);

    const { data } = await api.get(`/notes?${params.toString()}`);
    return data;
  },

  /**
   * Get a single note by ID (increments download count)
   */
  getNoteById: async (id) => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  },

  /**
   * Upload a new note
   * @param {FormData} formData - Must contain: file, title, subject, semester, description
   */
  uploadNote: async (formData) => {
    const { data } = await api.upload("/notes", formData);
    return data;
  },

  /**
   * Delete a note by ID
   */
  deleteNote: async (id) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
  },

  /**
   * Search notes by query string
   */
  searchNotes: async (query, page = 1) => {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("page", page);

    const { data } = await api.get(`/notes/search?${params.toString()}`);
    return data;
  },
};

export default notesService;
