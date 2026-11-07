import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { vendorFinanceService } from '@/features/vendors/services/vendorFinanceService'
import { VendorCommission } from '@/features/vendors/types'

export default function VendorCommissionsPage() {
  const [loading, setLoading] = useState(true)
  const [commissions, setCommissions] = useState<VendorCommission[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCommission, setTotalCommission] = useState(0)
  const [totalGross, setTotalGross] = useState(0)

  useEffect(() => {
    async function loadCommissions() {
      try {
        setLoading(true)
        const res = await vendorFinanceService.getCommissions({ page, limit: 15 })
        if (res.success) {
          setCommissions(res.data || [])
          setTotalPages(res.meta?.totalPages || 1)

          // Calculate totals
          const gross = (res.data || []).reduce((acc, c) => acc + (c.grossAmount || 0), 0)
          const fees = (res.data || []).reduce((acc, c) => acc + (c.commissionAmount || 0), 0)
          setTotalGross(gross)
          setTotalCommission(fees)
        }
      } catch (err) {
        console.error('Failed to load commission transactions', err)
      } finally {
        setLoading(false)
      }
    }
    loadCommissions()
  }, [page])

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Commission Reports">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Commission Transparency & Deductions
              </h2>
              <p className="text-sm text-text-secondary">
                Detailed audit trail of platform service fees per booking.
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Gross Bookings (Page)
              </span>
              <p className="text-2xl font-extrabold text-text-primary mt-1">
                {totalGross.toLocaleString()} ETB
              </p>
            </Card>

            <Card className="p-5">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Commission Deducted
              </span>
              <p className="text-2xl font-extrabold text-warning-600 mt-1">
                {totalCommission.toLocaleString()} ETB
              </p>
            </Card>

            <Card className="p-5">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Vendor Net Retained
              </span>
              <p className="text-2xl font-extrabold text-success-600 mt-1">
                {(totalGross - totalCommission).toLocaleString()} ETB
              </p>
            </Card>
          </div>

          {/* Table */}
          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="py-20 text-center text-text-secondary">
                <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading commission records...</p>
              </div>
            ) : commissions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-text-primary">No commission records found.</p>
                <p className="text-xs text-text-muted mt-1">
                  When confirmed guest reservations are processed, commission fees are automatically itemized here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Gross Fare</th>
                      <th className="py-3.5 px-4">Commission %</th>
                      <th className="py-3.5 px-4">Platform Fee</th>
                      <th className="py-3.5 px-4">Vendor Net</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {commissions.map((c) => (
                      <tr key={c._id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-secondary-600">
                          {c.booking?.bookingReference || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-text-primary">
                          {c.grossAmount?.toLocaleString()} ETB
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {c.commissionRate || 10}%
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-warning-600">
                          - {c.commissionAmount?.toLocaleString()} ETB
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-success-600">
                          {c.vendorNetAmount?.toLocaleString()} ETB
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge
                            variant={
                              c.status === 'processed'
                                ? 'success'
                                : c.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {c.status.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Transparency Info */}
          <Card className="p-6 bg-surface-muted/40 border-dashed">
            <h4 className="text-sm font-bold text-text-primary mb-2">
              Where do platform commission fees go?
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              LTTMS reinvests marketplace service fees into Lake Tana Maritime patrol boats, GPS digital mapping of lake routes, international marketing campaigns in Europe, Asia, and North America, and eco-tourism conservation grants for monastery communities.
            </p>
          </Card>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
