import api from './api';

const lessonApi = {
  getByTopic: (topicId) => api.get(`/topics/${topicId}/lessons`).then((r) => r.data.data),
  getOne: (id) => api.get(`/lessons/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/lessons', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/lessons/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/lessons/${id}`).then((r) => r.data.data),
  publish: (id) => api.put(`/lessons/${id}/publish`).then((r) => r.data.data),
  unpublish: (id) => api.put(`/lessons/${id}/unpublish`).then((r) => r.data.data),

  // Exercises
  getExercises: (lessonId) => api.get(`/lessons/${lessonId}/exercises`).then((r) => r.data.data),
  createExercise: (payload) => api.post('/exercises', payload).then((r) => r.data.data),
  updateExercise: (id, payload) => api.put(`/exercises/${id}`, payload).then((r) => r.data.data),
  removeExercise: (id) => api.delete(`/exercises/${id}`).then((r) => r.data.data),
  publishExercise: (id) => api.put(`/exercises/${id}/publish`).then((r) => r.data.data),
  unpublishExercise: (id) => api.put(`/exercises/${id}/unpublish`).then((r) => r.data.data),
};

export default lessonApi;
