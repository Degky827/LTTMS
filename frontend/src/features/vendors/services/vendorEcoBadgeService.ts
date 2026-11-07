import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { EcoBadge, EcoBadgeApplication } from '../types'

export const vendorEcoBadgeService = {
  async getAllBadges(): Promise<{ success: boolean; data: EcoBadge[] }> {
    return apiClient.get<{ success: boolean; data: EcoBadge[] }>(
      API_ENDPOINTS.ECO_BADGES.LIST
    )
  },

  async getMyApplications(): Promise<{ success: boolean; data: EcoBadgeApplication[] }> {
    return apiClient.get<{ success: boolean; data: EcoBadgeApplication[] }>(
      API_ENDPOINTS.ECO_BADGES.APPLICATIONS_ME
    )
  },

  async apply(data: {
    badgeId: string
    sustainabilityPractices: string[]
    evidenceDocuments?: string[]
  }): Promise<{ success: boolean; message: string; data: EcoBadgeApplication }> {
    return apiClient.post<{ success: boolean; message: string; data: EcoBadgeApplication }>(
      API_ENDPOINTS.ECO_BADGES.APPLY,
      data
    )
  },
}
