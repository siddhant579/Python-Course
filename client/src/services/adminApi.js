import api from './api';

const adminApi = {
  getStats: () => api.get('/admin/stats').then((r) => r.data.data),
  getStudents: () => api.get('/users/students').then((r) => r.data.data),
  getStudentProgress: (id) => api.get(`/users/students/${id}/progress`).then((r) => r.data.data),
  setStudentActive: (id, isActive) => api.put(`/users/${id}/status`, { isActive }).then((r) => r.data.data),
};

export default adminApi;
