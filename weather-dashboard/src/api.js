import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getLatest = () => axios.get(`${BASE}/api/readings/latest`).then(r => r.data);
export const getReadings = (limit = 200) => axios.get(`${BASE}/api/readings?limit=${limit}`).then(r => r.data);
export const getSummary = (hours = 24) => axios.get(`${BASE}/api/analytics/summary?hours=${hours}`).then(r => r.data);
export const getPredictions = () => axios.get(`${BASE}/api/analytics/predictions`).then(r => r.data);
export const getAlerts = () => axios.get(`${BASE}/api/alerts`).then(r => r.data);
export const getAccuracy = () => axios.get(`${BASE}/api/analytics/accuracy`).then(r => r.data);