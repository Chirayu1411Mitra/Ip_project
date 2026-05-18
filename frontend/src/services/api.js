// const api = fetch({
//   baseUrl: import.meta.env.API_BASE_URL,
//   withCredentials: true,
// });

// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response.status === 401) {
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = {
  get: (url) => request("GET", url),
  post: (url, body) => request("POST", url, body),
  put: (url, body) => request("PUT", url, body),
  delete: (url) => request("DELETE", url),
  patch: (url, body) => request("PATCH", url, body),
};

async function request(method, url, body = null) {
  const options = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${BASE_URL}${url}`, options);
  const data = await response.json();

  if (response.status === 401 && url !== "/auth/me" && url !== "/auth/login") {
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    throw { response: { data, status: response.status } };
  }

  return { data };
}

export default api;

// ================= DOUBTS =================

export const getDoubts = () => api.get("/doubts");

export const createDoubt = (body) => api.post("/doubts", body);

export const toggleDoubtUpvote = (id) =>
  api.patch ? api.patch(`/doubts/${id}/upvote`) : request("PATCH", `/doubts/${id}/upvote`);


// ================= ANSWERS =================

export const addAnswer = (doubtId, body) =>
  api.post(`/doubts/${doubtId}/answer`, body);

export const toggleAnswerUpvote = (doubtId, answerId) =>
  api.patch(`/doubts/${doubtId}/answers/${answerId}/upvote`);


// ================= NOTIFICATIONS =================

export const getNotifications = () => api.get("/notifications");

export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all");

// ================= GROUPS =================

export const createGroup = (body) => api.post("/groups", body);
export const joinGroup = (id) => api.post(`/groups/${id}/join`, {});
export const getMyGroups = () => api.get("/groups/my");
export const getAllGroups = () => api.get("/groups");
export const getGroupById = (id) => api.get(`/groups/${id}`);
export const addMemberToGroup = (groupId, userId) => api.post(`/groups/${groupId}/members`, { userId });
export const removeMemberFromGroup = (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`);

// ================= DEADLINES =================

export const createDeadline = (body) => api.post("/deadlines", body);
export const getMyDeadlines = () => api.get("/deadlines/my");
export const getGroupDeadlines = (groupId) => api.get(`/deadlines/group/${groupId}`);
export const toggleDeadlineComplete = (id) => api.patch(`/deadlines/${id}/complete`);
export const updateDeadline = (id, body) => api.patch(`/deadlines/${id}`, body);
export const deleteDeadline = (id) => api.delete(`/deadlines/${id}`);

// ================= PROFILE =================

export const updateProfile = (body) => api.patch("/auth/profile", body);
export const searchUsers = (q) => api.get(`/auth/search?q=${encodeURIComponent(q)}`);