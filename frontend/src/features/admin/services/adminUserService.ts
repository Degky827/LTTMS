import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminUser, AdminUserStatusPayload, AdminAssignRolePayload, AdminApiResponse } from '../types'

export interface UserQueryParams {
  role?: string
  status?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export const adminUserService = {
  getUsers: async (params?: UserQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminUser[]>>(API_ENDPOINTS.ADMIN.USERS, { params })
  },

  getUserDetail: async (id: string) => {
    return apiClient.get<AdminApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.USER_BY_ID(id))
  },

  updateUserStatus: async (id: string, data: AdminUserStatusPayload) => {
    return apiClient.put<AdminApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(id), data)
  },

  assignRole: async (id: string, data: AdminAssignRolePayload) => {
    return apiClient.put<AdminApiResponse<AdminUser>>(API_ENDPOINTS.ADMIN.UPDATE_USER_ROLE(id), data)
  },
}
