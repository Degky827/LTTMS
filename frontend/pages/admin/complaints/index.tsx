import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminSupportService } from '@/features/admin/services/adminSupportService'
import { AdminSupportTicket } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminComplaintsPage() {
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<AdminSupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const res = await adminSupportService.getTickets({
        category: 'complaint',
        status: statusFilter || undefined,
        limit: 50,
      })
      if (res.success && res.data) {
        setComplaints(res.data)
      }
    } catch (err: any) {
      toast.error('Failed to load complaint records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [statusFilter])

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform Complaints & Grievance Investigation"
        subtitle="Customer disputes, vessel safety complaints, and vendor conduct investigations"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Complaints</option>
                <option value="open">Open Complaints</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/support">
                <Button size="sm" variant="outline">
                  Full Support Desk &rarr;
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={loadComplaints}>
                Refresh
              </Button>
            </div>
          </Card>

          {/* Complaints Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                Filed Grievances ({complaints.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading grievances...</div>
            ) : complaints.length === 0 ? (
              <Card className="p-12 text-center space-y-2 border-0 shadow-none">
                <div className="text-3xl">🕊️</div>
                <h4 className="text-sm font-bold text-lake-deep">No Open Grievances Found</h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  There are currently no customer safety grievances or vendor disputes under investigation.
                </p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Ticket Ref</th>
                      <th className="py-3 px-4">Complainant</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assigned Agent</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {complaints.map((c) => (
                      <tr key={c._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                          <Link href={`/admin/support/${c._id}`} className="hover:underline">
                            {c.ticketNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">{c.user?.name || '—'}</p>
                          <p className="text-[11px] text-text-muted font-mono">{c.user?.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4 font-medium text-text-primary max-w-[200px] truncate" title={c.subject}>
                          {c.subject}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              c.priority === 'urgent' || c.priority === 'high' ? 'danger' : 'secondary'
                            }
                          >
                            {c.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {c.assignedTo?.name ? (
                            <span className="font-semibold text-lake-deep">{c.assignedTo.name}</span>
                          ) : (
                            <span className="text-text-muted italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              c.status === 'resolved' || c.status === 'closed'
                                ? 'success'
                                : c.status === 'in_progress'
                                ? 'primary'
                                : 'warning'
                            }
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/support/${c._id}`}>
                            <Button size="sm" variant="outline">
                              Investigate &rarr;
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
