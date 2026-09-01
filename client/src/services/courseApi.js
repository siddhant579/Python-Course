import api from './api';

const courseApi = {
  getAll: (params) => api.get('/courses', { params }).then((r) => r.data.data),
  getOne: (id) => api.get(`/courses/${id}`).then((r) => r.data.data),
  getStructure: (id) => api.get(`/courses/${id}/structure`).then((r) => r.data.data),
  create: (payload) => api.post('/courses', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/courses/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/courses/${id}`).then((r) => r.data.data),
  publish: (id) => api.put(`/courses/${id}/publish`).then((r) => r.data.data),
  unpublish: (id) => api.put(`/courses/${id}/unpublish`).then((r) => r.data.data),

  // Weeks
  getWeeks: (courseId) => api.get(`/courses/${courseId}/weeks`).then((r) => r.data.data),
  createWeek: (payload) => api.post('/weeks', payload).then((r) => r.data.data),
  updateWeek: (id, payload) => api.put(`/weeks/${id}`, payload).then((r) => r.data.data),
  removeWeek: (id) => api.delete(`/weeks/${id}`).then((r) => r.data.data),
  publishWeek: (id) => api.put(`/weeks/${id}/publish`).then((r) => r.data.data),
  unpublishWeek: (id) => api.put(`/weeks/${id}/unpublish`).then((r) => r.data.data),

  // Topics
  getTopics: (weekId) => api.get(`/weeks/${weekId}/topics`).then((r) => r.data.data),
  createTopic: (payload) => api.post('/topics', payload).then((r) => r.data.data),
  updateTopic: (id, payload) => api.put(`/topics/${id}`, payload).then((r) => r.data.data),
  removeTopic: (id) => api.delete(`/topics/${id}`).then((r) => r.data.data),
  publishTopic: (id) => api.put(`/topics/${id}/publish`).then((r) => r.data.data),
  unpublishTopic: (id) => api.put(`/topics/${id}/unpublish`).then((r) => r.data.data),
};

export default courseApi;
