export interface Notification {
  _id: string
  recipient: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

export interface NotificationListResponse {
  success: boolean
  count: number
  unreadCount?: number
  data: Notification[]
}
