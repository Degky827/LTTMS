import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminOverviewStats, AuditLogEntry, AdminApiResponse } from '../types'

export const adminDashboardService = {
  getOverview: async () => {
    return apiClient.get<AdminApiResponse<AdminOverviewStats>>(API_ENDPOINTS.ADMIN.OVERVIEW)
  },

  getStats: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.STATS)
  },

  getBookingsAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.BOOKINGS_ANALYSIS)
  },

  getRevenueAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.REVENUE_ANALYSIS)
  },

  getVendorsAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.VENDORS_ANALYSIS)
  },

  getTouristsAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.TOURISTS_ANALYSIS)
  },

  getServicesAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.SERVICES_ANALYSIS)
  },

  getReviewsAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.REVIEWS_ANALYSIS)
  },

  getRefundsAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.REFUNDS_ANALYSIS)
  },

  getSupportAnalysis: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.SUPPORT_ANALYSIS)
  },

  getRecentActivity: async () => {
    return apiClient.get<AdminApiResponse<AuditLogEntry[]>>(API_ENDPOINTS.ADMIN.RECENT_ACTIVITY)
  },
}
