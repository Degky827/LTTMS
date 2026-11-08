import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { setupInterceptors } from './interceptors'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean
}

export const PRODUCTION_API_URL = 'https://lttms.onrender.com/api/v1'

/**
 * Dynamically resolves the appropriate backend API base URL:
 * 1. Honors explicit NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL.
 * 2. If running on a deployed domain (non-localhost) and env var is missing or points to localhost,
 *    automatically falls back to the authoritative production backend (https://lttms.onrender.com/api/v1).
 * 3. In local development (localhost / 127.0.0.1), falls back to http://localhost:5000/api/v1.
 */
export function resolveApiBaseUrl(): string {
  const envUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ''
  ).trim()

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')

    // Deployed site fallback: Never allow localhost:5000 from a remote browser
    if (!isLocalhost) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return PRODUCTION_API_URL
      }
      return envUrl
    }
  }

  if (envUrl) {
    return envUrl
  }

  return 'http://localhost:5000/api/v1'
}

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = resolveApiBaseUrl()

    this.instance = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      timeout: 60000, // 60 seconds (allows for Render cold starts)
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    setupInterceptors(this.instance, this.baseURL)
  }

  public getRawInstance(): AxiosInstance {
    return this.instance
  }

  public getBaseURL(): string {
    // Dynamically synchronize if runtime browser host differs from build-time resolution
    const activeUrl = resolveApiBaseUrl()
    if (activeUrl !== this.baseURL) {
      this.baseURL = activeUrl
      this.instance.defaults.baseURL = activeUrl
    }
    return this.baseURL
  }

  public async get<T = any>(url: string, config?: RequestOptions): Promise<T> {
    this.getBaseURL()
    const response: AxiosResponse<T> = await this.instance.get(url, config)
    return response.data
  }

  public async post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    this.getBaseURL()
    const response: AxiosResponse<T> = await this.instance.post(url, data, config)
    return response.data
  }

  public async put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    this.getBaseURL()
    const response: AxiosResponse<T> = await this.instance.put(url, data, config)
    return response.data
  }

  public async patch<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    this.getBaseURL()
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config)
    return response.data
  }

  public async delete<T = any>(url: string, config?: RequestOptions): Promise<T> {
    this.getBaseURL()
    const response: AxiosResponse<T> = await this.instance.delete(url, config)
    return response.data
  }

  public async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void,
    config?: RequestOptions
  ): Promise<T> {
    this.getBaseURL()
    const response: AxiosResponse<T> = await this.instance.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
export default apiClient
