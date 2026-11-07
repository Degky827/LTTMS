import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminDashboardService } from '@/features/admin/services/adminDashboardService'
import { AuditLogEntry } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminAuditLogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')

  const loadLogs = async () => {
    try {
      setLoading(true)
      const res = await adminDashboardService.getRecentActivity()
      if (res.success && res.data) {
        setLogs(res.data)
      }
    } catch (err: any) {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = filterAction
    ? logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()))
    : logs

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Immutable Audit Activity Logs"
        subtitle="Forensic audit trail of administrative interventions, KYC approvals, and role elevations"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Filter by Action:</span>
              <input
                type="text"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                placeholder="e.g. vendor.status.update, user.role.assign..."
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary w-64"
              />
            </div>
            <Button size="sm" variant="outline" onClick={loadLogs}>
              Refresh Logs
            </Button>
          </Card>

          {/* Audit Logs Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-lake-deep">
                System Event Entries ({filteredLogs.length})
              </h3>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading audit entries...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No audit entries recorded matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Details / Payload</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-lake-deep">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 font-medium text-text-primary">
                          {log.actor?.name || 'Automated Engine'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{log.actor?.role || 'system'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-text-secondary font-mono text-[11px]">
                          {log.targetEntity ? `${log.targetEntity} (${log.targetId?.slice(-6) || ''})` : '—'}
                        </td>
                        <td className="py-3 px-4 text-text-muted font-mono text-[11px] max-w-[200px] truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right text-text-muted">
                          {new Date(log.timestamp).toLocaleString()}
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
