import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import {
  AdminPayment,
  AdminCommissionRule,
  AdminCommissionTransaction,
  AdminSettlement,
  AdminApiResponse,
} from '../types'

export interface PaymentQueryParams {
  status?: string
  page?: number
  limit?: number
}

export interface SettlementQueryParams {
  status?: string
  page?: number
  limit?: number
}

export const adminFinanceService = {
  getOverview: async () => {
    return apiClient.get<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.FINANCE_OVERVIEW)
  },

  getPayments: async (params?: PaymentQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminPayment[]>>(API_ENDPOINTS.ADMIN.PAYMENTS, { params })
  },

  getCommissions: async () => {
    return apiClient.get<AdminApiResponse<AdminCommissionTransaction[]>>(API_ENDPOINTS.ADMIN.COMMISSIONS)
  },

  getCommissionRules: async () => {
    return apiClient.get<AdminApiResponse<AdminCommissionRule[]>>(API_ENDPOINTS.ADMIN.COMMISSION_RULES)
  },

  createCommissionRule: async (data: Partial<AdminCommissionRule>) => {
    return apiClient.post<AdminApiResponse<AdminCommissionRule>>(API_ENDPOINTS.ADMIN.COMMISSION_RULES, data)
  },

  updateCommissionRule: async (ruleId: string, data: Partial<AdminCommissionRule>) => {
    return apiClient.put<AdminApiResponse<AdminCommissionRule>>(
      API_ENDPOINTS.ADMIN.COMMISSION_RULE_BY_ID(ruleId),
      data
    )
  },

  getSettlements: async (params?: SettlementQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminSettlement[]>>(API_ENDPOINTS.ADMIN.SETTLEMENTS, { params })
  },

  reviewSettlement: async (
    settlementId: string,
    data: { action: 'approve' | 'reject'; rejectionReason?: string }
  ) => {
    return apiClient.patch<AdminApiResponse<AdminSettlement>>(
      API_ENDPOINTS.ADMIN.SETTLEMENT_REVIEW(settlementId),
      data
    )
  },

  completeSettlement: async (settlementId: string, bankReference: string) => {
    return apiClient.patch<AdminApiResponse<AdminSettlement>>(
      API_ENDPOINTS.ADMIN.SETTLEMENT_COMPLETE(settlementId),
      { bankReference }
    )
  },
}
