import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  VendorBooking,
  VendorBookingsResponse,
  VendorBookingStats,
} from '../types'

export const vendorBookingService = {
  async getStatistics(): Promise<{ success: boolean; data: VendorBookingStats }> {
    return apiClient.get<{ success: boolean; data: VendorBookingStats }>(
      API_ENDPOINTS.VENDOR_BOOKINGS.STATISTICS
    )
  },

  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
    service?: string
  }): Promise<VendorBookingsResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.status && params.status !== 'all') query.append('status', params.status)
    if (params?.service) query.append('service', params.service)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<VendorBookingsResponse>(
      `${API_ENDPOINTS.VENDOR_BOOKINGS.LIST}${queryString}`
    )
  },

  async getById(id: string): Promise<{ success: boolean; data: VendorBooking }> {
    return apiClient.get<{ success: boolean; data: VendorBooking }>(
      API_ENDPOINTS.VENDOR_BOOKINGS.GET_BY_ID(id)
    )
  },

  async confirm(id: string, reason?: string): Promise<{ success: boolean; message: string; data: VendorBooking }> {
    return apiClient.patch<{ success: boolean; message: string; data: VendorBooking }>(
      API_ENDPOINTS.VENDOR_BOOKINGS.CONFIRM(id),
      { reason: reason || 'Reservation confirmed by vendor' }
    )
  },

  async reject(id: string, reason: string): Promise<{ success: boolean; message: string; data: VendorBooking }> {
    return apiClient.patch<{ success: boolean; message: string; data: VendorBooking }>(
      API_ENDPOINTS.VENDOR_BOOKINGS.REJECT(id),
      { reason }
    )
  },

  async getRefundRequests(): Promise<{ success: boolean; count: number; data: any[] }> {
    return apiClient.get<{ success: boolean; count: number; data: any[] }>(
      API_ENDPOINTS.REFUNDS.VENDOR_LIST
    )
  },
}
