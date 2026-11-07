import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminService, AdminApiResponse } from '../types'

export interface ServiceQueryParams {
  status?: string
  category?: string
  destination?: string
  search?: string
  page?: number
  limit?: number
}

export const adminServiceModeration = {
  getServices: async (params?: ServiceQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminService[]>>(API_ENDPOINTS.SERVICES.LIST, { params })
  },

  approveService: async (id: string) => {
    return apiClient.patch<AdminApiResponse<AdminService>>(API_ENDPOINTS.SERVICES.APPROVE(id))
  },

  rejectService: async (id: string, reason: string) => {
    return apiClient.patch<AdminApiResponse<AdminService>>(API_ENDPOINTS.SERVICES.REJECT(id), { reason })
  },

  featureService: async (id: string) => {
    return apiClient.patch<AdminApiResponse<AdminService>>(API_ENDPOINTS.SERVICES.FEATURE(id))
  },

  publishService: async (id: string) => {
    return apiClient.patch<AdminApiResponse<AdminService>>(API_ENDPOINTS.SERVICES.PUBLISH(id))
  },

  archiveService: async (id: string) => {
    return apiClient.patch<AdminApiResponse<AdminService>>(API_ENDPOINTS.SERVICES.ARCHIVE(id))
  },

  deleteService: async (id: string) => {
    return apiClient.delete<AdminApiResponse<any>>(API_ENDPOINTS.SERVICES.GET_BY_ID(id))
  },
}
