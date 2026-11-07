import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminVendorService } from '@/features/admin/services/adminVendorService'
import { AdminVendor } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminVendorVerificationQueuePage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [loading, setLoading] = useState(true)

  // Review Modal State
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [actionDecision, setActionDecision] = useState<'approved' | 'rejected' | 'suspended'>('approved')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadPendingVendors = async () => {
    try {
      setLoading(true)
      const res = await adminVendorService.getVendors({ status: 'pending', limit: 50 })
      if (res.success && res.data) {
        setVendors(res.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load verification queue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingVendors()
  }, [])

  const openReviewModal = (vendor: AdminVendor, decision: 'approved' | 'rejected' | 'suspended') => {
    setSelectedVendor(vendor)
    setActionDecision(decision)
    setRejectionReason('')
    setReviewModalOpen(true)
  }

  const handleExecuteDecision = async () => {
    if (!selectedVendor) return
    if ((actionDecision === 'rejected' || actionDecision === 'suspended') && !rejectionReason.trim()) {
      toast.error('A reason must be recorded for rejection or suspension')
      return
    }

    setSubmitting(true)
    try {
      const res = await adminVendorService.updateVendorStatus(selectedVendor._id, {
        status: actionDecision,
        reason: rejectionReason,
      })

      if (res.success) {
        toast.success(
          actionDecision === 'approved'
            ? `Vendor ${selectedVendor.businessName} approved! Account role upgraded to vendor.`
            : `Vendor ${selectedVendor.businessName} updated to ${actionDecision}.`
        )
        setReviewModalOpen(false)
        loadPendingVendors()
      } else {
        toast.error(res.message || 'Action failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to process decision')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Vendor KYC Verification Queue"
        subtitle="Review trade licenses, maritime permits, and eco-tourism dossiers for onboarding tourism providers"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/vendors">
              <Button size="sm" variant="outline">
                &larr; All Vendors Directory
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={loadPendingVendors} disabled={loading}>
              Refresh Queue
            </Button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">
              Loading verification applications...
            </div>
          ) : vendors.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <div className="text-4xl">🎉</div>
              <h3 className="text-base font-bold text-lake-deep">Verification Queue Clean!</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                There are currently no tourism businesses pending review. All vendor dossiers have been processed.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <Card key={vendor._id} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-lake-deep">{vendor.businessName}</h3>
                        <Badge variant="warning">Pending KYC Review</Badge>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Submitted by <span className="font-semibold text-text-primary">{vendor.user?.name}</span> ({vendor.user?.email}) on {new Date(vendor.createdAt).toLocaleDateString()}
                      </p>
                      {vendor.location && typeof vendor.location === 'string' && (
                        <p className="text-xs text-text-muted mt-0.5">📍 {vendor.location}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openReviewModal(vendor, 'approved')}
                      >
                        Approve Vendor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300"
                        onClick={() => openReviewModal(vendor, 'rejected')}
                      >
                        Reject
                      </Button>
                      <Link href={`/admin/vendors/${vendor._id}`}>
                        <Button size="sm" variant="outline">
                          Full Dossier
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="pt-3 border-t border-border">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                      Submitted Compliance Documents ({vendor.documents?.length || 0})
                    </span>

                    {!vendor.documents || vendor.documents.length === 0 ? (
                      <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        ⚠️ No official verification documents have been uploaded to this application yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {vendor.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-border bg-surface-elevated flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-lake-deep truncate">{doc.name || doc.type}</p>
                              <span className="text-[10px] text-text-muted uppercase font-mono">
                                {doc.type}
                              </span>
                            </div>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-lake-teal hover:underline shrink-0"
                              >
                                View ↗
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Decision Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={
            actionDecision === 'approved'
              ? `Approve Vendor Application: ${selectedVendor?.businessName}`
              : `Reject Application: ${selectedVendor?.businessName}`
          }
          description={
            actionDecision === 'approved'
              ? 'Approving upgrades the owner user role to "vendor" and allows them to publish tourism services on the marketplace.'
              : 'Record the feedback explaining why this vendor dossier was rejected or requires revisions.'
          }
        >
          <div className="space-y-4">
            {actionDecision === 'approved' ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Confirmation Summary:</p>
                <p>• Verification status will be stamped as "approved".</p>
                <p>• An automated approval confirmation email will be dispatched to {selectedVendor?.user?.email}.</p>
                <p>• The vendor will immediately gain permission to publish listings to Lake Tana tourists.</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Reason for Rejection / Required Corrections (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Maritime vessel passenger safety license expired / Business TIN certificate image is unreadable..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReviewModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionDecision === 'approved' ? 'primary' : 'danger'}
                onClick={handleExecuteDecision}
                disabled={submitting}
              >
                {submitting
                  ? 'Processing...'
                  : actionDecision === 'approved'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
