import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { useToast } from '@/contexts/ToastContext'
import { AdminApiResponse } from '@/features/admin/types'

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [destinations, setDestinations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [submittingCat, setSubmittingCat] = useState(false)

  // Destination Modal State
  const [destModalOpen, setDestModalOpen] = useState(false)
  const [newDestName, setNewDestName] = useState('')
  const [newDestRegion, setNewDestRegion] = useState('Lake Tana Basin')
  const [newDestDesc, setNewDestDesc] = useState('')
  const [submittingDest, setSubmittingDest] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [catRes, destRes] = await Promise.allSettled([
        apiClient.get<AdminApiResponse<any[]>>(API_ENDPOINTS.CATEGORIES.LIST),
        apiClient.get<AdminApiResponse<any[]>>(API_ENDPOINTS.DESTINATIONS.LIST),
      ])

      if (catRes.status === 'fulfilled' && catRes.value.success && catRes.value.data) {
        setCategories(catRes.value.data)
      }
      if (destRes.status === 'fulfilled' && destRes.value.success && destRes.value.data) {
        setDestinations(destRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load settings data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      toast.error('Category name is required')
      return
    }

    setSubmittingCat(true)
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.CATEGORIES.LIST, {
        name: newCatName,
        description: newCatDesc,
      })
      if (res.success) {
        toast.success(`Category "${newCatName}" created`)
        setCatModalOpen(false)
        setNewCatName('')
        setNewCatDesc('')
        loadData()
      } else {
        toast.error(res.message || 'Creation failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Creation failed')
    } finally {
      setSubmittingCat(false)
    }
  }

  const handleCreateDestination = async () => {
    if (!newDestName.trim()) {
      toast.error('Destination name is required')
      return
    }

    setSubmittingDest(true)
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.DESTINATIONS.LIST, {
        name: newDestName,
        region: newDestRegion,
        description: newDestDesc,
      })
      if (res.success) {
        toast.success(`Destination "${newDestName}" created`)
        setDestModalOpen(false)
        setNewDestName('')
        setNewDestDesc('')
        loadData()
      } else {
        toast.error(res.message || 'Creation failed')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Creation failed')
    } finally {
      setSubmittingDest(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Platform & Marketplace Configuration"
        subtitle="Manage tourism service categories, destination regions, and core operational parameters"
      >
        <div className="space-y-6">
          {/* General Platform Parameters */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-lake-deep border-b border-border pb-2">
              Core Marketplace Environment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-text-muted block text-[11px]">Platform Identity</span>
                <span className="font-bold text-lake-deep text-sm">LTTMS Marketplace v2</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Operating Currency</span>
                <span className="font-bold text-emerald-800 text-sm">ETB (Ethiopian Birr)</span>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Default Commission Rate</span>
                <span className="font-bold text-amber-900 text-sm">10% per booking</span>
              </div>
            </div>
          </Card>

          {/* Tourism Categories Management */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-lake-deep">
                  Marketplace Tourism Categories ({categories.length})
                </h3>
                <p className="text-xs text-text-secondary">
                  Used by vendors to classify boat tours, eco-lodges, monastery visits, and birdwatching
                </p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setCatModalOpen(true)}>
                + Add Category
              </Button>
            </div>

            {loading ? (
              <p className="text-xs text-text-muted py-4">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-xs text-text-secondary py-4">No categories created yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((c) => (
                  <div key={c._id} className="p-3.5 rounded-lg border border-border bg-surface-elevated">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-lake-deep">{c.name}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    {c.description && (
                      <p className="text-[11px] text-text-secondary line-clamp-2">{c.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Destination Regions Management */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-lake-deep">
                  Destinations & Biosphere Islands ({destinations.length})
                </h3>
                <p className="text-xs text-text-secondary">
                  Official Lake Tana islands, monasteries, waterfalls, and Bahir Dar locations
                </p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setDestModalOpen(true)}>
                + Add Destination
              </Button>
            </div>

            {loading ? (
              <p className="text-xs text-text-muted py-4">Loading destinations...</p>
            ) : destinations.length === 0 ? (
              <p className="text-xs text-text-secondary py-4">No destinations created yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {destinations.map((d) => (
                  <div key={d._id} className="p-3.5 rounded-lg border border-border bg-surface-elevated">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-lake-deep">{d.name}</span>
                      <Badge variant="primary">{d.region || 'Lake Tana'}</Badge>
                    </div>
                    {d.description && (
                      <p className="text-[11px] text-text-secondary line-clamp-2">{d.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Add Category Modal */}
        <Modal
          isOpen={catModalOpen}
          onClose={() => setCatModalOpen(false)}
          title="Add Tourism Category"
          description="Create a new classification category for tourism experiences."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Category Name</label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Island Monastery Tours / Kayaking & Watersports"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Description</label>
              <textarea
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary"
                placeholder="Category details and scope..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setCatModalOpen(false)} disabled={submittingCat}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleCreateCategory} disabled={submittingCat}>
                {submittingCat ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Destination Modal */}
        <Modal
          isOpen={destModalOpen}
          onClose={() => setDestModalOpen(false)}
          title="Add Tourism Destination"
          description="Register an attraction, historic monastery, or sanctuary around Lake Tana."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Destination Name</label>
              <Input
                value={newDestName}
                onChange={(e) => setNewDestName(e.target.value)}
                placeholder="e.g. Ura Kidane Mehret / Blue Nile Falls / Dek Island"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Region / Location</label>
              <Input
                value={newDestRegion}
                onChange={(e) => setNewDestRegion(e.target.value)}
                placeholder="e.g. Zege Peninsula / South Lake Tana"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Description</label>
              <textarea
                value={newDestDesc}
                onChange={(e) => setNewDestDesc(e.target.value)}
                rows={3}
                className="w-full text-xs rounded-lg border border-border p-2.5 bg-white text-text-primary"
                placeholder="Historical significance, boat access notes, cultural rules..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setDestModalOpen(false)} disabled={submittingDest}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleCreateDestination} disabled={submittingDest}>
                {submittingDest ? 'Creating...' : 'Create Destination'}
              </Button>
            </div>
          </div>
        </Modal>
      </AdminLayout>
    </ProtectedRoute>
  )
}
