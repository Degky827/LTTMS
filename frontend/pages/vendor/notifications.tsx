import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { useToast } from '@/contexts/ToastContext'

interface NotificationItem {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  data?: any
}

export default function VendorNotificationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadOnly, setUnreadOnly] = useState(false)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<{ success: boolean; data: NotificationItem[] }>(
        API_ENDPOINTS.NOTIFICATIONS.LIST
      )
      if (res?.success) {
        setNotifications(res.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      // ignore
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read.')
    } catch (err) {
      toast.error('Failed to mark all as read.')
    }
  }

  const filtered = unreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Alerts & Notifications">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Notification Center
              </h2>
              <p className="text-sm text-text-secondary">
                Real-time booking requests, payout updates, and administrative alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={unreadOnly ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setUnreadOnly(!unreadOnly)}
              >
                {unreadOnly ? 'Show All' : 'Unread Only'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={notifications.every((n) => n.isRead)}
              >
                Mark All as Read
              </Button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden divide-y divide-border">
            {loading ? (
              <div className="py-20 text-center text-text-secondary">
                <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading alerts...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm font-semibold text-text-primary">No notifications found.</p>
                <p className="text-xs text-text-muted mt-1">You're all caught up!</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  onClick={() => !item.isRead && markAsRead(item._id)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                    item.isRead ? 'bg-surface hover:bg-surface-muted/40' : 'bg-primary-50/40 hover:bg-primary-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      item.isRead ? 'bg-transparent' : 'bg-secondary-600'
                    }`} />
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{item.title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{item.message}</p>
                      <span className="text-[11px] text-text-muted mt-2 block">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!item.isRead && (
                    <span className="text-[10px] font-bold text-secondary-600 shrink-0">
                      NEW
                    </span>
                  )}
                </div>
              ))
            )}
          </Card>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
