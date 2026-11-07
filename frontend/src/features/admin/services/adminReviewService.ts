import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminReview, AdminApiResponse } from '../types'

export interface ReviewQueryParams {
  status?: string
  flagged?: string
  page?: number
  limit?: number
}

export const adminReviewService = {
  getReviews: async (params?: ReviewQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminReview[]>>(API_ENDPOINTS.ADMIN.REVIEWS, { params })
  },

  moderateReview: async (
    reviewId: string,
    data: {
      action: 'approve' | 'reject' | 'hide' | 'restore' | 'flag'
      reason?: string
    }
  ) => {
    return apiClient.patch<AdminApiResponse<AdminReview>>(API_ENDPOINTS.ADMIN.REVIEW_MODERATE(reviewId), data)
  },

  getReviewReports: async (reviewId: string) => {
    return apiClient.get<AdminApiResponse<any[]>>(API_ENDPOINTS.ADMIN.REVIEW_REPORTS(reviewId))
  },

  deleteReview: async (reviewId: string) => {
    return apiClient.delete<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.REVIEW_DELETE(reviewId))
  },
}
