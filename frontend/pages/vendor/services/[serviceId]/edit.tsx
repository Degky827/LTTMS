import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import { mediaUploadService } from '@/features/vendors/services/mediaUploadService'
import { Service } from '@/features/services/types'
import { useToast } from '@/contexts/ToastContext'

export default function EditServicePage() {
  const router = useRouter()
  const { serviceId } = router.query
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [service, setService] = useState<Service | null>(null)
  const [form, setForm] = useState({
    title: '',
    category: 'boat_tour',
    description: '',
    price: 0,
    currency: 'ETB',
    childPrice: 0,
    duration: '',
    location: '',
    meetingPoint: '',
    maxBookingCapacity: 10,
    cancellationPolicy: '',
    included: '',
    excluded: '',
    requirements: '',
    ecoFriendly: true,
    status: 'draft',
    images: [] as Array<{ url: string; caption?: string; isPrimary?: boolean }>,
  })

  useEffect(() => {
    if (!serviceId) return

    async function loadService() {
      try {
        setLoading(true)
        const res = await vendorServiceManagement.getServiceById(serviceId as string)
        if (res?.success && res.data) {
          const s = res.data
          setService(s)
          setForm({
            title: s.title || '',
            category: s.category || 'boat_tour',
            description: s.description || '',
            price: s.price || 0,
            currency: s.currency || 'ETB',
            childPrice: s.childPrice || 0,
            duration: s.duration || '',
            location: s.location || '',
            meetingPoint: s.meetingPoint || '',
            maxBookingCapacity: s.maxBookingCapacity || s.dailyCapacity || 10,
            cancellationPolicy: s.cancellationPolicy || '',
            included: s.included ? s.included.join(', ') : '',
            excluded: s.excluded ? s.excluded.join(', ') : '',
            requirements: s.requirements ? s.requirements.join(', ') : '',
            ecoFriendly: !!s.ecoFriendly,
            status: s.status || 'draft',
            images: s.images || [],
          })
        }
      } catch (err: any) {
        toast.error('Failed to load service details.')
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [serviceId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadingImage(true)
      try {
        const res = await mediaUploadService.uploadImage(file)
        if (res.success && res.data?.url) {
          const newImg = {
            url: res.data.url,
            caption: form.title,
            isPrimary: form.images.length === 0,
          }
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, newImg],
          }))
          toast.success('Image added to gallery!')
        }
      } catch (err) {
        toast.error('Failed to upload image.')
      } finally {
        setUploadingImage(false)
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSetPrimaryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceId) return

    setSaving(true)
    try {
      const payload: any = {
        title: form.title,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        currency: form.currency,
        childPrice: Number(form.childPrice),
        duration: form.duration,
        location: form.location,
        meetingPoint: form.meetingPoint,
        maxBookingCapacity: Number(form.maxBookingCapacity),
        cancellationPolicy: form.cancellationPolicy,
        included: form.included.split(',').map((s) => s.trim()).filter(Boolean),
        excluded: form.excluded.split(',').map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.split(',').map((s) => s.trim()).filter(Boolean),
        ecoFriendly: form.ecoFriendly,
        coverImage: form.images.find((img) => img.isPrimary)?.url || form.images[0]?.url || '',
        images: form.images,
        status: form.status,
      }

      const res = await vendorServiceManagement.updateService(serviceId as string, payload)
      if (res.success) {
        toast.success('Service updated successfully!')
        router.push('/vendor/services')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update service.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="Edit Service">
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-text-secondary">Loading service...</p>
          </div>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title={`Edit: ${service?.title || 'Tourism Service'}`}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-text-primary truncate">
                  Edit Service Details
                </h2>
                <Badge
                  variant={
                    form.status === 'published'
                      ? 'success'
                      : form.status === 'draft'
                      ? 'default'
                      : 'warning'
                  }
                >
                  {form.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">
                Update scheduling, pricing, and photo gallery for this experience.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/vendor/services">
                <Button variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary">Service Metadata</h3>

            <Input
              label="Service Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="boat_tour">Boat Tour & Excursion</option>
                  <option value="cultural_monastery">Monastery & Religious Tourism</option>
                  <option value="eco_lodge">Eco-Lodge & Sustainable Stay</option>
                  <option value="nature_wildlife">Bird Watching & Nature Trek</option>
                  <option value="guide_service">Private Guide & Cultural Escort</option>
                  <option value="fishing_dining">Traditional Dining / Fish</option>
                  <option value="other">Other Experience</option>
                </select>
              </div>

              <Input
                label="Duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Departure Location / Port"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <Input
                label="Meeting Point"
                value={form.meetingPoint}
                onChange={(e) => setForm({ ...form, meetingPoint: e.target.value })}
              />
            </div>

            <Textarea
              label="Description"
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Card>

          {/* Pricing & Capacity */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary">Pricing & Capacity</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Base Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
              <Input
                label="Child Price"
                type="number"
                value={form.childPrice}
                onChange={(e) => setForm({ ...form, childPrice: Number(e.target.value) })}
              />
              <Input
                label="Max Guest Capacity"
                type="number"
                value={form.maxBookingCapacity}
                onChange={(e) => setForm({ ...form, maxBookingCapacity: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Publication Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="published">Published (Visible in Marketplace)</option>
                  <option value="draft">Draft (Private)</option>
                  <option value="archived">Archived (Unlisted)</option>
                </select>
              </div>

              <div className="pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.ecoFriendly}
                    onChange={(e) => setForm({ ...form, ecoFriendly: e.target.checked })}
                    className="h-4 w-4 rounded text-secondary-600 focus:ring-secondary-500 border-border"
                  />
                  <span className="text-sm font-medium text-text-primary">
                    Eco-Certified Experience
                  </span>
                </label>
              </div>
            </div>
          </Card>

          {/* Gallery Management */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary">Photo Gallery</h3>

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="text-xs text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
              />
              {uploadingImage && <span className="text-xs text-secondary-600 ml-2 animate-pulse">Uploading photo...</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-border group bg-surface-muted">
                  <img src={img.url} alt={`Photo ${idx}`} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="text-[10px] bg-white text-gray-900 py-1 px-2 rounded-md font-bold"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-[10px] bg-danger-600 text-white py-1 px-2 rounded-md font-bold"
                    >
                      Remove
                    </button>
                  </div>
                  {img.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] bg-secondary-600 text-white py-0.5 px-2 rounded-md font-bold">
                        Cover
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/vendor/services">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" isLoading={saving}>
              Save All Changes
            </Button>
          </div>
        </form>
      </VendorLayout>
    </ProtectedRoute>
  )
}
