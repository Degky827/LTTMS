import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { adminUserService } from '@/features/admin/services/adminUserService'
import { AdminUser } from '@/features/admin/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export default function AdminSystemUsersPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Role Assignment Modal State (Super Admin Only)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [targetRole, setTargetRole] = useState<'tourist' | 'vendor' | 'support' | 'admin' | 'super_admin'>('tourist')
  const [submittingRole, setSubmittingRole] = useState(false)

  const isSuperAdmin = currentUser?.role === 'super_admin'

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await adminUserService.getUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setUsers(res.data)
        setTotalPages((res as any).pages || 1)
        setTotalCount((res as any).total || 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load system users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [roleFilter, statusFilter, search, page])

  const openRoleModal = (u: AdminUser) => {
    setSelectedUser(u)
    setTargetRole(u.role)
    setRoleModalOpen(true)
  }

  const handleAssignRole = async () => {
    if (!selectedUser) return
    setSubmittingRole(true)
    try {
      const res = await adminUserService.assignRole(selectedUser._id, { role: targetRole })
      if (res.success) {
        toast.success(`User ${selectedUser.name} role changed to ${targetRole}. All active sessions invalidated.`)
        setRoleModalOpen(false)
        loadUsers()
      } else {
        toast.error(res.message || 'Failed to assign role')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Permission denied')
    } finally {
      setSubmittingRole(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform Users & Identity Management"
        subtitle="Manage all user identities, account states, and role-based permissions"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search users by name or email..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Roles</option>
                <option value="tourist">Tourists</option>
                <option value="vendor">Vendors</option>
                <option value="support">Support Agents</option>
                <option value="admin">Administrators</option>
                <option value="super_admin">Super Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>

              <Button size="sm" variant="outline" onClick={loadUsers}>
                Refresh
              </Button>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                System Accounts ({totalCount})
              </span>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading user accounts...</div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No user accounts found matching filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Verified</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-bold text-lake-deep">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-text-primary">{u.email}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              u.role === 'super_admin'
                                ? 'danger'
                                : u.role === 'admin'
                                ? 'primary'
                                : u.role === 'vendor'
                                ? 'warning'
                                : 'secondary'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {u.isSuspended ? (
                            <Badge variant="danger">Suspended</Badge>
                          ) : u.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {u.isVerified ? (
                            <span className="text-emerald-600 font-semibold text-[11px]">✓ Yes</span>
                          ) : (
                            <span className="text-text-muted text-[11px]">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isSuperAdmin && (
                            <Button size="sm" variant="outline" onClick={() => openRoleModal(u)}>
                              Assign Role
                            </Button>
                          )}
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

        {/* Role Assignment Modal */}
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title={`Assign Platform Role: ${selectedUser?.name}`}
          description="Super Administrator privilege elevation. Changing a user's role immediately invalidates all active sessions."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Select Platform Role (Required)
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary font-semibold"
              >
                <option value="tourist">Tourist (Standard Marketplace User)</option>
                <option value="vendor">Vendor (Tourism Operator / Boat Captain)</option>
                <option value="support">Support Agent (Help Desk Staff)</option>
                <option value="admin">Administrator (Full Operational Access)</option>
                <option value="super_admin">Super Administrator (Platform Root)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Security Notice:</p>
              <p>• Only active Super Administrators can assign `admin` or `super_admin` roles.</p>
              <p>• All JWT refresh tokens belonging to {selectedUser?.email} will be immediately revoked.</p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setRoleModalOpen(false)} disabled={submittingRole}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleAssignRole} disabled={submittingRole}>
                {submittingRole ? 'Assigning...' : 'Confirm Role Elevation'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
