import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminServiceModeration } from '@/features/admin/services/adminServiceModeration'
import { AdminService } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminServicesCatalogPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadServices = async () => {
    try {
      setLoading(true)
      const res = await adminServiceModeration.getServices({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        limit: 50,
      })
      if (res.success && res.data) {
        setServices(res.data)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [search, statusFilter])

  const handleToggleFeature = async (id: string) => {
    try {
      const res = await adminServiceModeration.featureService(id)
      if (res.success) {
        toast.success('Featured status updated')
        loadServices()
      }
    } catch (err) {
      toast.error('Failed to toggle featured status')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Tourism Services Catalog"
        subtitle="Full inventory of boat tours, monastery excursions, and eco-lodges on Lake Tana"
      >
        <div className="space-y-5">
          {/* Controls Bar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services by title..."
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary"
              >
                <option value="">All Services</option>
                <option value="active">Active & Published</option>
                <option value="draft">Drafts</option>
                <option value="pending">Pending Moderation</option>
                <option value="archived">Archived</option>
              </select>
              <Link href="/admin/services/moderation">
                <Button size="sm" variant="warning">
                  Pending Approvals Queue &rarr;
                </Button>
              </Link>
            </div>
          </Card>

          {/* Services Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-lake-deep">
                All Tourism Offerings ({services.length})
              </span>
              <Button size="sm" variant="outline" onClick={loadServices}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-text-muted">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary">
                No tourism services found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Rate (ETB)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {services.map((svc) => (
                      <tr key={svc._id} className="hover:bg-surface-elevated transition-colors">
                        <td className="py-3 px-4 font-bold text-lake-deep">
                          <Link href={`/admin/services/${svc._id}`} className="hover:underline">
                            {svc.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {svc.vendor?.businessName || '—'}
                        </td>
                        <td className="py-3 px-4 text-text-muted">{svc.category?.name || 'General'}</td>
                        <td className="py-3 px-4 text-text-muted">{svc.destination?.name || 'Lake Tana'}</td>
                        <td className="py-3 px-4 font-bold text-lake-deep">
                          {svc.price?.toLocaleString()} ETB
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={svc.isActive ? 'success' : 'secondary'}>
                            {svc.isActive ? 'Active' : 'Draft / Off'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleFeature(svc._id)}
                            className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                              svc.featured
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {svc.featured ? '⭐ Featured' : 'Standard'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/services/${svc._id}`}>
                            <Button size="sm" variant="outline">
                              View &rarr;
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
