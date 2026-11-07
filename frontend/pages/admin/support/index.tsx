import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { adminSupportService } from '@/features/admin/services/adminSupportService'
import { adminUserService } from '@/features/admin/services/adminUserService'
import { AdminSupportTicket, AdminUser } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminSupportTicketsPage() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([])
  const [supportAgents, setSupportAgents] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Assign Modal State
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignedAgentId, setAssignedAgentId] = useState('')
  const [submittingAssign, setSubmittingAssign] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [tRes, uRes] = await Promise.allSettled([
        adminSupportService.getTickets({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          limit: 50,
        }),
        adminUserService.getUsers({ role: 'support', limit: 50 }),
      ])

      if (tRes.status === 'fulfilled' && tRes.value.success && tRes.value.data) {
        setTickets(tRes.value.data)
      }
      if (uRes.status === 'fulfilled' && uRes.value.success && uRes.value.data) {
        setSupportAgents(uRes.value.data)
      }
    } catch (err: any) {
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, statusFilter, priorityFilter])

  const openAssignModal = (ticket: AdminSupportTicket) => {
    setSelectedTicket(ticket)
    setAssignedAgentId(ticket.assignedTo?._id || '')
    setAssignModalOpen(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedTicket || !assignedAgentId) {
      toast.error('Please select an agent to assign')
      return
    }

    setSubmittingAssign(true)
    try {
      const res = await adminSupportService.assignTicket(selectedTicket._id, assignedAgentId)
      if (res.success) {
        toast.success('Ticket assigned successfully')
        setAssignModalOpen(false)
        loadData()
      } else {
        toast.error(res.message || 'Assignment failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to assign')
    } finally {
      setSubmittingAssign(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'support']}>
      <AdminLayout
        title="Customer Support & Help Desk"
        subtitle="Manage inquiries, technical assistance tickets, and customer inquiries across the marketplace"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets by ticket number or subject..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <Link href="/admin/support-agents">
                <Button size="sm" variant="outline">
                  Staff Team &rarr;
                </Button>
              </Link>
            </div>
          </Card>

          {/* Tickets Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                Support Tickets ({tickets.length})
              </h3>
              <Button size="sm" variant="outline" onClick={loadData}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No support tickets found matching current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Ticket Number</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assigned To</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tickets.map((t) => (
                      <tr key={t._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                          <Link href={`/admin/support/${t._id}`} className="hover:underline">
                            {t.ticketNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-medium text-text-primary max-w-[200px] truncate" title={t.subject}>
                          {t.subject}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          <p className="font-semibold text-text-primary">{t.user?.name || 'User'}</p>
                          <span className="text-[10px] text-text-muted">{t.user?.role}</span>
                        </td>
                        <td className="py-3 px-4 capitalize text-text-muted">{t.category}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              t.priority === 'urgent' || t.priority === 'high' ? 'danger' : 'secondary'
                            }
                          >
                            {t.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {t.assignedTo ? (
                            <span className="font-semibold text-lake-deep">{t.assignedTo.name}</span>
                          ) : (
                            <button
                              onClick={() => openAssignModal(t)}
                              className="text-lake-teal font-semibold hover:underline"
                            >
                              + Assign Staff
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              t.status === 'resolved' || t.status === 'closed'
                                ? 'success'
                                : t.status === 'in_progress'
                                ? 'primary'
                                : 'warning'
                            }
                          >
                            {t.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => openAssignModal(t)}>
                              Assign
                            </Button>
                            <Link href={`/admin/support/${t._id}`}>
                              <Button size="sm" variant="outline">
                                Open &rarr;
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Assign Modal */}
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Ticket: ${selectedTicket?.ticketNumber}`}
          description="Delegate this inquiry to a specialized customer support staff member."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Select Support Agent (Required)
              </label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary"
              >
                <option value="">Select an agent from roster...</option>
                {supportAgents.map((ag) => (
                  <option key={ag._id} value={ag._id}>
                    {ag.name} ({ag.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setAssignModalOpen(false)} disabled={submittingAssign}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmAssign} disabled={submittingAssign}>
                {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
