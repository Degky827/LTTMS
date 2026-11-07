import React, { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { bookingService } from '@/features/bookings/services/bookingService'
import { Booking } from '@/features/bookings/types'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { CancelBookingModal } from '@/features/bookings/components/CancelBookingModal'
import { RefundRequestModal } from '@/features/bookings/components/RefundRequestModal'

const STATUS_TABS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending Payment' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

export default function TouristBookingsListPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [refundTarget, setRefundTarget] = useState<Booking | null>(null)

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await bookingService.getMyBookings({
        status: activeTab !== 'all' ? activeTab : undefined,
        page,
        limit: 10,
      })
      if (res.data) {
        setBookings(res.data)
        setTotalPages(res.pages || res.totalPages || 1)
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, page])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>My Tour Reservations | LTTMS</title>
      </Head>
      <TouristLayout title="My Bookings">
        <PageHeader
          title="My Tour Reservations"
          subtitle="View and manage your upcoming boat tours, island monastery visits, and historical guides."
          breadcrumbs={[
            { label: 'Tourist Dashboard', href: '/tourist' },
            { label: 'My Bookings' },
          ]}
          actions={
            <Link href="/services">
              <Button variant="primary" size="sm">
                Book Another Tour
              </Button>
            </Link>
          }
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3 mb-6 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-white rounded-2xl border border-surface-border p-6"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
              📋
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              No Bookings Found
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              {activeTab === 'all'
                ? "You haven't made any reservations yet. Browse our marketplace to plan your trip!"
                : `No reservations found under "${activeTab}" status.`}
            </p>
            <Link href="/services">
              <Button variant="primary">Browse Tours</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                onCancelClick={(booking) => setCancelTarget(booking)}
                onRefundClick={(booking) => setRefundTarget(booking)}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  &larr; Previous
                </Button>
                <span className="text-xs text-text-secondary px-3 font-semibold">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next &rarr;
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Modal */}
        <CancelBookingModal
          booking={cancelTarget}
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={loadBookings}
        />

        {/* Refund Request Modal */}
        <RefundRequestModal
          booking={refundTarget}
          isOpen={!!refundTarget}
          onClose={() => setRefundTarget(null)}
          onSuccess={loadBookings}
        />
      </TouristLayout>
    </ProtectedRoute>
  )
}
