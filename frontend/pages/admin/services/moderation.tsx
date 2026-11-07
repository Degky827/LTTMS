import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminServiceModeration } from '@/features/admin/services/adminServiceModeration'
import { AdminService } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminServiceModerationPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)

  // Moderation Modal State
  const [selectedService, setSelectedService] = useState<AdminService | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadPendingServices = async () => {
    try {
      setLoading(true)
      const res = await adminServiceModeration.getServices({ status: 'pending', limit: 50 })
      if (res.success && res.data) {
        setServices(res.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load pending services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingServices()
  }, [])

  const handleApprove = async (service: AdminService) => {
    try {
      const res = await adminServiceModeration.approveService(service._id)
      if (res.success) {
        toast.success(`Service "${service.title}" approved and published to marketplace`)
        loadPendingServices()
      } else {
        toast.error(res.message || 'Failed to approve listing')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Approval failed')
    }
  }

  const openRejectModal = (service: AdminService) => {
    setSelectedService(service)
    setRejectionReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!selectedService) return
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    setSubmitting(true)
    try {
      const res = await adminServiceModeration.rejectService(selectedService._id, rejectionReason)
      if (res.success) {
        toast.success(`Listing rejected with feedback recorded`)
        setRejectModalOpen(false)
        loadPendingServices()
      } else {
        toast.error(res.message || 'Failed to reject listing')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Tourism Service Moderation Queue"
        subtitle="Review, approve, or reject new boat excursions, lodging offers, and island monastery tours"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/services">
              <Button size="sm" variant="outline">
                &larr; All Services Catalog
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={loadPendingServices} disabled={loading}>
              Refresh Queue
            </Button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading pending services...</div>
          ) : services.length === 0 ? (
            <Card className="p-12 text-center space-y-3">
              <div className="text-4xl">⛵</div>
              <h3 className="text-base font-bold text-lake-deep">No Services Awaiting Review</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                All vendor tourism offerings have been evaluated. Newly submitted drafts will appear here automatically.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {services.map((svc) => (
                <Card key={svc._id} className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-lake-deep">{svc.title}</h3>
                        <Badge variant="warning">Pending Moderation</Badge>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Submitted by{' '}
                        <span className="font-semibold text-text-primary">
                          {svc.vendor?.businessName}
                        </span>{' '}
                        ({svc.vendor?.contactEmail}) on {new Date(svc.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                        <span>🏷️ {svc.category?.name || 'Category'}</span>
                        <span>📍 {svc.destination?.name || 'Lake Tana'}</span>
                        <span>⏱️ {svc.duration || 'Flexible'}</span>
                        <span>👥 Max {svc.maxCapacity || 'N/A'} Guests</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="primary" onClick={() => handleApprove(svc)}>
                        Approve & Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300"
                        onClick={() => openRejectModal(svc)}
                      >
                        Reject
                      </Button>
                      <Link href={`/admin/services/${svc._id}`}>
                        <Button size="sm" variant="outline">
                          Inspect &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-surface-elevated p-3 rounded-lg border border-border">
                    {svc.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                    <span className="font-bold text-lake-deep">
                      Price: {svc.price?.toLocaleString()} {svc.currency || 'ETB'}
                    </span>
                    <span className="text-text-muted">
                      {svc.images?.length || 0} photo(s) submitted
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Rejection Feedback Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Listing: ${selectedService?.title}`}
          description="Provide constructive feedback to the vendor explaining why this listing cannot be published in its current form."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Moderation Notes / Rejection Reason (Required)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-red-500"
                placeholder="e.g. Inadequate safety guidelines specified / Price breakdown unclear / Low quality photos..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleConfirmReject}
                disabled={submitting}
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
