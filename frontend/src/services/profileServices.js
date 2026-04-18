import api from "./api";

const updateProfile = async (userData) => {
  const { data } = await api.patch("/profile/update-profile", userData);
  return data;
};

const uploadProfilePicture = async (file) => {
  const { data } = await api.upload("/profile/upload-avatar", file);
  return data;
};

const dataStats = async () => {
  const { data } = await api.get("/profile/data-stats");
  return data;
};

const getRecentNotes = async () => {
  const { data } = await api.get("/profile/recent-notes");
  return data.notes ?? [];
};

const getRecentDoubts = async () => {
  const { data } = await api.get("/profile/recent-doubts");
  return data.doubts ?? [];
};

const profileService = {
  updateProfile,
  uploadProfilePicture,
  dataStats,
  getRecentNotes,
  getRecentDoubts,
};
export default profileService;
