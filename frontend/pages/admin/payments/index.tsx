import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminFinanceService } from '@/features/admin/services/adminFinanceService'
import { AdminPayment } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminPaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const loadPayments = async () => {
    try {
      setLoading(true)
      const res = await adminFinanceService.getPayments({
        status: statusFilter || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setPayments(res.data)
        setTotalPages((res as any).pages || 1)
        setTotalCount((res as any).total || 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [statusFilter, page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
      case 'success':
        return <Badge variant="success">Successful</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>
      case 'failed':
        return <Badge variant="danger">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Payment Transactions & Gateway Monitoring"
        subtitle="Authoritative audit of all customer payments verified through payment rails"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Filter by Payment Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Transactions</option>
                <option value="successful">Successful Payments</option>
                <option value="pending">Pending Payments</option>
                <option value="refunded">Refunded Payments</option>
                <option value="failed">Failed Payments</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/commissions">
                <Button size="sm" variant="outline">
                  Commissions & Settlements &rarr;
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={loadPayments}>
                Refresh
              </Button>
            </div>
          </Card>

          {/* Payments Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                Verified Transactions ({totalCount})
              </span>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No payment transactions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Tx Reference</th>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Tourist</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Gross Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                          {p.txRef}
                        </td>
                        <td className="py-3 px-4 font-mono text-text-secondary">
                          {p.booking?.bookingReference ? (
                            <Link
                              href={`/admin/bookings/${p.booking._id}`}
                              className="text-lake-teal hover:underline font-bold"
                            >
                              {p.booking.bookingReference}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">{p.user?.name || '—'}</p>
                          <p className="text-[11px] text-text-muted">{p.user?.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {p.vendor?.businessName || '—'}
                        </td>
                        <td className="py-3 px-4 font-black text-lake-deep">
                          {p.amount.toLocaleString()} {p.currency || 'ETB'}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(p.status)}</td>
                        <td className="py-3 px-4 text-text-muted font-mono text-[11px]">
                          {p.paymentMethod || p.provider || 'Gateway'}
                        </td>
                        <td className="py-3 px-4 text-right text-text-muted">
                          {new Date(p.createdAt).toLocaleString()}
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
