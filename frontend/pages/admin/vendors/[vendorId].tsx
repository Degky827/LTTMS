import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { adminVendorService } from '@/features/admin/services/adminVendorService'
import { AdminVendor } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminVendorDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { vendorId } = router.query as { vendorId: string }

  const [vendorData, setVendorData] = useState<{
    vendor: AdminVendor
    services: any[]
    bookings: any[]
    totalRevenue: number
    avgRating: number
    totalBookings: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Status Action Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<any>('approved')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadVendor = async () => {
    if (!vendorId) return
    try {
      setLoading(true)
      const res = await adminVendorService.getVendorDetail(vendorId)
      if (res.success && res.data) {
        setVendorData(res.data)
      } else {
        toast.error('Vendor details not found')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load vendor dossier')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendor()
  }, [vendorId])

  const openStatusChangeModal = (st: any) => {
    setTargetStatus(st)
    setReason('')
    setStatusModalOpen(true)
  }

  const handleUpdateVendorStatus = async () => {
    if (!vendorId) return
    if ((targetStatus === 'rejected' || targetStatus === 'suspended') && !reason.trim()) {
      toast.error('Reason is required for rejection or suspension')
      return
    }

    setSubmitting(true)
    try {
      const res = await adminVendorService.updateVendorStatus(vendorId, {
        status: targetStatus,
        reason,
      })
      if (res.success) {
        toast.success(`Vendor status changed to ${targetStatus}`)
        setStatusModalOpen(false)
        loadVendor()
      } else {
        toast.error(res.message || 'Status update failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEco = async () => {
    if (!vendorData) return
    try {
      const nextVal = !vendorData.vendor.ecoCertification
      const res = await adminVendorService.verifyEcoBadge(vendorId, nextVal)
      if (res.success) {
        toast.success(nextVal ? 'Eco-badge verified on vendor' : 'Eco-badge removed')
        loadVendor()
      }
    } catch (err: any) {
      toast.error('Failed to update eco-certification status')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Vendor Business Dossier"
        subtitle={`Business verification & performance file for ID: ${vendorId || ''}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/vendors">
              <Button size="sm" variant="outline">
                &larr; Back to Vendors
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading vendor dossier...</div>
          ) : !vendorData ? (
            <Card className="p-8 text-center text-xs text-text-secondary">Vendor not found.</Card>
          ) : (
            <>
              {/* Header Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="p-6 md:col-span-2 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-lake-deep">{vendorData.vendor.businessName}</h2>
                      <p className="text-xs text-text-secondary">
                        Owner: <span className="font-semibold text-text-primary">{vendorData.vendor.user?.name}</span> ({vendorData.vendor.user?.email})
                      </p>
                      {vendorData.vendor.location && typeof vendorData.vendor.location === 'string' && (
                        <p className="text-xs text-text-muted mt-1">📍 {vendorData.vendor.location}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          vendorData.vendor.status === 'approved'
                            ? 'success'
                            : vendorData.vendor.status === 'pending'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {vendorData.vendor.status}
                      </Badge>
                      {vendorData.vendor.ecoCertification && (
                        <Badge variant="primary">🌿 Eco-Certified</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-border text-xs">
                    <div>
                      <span className="text-text-muted block text-[11px]">Primary Phone</span>
                      <span className="font-semibold text-text-primary">
                        {vendorData.vendor.contactPhone || vendorData.vendor.user?.phone || 'Not provided'}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Average Rating</span>
                      <span className="font-semibold text-amber-600">
                        ⭐ {vendorData.avgRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Published Tours</span>
                      <span className="font-semibold text-lake-deep">{vendorData.services.length}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[11px]">Member Since</span>
                      <span className="font-semibold text-text-primary">
                        {new Date(vendorData.vendor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Administrative Action Buttons */}
                  <div className="pt-3 border-t border-border flex flex-wrap gap-2">
                    {vendorData.vendor.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openStatusChangeModal('approved')}
                      >
                        Approve Vendor
                      </Button>
                    )}
                    {vendorData.vendor.status !== 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-700 border-red-300"
                        onClick={() => openStatusChangeModal('suspended')}
                      >
                        Suspend Business
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={handleToggleEco}>
                      {vendorData.vendor.ecoCertification ? 'Revoke Eco-Badge' : 'Award Eco-Badge'}
                    </Button>
                  </div>
                </Card>

                {/* Financial KPI Card */}
                <Card className="p-6 flex flex-col justify-between bg-lake-deep text-white">
                  <div>
                    <span className="text-[10px] font-bold text-amber-warm uppercase tracking-widest block">
                      Vendor Performance
                    </span>
                    <h3 className="text-3xl font-black mt-2 text-white">
                      {vendorData.totalRevenue.toLocaleString()} ETB
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">Total verified gross bookings volume</p>
                  </div>

                  <div className="pt-4 border-t border-lake-teal/40 space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Total Reservations:</span>
                      <span className="font-bold text-white">{vendorData.totalBookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Offerings:</span>
                      <span className="font-bold text-white">{vendorData.services.length}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* KYC Compliance Documents */}
              <Card className="p-5">
                <h3 className="text-sm font-bold text-lake-deep mb-3">Submitted Verification Documents</h3>
                {!vendorData.vendor.documents || vendorData.vendor.documents.length === 0 ? (
                  <p className="text-xs text-text-muted">No uploaded documents on record.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {vendorData.vendor.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border bg-surface-elevated">
                        <p className="text-xs font-bold text-lake-deep">{doc.name || doc.type}</p>
                        <span className="text-[10px] text-text-muted uppercase font-mono block mb-2">
                          {doc.type}
                        </span>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-lake-teal hover:underline"
                          >
                            View Document ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Offered Tourism Services */}
              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-bold text-lake-deep">
                    Tourism Listings ({vendorData.services.length})
                  </h3>
                </div>
                {vendorData.services.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted">No tourism services registered.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] border-b border-border">
                        <tr>
                          <th className="py-2.5 px-4">Service Title</th>
                          <th className="py-2.5 px-4">Price (ETB)</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {vendorData.services.map((svc) => (
                          <tr key={svc._id}>
                            <td className="py-2.5 px-4 font-semibold text-lake-deep">{svc.title}</td>
                            <td className="py-2.5 px-4 font-bold">{svc.price?.toLocaleString()} ETB</td>
                            <td className="py-2.5 px-4">
                              <Badge variant={svc.isActive ? 'success' : 'secondary'}>
                                {svc.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <Link href={`/admin/services/${svc._id}`}>
                                <Button size="sm" variant="outline">
                                  Inspect &rarr;
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
            </>
          )}
        </div>

        {/* Status Confirmation Modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title={`Update Vendor Status: ${targetStatus}`}
          description="Administrative business state change."
        >
          <div className="space-y-4">
            {(targetStatus === 'suspended' || targetStatus === 'rejected') && (
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Reason for {targetStatus} (Required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary focus:ring-1 focus:ring-red-500"
                  placeholder="Record explanation for this business status change..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setStatusModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleUpdateVendorStatus} disabled={submitting}>
                {submitting ? 'Updating...' : 'Confirm Change'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
