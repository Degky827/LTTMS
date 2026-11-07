import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { adminDashboardService } from '@/features/admin/services/adminDashboardService'
import { adminAuditService } from '@/features/admin/services/adminAuditService'
import { AdminOverviewStats, AuditLogEntry } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null)
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([])

  // Announcement Modal State
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementMsg, setAnnouncementMsg] = useState('')
  const [announcementTarget, setAnnouncementTarget] = useState('all')
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [ovRes, logsRes] = await Promise.allSettled([
        adminDashboardService.getOverview(),
        adminDashboardService.getRecentActivity(),
      ])

      if (ovRes.status === 'fulfilled' && ovRes.value.success && ovRes.value.data) {
        setOverview(ovRes.value.data)
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.success && logsRes.value.data) {
        setRecentLogs(logsRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load admin overview', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMsg.trim()) {
      toast.error('Title and message are required')
      return
    }

    setSendingAnnouncement(true)
    try {
      const res = await adminAuditService.sendAnnouncement({
        title: announcementTitle,
        message: announcementMsg,
        target: announcementTarget,
      })
      if (res.success) {
        toast.success('Platform announcement broadcasted successfully')
        setAnnouncementModalOpen(false)
        setAnnouncementTitle('')
        setAnnouncementMsg('')
      } else {
        toast.error(res.message || 'Failed to send announcement')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send announcement')
    } finally {
      setSendingAnnouncement(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform Executive Dashboard"
        subtitle="Real-time operational metrics across Lake Tana tourism marketplace"
      >
        <div className="space-y-6">
          {/* Top Bar Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-text-secondary">
                Last updated:{' '}
                <span className="font-semibold text-lake-deep">{new Date().toLocaleTimeString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={loadData} disabled={loading}>
                Refresh Data
              </Button>
              <Button size="sm" variant="primary" onClick={() => setAnnouncementModalOpen(true)}>
                📢 Broadcast Announcement
              </Button>
            </div>
          </div>

          {/* Urgent Action Items Alert Banner */}
          {overview && (overview.pendingVendors > 0 || overview.pendingRefundsCount > 0) && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-900 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="text-sm font-bold">Action Items Require Attention</h4>
                  <p className="text-xs text-amber-800">
                    {overview.pendingVendors} vendor application(s) pending KYC review and{' '}
                    {overview.pendingRefundsCount} customer refund request(s) awaiting processing.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {overview.pendingVendors > 0 && (
                  <Link href="/admin/vendors/verification">
                    <Button size="sm" variant="warning">
                      Review Vendors
                    </Button>
                  </Link>
                )}
                {overview.pendingRefundsCount > 0 && (
                  <Link href="/admin/refunds">
                    <Button size="sm" variant="outline">
                      Review Refunds
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Primary Platform KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {/* 1. Tourists */}
            <Card className="p-4 border-l-4 border-emerald-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Tourists
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {loading ? '...' : (overview?.touristCount ?? 0).toLocaleString()}
              </p>
              <Link
                href="/admin/tourists"
                className="text-[11px] font-semibold text-lake-teal hover:underline mt-1 inline-block"
              >
                View directory &rarr;
              </Link>
            </Card>

            {/* 2. Total Vendors */}
            <Card className="p-4 border-l-4 border-lake-teal">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Approved Vendors
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {loading ? '...' : (overview?.approvedVendors ?? 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-text-muted">
                {overview?.pendingVendors ?? 0} pending review
              </span>
            </Card>

            {/* 3. Services */}
            <Card className="p-4 border-l-4 border-sky-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Published Services
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {loading ? '...' : (overview?.activeServices ?? 0).toLocaleString()}
              </p>
              <Link
                href="/admin/services"
                className="text-[11px] font-semibold text-lake-teal hover:underline mt-1 inline-block"
              >
                Inspect catalog &rarr;
              </Link>
            </Card>

            {/* 4. Bookings */}
            <Card className="p-4 border-l-4 border-amber-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Total Bookings
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {loading ? '...' : (overview?.totalBookings ?? 0).toLocaleString()}
              </p>
              <Link
                href="/admin/bookings"
                className="text-[11px] font-semibold text-lake-teal hover:underline mt-1 inline-block"
              >
                Monitor pipeline &rarr;
              </Link>
            </Card>

            {/* 5. Gross Volume */}
            <Card className="p-4 border-l-4 border-emerald-600">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Gross Volume
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {loading
                  ? '...'
                  : `${((overview?.totalGrossVolume ?? 0) / 1000).toFixed(1)}k ETB`}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Verified transactions</span>
            </Card>

            {/* 6. Commissions */}
            <Card className="p-4 border-l-4 border-amber-warm">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Platform Commission
              </span>
              <p className="text-2xl font-black text-amber-900 mt-1">
                {loading
                  ? '...'
                  : `${((overview?.totalCommissions ?? 0) / 1000).toFixed(1)}k ETB`}
              </p>
              <Link
                href="/admin/commissions"
                className="text-[11px] font-semibold text-amber-800 hover:underline mt-1 inline-block"
              >
                Ledger details &rarr;
              </Link>
            </Card>

            {/* 7. Pending Settlements */}
            <Card className="p-4 border-l-4 border-purple-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Pending Settlements
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {loading
                  ? '...'
                  : `${((overview?.pendingSettlementsAmount ?? 0) / 1000).toFixed(1)}k ETB`}
              </p>
              <span className="text-[10px] text-purple-700 font-semibold">
                {overview?.pendingSettlementsCount ?? 0} request(s)
              </span>
            </Card>

            {/* 8. Pending Refunds */}
            <Card className="p-4 border-l-4 border-red-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Pending Refunds
              </span>
              <p className="text-2xl font-black text-red-600 mt-1">
                {loading ? '...' : (overview?.pendingRefundsCount ?? 0).toLocaleString()}
              </p>
              <Link
                href="/admin/refunds"
                className="text-[11px] font-semibold text-red-700 hover:underline mt-1 inline-block"
              >
                Process claims &rarr;
              </Link>
            </Card>

            {/* 9. Support Tickets */}
            <Card className="p-4 border-l-4 border-indigo-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Open Support Tickets
              </span>
              <p className="text-2xl font-black text-indigo-700 mt-1">
                {loading ? '...' : (overview?.openTicketsCount ?? 0).toLocaleString()}
              </p>
              <Link
                href="/admin/support"
                className="text-[11px] font-semibold text-indigo-700 hover:underline mt-1 inline-block"
              >
                Help desk &rarr;
              </Link>
            </Card>

            {/* 10. Flagged Reviews */}
            <Card className="p-4 border-l-4 border-rose-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Flagged Reviews
              </span>
              <p className="text-2xl font-black text-rose-700 mt-1">
                {loading ? '...' : (overview?.flaggedReviewsCount ?? 0).toLocaleString()}
              </p>
              <Link
                href="/admin/reviews"
                className="text-[11px] font-semibold text-rose-700 hover:underline mt-1 inline-block"
              >
                Moderate reviews &rarr;
              </Link>
            </Card>
          </div>

          {/* Quick Shortcuts & Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Financial & Moderation Shortcuts */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-3 flex items-center gap-2">
                <span>⚡</span> Operational Tools
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/services/moderation"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-surface-elevated transition-colors text-xs font-semibold text-text-primary"
                >
                  <span>Tourism Services Moderation Queue</span>
                  <span className="text-text-muted">&rarr;</span>
                </Link>
                <Link
                  href="/admin/vendors/verification"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-surface-elevated transition-colors text-xs font-semibold text-text-primary"
                >
                  <span>Vendor KYC Dossiers Review</span>
                  <span className="text-text-muted">&rarr;</span>
                </Link>
                <Link
                  href="/admin/commissions/configuration"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-surface-elevated transition-colors text-xs font-semibold text-text-primary"
                >
                  <span>Tiered Commission Rules Setup</span>
                  <span className="text-text-muted">&rarr;</span>
                </Link>
                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-surface-elevated transition-colors text-xs font-semibold text-text-primary"
                >
                  <span>Export Platform Data (CSV)</span>
                  <span className="text-text-muted">&rarr;</span>
                </Link>
              </div>
            </Card>

            {/* Column 2: Booking Status Distribution */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-3 flex items-center gap-2">
                <span>📊</span> Booking Pipeline
              </h3>
              {overview?.bookingStatusBreakdown ? (
                <div className="space-y-2.5">
                  {Object.entries(overview.bookingStatusBreakdown).map(([st, cnt]) => (
                    <div key={st} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-text-secondary">{st}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lake-deep">{cnt}</span>
                        <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-lake-teal h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (cnt / (overview.totalBookings || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-text-muted">No booking data available</div>
              )}
            </Card>

            {/* Column 3: Trust & Safety */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-lake-deep mb-3 flex items-center gap-2">
                <span>🛡️</span> Trust & Biosphere Quality
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                  <span className="text-text-secondary">Eco-Badge Applications</span>
                  <Link href="/admin/eco-badges" className="font-bold text-lake-teal hover:underline">
                    Manage Badges &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                  <span className="text-text-secondary">Abuse & Review Moderation</span>
                  <Link href="/admin/reviews" className="font-bold text-lake-teal hover:underline">
                    Moderate &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                  <span className="text-text-secondary">Platform Grievances</span>
                  <Link href="/admin/complaints" className="font-bold text-lake-teal hover:underline">
                    Investigate &rarr;
                  </Link>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-surface-elevated">
                  <span className="text-text-secondary">Role Assignment (RBAC)</span>
                  <Link href="/admin/roles" className="font-bold text-lake-teal hover:underline">
                    Manage Roles &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Audit Activity Log Table */}
          <Card className="overflow-hidden p-0">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-lake-deep">Recent Platform Activity & Audit Feed</h3>
                <p className="text-xs text-text-secondary">
                  Real-time immutable log of administrative actions, user security events, and financial state changes
                </p>
              </div>
              <Link href="/admin/audit-logs">
                <Button size="sm" variant="outline">
                  Full Audit Trail &rarr;
                </Button>
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-secondary">
                No recent administrative activity recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentLogs.slice(0, 8).map((log) => (
                      <tr key={log._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-lake-deep">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-text-primary">
                          {log.actor?.name || 'System Service'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{log.actor?.role || 'system'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-mono text-[11px]">
                          {log.targetEntity ? `${log.targetEntity} (${log.targetId?.slice(-6) || ''})` : '—'}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Broadcast Announcement Modal */}
        <Modal
          isOpen={announcementModalOpen}
          onClose={() => setAnnouncementModalOpen(false)}
          title="Broadcast Platform Announcement"
          description="Send an official announcement banner to tourists, vendors, or all platform users."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Announcement Title
              </label>
              <Input
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance / Lake Tana Festival Notice"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Audience Target
              </label>
              <select
                value={announcementTarget}
                onChange={(e) => setAnnouncementTarget(e.target.value)}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary"
              >
                <option value="all">All Platform Users (Tourists & Vendors)</option>
                <option value="vendors">Vendors Only</option>
                <option value="tourists">Tourists Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Announcement Message
              </label>
              <textarea
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                rows={4}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-lake-deep"
                placeholder="Write clear, professional notice for all participants..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnnouncementModalOpen(false)}
                disabled={sendingAnnouncement}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendAnnouncement}
                disabled={sendingAnnouncement}
              >
                {sendingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
