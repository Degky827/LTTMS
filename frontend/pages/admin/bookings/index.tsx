import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminBookingService } from '@/features/admin/services/adminBookingService'
import { AdminBooking } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminBookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [reference, setReference] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const loadBookings = async () => {
    try {
      setLoading(true)
      const res = await adminBookingService.getBookings({
        reference: reference.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setBookings(res.data)
        setTotalPages((res as any).pages || 1)
        setTotalCount((res as any).total || 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [reference, statusFilter, page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <Badge variant="success">{status}</Badge>
      case 'cancelled':
      case 'rejected':
        return <Badge variant="danger">{status}</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform Bookings & Reservations Monitor"
        subtitle="Live oversight across all tour departures, boat cruises, and eco-lodges"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by Booking Reference (e.g. BK-2026-XXXX)..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button size="sm" variant="outline" onClick={loadBookings}>
                Refresh
              </Button>
            </div>
          </Card>

          {/* Bookings Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                Total Reservations ({totalCount})
              </span>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading reservations...</div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No bookings matching current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Tourist</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Departure Date</th>
                      <th className="py-3 px-4">Gross Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                          <Link href={`/admin/bookings/${b._id}`} className="hover:underline">
                            {b.bookingReference}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">{b.user?.name || '—'}</p>
                          <p className="text-[11px] text-text-muted">{b.user?.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-medium">
                          {b.vendor?.businessName || '—'}
                        </td>
                        <td className="py-3 px-4 text-text-primary max-w-[160px] truncate">
                          {b.service?.title || 'Tour Service'}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {new Date(b.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-lake-deep">
                          {b.totalAmount.toLocaleString()} ETB
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold text-[11px] ${
                              b.paymentStatus === 'paid'
                                ? 'text-emerald-600'
                                : b.paymentStatus === 'refunded'
                                ? 'text-purple-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/bookings/${b._id}`}>
                            <Button size="sm" variant="outline">
                              Inspect &rarr;
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &larr; Previous
                </Button>
                <span className="text-xs text-text-secondary">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next &rarr;
                </Button>
              </div>
            )}
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
