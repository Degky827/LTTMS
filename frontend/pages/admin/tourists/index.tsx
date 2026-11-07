import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { adminUserService } from '@/features/admin/services/adminUserService'
import { AdminUser } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminTouristsPage() {
  const { toast } = useToast()
  const [tourists, setTourists] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Status Action Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'suspend' | 'activate' | 'lock'>('suspend')
  const [reason, setReason] = useState('')
  const [submittingStatus, setSubmittingStatus] = useState(false)

  const loadTourists = async () => {
    try {
      setLoading(true)
      const res = await adminUserService.getUsers({
        role: 'tourist',
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setTourists(res.data)
        setTotalPages((res as any).pages || 1)
        setTotalCount((res as any).total || 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load tourist directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTourists()
  }, [search, statusFilter, page])

  const openStatusModal = (user: AdminUser, action: 'suspend' | 'activate' | 'lock') => {
    setSelectedUser(user)
    setActionType(action)
    setReason('')
    setStatusModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedUser) return
    if (actionType === 'suspend' && !reason.trim()) {
      toast.error('A reason is required to suspend an account')
      return
    }

    setSubmittingStatus(true)
    try {
      const payload = {
        isActive: actionType === 'activate' ? true : undefined,
        isSuspended: actionType === 'suspend' ? true : actionType === 'activate' ? false : undefined,
        suspendedReason: actionType === 'suspend' ? reason : undefined,
        lock: actionType === 'lock' ? true : undefined,
      }

      const res = await adminUserService.updateUserStatus(selectedUser._id, payload)
      if (res.success) {
        toast.success(`User ${selectedUser.name} status updated successfully`)
        setStatusModalOpen(false)
        loadTourists()
      } else {
        toast.error(res.message || 'Failed to update user status')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setSubmittingStatus(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Tourist Directory & User Management"
        subtitle="Search, inspect, and manage marketplace travelers and tourist accounts"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search tourists by name or email..."
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
                >
                  <option value="">All Account Statuses</option>
                  <option value="active">Active Accounts</option>
                  <option value="suspended">Suspended Accounts</option>
                  <option value="inactive">Inactive Accounts</option>
                  <option value="locked">Locked Accounts</option>
                </select>
                <Button size="sm" variant="outline" onClick={loadTourists}>
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          {/* Tourists Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                Registered Tourists ({totalCount})
              </span>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading tourists...</div>
            ) : tourists.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No tourist accounts matching filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Tourist Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Email Verified</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tourists.map((t) => (
                      <tr key={t._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/tourists/${t._id}`}
                            className="font-bold text-lake-deep hover:text-lake-teal hover:underline"
                          >
                            {t.name}
                          </Link>
                          {t.phone && <p className="text-[11px] text-text-muted">{t.phone}</p>}
                        </td>
                        <td className="py-3 px-4 text-text-primary font-mono text-[11px]">
                          {t.email}
                        </td>
                        <td className="py-3 px-4">
                          {t.isSuspended ? (
                            <Badge variant="danger">Suspended</Badge>
                          ) : t.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {t.isVerified ? (
                            <span className="text-emerald-600 font-semibold text-[11px]">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="text-text-muted text-[11px]">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/tourists/${t._id}`}>
                              <Button size="sm" variant="outline">
                                View Profile
                              </Button>
                            </Link>
                            {t.isSuspended ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-700 border-emerald-300"
                                onClick={() => openStatusModal(t, 'activate')}
                              >
                                Reactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-700 border-red-200"
                                onClick={() => openStatusModal(t, 'suspend')}
                              >
                                Suspend
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &larr; Previous
                </Button>
                <span className="text-xs text-text-secondary">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next &rarr;
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Account Suspension / Action Modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={
            actionType === 'suspend'
              ? `Suspend Tourist Account: ${selectedUser?.name}`
              : `Reactivate Account: ${selectedUser?.name}`
          }
          description="Administrative account state transition. Applying suspension immediately invalidates all active sessions."
        >
          <div className="space-y-4">
            {actionType === 'suspend' ? (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Reason for Suspension (Required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Repeated fraudulent chargeback claims / Violating community safety rules"
                />
              </div>
            ) : (
              <p className="text-xs text-text-secondary">
                Are you sure you want to restore full platform access for{' '}
                <span className="font-bold text-lake-deep">{selectedUser?.email}</span>?
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusModalOpen(false)}
                disabled={submittingStatus}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant={actionType === 'suspend' ? 'danger' : 'primary'}
                onClick={handleUpdateStatus}
                disabled={submittingStatus}
              >
                {submittingStatus
                  ? 'Saving...'
                  : actionType === 'suspend'
                  ? 'Confirm Suspension'
                  : 'Reactivate Account'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
