import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { Service, ServiceListResponse } from '@/features/services/types'

export const vendorServiceManagement = {
  async getMyServices(vendorId: string, params?: { page?: number; limit?: number; status?: string }): Promise<ServiceListResponse> {
    const query = new URLSearchParams()
    query.append('vendor', vendorId)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.status && params.status !== 'all') query.append('status', params.status)

    return apiClient.get<ServiceListResponse>(`${API_ENDPOINTS.SERVICES.LIST}?${query.toString()}`)
  },

  async getServiceById(id: string): Promise<{ success: boolean; data: Service }> {
    return apiClient.get<{ success: boolean; data: Service }>(API_ENDPOINTS.SERVICES.GET_BY_ID(id))
  },

  async createService(data: Partial<Service>): Promise<{ success: boolean; message: string; data: Service }> {
    return apiClient.post<{ success: boolean; message: string; data: Service }>(
      API_ENDPOINTS.SERVICES.CREATE,
      data
    )
  },

  async updateService(id: string, data: Partial<Service>): Promise<{ success: boolean; message: string; data: Service }> {
    return apiClient.patch<{ success: boolean; message: string; data: Service }>(
      API_ENDPOINTS.SERVICES.UPDATE(id),
      data
    )
  },

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.SERVICES.DELETE(id)
    )
  },

  async submitForReview(id: string): Promise<{ success: boolean; message: string; data: Service }> {
    return apiClient.post<{ success: boolean; message: string; data: Service }>(
      API_ENDPOINTS.SERVICES.SUBMIT(id),
      {}
    )
  },

  async publishService(id: string): Promise<{ success: boolean; message: string; data: Service }> {
    return apiClient.patch<{ success: boolean; message: string; data: Service }>(
      API_ENDPOINTS.SERVICES.PUBLISH(id),
      {}
    )
  },

  async archiveService(id: string): Promise<{ success: boolean; message: string; data: Service }> {
    return apiClient.patch<{ success: boolean; message: string; data: Service }>(
      API_ENDPOINTS.SERVICES.ARCHIVE(id),
      {}
    )
  },

  async getPricing(serviceId: string): Promise<{ success: boolean; data: any }> {
    return apiClient.get<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.PRICING(serviceId)
    )
  },

  async updatePricing(serviceId: string, pricing: any): Promise<{ success: boolean; data: any }> {
    return apiClient.put<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.PRICING(serviceId),
      pricing
    )
  },

  async getAvailability(serviceId: string): Promise<{ success: boolean; data: any }> {
    return apiClient.get<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.AVAILABILITY(serviceId)
    )
  },

  async updateAvailability(serviceId: string, availability: any): Promise<{ success: boolean; data: any }> {
    return apiClient.put<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.AVAILABILITY(serviceId),
      availability
    )
  },

  async getCalendar(serviceId: string, startDate?: string, endDate?: string): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams()
    if (startDate) query.append('startDate', startDate)
    if (endDate) query.append('endDate', endDate)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<{ success: boolean; data: any }>(
      `${API_ENDPOINTS.SERVICES.AVAILABILITY_CALENDAR(serviceId)}${qs}`
    )
  },

  async addImage(serviceId: string, image: { url: string; caption?: string; isPrimary?: boolean }): Promise<{ success: boolean; data: any }> {
    return apiClient.post<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.IMAGES(serviceId),
      image
    )
  },

  async deleteImage(serviceId: string, imageId: string): Promise<{ success: boolean; data: any }> {
    return apiClient.delete<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.IMAGE_BY_ID(serviceId, imageId)
    )
  },

  async reorderImages(serviceId: string, imageIds: string[]): Promise<{ success: boolean; data: any }> {
    return apiClient.patch<{ success: boolean; data: any }>(
      API_ENDPOINTS.SERVICES.IMAGE_REORDER(serviceId),
      { imageIds }
    )
  },

  async getReviewsForService(serviceId: string, page = 1, limit = 10): Promise<{
    success: boolean
    data: any[]
    total: number
    ratingStats?: any[]
  }> {
    return apiClient.get<{
      success: boolean
      data: any[]
      total: number
      ratingStats?: any[]
    }>(`${API_ENDPOINTS.REVIEWS.FOR_SERVICE(serviceId)}?page=${page}&limit=${limit}`)
  },

  async respondToReview(reviewId: string, response: string): Promise<{ success: boolean; message: string; data: any }> {
    return apiClient.post<{ success: boolean; message: string; data: any }>(
      API_ENDPOINTS.REVIEWS.RESPOND(reviewId),
      { response }
    )
  },

  async reportReview(reviewId: string, reason: string, description?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.REVIEWS.REPORT(reviewId),
      { reason, description }
    )
  },
}
