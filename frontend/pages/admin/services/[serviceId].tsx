import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { adminServiceModeration } from '@/features/admin/services/adminServiceModeration'
import { Service } from '@/features/services/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminServiceDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { serviceId } = router.query as { serviceId: string }

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  const loadService = async () => {
    if (!serviceId) return
    try {
      setLoading(true)
      const res = await marketplaceService.getByIdOrSlug(serviceId)
      if (res.success && res.data) {
        setService(res.data)
      } else {
        toast.error('Service listing not found')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadService()
  }, [serviceId])

  const handleApprove = async () => {
    if (!service) return
    try {
      const res = await adminServiceModeration.approveService(service._id)
      if (res.success) {
        toast.success('Listing approved and published!')
        loadService()
      }
    } catch (err) {
      toast.error('Approval failed')
    }
  }

  const handleFeature = async () => {
    if (!service) return
    try {
      const res = await adminServiceModeration.featureService(service._id)
      if (res.success) {
        toast.success('Featured status updated')
        loadService()
      }
    } catch (err) {
      toast.error('Failed to toggle featured status')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Tourism Service Dossier"
        subtitle={`Inspection file for listing ID: ${serviceId || ''}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/services">
              <Button size="sm" variant="outline">
                &larr; Back to Catalog
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleFeature}>
                {service?.isFeatured ? 'Revoke Feature Badge' : '⭐ Make Featured'}
              </Button>
              {service && service.status !== 'published' && (
                <Button size="sm" variant="primary" onClick={handleApprove}>
                  Approve Listing
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading listing details...</div>
          ) : !service ? (
            <Card className="p-8 text-center text-xs text-text-secondary">Service not found.</Card>
          ) : (
            <div className="space-y-6">
              {/* Header Overview Card */}
              <Card className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-lake-deep">{service.title}</h2>
                      <Badge variant={service.status === 'published' ? 'success' : 'secondary'}>
                        {service.status === 'published' ? 'Published' : 'Draft / Moderation'}
                      </Badge>
                      {service.isFeatured && <Badge variant="warning">⭐ Featured</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary">
                      Offered by{' '}
                      <span className="font-semibold text-text-primary">
                        {service.vendor?.businessName || 'Tourism Vendor'}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-lake-deep block">
                      {service.price?.toLocaleString()} {service.currency || 'ETB'}
                    </span>
                    <span className="text-xs text-text-muted">Standard rate per guest</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-xs">
                  <div>
                    <span className="text-text-muted block text-[11px]">Category</span>
                    <span className="font-semibold text-text-primary">
                      {service.categoryRef?.name || (typeof service.category === 'object' ? (service.category as any)?.name : service.category) || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Destination</span>
                    <span className="font-semibold text-text-primary">
                      {service.destination?.name || 'Lake Tana'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Max Capacity</span>
                    <span className="font-semibold text-text-primary">
                      {(service as any).maxBookingCapacity || (service as any).maxCapacity ? `${(service as any).maxBookingCapacity || (service as any).maxCapacity} Guests` : 'Flexible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[11px]">Duration</span>
                    <span className="font-semibold text-text-primary">{service.duration || 'Flexible'}</span>
                  </div>
                </div>
              </Card>

              {/* Description & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-lake-deep">Service Overview & Itinerary</h3>
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </Card>

                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-bold text-lake-deep">Inclusions & Guidelines</h3>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 block mb-1.5">✓ Included:</span>
                    {service.included && service.included.length > 0 ? (
                      <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1">
                        {service.included.map((inc, i) => (
                          <li key={i}>{inc}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-text-muted">No explicit inclusions noted.</span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-red-800 block mb-1.5">✗ Excluded:</span>
                    {service.excluded && service.excluded.length > 0 ? (
                      <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1">
                        {service.excluded.map((exc, i) => (
                          <li key={i}>{exc}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-text-muted">Standard terms apply.</span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Gallery Photos */}
              <Card className="p-5">
                <h3 className="text-sm font-bold text-lake-deep mb-3">Submitted Gallery Photos</h3>
                {!service.images || service.images.length === 0 ? (
                  <p className="text-xs text-text-muted">No images provided for this listing.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {service.images.map((img, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden border border-border bg-gray-100">
                        <img
                          src={img.url}
                          alt={img.caption || service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
