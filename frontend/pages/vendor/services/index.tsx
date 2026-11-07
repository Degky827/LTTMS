import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { vendorService } from '@/features/vendors/services/vendorService'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import { Service } from '@/features/services/types'
import { Vendor } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorServicesListPage() {
  const { toast } = useToast()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const profileRes = await vendorService.getMyProfile()
      if (profileRes.success && profileRes.data) {
        setVendor(profileRes.data)
        const sRes = await vendorServiceManagement.getMyServices(profileRes.data._id, {
          status: statusFilter,
        })
        if (sRes.success) {
          setServices(sRes.data || [])
        }
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const handleTogglePublish = async (service: Service) => {
    try {
      if (service.status === 'published') {
        await vendorServiceManagement.archiveService(service._id)
        toast.success(`Service "${service.title}" has been archived.`)
      } else {
        await vendorServiceManagement.publishService(service._id)
        toast.success(`Service "${service.title}" is now published and bookable.`)
      }
      loadData()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Action failed.'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!serviceToDelete) return
    setDeleting(true)
    try {
      await vendorServiceManagement.deleteService(serviceToDelete._id)
      toast.success('Service deleted successfully.')
      setDeleteModalOpen(false)
      setServiceToDelete(null)
      loadData()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete service.'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(search.toLowerCase()))
  )

  const isVerified = vendor?.verificationStatus === 'approved'

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Services & Tours Catalog">
        <div className="space-y-6">
          {/* Unverified Vendor Notice */}
          {!isVerified && (
            <div className="p-4 rounded-xl bg-warning-50 border border-warning-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-warning-800">
                    Business Verification Pending
                  </h4>
                  <p className="text-xs text-warning-700 mt-0.5">
                    You can create draft services, but they will not be published to the public marketplace until your KYC documents are approved.
                  </p>
                </div>
              </div>
              <Link href="/vendor/verification">
                <Button variant="outline" size="sm" className="shrink-0 bg-white">
                  Check Verification
                </Button>
              </Link>
            </div>
          )}

          {/* Header & Create Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Tourism Offerings</h2>
              <p className="text-sm text-text-secondary">
                Manage your boat tours, monastery excursions, guided nature walks, and lodge accommodations.
              </p>
            </div>
            <Link href="/vendor/services/new">
              <Button variant="primary">
                + Create New Service
              </Button>
            </Link>
          </div>

          {/* Filter Bar */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg">
                {[
                  { id: 'all', label: 'All Services' },
                  { id: 'published', label: 'Published' },
                  { id: 'draft', label: 'Draft' },
                  { id: 'archived', label: 'Archived' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-surface-elevated text-text-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Service Cards / Table */}
          {loading ? (
            <div className="py-16 text-center text-text-secondary">
              <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Loading catalog...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary">No Services Found</h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto mt-1 mb-6">
                {search
                  ? `No offerings match "${search}". Try clearing your search.`
                  : 'You haven’t created any tourism services in this category yet.'}
              </p>
              <Link href="/vendor/services/new">
                <Button variant="primary">
                  Create First Service Listing
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service._id} className="overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Image Thumbnail */}
                    <div className="relative h-44 bg-surface-muted overflow-hidden">
                      {service.coverImage || (service.images && service.images[0]?.url) ? (
                        <img
                          src={service.coverImage || service.images![0].url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                          No Preview Image
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={
                            service.status === 'published'
                              ? 'success'
                              : service.status === 'draft'
                              ? 'default'
                              : 'warning'
                          }
                        >
                          {service.status.toUpperCase()}
                        </Badge>
                      </div>
                      {service.ecoFriendly && (
                        <div className="absolute top-3 left-3">
                          <span className="py-1 px-2 rounded-md bg-secondary-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                            🌿 Eco-Certified
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                        <span className="capitalize">{service.category?.replace('_', ' ') || 'Tour'}</span>
                        <span>{service.duration || 'Flexible'}</span>
                      </div>
                      <h3 className="text-base font-bold text-text-primary line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{service.location || 'Lake Tana'}</span>
                      </p>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-text-muted block">Base Price</span>
                          <span className="text-base font-extrabold text-primary-950">
                            {service.price?.toLocaleString()} {service.currency || 'ETB'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-text-muted block">Rating</span>
                          <span className="text-xs font-semibold text-text-primary">
                            ★ {service.rating ? service.rating.toFixed(1) : '5.0'} ({service.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Link href={`/vendor/services/${service._id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/vendor/availability?service=${service._id}`}>
                        <Button variant="ghost" size="sm" title="Manage Schedule & Slots">
                          Schedule
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(service)}
                        title={service.status === 'published' ? 'Archive Service' : 'Publish Service'}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted"
                      >
                        {service.status === 'published' ? (
                          <svg className="w-4 h-4 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setServiceToDelete(service)
                          setDeleteModalOpen(true)
                        }}
                        title="Delete Service"
                        className="p-1.5 rounded-lg text-danger-500 hover:text-danger-700 hover:bg-danger-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            title="Delete Tourism Service"
          >
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Are you sure you want to delete <span className="font-bold text-text-primary">"{serviceToDelete?.title}"</span>?
                This action will permanently unlist the tour from Lake Tana search and remove all availability slots.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={deleting}
                >
                  Delete Service
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
