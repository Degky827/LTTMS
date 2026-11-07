import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  Vendor,
  VendorListResponse,
  VendorVerificationStatusResponse,
  VendorDocument,
} from '../types'

export const vendorService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<VendorListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.search) query.append('search', params.search)
    query.append('status', 'approved')

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<VendorListResponse>(`${API_ENDPOINTS.VENDORS.LIST}${queryString}`)
  },

  async getByIdOrSlug(idOrSlug: string): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.get<{ success: boolean; data: Vendor }>(
      API_ENDPOINTS.VENDORS.GET_BY_ID(idOrSlug)
    )
  },

  async getMyProfile(): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.get<{ success: boolean; data: Vendor }>(
      API_ENDPOINTS.VENDORS.PROFILE_ME
    )
  },

  async createProfile(data: Partial<Vendor>): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.post<{ success: boolean; data: Vendor }>(
      API_ENDPOINTS.VENDORS.PROFILE,
      data
    )
  },

  async updateMyProfile(data: Partial<Vendor>): Promise<{ success: boolean; data: Vendor }> {
    return apiClient.patch<{ success: boolean; data: Vendor }>(
      API_ENDPOINTS.VENDORS.UPDATE_PROFILE,
      data
    )
  },

  async uploadVerificationDocument(doc: {
    documentType: string
    fileUrl: string
    originalFilename: string
    mimeType: string
    fileSize: number
  }): Promise<{ success: boolean; data: VendorDocument }> {
    return apiClient.post<{ success: boolean; data: VendorDocument }>(
      API_ENDPOINTS.VENDORS.VERIFICATION_DOCUMENTS,
      doc
    )
  },

  async getVerificationStatus(): Promise<VendorVerificationStatusResponse> {
    return apiClient.get<VendorVerificationStatusResponse>(
      API_ENDPOINTS.VENDORS.VERIFICATION_STATUS
    )
  },

  async submitVerification(): Promise<{ success: boolean; message: string; data: Vendor }> {
    return apiClient.post<{ success: boolean; message: string; data: Vendor }>(
      API_ENDPOINTS.VENDORS.VERIFICATION_SUBMIT,
      {}
    )
  },
}
