import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/register'
      }
    }
    return Promise.reject(error)
  }
)

export default API
