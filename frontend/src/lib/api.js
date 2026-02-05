import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const getMe = () => api.get('/auth/me');
export const createSession = (sessionId) => api.post('/auth/session', { session_id: sessionId });
export const logout = () => api.post('/auth/logout');

// Projects
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Chapters
export const getChapters = (projectId) => api.get(`/projects/${projectId}/chapters`);
export const getChapter = (id) => api.get(`/chapters/${id}`);
export const createChapter = (projectId, data) => api.post(`/projects/${projectId}/chapters`, data);
export const updateChapter = (id, data) => api.put(`/chapters/${id}`, data);
export const deleteChapter = (id) => api.delete(`/chapters/${id}`);

// PDF Upload
export const uploadPDF = (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/projects/${projectId}/upload-pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Quiz
export const getQuiz = (chapterId) => api.get(`/chapters/${chapterId}/quiz`);
export const createQuiz = (chapterId, data) => api.post(`/chapters/${chapterId}/quiz`, data);

// Progress & Gamification
export const getProgress = (projectId) => api.get(`/progress/${projectId}`);
export const completeChapter = (projectId, chapterId) => {
  const formData = new FormData();
  formData.append('chapter_id', chapterId);
  return api.post(`/progress/${projectId}/complete-chapter`, formData);
};
export const toggleBookmark = (projectId, chapterId) => {
  const formData = new FormData();
  formData.append('chapter_id', chapterId);
  return api.post(`/progress/${projectId}/bookmark`, formData);
};
export const getBadges = () => api.get('/badges');

// Payments
export const createCheckout = (projectId, method = 'stripe') => {
  const originUrl = window.location.origin;
  if (method === 'paypal') {
    return api.post('/payments/paypal/checkout', { project_id: projectId, origin_url: originUrl });
  } else if (method === 'przelewy24') {
    return api.post('/payments/przelewy24/checkout', { project_id: projectId, origin_url: originUrl });
  }
  return api.post('/payments/checkout', { project_id: projectId, origin_url: originUrl });
};
export const getPaymentStatus = (sessionId) => api.get(`/payments/status/${sessionId}`);
export const getPaymentMethods = () => api.get('/payments/methods');
export const capturePaypalPayment = (orderId) => api.post(`/payments/paypal/capture/${orderId}`);

// Export
export const exportWebbook = (projectId) => api.get(`/projects/${projectId}/export`);

export default api;
