import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  InitializePaymentResponse,
  Payment,
  PaymentReceipt,
  VerifyPaymentResponse,
} from '../types'

export const paymentService = {
  async initialize(
    bookingId: string,
    returnUrl?: string,
    callbackUrl?: string
  ): Promise<InitializePaymentResponse> {
    return apiClient.post<InitializePaymentResponse>(API_ENDPOINTS.PAYMENTS.INITIALIZE, {
      bookingId,
      returnUrl,
      callbackUrl,
    })
  },

  async verify(txRef: string): Promise<VerifyPaymentResponse> {
    return apiClient.get<VerifyPaymentResponse>(API_ENDPOINTS.PAYMENTS.VERIFY(txRef))
  },

  async getReceipt(identifier: string): Promise<{ success: boolean; data: PaymentReceipt }> {
    return apiClient.get<{ success: boolean; data: PaymentReceipt }>(
      `/payments/receipt/${encodeURIComponent(identifier)}`
    )
  },

  async getHistory(): Promise<{ success: boolean; count: number; data: Payment[] }> {
    return apiClient.get<{ success: boolean; count: number; data: Payment[] }>(
      API_ENDPOINTS.PAYMENTS.HISTORY
    )
  },

  async getByBookingId(bookingId: string): Promise<{ success: boolean; data: Payment }> {
    return apiClient.get<{ success: boolean; data: Payment }>(
      `/payments/booking/${bookingId}`
    )
  },
}
