import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL,
  withCredentials: true
});

// Keep interceptor for optional backward compatibility with legacy clients only.
API.interceptors.request.use((config) => config);

export default API;
