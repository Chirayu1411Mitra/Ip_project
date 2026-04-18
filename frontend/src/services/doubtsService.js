import api from "./api";

export const getDoubts = () => api.get("/doubts");
export const createDoubt = (body) => api.post("/doubts", body);
export const toggleDoubtUpvote = (id) =>
  api.patch ? api.patch(`/doubts/${id}/upvote`) : request("PATCH", `/doubts/${id}/upvote`);