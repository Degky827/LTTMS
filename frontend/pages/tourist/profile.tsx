import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api/client'
import { useToast } from '@/components/feedback/ToastProvider'

export default function TouristProfileSettingsPage() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()

  // Profile Form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    try {
      setSavingProfile(true)
      const res = await apiClient.put<{ success: boolean; data: any; message?: string }>('/auth/me', {
        name: name.trim(),
        phone: phone.trim() || undefined,
      })

      if (res.data) {
        updateUser(res.data)
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your personal information has been saved.',
        })
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      const msg = err?.response?.data?.message || 'Failed to update profile details'
      setProfileError(msg)
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: msg,
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    try {
      setSavingPassword(true)
      await apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      })

      addToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your account password has been updated successfully.',
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error('Failed to change password:', err)
      const msg = err?.response?.data?.message || 'Failed to update password.'
      setPasswordError(msg)
      addToast({
        type: 'error',
        title: 'Password Update Failed',
        message: msg,
      })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>Account & Profile Settings | LTTMS</title>
      </Head>
      <TouristLayout title="Profile Settings">
        <PageHeader
          title="Account & Profile Settings"
          subtitle="Manage your explorer credentials, contact info, and security preferences."
          breadcrumbs={[
            { label: 'Tourist Dashboard', href: '/tourist' },
            { label: 'Profile Settings' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card & Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card bordered className="bg-white">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center mx-auto shadow-inner">
                  {user?.name?.[0]?.toUpperCase() || 'T'}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-text-primary font-heading">
                    {user?.name || 'Tourist Explorer'}
                  </h3>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <Badge variant="primary" size="sm" className="capitalize">
                    {user?.role || 'tourist'}
                  </Badge>
                  <Badge variant="success" size="sm">
                    Verified Account
                  </Badge>
                </div>

                <div className="pt-4 border-t border-surface-border text-left space-y-2 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Account ID:</span>
                    <span className="font-mono">{user?.id?.slice(-8) || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Registered:</span>
                    <span>Lake Tana Biosphere Member</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Security:</span>
                    <span className="text-emerald-600 font-medium">Bcrypt 12 Rounds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Edit Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info Form */}
            <Card bordered className="bg-white">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {profileError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                      {profileError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Phone Number (For Booking SMS Updates)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 91 234 5678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" disabled={savingProfile}>
                      {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Form */}
            <Card bordered className="bg-white">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        New Password (Min 8 characters) *
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="outline" disabled={savingPassword}>
                      {savingPassword ? 'Updating Password...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </TouristLayout>
    </ProtectedRoute>
  )
}
