import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminEcoBadgeApplication, AdminApiResponse } from '../types'

export const adminEcoBadgeService = {
  getBadges: async () => {
    return apiClient.get<AdminApiResponse<any[]>>(API_ENDPOINTS.ECO_BADGES.LIST)
  },

  createBadge: async (data: any) => {
    return apiClient.post<AdminApiResponse<any>>(API_ENDPOINTS.ECO_BADGES.LIST, data)
  },

  getApplications: async () => {
    return apiClient.get<AdminApiResponse<AdminEcoBadgeApplication[]>>(API_ENDPOINTS.ADMIN.ECO_BADGE_APPLICATIONS)
  },

  approveApplication: async (id: string) => {
    return apiClient.patch<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.ECO_BADGE_APPROVE(id))
  },

  rejectApplication: async (id: string, rejectionReason: string) => {
    return apiClient.patch<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.ECO_BADGE_REJECT(id), {
      rejectionReason,
    })
  },

  getComplianceSummary: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.ECO_COMPLIANCE)
  },
}
