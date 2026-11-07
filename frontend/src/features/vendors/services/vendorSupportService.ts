import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { SupportTicket } from '../types'

export const vendorSupportService = {
  async getTickets(): Promise<{ success: boolean; data: SupportTicket[] }> {
    return apiClient.get<{ success: boolean; data: SupportTicket[] }>(
      API_ENDPOINTS.SUPPORT.TICKETS
    )
  },

  async getTicketById(id: string): Promise<{ success: boolean; data: SupportTicket }> {
    return apiClient.get<{ success: boolean; data: SupportTicket }>(
      API_ENDPOINTS.SUPPORT.TICKET_BY_ID(id)
    )
  },

  async createTicket(data: {
    subject: string
    category: string
    priority?: string
    description: string
  }): Promise<{ success: boolean; message: string; data: SupportTicket }> {
    return apiClient.post<{ success: boolean; message: string; data: SupportTicket }>(
      API_ENDPOINTS.SUPPORT.CREATE_TICKET,
      data
    )
  },

  async addMessage(
    ticketId: string,
    message: string,
    attachments?: string[]
  ): Promise<{ success: boolean; data: SupportTicket }> {
    return apiClient.post<{ success: boolean; data: SupportTicket }>(
      API_ENDPOINTS.SUPPORT.MESSAGES(ticketId),
      { message, attachments }
    )
  },
}
