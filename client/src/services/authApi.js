import api from './api';

const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  updateProfile: (payload) => api.put('/auth/me', payload).then((r) => r.data.data),
  changePassword: (payload) => api.put('/auth/password', payload).then((r) => r.data.data),
};

export default authApi;
