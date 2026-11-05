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

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:5000/api/v1'

    this.instance = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      timeout: 30000, // 30 seconds
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
    return this.baseURL
  }

  public async get<T = any>(url: string, config?: RequestOptions): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config)
    return response.data
  }

  public async post<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config)
    return response.data
  }

  public async put<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config)
    return response.data
  }

  public async patch<T = any>(url: string, data?: any, config?: RequestOptions): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config)
    return response.data
  }

  public async delete<T = any>(url: string, config?: RequestOptions): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config)
    return response.data
  }

  public async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void,
    config?: RequestOptions
  ): Promise<T> {
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
