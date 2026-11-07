import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { notificationService } from '@/features/notifications/services/notificationService'
import { Notification } from '@/features/notifications/types'
import { useToast } from '@/components/feedback/ToastProvider'

export default function TouristNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const { addToast } = useToast()

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationService.getAll({ limit: 30 })
      if (res.data) {
        setNotifications(res.data)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true)
      await notificationService.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      addToast({
        type: 'success',
        title: 'Inbox Updated',
        message: 'All notifications marked as read.',
      })
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>Notifications Inbox | LTTMS</title>
      </Head>
      <TouristLayout title="Notifications">
        <PageHeader
          title="Notification Center"
          subtitle="Real-time alerts regarding your boat reservations, weather notices, and payment receipts."
          breadcrumbs={[
            { label: 'Tourist Dashboard', href: '/tourist' },
            { label: 'Notifications' },
          ]}
          actions={
            unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                disabled={markingAll}
                onClick={handleMarkAllRead}
              >
                {markingAll ? 'Updating...' : `Mark All as Read (${unreadCount})`}
              </Button>
            ) : undefined
          }
        />

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-white rounded-2xl border border-surface-border"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
              🔔
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              Your Inbox is Empty
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              You are all caught up! Booking updates and payment receipts will appear here automatically.
            </p>
            <Link href="/services">
              <Button variant="primary">Explore Tours & Activities</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n._id}
                bordered
                className={`transition-colors ${
                  !n.isRead ? 'bg-primary-50/40 border-primary-200' : 'bg-white'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0"></span>
                      )}
                      <h4 className="text-sm font-bold text-text-primary">{n.title}</h4>
                      <Badge variant={!n.isRead ? 'primary' : 'default'} size="sm" className="capitalize text-[10px]">
                        {n.type || 'Notice'}
                      </Badge>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed pl-4">
                      {n.message}
                    </p>

                    <span className="text-[11px] text-text-muted pl-4 block">
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(n._id)}
                      className="text-xs shrink-0 text-primary-700 hover:bg-primary-100"
                    >
                      Mark Read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TouristLayout>
    </ProtectedRoute>
  )
}
