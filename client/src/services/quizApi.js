import api from './api';

const quizApi = {
  getByWeek: (weekId) => api.get(`/weeks/${weekId}/quizzes`).then((r) => r.data.data),
  getOne: (id) => api.get(`/quizzes/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/quizzes', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/quizzes/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/quizzes/${id}`).then((r) => r.data.data),
  publish: (id) => api.put(`/quizzes/${id}/publish`).then((r) => r.data.data),
  unpublish: (id) => api.put(`/quizzes/${id}/unpublish`).then((r) => r.data.data),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }).then((r) => r.data.data),
  getResults: (quizId) => api.get(`/quizzes/${quizId}/results`).then((r) => r.data.data),

  // Questions (admin authoring)
  getQuestions: (quizId) => api.get(`/quizzes/${quizId}/questions`).then((r) => r.data.data),
  createQuestion: (payload) => api.post('/questions', payload).then((r) => r.data.data),
  updateQuestion: (id, payload) => api.put(`/questions/${id}`, payload).then((r) => r.data.data),
  removeQuestion: (id) => api.delete(`/questions/${id}`).then((r) => r.data.data),
};

export default quizApi;
