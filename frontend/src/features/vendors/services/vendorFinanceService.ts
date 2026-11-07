import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  VendorFinanceOverview,
  VendorLedgerEntry,
  VendorCommission,
  VendorSettlement,
  RequestSettlementPayload,
} from '../types'

export const vendorFinanceService = {
  async getOverview(): Promise<{ success: boolean; data: VendorFinanceOverview }> {
    return apiClient.get<{ success: boolean; data: VendorFinanceOverview }>(
      API_ENDPOINTS.FINANCE.VENDOR_OVERVIEW
    )
  },

  async getTransactions(params?: {
    page?: number
    limit?: number
    entryType?: string
  }): Promise<{
    success: boolean
    data: VendorLedgerEntry[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.entryType && params.entryType !== 'all') query.append('entryType', params.entryType)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<{
      success: boolean
      data: VendorLedgerEntry[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }>(`${API_ENDPOINTS.FINANCE.VENDOR_TRANSACTIONS}${queryString}`)
  },

  async getCommissions(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{
    success: boolean
    data: VendorCommission[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.status && params.status !== 'all') query.append('status', params.status)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<{
      success: boolean
      data: VendorCommission[]
      meta: { page: number; limit: number; total: number; totalPages: number }
    }>(`${API_ENDPOINTS.FINANCE.VENDOR_COMMISSIONS}${queryString}`)
  },

  async getSettlements(params?: { status?: string }): Promise<{
    success: boolean
    data: VendorSettlement[]
  }> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') query.append('status', params.status)

    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<{
      success: boolean
      data: VendorSettlement[]
    }>(`${API_ENDPOINTS.FINANCE.VENDOR_SETTLEMENTS}${queryString}`)
  },

  async requestSettlement(payload: RequestSettlementPayload): Promise<{
    success: boolean
    message: string
    data: VendorSettlement
  }> {
    return apiClient.post<{
      success: boolean
      message: string
      data: VendorSettlement
    }>(API_ENDPOINTS.FINANCE.VENDOR_SETTLEMENTS, payload)
  },
}
