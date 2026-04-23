import api from "./api";

const facultyService = {
  // Announcements
  getAnnouncements: async () => {
    const { data } = await api.get("/faculty/announcements");
    return data;
  },
  createAnnouncement: async (payload) => {
    const { data } = await api.post("/faculty/announcements", payload);
    return data;
  },
  deleteAnnouncement: async (id) => {
    const { data } = await api.delete(`/faculty/announcements/${id}`);
    return data;
  },

  // Student activity
  getStudentActivity: async () => {
    const { data } = await api.get("/faculty/students");
    return data;
  },

  // Faculty stats
  getStats: async () => {
    const { data } = await api.get("/faculty/stats");
    return data;
  },
};

export default facultyService;