import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminRefundService } from '@/features/admin/services/adminRefundService'
import { AdminRefundRequest } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminRefundsPage() {
  const { toast } = useToast()
  const [refunds, setRefunds] = useState<AdminRefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Review Modal State
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundRequest | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [actionDecision, setActionDecision] = useState<'approve' | 'reject'>('approve')
  const [noteOrReason, setNoteOrReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadRefunds = async () => {
    try {
      setLoading(true)
      const res = await adminRefundService.getRefunds({
        status: statusFilter || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setRefunds(res.data)
        setTotalPages((res as any).pages || 1)
        setTotalCount((res as any).total || 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load refund requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRefunds()
  }, [statusFilter, page])

  const openReviewModal = (refund: AdminRefundRequest, action: 'approve' | 'reject') => {
    setSelectedRefund(refund)
    setActionDecision(action)
    setNoteOrReason('')
    setReviewModalOpen(true)
  }

  const handleExecuteDecision = async () => {
    if (!selectedRefund) return
    if (actionDecision === 'reject' && !noteOrReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    setSubmitting(true)
    try {
      if (actionDecision === 'approve') {
        const res = await adminRefundService.approveRefund(selectedRefund._id, noteOrReason)
        if (res.success) {
          toast.success('Refund request approved. You can now execute payment rollback.')
        }
      } else {
        const res = await adminRefundService.rejectRefund(selectedRefund._id, noteOrReason)
        if (res.success) {
          toast.success('Refund request rejected with justification recorded.')
        }
      }
      setReviewModalOpen(false)
      loadRefunds()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to process refund decision')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProcessRollback = async (refundId: string) => {
    try {
      const res = await adminRefundService.processRefund(refundId)
      if (res.success) {
        toast.success('Financial rollback executed successfully! Vendor debited and capacity released.')
        loadRefunds()
      } else {
        toast.error(res.message || 'Rollback execution failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Rollback failed')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Customer Refund Claims & Dispute Resolution"
        subtitle="Manage customer refund requests, authorize payment rollbacks, and release held boat capacity"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Filter by Refund Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Refund Requests</option>
                <option value="submitted">Pending / Submitted</option>
                <option value="approved">Approved (Awaiting Rollback)</option>
                <option value="completed">Completed / Processed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button size="sm" variant="outline" onClick={loadRefunds}>
              Refresh Claims
            </Button>
          </Card>

          {/* Refund Requests Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                Customer Claims ({totalCount})
              </span>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading refund claims...</div>
            ) : refunds.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No customer refund requests found matching filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Tourist</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Requested Amount</th>
                      <th className="py-3 px-4">Claim Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {refunds.map((r) => (
                      <tr key={r._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                          <Link href={`/admin/refunds/${r._id}`} className="hover:underline">
                            {r.booking?.bookingReference || r._id.slice(-8)}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">{r.user?.name || '—'}</p>
                          <p className="text-[11px] text-text-muted font-mono">{r.user?.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {r.vendor?.businessName || '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-lake-deep">
                          {r.amount.toLocaleString()} ETB
                        </td>
                        <td className="py-3 px-4 text-text-secondary max-w-[200px] truncate" title={r.reason}>
                          {r.reason}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              r.status === 'completed' || r.status === 'processed'
                                ? 'success'
                                : r.status === 'approved'
                                ? 'primary'
                                : r.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {['submitted', 'requested', 'under_review'].includes(r.status) && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => openReviewModal(r, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-700 border-red-300"
                                  onClick={() => openReviewModal(r, 'reject')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {r.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => handleProcessRollback(r._id)}
                              >
                                Execute Rollback
                              </Button>
                            )}

                            <Link href={`/admin/refunds/${r._id}`}>
                              <Button size="sm" variant="outline">
                                Details &rarr;
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

        {/* Review Decision Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={
            actionDecision === 'approve'
              ? `Approve Refund Claim: ${selectedRefund?.booking?.bookingReference}`
              : `Reject Refund Claim: ${selectedRefund?.booking?.bookingReference}`
          }
          description="Administrative financial decision. Approving authorizes monetary rollback and vendor balance debit."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                {actionDecision === 'approve' ? 'Admin Note (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                value={noteOrReason}
                onChange={(e) => setNoteOrReason(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-lake-deep"
                placeholder={
                  actionDecision === 'approve'
                    ? 'Notes regarding this refund approval...'
                    : 'Explain reason for claim rejection (e.g. Tour was fully attended / Cancellation past refund window)...'
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setReviewModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionDecision === 'approve' ? 'primary' : 'danger'}
                onClick={handleExecuteDecision}
                disabled={submitting}
              >
                {submitting ? 'Recording...' : actionDecision === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
