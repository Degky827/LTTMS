import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor - attach JWT
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor - handle auth expiry
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
        const accessToken = res.data?.token || res.data?.data?.accessToken
        const newRefreshToken = res.data?.refreshToken || res.data?.data?.refreshToken

        if (accessToken) {
          localStorage.setItem('token', accessToken)
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return API(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          if (!window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login'
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export default API
