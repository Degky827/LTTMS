import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { vendorService } from '@/features/vendors/services/vendorService'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { useToast } from '@/contexts/ToastContext'

export default function VendorSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingPayout, setSavingPayout] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Payout Details State
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'telebirr' | 'cbe_birr'>('bank_transfer')
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia (CBE)')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [payoutPhone, setPayoutPhone] = useState('')

  // Password State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const res = await vendorService.getMyProfile()
        if (res.success && res.data?.payoutDetails) {
          const pd = res.data.payoutDetails
          if (pd.method) setPayoutMethod(pd.method as any)
          if (pd.bankName) setBankName(pd.bankName)
          if (pd.accountNumber) setAccountNumber(pd.accountNumber)
          if (pd.accountName) setAccountName(pd.accountName)
          if (pd.phone) setPayoutPhone(pd.phone)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSavePayoutDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPayout(true)
    try {
      const res = await vendorService.updateMyProfile({
        payoutDetails: {
          method: payoutMethod,
          bankName: payoutMethod === 'bank_transfer' ? bankName : undefined,
          accountNumber: payoutMethod === 'bank_transfer' ? accountNumber : undefined,
          accountName: payoutMethod === 'bank_transfer' ? accountName : undefined,
          phone: payoutMethod !== 'bank_transfer' ? payoutPhone : undefined,
        },
      })
      if (res.success) {
        toast.success('Payout account details updated successfully!')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update payout details.'
      toast.error(msg)
    } finally {
      setSavingPayout(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error('Please enter your current and new password.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      const res = await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      })
      if (res.success) {
        toast.success('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password.'
      toast.error(msg)
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="Business Settings & Payouts">
          <div className="py-20 text-center text-text-secondary">
            <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading settings...</p>
          </div>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Business Settings & Payouts">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Account & Payout Configurations
            </h2>
            <p className="text-sm text-text-secondary">
              Manage your withdrawal destination, security credentials, and preferences.
            </p>
          </div>

          {/* Payout Banking Details */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-primary mb-1">
              Disbursement & Payout Account
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Earnings from completed tourist reservations will be disbursed into this account upon settlement.
            </p>

            <form onSubmit={handleSavePayoutDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Default Payout Method
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Bank Name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  <Input
                    label="Account Number"
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
                    placeholder="Exact name on passbook"
                  />
                </div>
              ) : (
                <Input
                  label="Registered Mobile Wallet Phone Number"
                  required
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                />
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" isLoading={savingPayout}>
                  Save Payout Details
                </Button>
              </div>
            </form>
          </Card>

          {/* Security & Password */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-primary mb-1">
              Security Credentials
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Update your account password to ensure the security of your business workspace.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="outline" isLoading={savingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
