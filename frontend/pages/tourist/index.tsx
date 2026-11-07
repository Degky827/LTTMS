import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { bookingService } from '@/features/bookings/services/bookingService'
import { Booking } from '@/features/bookings/types'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { CancelBookingModal } from '@/features/bookings/components/CancelBookingModal'
import { RefundRequestModal } from '@/features/bookings/components/RefundRequestModal'

export default function TouristOverviewDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null)
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<Booking | null>(null)

  const loadMyBookings = async () => {
    try {
      setLoading(true)
      const res = await bookingService.getMyBookings({ limit: 10 })
      if (res.data) {
        setBookings(res.data)
      }
    } catch (err) {
      console.error('Failed to load tourist bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyBookings()
  }, [])

  // Derived stats
  const activeCount = bookings.filter((b) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>Tourist Dashboard | LTTMS</title>
      </Head>
      <TouristLayout title="Tourist Portal">
        <PageHeader
          title={`Welcome back, ${user?.name || 'Explorer'}!`}
          subtitle="Manage your Lake Tana tour reservations, eco-adventures, receipts, and travel itinerary."
          breadcrumbs={[
            { label: 'Marketplace', href: '/' },
            { label: 'Tourist Dashboard' },
          ]}
          actions={
            <Link href="/services">
              <Button variant="primary" size="sm">
                Explore More Tours
              </Button>
            </Link>
          }
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card bordered className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Active & Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-primary-600 font-heading">
                  {activeCount}
                </span>
                <Badge variant="success" size="sm">Confirmed</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Boat excursions & guides ready for your trip.
              </p>
            </CardContent>
          </Card>

          <Card bordered className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Pending Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-600 font-heading">
                  {pendingCount}
                </span>
                <Badge variant="warning" size="sm">Awaiting</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Reservations waiting for Chapa checkout.
              </p>
            </CardContent>
          </Card>

          <Card bordered className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Completed Expeditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-text-primary font-heading">
                  {completedCount}
                </span>
                <Badge variant="primary" size="sm">Travel Memories</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Past island monasteries & waterfall adventures.
              </p>
            </CardContent>
          </Card>

          <Card bordered className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Eco-Impact Contribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-emerald-600 font-heading">
                  100%
                </span>
                <Badge variant="secondary" size="sm">Biosphere Fund</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Directly supporting Lake Tana ecosystem conservation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary font-heading">
                My Recent Reservations
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Check schedule, download official receipts, or manage your bookings.
              </p>
            </div>
            {bookings.length > 0 && (
              <Link href="/tourist/bookings">
                <Button variant="outline" size="sm">
                  View All ({bookings.length}) →
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 bg-white rounded-2xl border border-surface-border p-6"></div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
              <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
                ⛵
              </div>
              <h3 className="text-lg font-bold text-text-primary font-heading">
                No Reservations Yet
              </h3>
              <p className="text-text-secondary max-w-md mx-auto text-sm">
                You haven&apos;t booked any Lake Tana boat excursions or monastery guides yet. Explore verified tours and start your journey!
              </p>
              <Link href="/services">
                <Button variant="primary">Browse Tours & Experiences</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onCancelClick={(booking) => setSelectedBookingForCancel(booking)}
                  onRefundClick={(booking) => setSelectedBookingForRefund(booking)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-6 space-y-2">
              <span className="text-2xl block mb-1">💳</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                Payment History & Receipts
              </h3>
              <p className="text-xs text-text-secondary">
                View your Chapa transaction records, verified timestamps, and printable VAT receipts.
              </p>
              <Link href="/tourist/payments" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                Open Transactions &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-6 space-y-2">
              <span className="text-2xl block mb-1">⭐</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                My Reviews & Feedback
              </h3>
              <p className="text-xs text-text-secondary">
                Share your travel tips and rate boat captains to help fellow travelers explore safely.
              </p>
              <Link href="/tourist/reviews" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                Manage Reviews &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-6 space-y-2">
              <span className="text-2xl block mb-1">⚙️</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                Profile & Notifications
              </h3>
              <p className="text-xs text-text-secondary">
                Update your emergency contact info, phone number, password, and notification preferences.
              </p>
              <Link href="/tourist/profile" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                Edit Profile &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Cancellation Modal */}
        <CancelBookingModal
          booking={selectedBookingForCancel}
          isOpen={!!selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          onSuccess={loadMyBookings}
        />

        {/* Refund Request Modal */}
        <RefundRequestModal
          booking={selectedBookingForRefund}
          isOpen={!!selectedBookingForRefund}
          onClose={() => setSelectedBookingForRefund(null)}
          onSuccess={loadMyBookings}
        />
      </TouristLayout>
    </ProtectedRoute>
  )
}
