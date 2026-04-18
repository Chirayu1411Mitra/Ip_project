import api from "./api";

export const addAnswer = (doubtId, body) =>
  api.post(`/doubts/${doubtId}/answer`, body);

export const toggleAnswerUpvote = (doubtId, answerId) =>
  api.patch(`/doubts/${doubtId}/answers/${answerId}/upvote`);

