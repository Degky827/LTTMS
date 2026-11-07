import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  Booking,
  BookingListResponse,
  CreateBookingPayload,
  RefundRequest,
} from '../types'

export const bookingService = {
  async create(payload: CreateBookingPayload): Promise<{ success: boolean; message: string; data: Booking }> {
    return apiClient.post<{ success: boolean; message: string; data: Booking }>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      payload
    )
  },

  async getMyBookings(params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<BookingListResponse> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') query.append('status', params.status)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<BookingListResponse>(`/bookings/my${queryString}`)
  },

  async getById(id: string): Promise<{ success: boolean; data: Booking }> {
    return apiClient.get<{ success: boolean; data: Booking }>(
      API_ENDPOINTS.BOOKINGS.GET_BY_ID(id)
    )
  },

  async getByReference(reference: string): Promise<{ success: boolean; data: Booking }> {
    return apiClient.get<{ success: boolean; data: Booking }>(
      `/bookings/reference/${encodeURIComponent(reference)}`
    )
  },

  async cancel(
    id: string,
    reason: string
  ): Promise<{ success: boolean; message: string; data: Booking }> {
    return apiClient.post<{ success: boolean; message: string; data: Booking }>(
      API_ENDPOINTS.BOOKINGS.CANCEL(id),
      { reason }
    )
  },

  async submitRefundRequest(
    bookingId: string,
    data: { reason: string; preferredMethod?: string }
  ): Promise<{ success: boolean; message: string; data: RefundRequest }> {
    return apiClient.post<{ success: boolean; message: string; data: RefundRequest }>(
      `/bookings/${bookingId}/refund-requests`,
      data
    )
  },

  async getMyRefundRequests(): Promise<{ success: boolean; count: number; data: RefundRequest[] }> {
    return apiClient.get<{ success: boolean; count: number; data: RefundRequest[] }>(
      `/refund-requests/my`
    )
  },
}
