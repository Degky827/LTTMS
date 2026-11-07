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
import { AdminCommissionRule } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminCommissionConfigurationPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState<AdminCommissionRule[]>([])
  const [loading, setLoading] = useState(true)

  // Rule Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AdminCommissionRule | null>(null)
  const [ruleName, setRuleName] = useState('')
  const [ruleRate, setRuleRate] = useState<number>(10)
  const [isDefault, setIsDefault] = useState(false)
  const [minAmount, setMinAmount] = useState<number>(0)
  const [maxAmount, setMaxAmount] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  const loadRules = async () => {
    try {
      setLoading(true)
      const res = await adminFinanceService.getCommissionRules()
      if (res.success && res.data) {
        setRules(res.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load commission rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const openCreateModal = () => {
    setEditingRule(null)
    setRuleName('')
    setRuleRate(10)
    setIsDefault(false)
    setMinAmount(0)
    setMaxAmount(0)
    setModalOpen(true)
  }

  const openEditModal = (r: AdminCommissionRule) => {
    setEditingRule(r)
    setRuleName(r.name)
    setRuleRate(r.rate)
    setIsDefault(r.isDefault || false)
    setMinAmount(r.minAmount || 0)
    setMaxAmount(r.maxAmount || 0)
    setModalOpen(true)
  }

  const handleSaveRule = async () => {
    if (!ruleName.trim()) {
      toast.error('Rule name is required')
      return
    }
    if (ruleRate <= 0 || ruleRate > 50) {
      toast.error('Commission rate must be between 1% and 50%')
      return
    }

    setSubmitting(true)
    try {
      const payload: Partial<AdminCommissionRule> = {
        name: ruleName,
        rate: Number(ruleRate),
        isDefault,
        minAmount: minAmount > 0 ? Number(minAmount) : undefined,
        maxAmount: maxAmount > 0 ? Number(maxAmount) : undefined,
      }

      if (editingRule) {
        const res = await adminFinanceService.updateCommissionRule(editingRule._id, payload)
        if (res.success) {
          toast.success('Commission rule updated successfully')
        }
      } else {
        const res = await adminFinanceService.createCommissionRule(payload)
        if (res.success) {
          toast.success('New commission rule registered')
        }
      }
      setModalOpen(false)
      loadRules()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save rule')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Commission Rules & Marketplace Payout Settings"
        subtitle="Configure dynamic tier rates, default fees, and threshold policies for tourism providers"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/commissions">
              <Button size="sm" variant="outline">
                &larr; Back to Settlements
              </Button>
            </Link>
            <Button size="sm" variant="primary" onClick={openCreateModal}>
              + Add New Commission Rule
            </Button>
          </div>

          <Card className="p-4 bg-lake-deep/5 border-lake-teal/30 text-xs text-lake-deep space-y-1">
            <p className="font-bold">Authoritative Rule Enforcement:</p>
            <p>
              When a booking is confirmed and paid, the backend matches transactions against active commission rules. If no custom category or tiered rule matches, the Default Rule (e.g. 10%) applies automatically.
            </p>
          </Card>

          {/* Rules Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                Active Commission Rules ({rules.length})
              </h3>
              <Button size="sm" variant="outline" onClick={loadRules}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading rules...</div>
            ) : rules.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No custom commission rules configured. The system will use the baseline 10% platform fee.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Rule Name</th>
                      <th className="py-3 px-4">Platform Fee Rate</th>
                      <th className="py-3 px-4">Default Rule</th>
                      <th className="py-3 px-4">Min Amount</th>
                      <th className="py-3 px-4">Max Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rules.map((r) => (
                      <tr key={r._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-bold text-lake-deep">{r.name}</td>
                        <td className="py-3 px-4 font-black text-amber-900 text-sm">
                          {r.rate}%
                        </td>
                        <td className="py-3 px-4">
                          {r.isDefault ? (
                            <Badge variant="primary">Default Rule</Badge>
                          ) : (
                            <span className="text-text-muted text-[11px]">Tiered Rule</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {r.minAmount ? `${r.minAmount.toLocaleString()} ETB` : 'None'}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {r.maxAmount ? `${r.maxAmount.toLocaleString()} ETB` : 'Unlimited'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={r.isActive ? 'success' : 'secondary'}>
                            {r.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(r)}>
                            Edit Rule
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Create / Edit Rule Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingRule ? `Edit Rule: ${editingRule.name}` : 'Configure New Commission Rule'}
          description="Define the percentage fee deducted from gross booking payments upon completion."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Rule Name (Required)
              </label>
              <Input
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Standard Lake Cruise Fee / High-Volume Vendor Tier"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Platform Commission Fee Rate (%) (Required)
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={ruleRate}
                onChange={(e) => setRuleRate(Number(e.target.value))}
                placeholder="10"
              />
              <span className="text-[11px] text-text-muted mt-0.5 block">
                Standard Lake Tana baseline is 10%.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultRule"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-border text-lake-deep"
              />
              <label htmlFor="isDefaultRule" className="text-xs font-medium text-text-primary">
                Make this the platform-wide fallback default rule
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Min Booking Amount (ETB)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Max Booking Amount (ETB)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  placeholder="0 (Unlimited)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveRule} disabled={submitting}>
                {submitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
