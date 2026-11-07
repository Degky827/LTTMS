import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { AdminSupportTicket, AdminApiResponse } from '../types'

export interface SupportQueryParams {
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}

export const adminSupportService = {
  getTickets: async (params?: SupportQueryParams) => {
    return apiClient.get<AdminApiResponse<AdminSupportTicket[]>>(API_ENDPOINTS.ADMIN.SUPPORT_TICKETS, { params })
  },

  getTicketDetail: async (ticketId: string) => {
    return apiClient.get<AdminApiResponse<AdminSupportTicket>>(API_ENDPOINTS.ADMIN.SUPPORT_TICKET_BY_ID(ticketId))
  },

  assignTicket: async (ticketId: string, assignedTo: string) => {
    return apiClient.patch<AdminApiResponse<AdminSupportTicket>>(API_ENDPOINTS.ADMIN.SUPPORT_ASSIGN(ticketId), {
      assignedTo,
    })
  },

  updateStatus: async (ticketId: string, status: string) => {
    return apiClient.patch<AdminApiResponse<AdminSupportTicket>>(API_ENDPOINTS.ADMIN.SUPPORT_STATUS(ticketId), {
      status,
    })
  },

  updatePriority: async (ticketId: string, priority: string) => {
    return apiClient.patch<AdminApiResponse<AdminSupportTicket>>(API_ENDPOINTS.ADMIN.SUPPORT_PRIORITY(ticketId), {
      priority,
    })
  },

  reply: async (ticketId: string, message: string) => {
    return apiClient.post<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.SUPPORT_REPLY(ticketId), { message })
  },

  addInternalNote: async (ticketId: string, message: string) => {
    return apiClient.post<AdminApiResponse<any>>(API_ENDPOINTS.ADMIN.SUPPORT_INTERNAL_NOTES(ticketId), {
      message,
    })
  },
}
