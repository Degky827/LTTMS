import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { adminFinanceService } from '@/features/admin/services/adminFinanceService'
import { AdminCommissionTransaction, AdminSettlement } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminCommissionsPage() {
  const { toast } = useToast()
  const [commissions, setCommissions] = useState<AdminCommissionTransaction[]>([])
  const [settlements, setSettlements] = useState<AdminSettlement[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'settlements' | 'commissions'>('settlements')

  // Review Settlement Modal State
  const [selectedSettlement, setSelectedSettlement] = useState<AdminSettlement | null>(null)
  const [settlementModalOpen, setSettlementModalOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Complete Settlement Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [bankReference, setBankReference] = useState('')
  const [submittingComplete, setSubmittingComplete] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [ovRes, commRes, setRes] = await Promise.allSettled([
        adminFinanceService.getOverview(),
        adminFinanceService.getCommissions(),
        adminFinanceService.getSettlements({ limit: 50 }),
      ])

      if (ovRes.status === 'fulfilled' && ovRes.value.success) setOverview(ovRes.value.data)
      if (commRes.status === 'fulfilled' && commRes.value.success && commRes.value.data) {
        setCommissions(commRes.value.data)
      }
      if (setRes.status === 'fulfilled' && setRes.value.success && setRes.value.data) {
        setSettlements(setRes.value.data)
      }
    } catch (err: any) {
      toast.error('Failed to load financial records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openReviewModal = (s: AdminSettlement, action: 'approve' | 'reject') => {
    setSelectedSettlement(s)
    setReviewAction(action)
    setRejectionReason('')
    setSettlementModalOpen(true)
  }

  const handleReviewSettlement = async () => {
    if (!selectedSettlement) return
    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await adminFinanceService.reviewSettlement(selectedSettlement._id, {
        action: reviewAction,
        rejectionReason,
      })
      if (res.success) {
        toast.success(`Settlement payout ${reviewAction}d successfully`)
        setSettlementModalOpen(false)
        loadData()
      } else {
        toast.error(res.message || 'Review failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setSubmittingReview(false)
    }
  }

  const openCompleteModal = (s: AdminSettlement) => {
    setSelectedSettlement(s)
    setBankReference('')
    setCompleteModalOpen(true)
  }

  const handleCompleteSettlement = async () => {
    if (!selectedSettlement) return
    if (!bankReference.trim()) {
      toast.error('Bank transaction reference number is required (e.g. CBE-TXN-XXXX)')
      return
    }

    setSubmittingComplete(true)
    try {
      const res = await adminFinanceService.completeSettlement(selectedSettlement._id, bankReference)
      if (res.success) {
        toast.success('Payout marked completed and vendor ledger updated!')
        setCompleteModalOpen(false)
        loadData()
      } else {
        toast.error(res.message || 'Completion failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setSubmittingComplete(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform Finance & Vendor Settlements"
        subtitle="Manage commission earnings, approve vendor payout settlements, and verify bank transfers"
      >
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-emerald-600">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Total Gross Volume
              </span>
              <p className="text-xl font-black text-lake-deep mt-1">
                {overview?.totalGross ? `${overview.totalGross.toLocaleString()} ETB` : '0 ETB'}
              </p>
              <span className="text-[10px] text-text-muted">All paid reservations</span>
            </Card>

            <Card className="p-4 border-l-4 border-amber-warm">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Platform Commissions
              </span>
              <p className="text-xl font-black text-amber-900 mt-1">
                {overview?.totalCommission ? `${overview.totalCommission.toLocaleString()} ETB` : '0 ETB'}
              </p>
              <span className="text-[10px] text-amber-800">Earned marketplace revenue</span>
            </Card>

            <Card className="p-4 border-l-4 border-purple-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Outstanding Vendor Balances
              </span>
              <p className="text-xl font-black text-lake-deep mt-1">
                {overview?.vendorBalances ? `${overview.vendorBalances.toLocaleString()} ETB` : '0 ETB'}
              </p>
              <span className="text-[10px] text-purple-700">Held in platform custody</span>
            </Card>

            <Card className="p-4 border-l-4 border-sky-500">
              <span className="text-[11px] font-bold uppercase text-text-muted tracking-wider block">
                Pending Settlements
              </span>
              <p className="text-xl font-black text-sky-900 mt-1">
                {overview?.pendingSettlementsAmount
                  ? `${overview.pendingSettlementsAmount.toLocaleString()} ETB`
                  : '0 ETB'}
              </p>
              <span className="text-[10px] text-sky-700 font-semibold">
                {settlements.filter((s) => s.status === 'requested' || s.status === 'approved').length} payout(s) to process
              </span>
            </Card>
          </div>

          {/* Action Links Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === 'settlements' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('settlements')}
              >
                Vendor Payout Settlements ({settlements.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'commissions' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('commissions')}
              >
                Commission Transactions ({commissions.length})
              </Button>
            </div>
            <Link href="/admin/commissions/configuration">
              <Button size="sm" variant="outline">
                ⚙️ Commission Rules Configuration &rarr;
              </Button>
            </Link>
          </div>

          {/* Tab 1: Settlements Table */}
          {activeTab === 'settlements' && (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-lake-deep">
                  Vendor Settlement Payout Requests
                </h3>
                <Button size="sm" variant="outline" onClick={loadData}>
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-text-muted">Loading settlements...</div>
              ) : settlements.length === 0 ? (
                <div className="py-16 text-center text-xs text-text-secondary">
                  No vendor settlement payout requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Vendor</th>
                        <th className="py-3 px-4">Payout Amount</th>
                        <th className="py-3 px-4">Destination Bank</th>
                        <th className="py-3 px-4">Account Number</th>
                        <th className="py-3 px-4">Requested At</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {settlements.map((s) => (
                        <tr key={s._id} className="hover:bg-surface-elevated transition-colors">
                          <td className="py-3 px-4 font-bold text-lake-deep">
                            {s.vendor?.businessName || 'Tourism Vendor'}
                          </td>
                          <td className="py-3 px-4 font-black text-lake-deep">
                            {s.amount.toLocaleString()} ETB
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            {s.destinationBank || 'Commercial Bank of Ethiopia'}
                          </td>
                          <td className="py-3 px-4 font-mono text-text-muted">
                            {s.accountNumber || '—'}
                          </td>
                          <td className="py-3 px-4 text-text-muted">
                            {new Date(s.requestedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                s.status === 'completed'
                                  ? 'success'
                                  : s.status === 'approved'
                                  ? 'primary'
                                  : s.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {s.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.status === 'requested' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => openReviewModal(s, 'approve')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-700 border-red-300"
                                    onClick={() => openReviewModal(s, 'reject')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}

                              {s.status === 'approved' && (
                                <Button
                                  size="sm"
                                  variant="warning"
                                  onClick={() => openCompleteModal(s)}
                                >
                                  Mark Transferred
                                </Button>
                              )}

                              {s.status === 'completed' && s.bankReference && (
                                <span className="text-[11px] font-mono text-text-muted">
                                  Ref: {s.bankReference}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Tab 2: Commissions Transactions Table */}
          {activeTab === 'commissions' && (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-bold text-lake-deep">
                  Marketplace Commission Transactions
                </h3>
                <Button size="sm" variant="outline" onClick={loadData}>
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-text-muted">Loading commissions...</div>
              ) : commissions.length === 0 ? (
                <div className="py-16 text-center text-xs text-text-secondary">
                  No commission transactions on record.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Booking Ref</th>
                        <th className="py-3 px-4">Vendor</th>
                        <th className="py-3 px-4">Gross Total</th>
                        <th className="py-3 px-4">Commission Rate</th>
                        <th className="py-3 px-4">Platform Fee</th>
                        <th className="py-3 px-4">Vendor Net</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {commissions.map((c) => (
                        <tr key={c._id} className="hover:bg-surface-elevated transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                            {c.booking?.bookingReference || '—'}
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            {c.vendor?.businessName || '—'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-text-primary">
                            {c.grossAmount.toLocaleString()} ETB
                          </td>
                          <td className="py-3 px-4 font-mono text-lake-teal">
                            {c.commissionRate}%
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-900">
                            {c.commissionAmount.toLocaleString()} ETB
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-800">
                            {c.vendorEarning.toLocaleString()} ETB
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={c.status === 'earned' || c.status === 'settled' ? 'success' : 'secondary'}>
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Review Settlement Modal */}
        <Modal
          isOpen={settlementModalOpen}
          onClose={() => setSettlementModalOpen(false)}
          title={
            reviewAction === 'approve'
              ? `Approve Settlement Payout: ${selectedSettlement?.amount?.toLocaleString()} ETB`
              : `Reject Settlement Request`
          }
          description="Administrative settlement approval before bank wire transfer execution."
        >
          <div className="space-y-4">
            {reviewAction === 'approve' ? (
              <p className="text-xs text-text-secondary">
                Approving confirms that {selectedSettlement?.vendor?.businessName} has sufficient cleared ledger balance for withdrawal.
              </p>
            ) : (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Reason for Rejection (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Account number mismatch with KYC trade license..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setSettlementModalOpen(false)} disabled={submittingReview}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={reviewAction === 'approve' ? 'primary' : 'danger'}
                onClick={handleReviewSettlement}
                disabled={submittingReview}
              >
                {submittingReview ? 'Recording...' : reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Complete Settlement Modal */}
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title={`Mark Settlement Completed: ${selectedSettlement?.amount?.toLocaleString()} ETB`}
          description="Enter the official bank transaction or Telebirr reference code to finalize the transfer and update the vendor ledger."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Bank / Wire Transfer Reference Number (Required)
              </label>
              <Input
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g. CBE-TXN-20261107-88214 or TB-TRANS-98124"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setCompleteModalOpen(false)} disabled={submittingComplete}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleCompleteSettlement}
                disabled={submittingComplete}
              >
                {submittingComplete ? 'Completing...' : 'Mark Payout Completed'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
