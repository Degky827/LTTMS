import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { adminUserService } from '@/features/admin/services/adminUserService'
import { adminSupportService } from '@/features/admin/services/adminSupportService'
import { AdminUser, AdminSupportTicket } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminSupportAgentsPage() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<AdminUser[]>([])
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  // Add Agent Modal State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [searchingUser, setSearchingUser] = useState(false)
  const [foundUser, setFoundUser] = useState<AdminUser | null>(null)
  const [submittingRole, setSubmittingRole] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [uRes, tRes] = await Promise.allSettled([
        adminUserService.getUsers({ role: 'support', limit: 50 }),
        adminSupportService.getTickets({ limit: 100 }),
      ])

      if (uRes.status === 'fulfilled' && uRes.value.success && uRes.value.data) {
        setAgents(uRes.value.data)
      }
      if (tRes.status === 'fulfilled' && tRes.value.success && tRes.value.data) {
        setTickets(tRes.value.data)
      }
    } catch (err: any) {
      toast.error('Failed to load support agent team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearchUser = async () => {
    if (!userEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setSearchingUser(true)
    setFoundUser(null)
    try {
      const res = await adminUserService.getUsers({ search: userEmail.trim(), limit: 1 })
      if (res.success && res.data && res.data.length > 0) {
        setFoundUser(res.data[0])
      } else {
        toast.error('No registered user found with that email')
      }
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setSearchingUser(false)
    }
  }

  const handlePromoteToSupport = async () => {
    if (!foundUser) return
    setSubmittingRole(true)
    try {
      const res = await adminUserService.assignRole(foundUser._id, { role: 'support' })
      if (res.success) {
        toast.success(`User ${foundUser.name} appointed to Support Staff!`)
        setAddModalOpen(false)
        setFoundUser(null)
        setUserEmail('')
        loadData()
      } else {
        toast.error(res.message || 'Promotion failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to appoint agent')
    } finally {
      setSubmittingRole(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Support Staff & Help Desk Team"
        subtitle="Manage customer care agents, ticket load balancing, and agent privileges"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/support">
              <Button size="sm" variant="outline">
                &larr; Back to Tickets
              </Button>
            </Link>
            <Button size="sm" variant="primary" onClick={() => setAddModalOpen(true)}>
              + Appoint Support Agent
            </Button>
          </div>

          {/* Agents Roster */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                Active Support Staff ({agents.length})
              </h3>
              <Button size="sm" variant="outline" onClick={loadData}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading team roster...</div>
            ) : agents.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No users assigned to the support role. Appoint an agent to begin delegating tickets.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Assigned Tickets</th>
                      <th className="py-3 px-4">Appointed On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {agents.map((ag) => {
                      const load = tickets.filter(
                        (t) =>
                          t.assignedTo?._id === ag._id &&
                          t.status !== 'resolved' &&
                          t.status !== 'closed'
                      ).length

                      return (
                        <tr key={ag._id} className="hover:bg-surface-elevated transition-colors">
                          <td className="py-3 px-4 font-bold text-lake-deep">{ag.name}</td>
                          <td className="py-3 px-4 font-mono text-text-primary">{ag.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant={ag.isActive ? 'success' : 'secondary'}>
                              {ag.isActive ? 'Active Staff' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-bold text-lake-deep">
                            {load > 0 ? (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">
                                {load} open ticket(s)
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-normal">Available (0)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-text-muted">
                            {new Date(ag.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Appoint Agent Modal */}
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Appoint New Support Agent"
          description="Promote an existing registered user to the Support role. They will receive access strictly to customer tickets and internal staff notes."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                User Email Address
              </label>
              <div className="flex gap-2">
                <Input
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. agent@laketana.com"
                />
                <Button size="sm" variant="outline" onClick={handleSearchUser} disabled={searchingUser}>
                  {searchingUser ? 'Searching...' : 'Find User'}
                </Button>
              </div>
            </div>

            {foundUser && (
              <div className="p-3.5 rounded-lg border border-lake-teal/40 bg-lake-deep/5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lake-deep">{foundUser.name}</span>
                  <Badge variant="secondary">Current Role: {foundUser.role}</Badge>
                </div>
                <p className="text-text-muted font-mono">{foundUser.email}</p>
                <div className="pt-2 border-t border-border flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handlePromoteToSupport}
                    disabled={submittingRole}
                  >
                    {submittingRole ? 'Promoting...' : 'Promote to Support Staff'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
