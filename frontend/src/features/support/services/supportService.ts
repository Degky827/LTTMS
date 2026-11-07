import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { SupportTicket, CreateTicketDTO, SupportTicketListResponse } from '../types'

export const supportService = {
  async getMyTickets(params?: { status?: string; page?: number; limit?: number }): Promise<SupportTicketListResponse> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') query.append('status', params.status)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const queryString = query.toString() ? `?${query.toString()}` : ''

    return apiClient.get<SupportTicketListResponse>(`${API_ENDPOINTS.SUPPORT.TICKETS}${queryString}`)
  },

  async getTicketById(id: string): Promise<{ success: boolean; data: SupportTicket }> {
    return apiClient.get<{ success: boolean; data: SupportTicket }>(
      API_ENDPOINTS.SUPPORT.TICKET_BY_ID(id)
    )
  },

  async createTicket(dto: CreateTicketDTO): Promise<{ success: boolean; message: string; data: SupportTicket }> {
    return apiClient.post<{ success: boolean; message: string; data: SupportTicket }>(
      API_ENDPOINTS.SUPPORT.CREATE_TICKET,
      dto
    )
  },

  async addMessage(
    ticketId: string,
    message: string,
    attachments?: Array<{ url: string; filename: string }>
  ): Promise<{ success: boolean; data: SupportTicket }> {
    return apiClient.post<{ success: boolean; data: SupportTicket }>(
      API_ENDPOINTS.SUPPORT.MESSAGES(ticketId),
      { message, attachments }
    )
  },
}
