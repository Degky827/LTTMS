import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { vendorService } from '@/features/vendors/services/vendorService'
import { vendorBookingService } from '@/features/vendors/services/vendorBookingService'
import { vendorFinanceService } from '@/features/vendors/services/vendorFinanceService'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import {
  Vendor,
  VendorBooking,
  VendorBookingStats,
  VendorFinanceOverview,
} from '@/features/vendors/types'
import { Service } from '@/features/services/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorDashboardPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [stats, setStats] = useState<VendorBookingStats | null>(null)
  const [finance, setFinance] = useState<VendorFinanceOverview | null>(null)
  const [recentBookings, setRecentBookings] = useState<VendorBooking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const profileRes = await vendorService.getMyProfile()
      if (profileRes.success && profileRes.data) {
        const v = profileRes.data
        setVendor(v)

        // Parallel fetch for stats, finance, bookings, services
        const [statsRes, finRes, bkRes, srvRes] = await Promise.all([
          vendorBookingService.getStatistics().catch(() => ({ success: false, data: null })),
          vendorFinanceService.getOverview().catch(() => ({ success: false, data: null })),
          vendorBookingService.getAll({ page: 1, limit: 5 }).catch(() => ({ success: false, data: [] })),
          vendorServiceManagement.getMyServices(v._id, { limit: 4 }).catch(() => ({ success: false, data: [] })),
        ])

        if (statsRes.success && statsRes.data) setStats(statsRes.data)
        if (finRes.success && finRes.data) setFinance(finRes.data)
        if (bkRes.success) setRecentBookings(bkRes.data || [])
        if (srvRes.success) setServices(srvRes.data || [])
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleQuickConfirm = async (booking: VendorBooking) => {
    setActionLoadingId(booking._id)
    try {
      const res = await vendorBookingService.confirm(booking._id)
      if (res.success) {
        toast.success(`Booking ${booking.bookingReference} confirmed!`)
        loadDashboardData()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to confirm booking.'
      toast.error(msg)
    } finally {
      setActionLoadingId(null)
    }
  }

  const isVerified = vendor?.verificationStatus === 'approved'

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Business Overview">
        <div className="space-y-6">
          {/* Welcome & Verification Alert Banner */}
          {!isVerified && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-warning-50 via-amber-50 to-orange-50 border border-warning-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-warning-100 text-warning-800 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-warning-950">
                    KYC Verification Dossier Required
                  </h3>
                  <p className="text-xs text-warning-800 mt-1 max-w-2xl leading-relaxed">
                    Your tourism business is currently in <span className="font-bold capitalize">{vendor?.verificationStatus || 'draft'}</span> state. Upload your trade license or maritime permit to activate public listings and receive traveler bookings.
                  </p>
                </div>
              </div>
              <Link href="/vendor/verification">
                <Button variant="primary" size="sm" className="shrink-0 bg-warning-600 hover:bg-warning-700 text-white">
                  Complete Verification Dossier →
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Pending Requests
                </span>
                <span className="p-1.5 rounded-md bg-warning-50 text-warning-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-extrabold text-warning-600 mt-2">
                {stats?.pending ?? 0}
              </p>
              <p className="text-xs text-text-secondary mt-1">Awaiting your approval</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Confirmed Bookings
                </span>
                <span className="p-1.5 rounded-md bg-success-50 text-success-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-extrabold text-success-600 mt-2">
                {stats?.confirmed ?? 0}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {stats?.totalGuestsServed ?? 0} passengers scheduled
              </p>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-primary-950 to-primary-900 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-200 uppercase tracking-wider">
                  Available Balance
                </span>
                <span className="p-1.5 rounded-md bg-primary-800 text-primary-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-white">
                {finance?.availableBalance?.toLocaleString() ?? 0}{' '}
                <span className="text-sm font-normal text-primary-300">ETB</span>
              </p>
              <Link href="/vendor/revenue" className="text-xs text-secondary-300 hover:text-white font-semibold mt-1 inline-block">
                Withdraw funds →
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Active Offerings
                </span>
                <span className="p-1.5 rounded-md bg-secondary-50 text-secondary-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-extrabold text-text-primary mt-2">
                {services.length}
              </p>
              <Link href="/vendor/services" className="text-xs text-secondary-600 hover:underline font-semibold mt-1 inline-block">
                Manage catalog →
              </Link>
            </Card>
          </div>

          {/* Quick Action Shortcuts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/vendor/services/new"
              className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/60 transition-colors flex items-center gap-3 text-xs font-bold text-text-primary shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary-100 text-secondary-800 flex items-center justify-center font-bold text-sm shrink-0">
                +
              </div>
              <span>Add New Service</span>
            </Link>

            <Link
              href="/vendor/availability"
              className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/60 transition-colors flex items-center gap-3 text-xs font-bold text-text-primary shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-sm shrink-0">
                📅
              </div>
              <span>Update Schedule</span>
            </Link>

            <Link
              href="/vendor/revenue"
              className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/60 transition-colors flex items-center gap-3 text-xs font-bold text-text-primary shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-success-100 text-success-800 flex items-center justify-center font-bold text-sm shrink-0">
                💵
              </div>
              <span>Request Payout</span>
            </Link>

            <Link
              href="/services"
              target="_blank"
              className="p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/60 transition-colors flex items-center gap-3 text-xs font-bold text-text-primary shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                🧭
              </div>
              <span>Public Marketplace</span>
            </Link>
          </div>

          {/* Recent Reservations Table */}
          <Card className="overflow-hidden p-0">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Recent Guest Reservations
                </h3>
                <p className="text-xs text-text-secondary">
                  Latest bookings placed by local and international travelers.
                </p>
              </div>
              <Link href="/vendor/bookings">
                <Button variant="outline" size="sm">
                  View All ({stats?.totalBookings || 0})
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-text-secondary">
                Loading recent bookings...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-xs">
                No bookings received yet. Ensure your services are published and verified.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Ref</th>
                      <th className="py-3 px-4">Tour / Offering</th>
                      <th className="py-3 px-4">Traveler</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-secondary-600">
                          <Link href={`/vendor/bookings/${b._id}`} className="hover:underline">
                            {b.bookingReference}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-text-primary text-xs truncate max-w-[180px]">
                          {b.service?.title || 'Tour'}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="font-semibold text-text-primary block">{b.user?.name || 'Guest'}</span>
                          <span className="text-[10px] text-text-muted">{b.user?.phone || b.user?.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {new Date(b.date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-xs text-text-primary">
                          {b.totalAmount?.toLocaleString()} {b.currency || 'ETB'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              b.status === 'confirmed'
                                ? 'success'
                                : b.status === 'pending'
                                ? 'warning'
                                : b.status === 'completed'
                                ? 'info'
                                : 'danger'
                            }
                          >
                            {b.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {b.status === 'pending' ? (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleQuickConfirm(b)}
                              isLoading={actionLoadingId === b._id}
                            >
                              Confirm
                            </Button>
                          ) : (
                            <Link href={`/vendor/bookings/${b._id}`}>
                              <Button size="sm" variant="ghost">
                                Details
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Active Services Preview & Eco Badge Callout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-text-primary">
                    Published Services Preview
                  </h3>
                  <Link href="/vendor/services" className="text-xs text-secondary-600 font-semibold hover:underline">
                    View Catalog →
                  </Link>
                </div>

                {services.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">
                    No services created yet. Create a boat tour, monastery visit, or accommodation listing.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.slice(0, 4).map((s) => (
                      <div
                        key={s._id}
                        className="p-3.5 rounded-xl border border-border bg-surface-muted/30 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-text-primary truncate">{s.title}</h4>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {s.price?.toLocaleString()} {s.currency || 'ETB'} • {s.duration || 'Flexible'}
                          </p>
                        </div>
                        <Link href={`/vendor/services/${s._id}/edit`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-5 bg-gradient-to-br from-surface to-secondary-50/40 border-secondary-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌿</span>
                  <h3 className="text-sm font-bold text-text-primary">Lake Tana Eco-Badge</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  Stand out to sustainable eco-tourists. Document your waste management, fuel efficiency, and monastery conservation practices to get certified.
                </p>
                <Link href="/vendor/eco-badge">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    View Eco-Badges
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
