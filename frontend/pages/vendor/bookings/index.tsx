import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { vendorBookingService } from '@/features/vendors/services/vendorBookingService'
import { VendorBooking, VendorBookingStats } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorBookingsListPage() {
  const { toast } = useToast()

  const [bookings, setBookings] = useState<VendorBooking[]>([])
  const [stats, setStats] = useState<VendorBookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Action States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [bookingToReject, setBookingToReject] = useState<VendorBooking | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const loadStats = async () => {
    try {
      const res = await vendorBookingService.getStatistics()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Failed to load stats', err)
    }
  }

  const loadBookings = async () => {
    try {
      setLoading(true)
      const res = await vendorBookingService.getAll({
        page,
        limit: 15,
        status: statusFilter,
      })
      if (res.success) {
        setBookings(res.data || [])
        setTotalPages(res.pages || 1)
      }
    } catch (err) {
      console.error('Failed to load bookings', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadBookings()
  }, [statusFilter, page])

  const handleConfirm = async (booking: VendorBooking) => {
    setActionLoadingId(booking._id)
    try {
      const res = await vendorBookingService.confirm(booking._id)
      if (res.success) {
        toast.success(`Booking ${booking.bookingReference} confirmed!`)
        loadBookings()
        loadStats()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to confirm booking.'
      toast.error(msg)
    } finally {
      setActionLoadingId(null)
    }
  }

  const openRejectModal = (booking: VendorBooking) => {
    setBookingToReject(booking)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!bookingToReject) return
    if (!rejectReason.trim()) {
      toast.error('Please state the reason for rejecting this reservation.')
      return
    }

    setRejecting(true)
    try {
      const res = await vendorBookingService.reject(bookingToReject._id, rejectReason.trim())
      if (res.success) {
        toast.success(`Booking ${bookingToReject.bookingReference} rejected and capacity released.`)
        setRejectModalOpen(false)
        setBookingToReject(null)
        loadBookings()
        loadStats()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to decline booking.'
      toast.error(msg)
    } finally {
      setRejecting(false)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase()
    return (
      b.bookingReference.toLowerCase().includes(q) ||
      (b.user?.name && b.user.name.toLowerCase().includes(q)) ||
      (b.service?.title && b.service.title.toLowerCase().includes(q))
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>
      case 'pending':
        return <Badge variant="warning">Pending Approval</Badge>
      case 'completed':
        return <Badge variant="info">Completed</Badge>
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>
      case 'rejected':
        return <Badge variant="danger">Declined</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Reservation Management">
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-text-muted font-medium">Pending Requests</span>
              <p className="text-2xl font-extrabold text-warning-600 mt-1">
                {stats?.pending ?? 0}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-text-muted font-medium">Confirmed Departures</span>
              <p className="text-2xl font-extrabold text-success-600 mt-1">
                {stats?.confirmed ?? 0}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-text-muted font-medium">Total Passengers</span>
              <p className="text-2xl font-extrabold text-text-primary mt-1">
                {stats?.totalGuestsServed ?? 0}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-text-muted font-medium">Estimated Revenue</span>
              <p className="text-2xl font-extrabold text-secondary-600 mt-1">
                {stats?.estimatedRevenue?.toLocaleString() ?? 0} ETB
              </p>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: `Pending (${stats?.pending || 0})` },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'cancelled', label: 'Cancelled' },
                  { id: 'rejected', label: 'Declined' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-surface-elevated text-text-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search ref, guest, or tour..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Bookings Table */}
          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="py-20 text-center text-text-secondary">
                <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading reservations...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-base font-bold text-text-primary">No Bookings Found</h3>
                <p className="text-xs text-text-muted mt-1">
                  There are no reservations matching the selected filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Tour / Offering</th>
                      <th className="py-3.5 px-4">Traveler</th>
                      <th className="py-3.5 px-4">Departure Date</th>
                      <th className="py-3.5 px-4">Guests</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-secondary-600">
                          <Link href={`/vendor/bookings/${b._id}`} className="hover:underline">
                            {b.bookingReference}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-text-primary">
                          <div className="line-clamp-1 max-w-[200px]" title={b.service?.title}>
                            {b.service?.title || 'Tour'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-text-primary text-xs">{b.user?.name || 'Guest'}</div>
                          <div className="text-[11px] text-text-muted">{b.user?.phone || b.user?.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {new Date(b.date).toLocaleDateString()}
                          {b.timeSlot && <span className="block text-[11px] text-text-muted">{b.timeSlot}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-text-primary">
                          {b.guests} {b.guests === 1 ? 'person' : 'people'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-text-primary">
                          {b.totalAmount?.toLocaleString()} {b.currency || 'ETB'}
                          <span className={`block text-[10px] font-semibold ${
                            b.paymentStatus === 'paid' ? 'text-success-600' : 'text-warning-600'
                          }`}>
                            {b.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(b.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleConfirm(b)}
                                  isLoading={actionLoadingId === b._id}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRejectModal(b)}
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            <Link href={`/vendor/bookings/${b._id}`}>
                              <Button size="sm" variant="ghost">
                                Details
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Decline / Reject Reason Modal */}
          <Modal
            isOpen={rejectModalOpen}
            onClose={() => setRejectModalOpen(false)}
            title="Decline Reservation"
          >
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                You are about to decline booking{' '}
                <span className="font-mono font-bold text-text-primary">
                  {bookingToReject?.bookingReference}
                </span>.
                Capacity for this date will be instantly restored for other travelers.
              </p>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Reason for Declining <span className="text-danger-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Boat under routine maritime maintenance, severe lake wind advisory, etc."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-danger-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={rejecting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  isLoading={rejecting}
                >
                  Confirm Decline
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
