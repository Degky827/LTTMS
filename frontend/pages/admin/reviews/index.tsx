import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminReviewService } from '@/features/admin/services/adminReviewService'
import { AdminReview } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminReviewsModerationPage() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [flaggedFilter, setFlaggedFilter] = useState('')

  // Moderation Modal State
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'hide' | 'restore'>('hide')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reports Dialog State
  const [reportsModalOpen, setReportsModalOpen] = useState(false)
  const [reviewReports, setReviewReports] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(false)

  const loadReviews = async () => {
    try {
      setLoading(true)
      const res = await adminReviewService.getReviews({
        status: statusFilter || undefined,
        flagged: flaggedFilter || undefined,
        limit: 50,
      })
      if (res.success && res.data) {
        setReviews(res.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [statusFilter, flaggedFilter])

  const openActionModal = (rev: AdminReview, act: 'approve' | 'reject' | 'hide' | 'restore') => {
    setSelectedReview(rev)
    setActionType(act)
    setReason('')
    setActionModalOpen(true)
  }

  const handleExecuteAction = async () => {
    if (!selectedReview) return
    setSubmitting(true)
    try {
      const res = await adminReviewService.moderateReview(selectedReview._id, {
        action: actionType,
        reason,
      })
      if (res.success) {
        toast.success(`Review status updated to ${actionType}d`)
        setActionModalOpen(false)
        loadReviews()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Moderation error')
    } finally {
      setSubmitting(false)
    }
  }

  const openReportsModal = async (rev: AdminReview) => {
    setSelectedReview(rev)
    setReportsModalOpen(true)
    setLoadingReports(true)
    try {
      const res = await adminReviewService.getReviewReports(rev._id)
      if (res.success && res.data) {
        setReviewReports(res.data)
      } else {
        setReviewReports([])
      }
    } catch (err) {
      setReviewReports([])
    } finally {
      setLoadingReports(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this abusive review?')) return
    try {
      const res = await adminReviewService.deleteReview(id)
      if (res.success) {
        toast.success('Review permanently removed')
        loadReviews()
      }
    } catch (err) {
      toast.error('Failed to delete review')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Customer Feedback & Review Moderation"
        subtitle="Ensure authentic, abuse-free ratings across Lake Tana tourism operators"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Filter Reviews:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved & Published</option>
                <option value="pending">Pending Moderation</option>
                <option value="hidden">Hidden from Public</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={flaggedFilter}
                onChange={(e) => setFlaggedFilter(e.target.value)}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">Flagged & Standard</option>
                <option value="true">⚠️ Flagged by Community</option>
                <option value="false">Standard Feedback</option>
              </select>
            </div>
            <Button size="sm" variant="outline" onClick={loadReviews}>
              Refresh Reviews
            </Button>
          </Card>

          {/* Reviews Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                Feedback Submissions ({reviews.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No customer reviews found matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Feedback</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Reports</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reviews.map((r) => (
                      <tr key={r._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-semibold text-lake-deep">
                          {r.user?.name || 'Anonymous Tourist'}
                        </td>
                        <td className="py-3 px-4 text-text-primary max-w-[150px] truncate">
                          {r.service?.title || 'Tour'}
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-600">
                          {'★'.repeat(r.rating)}
                          {'☆'.repeat(5 - r.rating)}
                        </td>
                        <td className="py-3 px-4 text-text-secondary max-w-[240px] truncate" title={r.comment}>
                          {r.comment}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              r.status === 'approved'
                                ? 'success'
                                : r.status === 'hidden'
                                ? 'secondary'
                                : r.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {r.flagged || (r.reports && r.reports.length > 0) ? (
                            <button
                              onClick={() => openReportsModal(r)}
                              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                            >
                              🚩 {r.reports?.length || 1} Report(s)
                            </button>
                          ) : (
                            <span className="text-[11px] text-text-muted">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status === 'hidden' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openActionModal(r, 'restore')}
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-700 border-amber-300"
                                onClick={() => openActionModal(r, 'hide')}
                              >
                                Hide
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-300"
                              onClick={() => handleDelete(r._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Action Confirmation Modal */}
        <Modal
          isOpen={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          title={`Review Moderation: ${actionType.toUpperCase()}`}
          description="Update public visibility and recalculate service average star ratings."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Moderation Reason Note
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-lake-deep"
                placeholder="Reason for hiding or modifying review visibility..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setActionModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleExecuteAction} disabled={submitting}>
                {submitting ? 'Applying...' : 'Confirm Action'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Abuse Reports Dialog */}
        <Modal
          isOpen={reportsModalOpen}
          onClose={() => setReportsModalOpen(false)}
          title="Community Abuse Reports"
          description={`Reports filed against review: "${selectedReview?.comment.slice(0, 40)}..."`}
        >
          <div className="space-y-3">
            {loadingReports ? (
              <p className="text-xs text-text-muted py-4 text-center">Loading filed reports...</p>
            ) : reviewReports.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">
                This review was flagged automatically or reports could not be loaded.
              </p>
            ) : (
              <div className="space-y-2">
                {reviewReports.map((rep, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-surface-elevated text-xs">
                    <p className="font-semibold text-lake-deep">Report by: {rep.reporter?.name || 'User'}</p>
                    <p className="text-text-secondary mt-1">{rep.reason || 'Flagged as inappropriate'}</p>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      {new Date(rep.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setReportsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
