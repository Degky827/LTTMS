import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { vendorFinanceService } from '@/features/vendors/services/vendorFinanceService'
import {
  VendorFinanceOverview,
  VendorLedgerEntry,
  VendorSettlement,
} from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorRevenuePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<VendorFinanceOverview | null>(null)
  const [transactions, setTransactions] = useState<VendorLedgerEntry[]>([])
  const [settlements, setSettlements] = useState<VendorSettlement[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements'>('transactions')

  // Request Payout Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState<number>(0)
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'cbe_birr' | 'telebirr'>('bank_transfer')
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [submittingPayout, setSubmittingPayout] = useState(false)

  const loadFinanceData = async () => {
    try {
      setLoading(true)
      const [oRes, tRes, sRes] = await Promise.all([
        vendorFinanceService.getOverview(),
        vendorFinanceService.getTransactions({ page, limit: 15 }),
        vendorFinanceService.getSettlements(),
      ])

      if (oRes.success && oRes.data) {
        setOverview(oRes.data)
        if (oRes.data.vendor?.payoutDetails) {
          const pd = oRes.data.vendor.payoutDetails
          if (pd.method) setPayoutMethod(pd.method as any)
          if (pd.bankName) setBankName(pd.bankName)
          if (pd.accountNumber) setAccountNumber(pd.accountNumber)
          if (pd.accountName) setAccountName(pd.accountName)
        }
      }
      if (tRes.success) {
        setTransactions(tRes.data || [])
        setTotalPages(tRes.meta?.totalPages || 1)
      }
      if (sRes.success) {
        setSettlements(sRes.data || [])
      }
    } catch (err) {
      console.error('Failed to load financial records', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFinanceData()
  }, [page])

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payoutAmount || payoutAmount <= 0) {
      toast.error('Please enter a valid payout amount.')
      return
    }

    if (overview && payoutAmount > overview.availableBalance) {
      toast.error(`Payout amount exceeds available balance of ${overview.availableBalance.toLocaleString()} ETB.`)
      return
    }

    setSubmittingPayout(true)
    try {
      const res = await vendorFinanceService.requestSettlement({
        amount: Number(payoutAmount),
        payoutMethod,
        payoutDetails: {
          method: payoutMethod,
          bankName,
          accountNumber,
          accountName,
        },
        notes: payoutNotes,
      })

      if (res.success) {
        toast.success('Payout withdrawal request submitted successfully!')
        setPayoutModalOpen(false)
        setPayoutAmount(0)
        loadFinanceData()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit settlement request.'
      toast.error(msg)
    } finally {
      setSubmittingPayout(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Revenue & Settlements">
        <div className="space-y-6">
          {/* Top Balance Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 bg-gradient-to-br from-primary-950 to-primary-900 text-white shadow-sm">
              <span className="text-xs text-primary-200 uppercase tracking-wider font-semibold">
                Available Ledger Balance
              </span>
              <p className="text-3xl font-extrabold mt-2 text-white">
                {overview?.availableBalance?.toLocaleString() ?? 0} <span className="text-lg font-normal text-primary-300">ETB</span>
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPayoutModalOpen(true)}
                  disabled={!overview || overview.availableBalance <= 0}
                >
                  Request Payout Withdrawal
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Lifetime Gross Bookings
              </span>
              <p className="text-2xl font-extrabold text-text-primary mt-2">
                {overview?.totalGrossEarnings?.toLocaleString() ?? 0} ETB
              </p>
              <p className="text-xs text-text-secondary mt-1">Total revenue collected from tours</p>
            </Card>

            <Card className="p-6">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Total Settled / Withdrawn
              </span>
              <p className="text-2xl font-extrabold text-success-600 mt-2">
                {overview?.totalSettled?.toLocaleString() ?? 0} ETB
              </p>
              <p className="text-xs text-text-secondary mt-1">Disbursed to bank / Telebirr</p>
            </Card>

            <Card className="p-6">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Platform Commission
              </span>
              <p className="text-2xl font-extrabold text-warning-600 mt-2">
                {overview?.totalCommissionPaid?.toLocaleString() ?? 0} ETB
              </p>
              <p className="text-xs text-text-secondary mt-1">Marketplace service fees paid</p>
            </Card>
          </div>

          {/* Subtabs: Transactions vs Settlements */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-secondary-600 text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              Ledger Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'settlements'
                  ? 'bg-secondary-600 text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              Payout Requests ({settlements.length})
            </button>
          </div>

          {/* Tab 1: Ledger Audit Trail */}
          {activeTab === 'transactions' && (
            <Card className="overflow-hidden p-0">
              {loading ? (
                <div className="py-20 text-center text-text-secondary">
                  <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading ledger entries...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm font-semibold text-text-primary">No financial entries yet.</p>
                  <p className="text-xs text-text-muted mt-1">
                    Confirmed reservations and earnings will record an auditable credit here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                      <tr>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Entry Type</th>
                        <th className="py-3.5 px-4">Description</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-3.5 px-4 text-xs text-text-secondary">
                            {new Date(tx.createdAt).toLocaleDateString()}{' '}
                            <span className="text-[10px] text-text-muted block">
                              {new Date(tx.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                tx.entryType === 'credit'
                                  ? 'success'
                                  : tx.entryType === 'settlement'
                                  ? 'info'
                                  : 'warning'
                              }
                            >
                              {tx.entryType.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-text-primary">
                            {tx.description}
                            {tx.booking && (
                              <span className="block text-[11px] text-secondary-600 font-mono mt-0.5">
                                Ref: {tx.booking.bookingReference}
                              </span>
                            )}
                          </td>
                          <td className={`py-3.5 px-4 font-bold text-xs ${
                            tx.entryType === 'credit' ? 'text-success-600' : 'text-danger-600'
                          }`}>
                            {tx.entryType === 'credit' ? '+' : '-'} {tx.amount.toLocaleString()} ETB
                          </td>
                          <td className="py-3.5 px-4 font-bold text-text-primary text-xs text-right">
                            {tx.balanceAfter.toLocaleString()} ETB
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Tab 2: Settlements List */}
          {activeTab === 'settlements' && (
            <Card className="overflow-hidden p-0">
              {settlements.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm font-semibold text-text-primary">No payout requests submitted yet.</p>
                  <p className="text-xs text-text-muted mt-1">
                    When you request a payout from your available balance, its tracking status will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                      <tr>
                        <th className="py-3.5 px-4">Settlement Ref</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Payout Method</th>
                        <th className="py-3.5 px-4">Account / Phone</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Requested At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {settlements.map((s) => (
                        <tr key={s._id} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-secondary-600">
                            {s.settlementReference}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-text-primary text-xs">
                            {s.amount.toLocaleString()} ETB
                          </td>
                          <td className="py-3.5 px-4 text-xs capitalize text-text-secondary">
                            {s.payoutMethod?.replace('_', ' ')}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-text-muted">
                            {s.payoutDetails?.accountNumber || s.payoutDetails?.phone || 'On file'}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                s.status === 'processed'
                                  ? 'success'
                                  : s.status === 'pending' || s.status === 'approved'
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {s.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-text-muted text-right">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Payout Withdrawal Request Modal */}
          <Modal
            isOpen={payoutModalOpen}
            onClose={() => setPayoutModalOpen(false)}
            title="Request Payout Withdrawal"
          >
            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="p-3 bg-primary-50 rounded-lg text-xs text-primary-900 border border-primary-200">
                Available to withdraw:{' '}
                <span className="font-extrabold text-sm text-primary-950">
                  {overview?.availableBalance?.toLocaleString() ?? 0} ETB
                </span>
              </div>

              <Input
                label="Withdrawal Amount (ETB)"
                type="number"
                required
                max={overview?.availableBalance || 0}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                placeholder="e.g. 5000"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="bank_transfer">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="telebirr">Telebirr Mobile Wallet</option>
                  <option value="cbe_birr">CBE Birr Mobile Wallet</option>
                </select>
              </div>

              {payoutMethod === 'bank_transfer' ? (
                <>
                  <Input
                    label="Bank Name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  <Input
                    label="Bank Account Number"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1000..."
                  />
                  <Input
                    label="Account Holder Name"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Exact name on bank passbook"
                  />
                </>
              ) : (
                <Input
                  label="Registered Mobile Wallet Phone Number"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="+251 9..."
                />
              )}

              <Input
                label="Optional Notes / Reference"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="e.g. November Boat Operations Settlement"
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayoutModalOpen(false)}
                  disabled={submittingPayout}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submittingPayout}
                >
                  Confirm Payout Request
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
