import axios from 'axios';

// const API_URL = '/api';
const API_URL = 'https://badminton-assign2.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Booking APIs
export const createBooking = (data) => api.post('/bookings', data);
export const getUserBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id, userId) => api.delete(`/bookings/${id}`, { data: { userId } });
export const getPricingPreview = (data) => api.post('/bookings/pricing-preview', data);

// Availability APIs
export const checkAvailability = (params) => api.get('/availability/check', { params });
export const getAvailableSlots = (params) => api.get('/availability/slots', { params });
export const getAvailableResources = (params) => api.get('/availability/resources', { params });

// Resource APIs
export const getCourts = () => api.get('/courts');
export const getEquipment = () => api.get('/equipment');
export const getCoaches = () => api.get('/coaches');
export const getPricingRules = () => api.get('/pricing-rules');

// Admin APIs
export const createCourt = (data) => api.post('/admin/courts', data);
export const updateCourt = (id, data) => api.put(`/admin/courts/${id}`, data);
export const deleteCourt = (id) => api.delete(`/admin/courts/${id}`);

export const createEquipment = (data) => api.post('/admin/equipment', data);
export const updateEquipment = (id, data) => api.put(`/admin/equipment/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/admin/equipment/${id}`);

export const createCoach = (data) => api.post('/admin/coaches', data);
export const updateCoach = (id, data) => api.put(`/admin/coaches/${id}`, data);
export const deleteCoach = (id) => api.delete(`/admin/coaches/${id}`);

export const createPricingRule = (data) => api.post('/admin/pricing-rules', data);
export const updatePricingRule = (id, data) => api.put(`/admin/pricing-rules/${id}`, data);
export const deletePricingRule = (id) => api.delete(`/admin/pricing-rules/${id}`);

// Waitlist APIs
export const addToWaitlist = (data) => api.post('/waitlist', data);
export const getUserWaitlist = (userId) => api.get(`/waitlist/user/${userId}`);
export const removeFromWaitlist = (id) => api.delete(`/waitlist/${id}`);

// Admin Waitlist APIs
export const getAllWaitlist = () => api.get('/admin/waitlist');
export const notifyWaitlistUser = (id) => api.put(`/admin/waitlist/${id}/notify`);
export const adminRemoveFromWaitlist = (id) => api.delete(`/admin/waitlist/${id}`);

export default api;
