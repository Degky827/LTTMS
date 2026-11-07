import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { Destination, DestinationListResponse } from '../types'

export interface DestinationQueryParams {
  page?: number
  limit?: number
  type?: string
  isFeatured?: boolean
  search?: string
}

export const destinationService = {
  async getAll(params?: DestinationQueryParams): Promise<DestinationListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.type) query.append('type', params.type)
    if (params?.isFeatured !== undefined) query.append('isFeatured', String(params.isFeatured))
    if (params?.search) query.append('search', params.search)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<DestinationListResponse>(`${API_ENDPOINTS.DESTINATIONS.LIST}${queryString}`)
  },

  async getByIdOrSlug(idOrSlug: string): Promise<{ success: boolean; data: Destination }> {
    return apiClient.get<{ success: boolean; data: Destination }>(
      API_ENDPOINTS.DESTINATIONS.GET_BY_ID(idOrSlug)
    )
  },
}
