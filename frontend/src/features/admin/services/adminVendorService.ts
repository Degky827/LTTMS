import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminVendor, AdminVendorStatusPayload, AdminApiResponse } from '../types'

export interface VendorQueryParams {
  status?: string
  page?: number
  limit?: number
}

export const adminVendorService = {
  getVendors: async (params?: VendorQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminVendor[]>>(API_ENDPOINTS.ADMIN.VENDORS, { params })
  },

  getVendorDetail: async (id: string) => {
    return apiClient.get<AdminApiResponse<{
      vendor: AdminVendor
      services: any[]
      bookings: any[]
      totalRevenue: number
      avgRating: number
      totalBookings: number
    }>>(API_ENDPOINTS.ADMIN.VENDOR_BY_ID(id))
  },

  updateVendorStatus: async (id: string, data: AdminVendorStatusPayload) => {
    return apiClient.put<AdminApiResponse<AdminVendor>>(API_ENDPOINTS.ADMIN.UPDATE_VENDOR_STATUS(id), data)
  },

  verifyEcoBadge: async (id: string, ecoCertification: boolean) => {
    return apiClient.put<AdminApiResponse<AdminVendor>>(API_ENDPOINTS.ADMIN.UPDATE_VENDOR_ECO_BADGE(id), {
      ecoCertification,
    })
  },
}
