import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminRefundRequest, AdminApiResponse } from '../types'

export interface RefundQueryParams {
  status?: string
  vendorId?: string
  page?: number
  limit?: number
}

export const adminRefundService = {
  getRefunds: async (params?: RefundQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminRefundRequest[]>>(API_ENDPOINTS.ADMIN.REFUNDS, { params })
  },

  getRefundDetail: async (refundId: string) => {
    return apiClient.get<AdminApiResponse<{ refund: AdminRefundRequest; payment: any }>>(
      API_ENDPOINTS.ADMIN.REFUND_BY_ID(refundId)
    )
  },

  approveRefund: async (refundId: string, adminNote?: string) => {
    return apiClient.patch<AdminApiResponse<AdminRefundRequest>>(API_ENDPOINTS.ADMIN.REFUND_APPROVE(refundId), {
      adminNote,
    })
  },

  rejectRefund: async (refundId: string, reason: string) => {
    return apiClient.patch<AdminApiResponse<AdminRefundRequest>>(API_ENDPOINTS.ADMIN.REFUND_REJECT(refundId), {
      reason,
    })
  },

  retryRefund: async (refundId: string) => {
    return apiClient.post<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.REFUND_RETRY(refundId))
  },

  processRefund: async (refundId: string) => {
    return apiClient.post<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.REFUND_PROCESS(refundId))
  },
}
