import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { vendorBookingService } from '@/features/vendors/services/vendorBookingService'
import { VendorBooking } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorBookingDetailPage() {
  const router = useRouter()
  const { bookingId } = router.query
  const { toast } = useToast()

  const [booking, setBooking] = useState<VendorBooking | null>(null)
  const [loading, setLoading] = useState(true)

  // Actions
  const [confirming, setConfirming] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const loadBooking = async () => {
    if (!bookingId) return
    try {
      setLoading(true)
      const res = await vendorBookingService.getById(bookingId as string)
      if (res.success && res.data) {
        setBooking(res.data)
      }
    } catch (err: any) {
      toast.error('Failed to load booking details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const handleConfirm = async () => {
    if (!booking) return
    setConfirming(true)
    try {
      const res = await vendorBookingService.confirm(booking._id)
      if (res.success) {
        toast.success('Reservation confirmed successfully!')
        loadBooking()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to confirm booking.'
      toast.error(msg)
    } finally {
      setConfirming(false)
    }
  }

  const handleReject = async () => {
    if (!booking) return
    if (!rejectReason.trim()) {
      toast.error('Please enter a reason for declining.')
      return
    }
    setRejecting(true)
    try {
      const res = await vendorBookingService.reject(booking._id, rejectReason.trim())
      if (res.success) {
        toast.success('Booking rejected and capacity released.')
        setRejectModalOpen(false)
        loadBooking()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to decline booking.'
      toast.error(msg)
    } finally {
      setRejecting(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success" size="md">Confirmed</Badge>
      case 'pending':
        return <Badge variant="warning" size="md">Pending Approval</Badge>
      case 'completed':
        return <Badge variant="info" size="md">Completed</Badge>
      case 'cancelled':
        return <Badge variant="danger" size="md">Cancelled</Badge>
      case 'rejected':
        return <Badge variant="danger" size="md">Declined</Badge>
      default:
        return <Badge variant="default" size="md">{status || 'Unknown'}</Badge>
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="Booking Details">
          <div className="py-20 text-center text-text-secondary">
            <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading reservation dossier...</p>
          </div>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  if (!booking) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="Booking Not Found">
          <Card className="p-12 text-center">
            <h3 className="text-lg font-bold text-text-primary">Reservation Not Found</h3>
            <p className="text-sm text-text-secondary mt-1 mb-4">
              The requested booking could not be loaded or does not belong to your vendor account.
            </p>
            <Link href="/vendor/bookings">
              <Button variant="primary">Return to Reservations</Button>
            </Link>
          </Card>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title={`Reservation: ${booking.bookingReference}`}>
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/vendor/bookings" className="text-text-secondary hover:text-text-primary text-sm font-medium">
                ← Back
              </Link>
              <h2 className="text-xl font-bold font-mono text-text-primary">
                {booking.bookingReference}
              </h2>
              {getStatusBadge(booking.status)}
            </div>

            <div className="flex items-center gap-3">
              {booking.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    isLoading={confirming}
                  >
                    Confirm Reservation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectReason('')
                      setRejectModalOpen(true)
                    }}
                  >
                    Decline
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => window.print()} title="Print Manifest">
                Print Manifest
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Experience & Guest Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tour Experience Card */}
              <Card className="p-6">
                <h3 className="text-base font-bold text-text-primary mb-4">Experience & Departure</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-text-muted block">Offering Title</span>
                    <span className="font-bold text-text-primary">{booking.service?.title || 'Tour'}</span>
                  </div>

                  <div>
                    <span className="text-xs text-text-muted block">Departure Date & Time</span>
                    <span className="font-bold text-text-primary">
                      {new Date(booking.date).toLocaleDateString()} {booking.timeSlot ? `• ${booking.timeSlot}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-text-muted block">Passenger Count</span>
                    <span className="font-semibold text-text-primary">
                      {booking.guests} Guests ({booking.adultGuests || booking.guests} Adults{booking.childGuests ? `, ${booking.childGuests} Children` : ''})
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-text-muted block">Meeting Point / Pier</span>
                    <span className="font-semibold text-text-primary">
                      {booking.service?.meetingPoint || 'Bahir Dar Harbor Gate 2'}
                    </span>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="mt-4 p-3 rounded-lg bg-surface-muted border border-border text-xs">
                    <span className="font-bold text-text-primary block mb-1">Special Requests from Traveler:</span>
                    <p className="text-text-secondary">{booking.specialRequests}</p>
                  </div>
                )}
              </Card>

              {/* Guest Profile Card */}
              <Card className="p-6">
                <h3 className="text-base font-bold text-text-primary mb-4">Traveler Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-text-muted block">Traveler Name</span>
                    <span className="font-bold text-text-primary">{booking.user?.name || 'Guest'}</span>
                  </div>

                  <div>
                    <span className="text-xs text-text-muted block">Phone Number</span>
                    <span className="font-semibold text-text-primary">{booking.contactPhone || booking.user?.phone || 'Not provided'}</span>
                  </div>

                  <div>
                    <span className="text-xs text-text-muted block">Email Address</span>
                    <span className="font-semibold text-text-primary">{booking.contactEmail || booking.user?.email || 'Not provided'}</span>
                  </div>
                </div>
              </Card>

              {/* Status History Timeline */}
              {booking.statusHistory && booking.statusHistory.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-base font-bold text-text-primary mb-4">Audit Status History</h3>
                  <div className="space-y-4">
                    {booking.statusHistory.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-secondary-600 mt-2 shrink-0" />
                        <div>
                          <p className="font-bold text-text-primary capitalize">{item.status}</p>
                          {item.reason && <p className="text-xs text-text-secondary mt-0.5">{item.reason}</p>}
                          <p className="text-[11px] text-text-muted mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Col: Financial Breakdown */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <h3 className="text-base font-bold text-text-primary mb-4">Financial Ledger</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Gross Fare:</span>
                    <span className="font-bold text-text-primary">
                      {booking.totalAmount?.toLocaleString()} {booking.currency || 'ETB'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Payment Status:</span>
                    <span className={`font-bold capitalize text-xs ${
                      booking.paymentStatus === 'paid' ? 'text-success-600' : 'text-warning-600'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between text-base font-extrabold text-secondary-600">
                    <span>Vendor Net Value:</span>
                    <span>
                      {(booking.totalAmount * 0.9).toLocaleString()} {booking.currency || 'ETB'}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted pt-2 leading-relaxed">
                    * Net funds will be credited to your vendor ledger upon departure confirmation.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Decline Modal */}
          <Modal
            isOpen={rejectModalOpen}
            onClose={() => setRejectModalOpen(false)}
            title="Decline Reservation"
          >
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Provide a reason for declining reservation <span className="font-mono font-bold text-text-primary">{booking.bookingReference}</span>:
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Inclement weather on Lake Tana, engine maintenance"
                className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-danger-500"
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setRejectModalOpen(false)} disabled={rejecting}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleReject} isLoading={rejecting}>
                  Decline Booking
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
