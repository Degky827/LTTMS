import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminBookingService } from '@/features/admin/services/adminBookingService'
import { AdminBooking } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminBookingDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { bookingId } = router.query as { bookingId: string }

  const [booking, setBooking] = useState<AdminBooking | null>(null)
  const [loading, setLoading] = useState(true)

  // Status Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('confirmed')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadBooking = async () => {
    if (!bookingId) return
    try {
      setLoading(true)
      const res = await adminBookingService.getBookingById(bookingId)
      if (res.success && res.data) {
        setBooking(res.data)
      } else {
        toast.error('Booking not found')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const openActionModal = (st: string) => {
    setNewStatus(st)
    setReason('')
    setActionModalOpen(true)
  }

  const handleExecuteStatusUpdate = async () => {
    if (!bookingId) return
    setSubmitting(true)
    try {
      if (newStatus === 'cancelled') {
        await adminBookingService.cancelBooking(bookingId, reason)
        toast.success('Booking cancelled via administrative override')
      } else {
        await adminBookingService.updateBookingStatus(bookingId, newStatus, reason)
        toast.success(`Booking status changed to ${newStatus}`)
      }
      setActionModalOpen(false)
      loadBooking()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Reservation File & Audit Timeline"
        subtitle={`Administrative oversight for reference: ${booking?.bookingReference || bookingId || ''}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/bookings">
              <Button size="sm" variant="outline">
                &larr; Back to Bookings
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {booking && booking.status !== 'cancelled' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300"
                  onClick={() => openActionModal('cancelled')}
                >
                  Cancel Reservation
                </Button>
              )}
              {booking && booking.status === 'pending' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openActionModal('confirmed')}
                >
                  Confirm Reservation
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading reservation file...</div>
          ) : !booking ? (
            <Card className="p-8 text-center text-xs text-text-secondary">Reservation not found.</Card>
          ) : (
            <>
              {/* Header Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="p-6 md:col-span-2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-mono font-bold text-lake-deep">
                          {booking.bookingReference}
                        </h2>
                        <Badge
                          variant={
                            booking.status === 'confirmed' || booking.status === 'completed'
                              ? 'success'
                              : booking.status === 'cancelled' || booking.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Service:{' '}
                        <span className="font-bold text-text-primary">
                          {booking.service?.title || 'Tour'}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-lake-deep block">
                        {booking.totalAmount.toLocaleString()} {booking.currency || 'ETB'}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-xs">
                    <div>
                      <span className="text-text-muted block text-[11px]">Departure Date</span>
                      <span className="font-semibold text-text-primary">
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Time Slot</span>
                      <span className="font-semibold text-text-primary">
                        {booking.timeSlot || 'Flexible'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Party Size</span>
                      <span className="font-semibold text-text-primary">
                        {booking.participants?.adults || 1} Adults
                        {booking.participants?.children ? `, ${booking.participants.children} Kids` : ''}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Parties Details Card */}
                <Card className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Tourist (Customer)
                    </span>
                    <p className="text-xs font-bold text-lake-deep">{booking.user?.name}</p>
                    <p className="text-xs text-text-secondary font-mono">{booking.user?.email}</p>
                    {booking.user?.phone && (
                      <p className="text-xs text-text-muted mt-0.5">📞 {booking.user.phone}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Assigned Vendor
                    </span>
                    <p className="text-xs font-bold text-lake-deep">
                      {booking.vendor?.businessName || 'Tourism Vendor'}
                    </p>
                    <p className="text-xs text-text-secondary font-mono">
                      {booking.vendor?.contactEmail || '—'}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Status History Audit Timeline */}
              <Card className="p-5">
                <h3 className="text-sm font-bold text-lake-deep mb-3">
                  Reservation Lifecycle & Audit Timeline
                </h3>
                {!booking.statusHistory || booking.statusHistory.length === 0 ? (
                  <p className="text-xs text-text-muted">No state transitions recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {booking.statusHistory.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-lake-teal mt-1.5 shrink-0" />
                        <div className="flex-1 p-3 rounded-lg bg-surface-elevated border border-border">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lake-deep capitalize">
                              Status changed to &quot;{item.status}&quot;
                            </span>
                            <span className="text-text-muted text-[11px]">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {item.reason && (
                            <p className="text-text-secondary mt-1 italic">
                              &quot;{item.reason}&quot;
                            </p>
                          )}
                          {item.changedBy && (
                            <p className="text-[11px] text-text-muted mt-1">
                              Actioned by: {item.changedBy.name} ({item.changedBy.role})
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        {/* Status Transition Modal */}
        <Modal
          isOpen={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          title={`Administrative Action: Transition to "${newStatus}"`}
          description="Enforces state machine rules and notifies customer and vendor via Socket.IO and email."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Reason / Internal Justification Note
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-lake-deep"
                placeholder="Explain the operational reason for this override..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setActionModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleExecuteStatusUpdate} disabled={submitting}>
                {submitting ? 'Applying...' : 'Confirm Status Update'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
