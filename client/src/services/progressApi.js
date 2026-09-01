import api from './api';

const progressApi = {
  getForCourse: (courseId) => api.get(`/progress/${courseId}`).then((r) => r.data.data),
  markLessonComplete: (payload) => api.post('/progress/lesson', payload).then((r) => r.data.data),
  markExerciseComplete: (payload) => api.post('/progress/exercise', payload).then((r) => r.data.data),
  setCurrentWeek: (payload) => api.post('/progress/week', payload).then((r) => r.data.data),
};

export default progressApi;
