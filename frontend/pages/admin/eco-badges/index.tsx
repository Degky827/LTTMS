import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminEcoBadgeService } from '@/features/admin/services/adminEcoBadgeService'
import { AdminEcoBadgeApplication } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminEcoBadgesPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<AdminEcoBadgeApplication[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [complianceSummary, setComplianceSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState<AdminEcoBadgeApplication | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [appRes, badgeRes, compRes] = await Promise.allSettled([
        adminEcoBadgeService.getApplications(),
        adminEcoBadgeService.getBadges(),
        adminEcoBadgeService.getComplianceSummary(),
      ])

      if (appRes.status === 'fulfilled' && appRes.value.success && appRes.value.data) {
        setApplications(appRes.value.data)
      }
      if (badgeRes.status === 'fulfilled' && badgeRes.value.success && badgeRes.value.data) {
        setBadges(badgeRes.value.data)
      }
      if (compRes.status === 'fulfilled' && compRes.value.success && compRes.value.data) {
        setComplianceSummary(compRes.value.data)
      }
    } catch (err: any) {
      toast.error('Failed to load eco-badge applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openReviewModal = (app: AdminEcoBadgeApplication, act: 'approve' | 'reject') => {
    setSelectedApp(app)
    setActionType(act)
    setRejectionReason('')
    setReviewModalOpen(true)
  }

  const handleConfirmDecision = async () => {
    if (!selectedApp) return
    if (actionType === 'reject' && !rejectionReason.trim()) {
      toast.error('Rejection feedback is required')
      return
    }

    setSubmitting(true)
    try {
      if (actionType === 'approve') {
        const res = await adminEcoBadgeService.approveApplication(selectedApp._id)
        if (res.success) {
          toast.success(`Eco-badge awarded to ${selectedApp.vendor?.businessName}!`)
        }
      } else {
        const res = await adminEcoBadgeService.rejectApplication(selectedApp._id, rejectionReason)
        if (res.success) {
          toast.success('Application rejected with feedback recorded.')
        }
      }
      setReviewModalOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Eco-Tourism Certification & Biosphere Compliance"
        subtitle="Lake Tana Biosphere Reserve sustainability standards, badge evaluations, and vendor certifications"
      >
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-emerald-600">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Defined Eco Tiers
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">{badges.length}</p>
              <span className="text-[10px] text-text-muted">Platinum, Gold, Silver & Bronze</span>
            </Card>

            <Card className="p-4 border-l-4 border-amber-warm">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Pending Applications
              </span>
              <p className="text-2xl font-black text-amber-900 mt-1">
                {applications.filter((a) => a.status === 'pending' || a.status === 'under_review').length}
              </p>
              <span className="text-[10px] text-amber-800">Awaiting sustainability audit</span>
            </Card>

            <Card className="p-4 border-l-4 border-lake-teal">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Certified Operators
              </span>
              <p className="text-2xl font-black text-lake-deep mt-1">
                {complianceSummary?.certifiedVendors ?? applications.filter((a) => a.status === 'approved').length}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">Active Biosphere Partners</span>
            </Card>
          </div>

          {/* Applications List */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                Vendor Certification Applications ({applications.length})
              </h3>
              <Button size="sm" variant="outline" onClick={loadData}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No eco-badge applications submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {applications.map((app) => (
                  <div key={app._id} className="p-5 space-y-3 hover:bg-surface-elevated transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-lake-deep">{app.vendor?.businessName}</h4>
                          <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                            {app.status}
                          </Badge>
                          <Badge variant="primary">{app.badge?.name || 'Eco-Badge'}</Badge>
                        </div>
                        <p className="text-xs text-text-secondary">
                          Submitted on {new Date(app.createdAt).toLocaleDateString()} &bull; Target Tier: <span className="font-semibold uppercase text-lake-teal">{app.badge?.tier}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status !== 'approved' && (
                          <Button size="sm" variant="primary" onClick={() => openReviewModal(app, 'approve')}>
                            Award Badge
                          </Button>
                        )}
                        {app.status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="text-red-700 border-red-300" onClick={() => openReviewModal(app, 'reject')}>
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Practices Checklist */}
                    <div>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                        Claimed Eco-Friendly Practices ({app.sustainabilityPractices?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {app.sustainabilityPractices?.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            🌿 {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Files */}
                    {app.evidenceFiles && app.evidenceFiles.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Auditable Evidence Photos ({app.evidenceFiles.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {app.evidenceFiles.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-lake-teal hover:underline bg-surface-elevated px-2.5 py-1 rounded border border-border"
                            >
                              Evidence File #{idx + 1} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Review Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={
            actionType === 'approve'
              ? `Award Eco-Badge to ${selectedApp?.vendor?.businessName}`
              : `Reject Application: ${selectedApp?.vendor?.businessName}`
          }
          description="Administrative biosphere certification evaluation."
        >
          <div className="space-y-4">
            {actionType === 'approve' ? (
              <p className="text-xs text-text-secondary">
                Approving will officially stamp the &quot;{selectedApp?.badge?.name}&quot; badge on the vendor&apos;s public marketplace profile and promote their listings in eco-tourism searches.
              </p>
            ) : (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Rejection Reason / Insufficient Evidence Feedback (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-red-500"
                  placeholder="Explain why evidence was insufficient (e.g. Engine emissions certificate expired)..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setReviewModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={handleConfirmDecision}
                disabled={submitting}
              >
                {submitting ? 'Recording...' : actionType === 'approve' ? 'Confirm & Award Badge' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
