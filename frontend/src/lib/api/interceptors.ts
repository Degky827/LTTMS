import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from './api-error'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

export function setupInterceptors(instance: AxiosInstance, baseURL: string): void {
  // Request Interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token && config.headers && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`
        }

        const lang = localStorage.getItem('lttms_lang') || 'en'
        config.headers['Accept-Language'] = lang

        // Optional request correlation ID
        if (!config.headers['x-correlation-id']) {
          config.headers['x-correlation-id'] = `lttms-fe-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
        }
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // Handle Network / Connection Errors
      if (!error.response) {
        return Promise.reject(
          new ApiError({
            message: 'Unable to reach LTTMS servers. Please check your internet connection.',
            status: 0,
            isNetworkError: true,
          })
        )
      }

      const status = error.response.status
      const responseData = error.response.data

      // Handle 401 Unauthorized with token refresh rotation
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/register')

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return instance(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const storedRefreshToken =
            typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null

          const refreshResponse = await instance.post(
            `${baseURL}/auth/refresh`,
            { refreshToken: storedRefreshToken },
            { withCredentials: true }
          )

          const newAccessToken =
            refreshResponse.data?.token || refreshResponse.data?.data?.accessToken
          const newRefreshToken =
            refreshResponse.data?.refreshToken || refreshResponse.data?.data?.refreshToken

          if (newAccessToken && typeof window !== 'undefined') {
            localStorage.setItem('token', newAccessToken)
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken)
            }
          }

          processQueue(null, newAccessToken)
          isRefreshing = false

          if (originalRequest.headers && newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }

          return instance(originalRequest)
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          isRefreshing = false

          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')

            // Dispatch global event for auth listeners
            window.dispatchEvent(new CustomEvent('lttms:auth:session_expired'))
          }

          return Promise.reject(
            new ApiError({
              message: 'Session expired. Please sign in again.',
              status: 401,
              code: 'SESSION_EXPIRED',
              data: responseData,
            })
          )
        }
      }

      // Format normalized ApiError
      const message =
        responseData?.message ||
        responseData?.error?.message ||
        (typeof responseData?.error === 'string' ? responseData.error : undefined) ||
        error.message ||
        'An API error occurred'

      const validationErrors = responseData?.errors || responseData?.details

      return Promise.reject(
        new ApiError({
          message,
          status,
          code: responseData?.code,
          errors: Array.isArray(validationErrors) ? validationErrors : undefined,
          data: responseData,
        })
      )
    }
  )
}
