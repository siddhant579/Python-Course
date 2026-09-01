import api from './api';

const documentApi = {
  upload: (courseId, file, onProgress) => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('file', file);
    return api
      .post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) onProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      })
      .then((r) => r.data.data);
  },
  getAll: (courseId) => api.get('/documents', { params: courseId ? { courseId } : {} }).then((r) => r.data.data),
  getOne: (id) => api.get(`/documents/${id}`).then((r) => r.data.data),
  process: (id) => api.post(`/documents/${id}/process`).then((r) => r.data.data),
  updateDraft: (id, draftStructure) => api.put(`/documents/${id}/draft`, { draftStructure }).then((r) => r.data.data),
  publish: (id) => api.post(`/documents/${id}/publish`).then((r) => r.data.data),
  remove: (id) => api.delete(`/documents/${id}`).then((r) => r.data.data),
};

export default documentApi;
