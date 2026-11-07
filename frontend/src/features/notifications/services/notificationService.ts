import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { Notification, NotificationListResponse } from '../types'

export const notificationService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<NotificationListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<NotificationListResponse>(`${API_ENDPOINTS.NOTIFICATIONS.LIST}${queryString}`)
  },

  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    return apiClient.get<{ success: boolean; count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    )
  },

  async markRead(id: string): Promise<{ success: boolean; data: Notification }> {
    return apiClient.patch<{ success: boolean; data: Notification }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    )
  },

  async markAllRead(): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    )
  },
}
