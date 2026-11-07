import React, { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { bookingService } from '@/features/bookings/services/bookingService'
import { Booking } from '@/features/bookings/types'
import { CancelBookingModal } from '@/features/bookings/components/CancelBookingModal'
import { RefundRequestModal } from '@/features/bookings/components/RefundRequestModal'
import { ReviewFormModal } from '@/features/reviews/components/ReviewFormModal'

export default function TouristBookingDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  const loadBooking = useCallback(async () => {
    if (!id || Array.isArray(id)) return
    try {
      setLoading(true)
      setError(null)
      const res = await bookingService.getById(id)
      if (res.data) {
        setBooking(res.data)
      } else {
        setError('Booking not found.')
      }
    } catch (err: any) {
      console.error('Failed to load booking:', err)
      setError(err?.response?.data?.message || 'Failed to load booking details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  const service = typeof booking?.service === 'object' ? booking?.service : null
  const vendor = typeof booking?.vendor === 'object' ? booking?.vendor : null
  const currency = booking?.currency || 'ETB'

  const canCancel = booking?.status === 'pending' || booking?.status === 'confirmed'
  const canRefund =
    booking?.paymentStatus === 'paid' &&
    (booking?.status === 'cancelled' || booking?.status === 'rejected')
  const canReview = booking?.status === 'completed'

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>{booking ? `Reservation #${booking.bookingReference} | LTTMS` : 'Booking Details | LTTMS'}</title>
      </Head>
      <TouristLayout title="Booking Details">
        <PageHeader
          title={booking ? `Reservation #${booking.bookingReference}` : 'Booking Details'}
          subtitle="View complete itinerary, payment status, operator contact, and reservation actions."
          breadcrumbs={[
            { label: 'Tourist Dashboard', href: '/tourist' },
            { label: 'My Bookings', href: '/tourist/bookings' },
            { label: booking ? `#${booking.bookingReference}` : 'Details' },
          ]}
          actions={
            <Link href="/tourist/bookings">
              <Button variant="outline" size="sm">
                &larr; Back to Bookings
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-surface-border animate-pulse space-y-4">
            <div className="h-6 bg-surface-border rounded w-1/3"></div>
            <div className="h-32 bg-surface-border rounded"></div>
            <div className="h-48 bg-surface-border rounded"></div>
          </div>
        ) : error || !booking ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              !
            </div>
            <h2 className="text-xl font-bold text-text-primary">{error || 'Booking Not Found'}</h2>
            <Link href="/tourist/bookings">
              <Button variant="primary">Return to Bookings List</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Itinerary & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Header Card */}
              <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
                  <div>
                    <span className="text-xs text-text-muted block">Booking Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          booking.status === 'confirmed'
                            ? 'success'
                            : booking.status === 'completed'
                            ? 'primary'
                            : booking.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                        size="md"
                        className="capitalize font-bold"
                      >
                        {booking.status}
                      </Badge>
                      <Badge
                        variant={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                        size="md"
                        className="capitalize"
                      >
                        Payment: {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-text-muted block">Booked On</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {new Date(booking.createdAt || booking.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Tour / Experience
                  </span>
                  <h3 className="text-xl font-bold text-text-primary font-heading">
                    {booking.serviceTitleSnapshot || service?.title || 'Lake Tana Tour Experience'}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-surface-muted rounded-xl">
                      <span className="text-xs text-text-muted block">Departure Date</span>
                      <span className="text-sm font-bold text-text-primary">
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="p-3 bg-surface-muted rounded-xl">
                      <span className="text-xs text-text-muted block">Time Slot</span>
                      <span className="text-sm font-bold text-text-primary capitalize">
                        {booking.timeSlot ? booking.timeSlot.replace('_', ' ') : 'Morning (08:30)'}
                      </span>
                    </div>

                    <div className="p-3 bg-surface-muted rounded-xl">
                      <span className="text-xs text-text-muted block">Travelers</span>
                      <span className="text-sm font-bold text-text-primary">
                        {booking.guests} Participant{booking.guests === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 mt-2">
                      <strong>Special requests:</strong> {booking.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Operator Information Card */}
              {vendor && (
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    Assigned Local Operator
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">
                        {vendor.businessName}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Licensed boat cooperative / cultural guide partner
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {vendor.contactPhone && (
                        <a
                          href={`tel:${vendor.contactPhone}`}
                          className="px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold hover:bg-surface-muted"
                        >
                          📞 {vendor.contactPhone}
                        </a>
                      )}
                      {vendor.contactEmail && (
                        <a
                          href={`mailto:${vendor.contactEmail}`}
                          className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100"
                        >
                          ✉️ Contact Operator
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Price Breakdown & Actions */}
            <div className="space-y-6">
              <Card bordered className="bg-white shadow-xs">
                <CardContent className="p-6 space-y-5">
                  <h3 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    Payment Breakdown
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-text-secondary">
                      <span>Total Participants:</span>
                      <span className="font-semibold text-text-primary">{booking.guests}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Tour Fee:</span>
                      <span className="font-semibold text-text-primary">
                        {Number(booking.totalAmount).toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Conservation Fee:</span>
                      <span className="font-semibold text-emerald-600">Included</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-baseline justify-between">
                    <span className="text-sm font-bold text-text-primary">Total Paid / Due</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-primary-800 font-heading">
                        {Number(booking.totalAmount).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-text-secondary ml-1">{currency}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-3">
                    {booking.paymentStatus === 'pending' && (
                      <Link href={`/checkout/${booking._id}`} className="block">
                        <Button variant="accent" size="lg" className="w-full justify-center font-bold">
                          Pay Now via Chapa →
                        </Button>
                      </Link>
                    )}

                    {booking.paymentStatus === 'paid' && (
                      <Link
                        href={`/booking/payment-status?tx_ref=${booking.bookingReference}`}
                        className="block"
                      >
                        <Button variant="outline" size="md" className="w-full justify-center">
                          📄 View Official Receipt
                        </Button>
                      </Link>
                    )}

                    {canReview && (
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full justify-center"
                        onClick={() => setReviewModalOpen(true)}
                      >
                        ⭐ Rate & Review Experience
                      </Button>
                    )}

                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-red-600 hover:bg-red-50"
                        onClick={() => setCancelModalOpen(true)}
                      >
                        Cancel Reservation
                      </Button>
                    )}

                    {canRefund && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-amber-700 border-amber-300 hover:bg-amber-50"
                        onClick={() => setRefundModalOpen(true)}
                      >
                        Request Payment Refund
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        <CancelBookingModal
          booking={booking}
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onSuccess={loadBooking}
        />

        {/* Refund Request Modal */}
        <RefundRequestModal
          booking={booking}
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          onSuccess={loadBooking}
        />

        {/* Review Submission Modal */}
        {service && (
          <ReviewFormModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            serviceId={service._id}
            serviceTitle={service.title}
            bookingId={booking?._id}
            onSuccess={loadBooking}
          />
        )}
      </TouristLayout>
    </ProtectedRoute>
  )
}
