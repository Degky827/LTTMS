import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { CreateReviewPayload, Review, ReviewListResponse } from '../types'

export const reviewService = {
  async getByServiceId(serviceId: string): Promise<ReviewListResponse> {
    return apiClient.get<ReviewListResponse>(API_ENDPOINTS.REVIEWS.FOR_SERVICE(serviceId))
  },

  async getByService(serviceId: string): Promise<ReviewListResponse> {
    return apiClient.get<ReviewListResponse>(API_ENDPOINTS.REVIEWS.FOR_SERVICE(serviceId))
  },

  async submit(
    payload: CreateReviewPayload
  ): Promise<{ success: boolean; message: string; data: Review }> {
    return apiClient.post<{ success: boolean; message: string; data: Review }>(
      API_ENDPOINTS.REVIEWS.CREATE,
      payload
    )
  },

  async getMyReviews(): Promise<ReviewListResponse> {
    return apiClient.get<ReviewListResponse>(`/reviews/my-reviews`)
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.REVIEWS.DELETE(id)
    )
  },
}
