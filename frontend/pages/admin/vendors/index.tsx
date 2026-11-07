import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminVendorService } from '@/features/admin/services/adminVendorService'
import { AdminVendor } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminVendorsPage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const loadVendors = async () => {
    try {
      setLoading(true)
      const res = await adminVendorService.getVendors({
        status: statusFilter || undefined,
        page,
        limit: 15,
      })

      if (res.success && res.data) {
        setVendors(res.data)
        setTotalPages((res as any).pages || 1)
        setTotalCount((res as any).total || 0)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendors()
  }, [statusFilter, page])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'suspended':
        return <Badge variant="danger">Suspended</Badge>
      case 'blacklisted':
        return <Badge variant="danger">Blacklisted</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Vendors Directory & Compliance"
        subtitle="Manage tourism operators, boat captains, eco-lodges, and monastery guides around Lake Tana"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Filter by Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Vendors</option>
                <option value="pending">Pending Verification</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/vendors/verification">
                <Button size="sm" variant="warning">
                  KYC Verification Queue &rarr;
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={loadVendors}>
                Refresh
              </Button>
            </div>
          </Card>

          {/* Vendors Roster Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                Registered Tourism Businesses ({totalCount})
              </span>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading vendor directory...</div>
            ) : vendors.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No vendors found matching the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Business Name</th>
                      <th className="py-3 px-4">Authorized Contact</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Eco-Certified</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {vendors.map((v) => (
                      <tr key={v._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/vendors/${v._id}`}
                            className="font-bold text-lake-deep hover:text-lake-teal hover:underline text-xs"
                          >
                            {v.businessName}
                          </Link>
                          {v.location && typeof v.location === 'string' && (
                            <p className="text-[11px] text-text-muted">{v.location}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-text-primary">{v.user?.name || '—'}</p>
                          <p className="text-[11px] text-text-muted font-mono">{v.user?.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(v.status)}</td>
                        <td className="py-3 px-4">
                          {v.ecoCertification ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                              🌿 Biosphere Certified
                            </span>
                          ) : (
                            <span className="text-text-muted text-[11px]">Standard Tier</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/vendors/${v._id}`}>
                              <Button size="sm" variant="outline">
                                View Profile
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
      </AdminLayout>
    </ProtectedRoute>
  )
}
