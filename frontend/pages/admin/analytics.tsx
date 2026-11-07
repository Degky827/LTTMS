import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminDashboardService } from '@/features/admin/services/adminDashboardService'

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('30d')
  const [bookingsData, setBookingsData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [vendorsData, setVendorsData] = useState<any>(null)
  const [touristsData, setTouristsData] = useState<any>(null)
  const [servicesData, setServicesData] = useState<any>(null)
  const [supportData, setSupportData] = useState<any>(null)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [bRes, rRes, vRes, tRes, sRes, supRes] = await Promise.allSettled([
        adminDashboardService.getBookingsAnalysis(),
        adminDashboardService.getRevenueAnalysis(),
        adminDashboardService.getVendorsAnalysis(),
        adminDashboardService.getTouristsAnalysis(),
        adminDashboardService.getServicesAnalysis(),
        adminDashboardService.getSupportAnalysis(),
      ])

      if (bRes.status === 'fulfilled' && bRes.value.success) setBookingsData(bRes.value.data)
      if (rRes.status === 'fulfilled' && rRes.value.success) setRevenueData(rRes.value.data)
      if (vRes.status === 'fulfilled' && vRes.value.success) setVendorsData(vRes.value.data)
      if (tRes.status === 'fulfilled' && tRes.value.success) setTouristsData(tRes.value.data)
      if (sRes.status === 'fulfilled' && sRes.value.success) setServicesData(sRes.value.data)
      if (supRes.status === 'fulfilled' && supRes.value.success) setSupportData(supRes.value.data)
    } catch (err) {
      console.error('Failed to load analytics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [timeframe])

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform Analytics & Business Intelligence"
        subtitle="Empirical performance indicators across bookings, marketplace revenue, and biosphere services"
      >
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-lake-deep">Marketplace Metrics Breakdown</h2>
              <p className="text-xs text-text-secondary">
                Aggregated from authoritative MongoDB database transactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={timeframe === '30d' ? 'primary' : 'outline'}
                onClick={() => setTimeframe('30d')}
              >
                Last 30 Days
              </Button>
              <Button
                size="sm"
                variant={timeframe === '90d' ? 'primary' : 'outline'}
                onClick={() => setTimeframe('90d')}
              >
                Last 90 Days
              </Button>
              <Button
                size="sm"
                variant={timeframe === '1y' ? 'primary' : 'outline'}
                onClick={() => setTimeframe('1y')}
              >
                Current Year
              </Button>
            </div>
          </div>

          {/* Section 1: Financial & Revenue Trajectory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-1">
                Platform Revenue & Commission Collection
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                Historical gross booking volume vs. collected marketplace commissions (ETB)
              </p>
              {loading ? (
                <div className="py-16 text-center text-xs text-text-muted">Loading revenue metrics...</div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-900">
                      Total Verified Gross Volume
                    </span>
                    <span className="text-base font-black text-emerald-800">
                      {revenueData?.totalGross ? `${revenueData.totalGross.toLocaleString()} ETB` : '0 ETB'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                    <span className="text-xs font-semibold text-amber-900">
                      Earned Platform Commissions
                    </span>
                    <span className="text-base font-black text-amber-800">
                      {revenueData?.totalCommission
                        ? `${revenueData.totalCommission.toLocaleString()} ETB`
                        : '0 ETB'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100">
                    <span className="text-xs font-semibold text-sky-900">Net Vendor Payouts</span>
                    <span className="text-base font-black text-sky-800">
                      {revenueData?.totalVendorEarning
                        ? `${revenueData.totalVendorEarning.toLocaleString()} ETB`
                        : '0 ETB'}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-1">
                Booking Conversion & Status Lifecycle
              </h3>
              <p className="text-xs text-text-secondary mb-4">
                Reservation distribution across lifecycle stages
              </p>
              {loading ? (
                <div className="py-16 text-center text-xs text-text-muted">Loading booking data...</div>
              ) : bookingsData?.statusBreakdown ? (
                <div className="space-y-3">
                  {bookingsData.statusBreakdown.map((item: any) => (
                    <div key={item._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-text-primary font-medium">{item._id}</span>
                        <span className="font-bold text-lake-deep">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-lake-deep h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.count / (bookingsData.total || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-text-muted">
                  No booking distribution recorded yet
                </div>
              )}
            </Card>
          </div>

          {/* Section 2: Vendors & Services Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Vendor Compliance Pipeline */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-1">Vendor Verification Pipeline</h3>
              <p className="text-xs text-text-secondary mb-3">
                KYC compliance status across registered businesses
              </p>
              {loading ? (
                <div className="py-8 text-center text-xs text-text-muted">Loading...</div>
              ) : vendorsData?.byStatus ? (
                <div className="space-y-2.5">
                  {vendorsData.byStatus.map((v: any) => (
                    <div
                      key={v._id}
                      className="flex items-center justify-between text-xs p-2 rounded bg-surface-elevated"
                    >
                      <span className="capitalize text-text-secondary">{v._id || 'unassigned'}</span>
                      <span className="font-bold text-lake-deep">{v.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-text-muted">No vendor data</div>
              )}
            </Card>

            {/* Tourist User Trajectory */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-1">Tourist Growth & Activity</h3>
              <p className="text-xs text-text-secondary mb-3">
                Account verification and engagement metrics
              </p>
              {loading ? (
                <div className="py-8 text-center text-xs text-text-muted">Loading...</div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <span className="text-[11px] text-text-muted uppercase font-bold block">
                      Total Registered Tourists
                    </span>
                    <span className="text-2xl font-black text-lake-deep mt-1 block">
                      {touristsData?.totalCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-surface-elevated">
                    <span className="text-text-secondary">Active Accounts</span>
                    <span className="font-bold text-emerald-600">
                      {touristsData?.activeCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-surface-elevated">
                    <span className="text-text-secondary">Suspended Accounts</span>
                    <span className="font-bold text-red-600">
                      {touristsData?.suspendedCount ?? 0}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Services Inventory by Category */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-1">Services by Category</h3>
              <p className="text-xs text-text-secondary mb-3">
                Distribution of tours, lodging, and activities
              </p>
              {loading ? (
                <div className="py-8 text-center text-xs text-text-muted">Loading...</div>
              ) : servicesData?.byCategory ? (
                <div className="space-y-2">
                  {servicesData.byCategory.map((cat: any) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between text-xs p-2 rounded bg-surface-elevated"
                    >
                      <span className="text-text-primary font-medium truncate max-w-[140px]">
                        {cat.name || 'General Tourism'}
                      </span>
                      <span className="font-bold text-lake-deep">{cat.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-text-muted">No category data</div>
              )}
            </Card>
          </div>

          {/* Section 3: Support & Grievances Analytics */}
          <Card className="p-5">
            <h3 className="text-sm font-bold text-lake-deep mb-1">
              Customer Support & Grievance Resolution
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Ticket volume broken down by priority level and resolution category
            </p>
            {loading ? (
              <div className="py-12 text-center text-xs text-text-muted">Loading support analytics...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status */}
                <div className="p-3 rounded-lg border border-border">
                  <h4 className="text-xs font-bold text-text-muted uppercase mb-2">By Status</h4>
                  <div className="space-y-1.5">
                    {supportData?.byStatus?.map((s: any) => (
                      <div key={s._id} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-text-secondary">{s._id}</span>
                        <span className="font-semibold text-lake-deep">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div className="p-3 rounded-lg border border-border">
                  <h4 className="text-xs font-bold text-text-muted uppercase mb-2">By Priority</h4>
                  <div className="space-y-1.5">
                    {supportData?.byPriority?.map((p: any) => (
                      <div key={p._id} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-text-secondary">{p._id}</span>
                        <span className="font-semibold text-lake-deep">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="p-3 rounded-lg border border-border">
                  <h4 className="text-xs font-bold text-text-muted uppercase mb-2">By Category</h4>
                  <div className="space-y-1.5">
                    {supportData?.byCategory?.map((c: any) => (
                      <div key={c._id} className="flex items-center justify-between text-xs">
                        <span className="capitalize text-text-secondary">{c._id}</span>
                        <span className="font-semibold text-lake-deep">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
