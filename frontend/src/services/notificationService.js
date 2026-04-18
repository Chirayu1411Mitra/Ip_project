import api from "./api";

export const getNotifications = () => api.get("/notifications");
export const markAllNotificationsRead = () => api.patch("/notifications/read-all");