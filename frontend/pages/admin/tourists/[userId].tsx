import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminUserService } from '@/features/admin/services/adminUserService'
import { adminBookingService } from '@/features/admin/services/adminBookingService'
import { AdminUser, AdminBooking } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminTouristDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { userId } = router.query as { userId: string }

  const [tourist, setTourist] = useState<AdminUser | null>(null)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const [uRes, bRes] = await Promise.allSettled([
        adminUserService.getUserDetail(userId),
        adminBookingService.getBookings({ user: userId, limit: 50 }),
      ])

      if (uRes.status === 'fulfilled' && uRes.value.success && uRes.value.data) {
        setTourist(uRes.value.data)
      } else {
        toast.error('Tourist profile not found')
      }

      if (bRes.status === 'fulfilled' && bRes.value.success && bRes.value.data) {
        setBookings(bRes.value.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tourist profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userId])

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Tourist Profile & Booking Records"
        subtitle={`Audit dossier for traveler account ID: ${userId || ''}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/tourists">
              <Button size="sm" variant="outline">
                &larr; Back to Tourist Directory
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading tourist profile...</div>
          ) : !tourist ? (
            <Card className="p-8 text-center text-xs text-text-secondary">
              Tourist record could not be found.
            </Card>
          ) : (
            <>
              {/* Profile Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="p-6 md:col-span-2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-lake-deep">{tourist.name}</h2>
                      <p className="text-xs text-text-secondary font-mono">{tourist.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tourist.isSuspended ? 'danger' : tourist.isActive ? 'success' : 'secondary'}>
                        {tourist.isSuspended ? 'Suspended' : tourist.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="primary">{tourist.role}</Badge>
                    </div>
                  </div>

                  {tourist.suspendedReason && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                      <span className="font-bold block">Account Suspension Reason:</span>
                      {tourist.suspendedReason}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-border text-xs">
                    <div>
                      <span className="text-text-muted block text-[11px]">Contact Phone</span>
                      <span className="font-semibold text-text-primary">{tourist.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Email Verification</span>
                      <span className="font-semibold text-text-primary">
                        {tourist.isVerified ? '✓ Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Member Since</span>
                      <span className="font-semibold text-text-primary">
                        {new Date(tourist.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Lifetime Value Card */}
                <Card className="p-6 flex flex-col justify-between bg-lake-deep text-white">
                  <div>
                    <span className="text-[10px] font-bold text-amber-warm uppercase tracking-widest block">
                      Marketplace Engagement
                    </span>
                    <h3 className="text-3xl font-black mt-2 text-white">{totalSpent.toLocaleString()} ETB</h3>
                    <p className="text-xs text-gray-300 mt-1">Verified total booking expenditure</p>
                  </div>
                  <div className="pt-4 border-t border-lake-teal/40 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Total Reservations:</span>
                      <span className="font-bold text-white">{bookings.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Completed Tours:</span>
                      <span className="font-bold text-white">
                        {bookings.filter((b) => b.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Booking History Table */}
              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-bold text-lake-deep">
                    Booking & Reservation History ({bookings.length})
                  </h3>
                </div>

                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-secondary">
                    This tourist has not placed any reservations yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                        <tr>
                          <th className="py-3 px-4">Booking Ref</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Vendor</th>
                          <th className="py-3 px-4">Tour Date</th>
                          <th className="py-3 px-4">Total (ETB)</th>
                          <th className="py-3 px-4">Booking Status</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings.map((b) => (
                          <tr key={b._id} className="hover:bg-surface-elevated transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                              {b.bookingReference}
                            </td>
                            <td className="py-3 px-4 font-medium text-text-primary">
                              {b.service?.title || 'Tour Service'}
                            </td>
                            <td className="py-3 px-4 text-text-secondary">
                              {b.vendor?.businessName || 'Tourism Vendor'}
                            </td>
                            <td className="py-3 px-4 text-text-muted">
                              {new Date(b.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-lake-deep">
                              {b.totalAmount.toLocaleString()} ETB
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  b.status === 'confirmed' || b.status === 'completed'
                                    ? 'success'
                                    : b.status === 'cancelled' || b.status === 'rejected'
                                    ? 'danger'
                                    : 'warning'
                                }
                              >
                                {b.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-semibold text-[11px] ${
                                  b.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
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
              </Card>
            </>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
