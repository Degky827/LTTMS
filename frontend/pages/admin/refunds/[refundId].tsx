import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminRefundService } from '@/features/admin/services/adminRefundService'
import { AdminRefundRequest } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminRefundDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refundId } = router.query as { refundId: string }

  const [refundData, setRefundData] = useState<{ refund: AdminRefundRequest; payment: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingRollback, setProcessingRollback] = useState(false)

  const loadRefund = async () => {
    if (!refundId) return
    try {
      setLoading(true)
      const res = await adminRefundService.getRefundDetail(refundId)
      if (res.success && res.data) {
        setRefundData(res.data)
      } else {
        toast.error('Refund request not found')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load refund details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRefund()
  }, [refundId])

  const handleExecuteRollback = async () => {
    if (!refundId) return
    setProcessingRollback(true)
    try {
      const res = await adminRefundService.processRefund(refundId)
      if (res.success) {
        toast.success('Financial refund processed! Vendor balance debited and capacity restored.')
        loadRefund()
      } else {
        toast.error(res.message || 'Rollback failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Processing error')
    } finally {
      setProcessingRollback(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Refund Claim Dossier & Financial Audit"
        subtitle={`Claim ID: ${refundId || ''}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/refunds">
              <Button size="sm" variant="outline">
                &larr; Back to Refunds
              </Button>
            </Link>
            {refundData?.refund.status === 'approved' && (
              <Button
                size="sm"
                variant="warning"
                onClick={handleExecuteRollback}
                disabled={processingRollback}
              >
                {processingRollback ? 'Processing Gateway Rollback...' : '⚡ Execute Financial Rollback'}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading claim breakdown...</div>
          ) : !refundData ? (
            <Card className="p-8 text-center text-xs text-text-secondary">Claim record not found.</Card>
          ) : (
            <>
              {/* Claim Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="p-6 md:col-span-2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Customer Refund Claim
                      </span>
                      <h2 className="text-xl font-bold text-lake-deep mt-0.5">
                        Amount: {refundData.refund.amount.toLocaleString()} ETB
                      </h2>
                      <p className="text-xs text-text-secondary mt-1">
                        Linked Booking:{' '}
                        <span className="font-mono font-bold text-lake-teal">
                          {refundData.refund.booking?.bookingReference || '—'}
                        </span>
                      </p>
                    </div>
                    <Badge
                      variant={
                        refundData.refund.status === 'completed' || refundData.refund.status === 'processed'
                          ? 'success'
                          : refundData.refund.status === 'approved'
                          ? 'primary'
                          : refundData.refund.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {refundData.refund.status}
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-lg bg-surface-elevated border border-border">
                    <span className="text-xs font-bold text-text-primary block mb-1">
                      Reason Stated by Customer:
                    </span>
                    <p className="text-xs text-text-secondary italic">
                      &quot;{refundData.refund.reason}&quot;
                    </p>
                  </div>

                  {refundData.refund.rejectionReason && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
                      <span className="font-bold block mb-0.5">Official Rejection Feedback:</span>
                      <p>{refundData.refund.rejectionReason}</p>
                    </div>
                  )}

                  {refundData.refund.adminNote && (
                    <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                      <span className="font-bold block mb-0.5">Administrative Note:</span>
                      <p>{refundData.refund.adminNote}</p>
                    </div>
                  )}
                </Card>

                {/* Parties Details Card */}
                <Card className="p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Customer (Claimant)
                    </span>
                    <p className="text-xs font-bold text-lake-deep">{refundData.refund.user?.name}</p>
                    <p className="text-xs text-text-secondary font-mono">{refundData.refund.user?.email}</p>
                    {refundData.refund.user?.phone && (
                      <p className="text-xs text-text-muted mt-0.5">📞 {refundData.refund.user.phone}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Debited Vendor
                    </span>
                    <p className="text-xs font-bold text-lake-deep">
                      {refundData.refund.vendor?.businessName || 'Tourism Vendor'}
                    </p>
                    {refundData.refund.vendor?.phone && (
                      <p className="text-xs text-text-muted mt-0.5">📞 {refundData.refund.vendor.phone}</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Associated Payment Details */}
              <Card className="p-5">
                <h3 className="text-sm font-bold text-lake-deep mb-3">Associated Payment Gateway Transaction</h3>
                {!refundData.payment ? (
                  <p className="text-xs text-text-muted">
                    No verified gateway transaction linked directly to this claim.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-text-muted block text-[11px]">Transaction Ref</span>
                      <span className="font-mono font-bold text-lake-deep">{refundData.payment.txRef}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Original Amount</span>
                      <span className="font-bold text-text-primary">
                        {refundData.payment.amount?.toLocaleString()} {refundData.payment.currency || 'ETB'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Payment Status</span>
                      <span className="font-semibold text-emerald-600">{refundData.payment.status}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Payment Method</span>
                      <span className="font-semibold text-text-primary">
                        {refundData.payment.paymentMethod || 'Gateway'}
                      </span>
                    </div>
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
