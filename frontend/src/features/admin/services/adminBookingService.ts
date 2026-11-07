import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminBooking, AdminApiResponse } from '../types'

export interface BookingQueryParams {
  status?: string
  vendor?: string
  service?: string
  user?: string
  reference?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export const adminBookingService = {
  getBookings: async (params?: BookingQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminBooking[]>>(API_ENDPOINTS.ADMIN.BOOKINGS, { params })
  },

  getBookingById: async (id: string) => {
    return apiClient.get<AdminApiResponse<AdminBooking>>(API_ENDPOINTS.ADMIN.BOOKING_BY_ID(id))
  },

  cancelBooking: async (id: string, reason?: string) => {
    return apiClient.patch<AdminApiResponse<AdminBooking>>(API_ENDPOINTS.ADMIN.BOOKING_CANCEL(id), { reason })
  },

  updateBookingStatus: async (id: string, status: string, reason?: string) => {
    return apiClient.patch<AdminApiResponse<AdminBooking>>(API_ENDPOINTS.ADMIN.BOOKING_STATUS(id), {
      status,
      reason,
    })
  },

  overrideBooking: async (id: string, status: string, paymentStatus?: string) => {
    return apiClient.put<AdminApiResponse<AdminBooking>>(API_ENDPOINTS.ADMIN.BOOKING_OVERRIDE(id), {
      status,
      paymentStatus,
    })
  },

  getBookingStatistics: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.BOOKING_STATISTICS)
  },
}
