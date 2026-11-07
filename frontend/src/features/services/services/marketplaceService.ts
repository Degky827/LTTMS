import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { Service, ServiceListResponse, ServiceQueryParams } from '../types'

export const marketplaceService = {
  async getAll(params?: ServiceQueryParams): Promise<ServiceListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.search) query.append('search', params.search)
    if (params?.category && params.category !== 'all') query.append('category', params.category)
    if (params?.destination && params.destination !== 'all') query.append('destination', params.destination)
    if (params?.minPrice !== undefined && params.minPrice > 0) query.append('minPrice', String(params.minPrice))
    if (params?.maxPrice !== undefined && params.maxPrice > 0) query.append('maxPrice', String(params.maxPrice))
    if (params?.rating !== undefined && params.rating > 0) query.append('rating', String(params.rating))
    if (params?.ecoFriendly) query.append('ecoFriendly', 'true')
    if (params?.sortBy) query.append('sortBy', params.sortBy)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<ServiceListResponse>(`${API_ENDPOINTS.SERVICES.LIST}${queryString}`)
  },

  async getByIdOrSlug(idOrSlug: string): Promise<{ success: boolean; data: Service }> {
    return apiClient.get<{ success: boolean; data: Service }>(
      API_ENDPOINTS.SERVICES.GET_BY_ID(idOrSlug)
    )
  },

  async getAvailability(serviceId: string): Promise<any> {
    return apiClient.get(`${API_ENDPOINTS.SERVICES.AVAILABILITY(serviceId)}`)
  },

  async getCalendar(serviceId: string, startDate?: string, endDate?: string): Promise<any> {
    const query = new URLSearchParams()
    if (startDate) query.append('startDate', startDate)
    if (endDate) query.append('endDate', endDate)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get(`${API_ENDPOINTS.SERVICES.GET_BY_ID(serviceId)}/availability/calendar${queryString}`)
  },

  async checkAvailability(
    serviceId: string,
    params: { date: string; participants?: number; timeSlot?: string }
  ): Promise<any> {
    const query = new URLSearchParams()
    query.append('date', params.date)
    if (params.participants) query.append('participants', String(params.participants))
    if (params.timeSlot) query.append('timeSlot', params.timeSlot)
    return apiClient.get(`${API_ENDPOINTS.SERVICES.GET_BY_ID(serviceId)}/availability/check?${query.toString()}`)
  },
}
