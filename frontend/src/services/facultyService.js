import api from "./api";

const facultyService = {
  getAnnouncements: async () => {
    return api.get("/faculty/announcements");
  },

  createAnnouncement: async (payload) => {
    return api.post("/faculty/announcements", payload);
  },

  deleteAnnouncement: async (id) => {
    return api.delete(`/faculty/announcements/${id}`);
  },

  getStudentActivity: async () => {
    return api.get("/faculty/students");
  },

  getStats: async () => {
    return api.get("/faculty/stats");
  },

  registerFaculty: async (payload) => {
    return api.post("/auth/register-faculty", payload);
  },
};

export default facultyService;
