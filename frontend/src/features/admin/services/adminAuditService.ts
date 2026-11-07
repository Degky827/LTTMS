import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AuditLogEntry, AdminApiResponse } from '../types'

export const adminAuditService = {
  getAuditLogs: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get<AdminApiResponse<AuditLogEntry[]>>(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params })
  },

  sendAnnouncement: async (data: { title: string; message: string; target?: string }) => {
    return apiClient.post<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.ANNOUNCEMENTS, data)
  },
}
