import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { vendorService } from '@/features/vendors/services/vendorService'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import { mediaUploadService } from '@/features/vendors/services/mediaUploadService'
import { Vendor } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function CreateServicePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'boat_tour',
    description: '',
    shortDescription: '',
    price: 1500,
    currency: 'ETB',
    childPrice: 800,
    pricingType: 'per_person',
    duration: '3 hours',
    location: 'Bahir Dar Pier',
    meetingPoint: 'Bahir Dar Harbor Main Entrance, Next to Maritime Office',
    maxBookingCapacity: 12,
    minBookingCapacity: 1,
    cancellationPolicy: 'Free cancellation up to 24 hours before departure',
    included: 'Life jackets, licensed boat captain, bottled water, entrance permits',
    excluded: 'Personal monastery donations, hotel pickup outside Bahir Dar',
    requirements: 'Sun protection, modest clothing for monastery visits (knees/shoulders covered)',
    ecoFriendly: true,
    ecoPractices: 'Low-emission 4-stroke engine, zero plastic policy, local guide employment',
    images: [] as Array<{ url: string; caption?: string; isPrimary?: boolean }>,
  })

  // Media upload state
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await vendorService.getMyProfile()
        if (res.success && res.data) {
          setVendor(res.data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchVendor()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadingImage(true)
      try {
        const res = await mediaUploadService.uploadImage(file)
        if (res.success && res.data?.url) {
          const newImg = {
            url: res.data.url,
            caption: formData.title || 'Tour Gallery Image',
            isPrimary: formData.images.length === 0,
          }
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImg],
          }))
          toast.success('Photo added to service gallery!')
        }
      } catch (err) {
        toast.error('Image upload failed.')
      } finally {
        setUploadingImage(false)
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }))
  }

  const handleSubmit = async (publishImmediate = false) => {
    if (!formData.title.trim()) {
      toast.error('Please provide a service title.')
      setCurrentStep(1)
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        shortDescription: formData.shortDescription || formData.description.slice(0, 150),
        price: Number(formData.price),
        currency: formData.currency,
        childPrice: Number(formData.childPrice),
        pricingType: formData.pricingType,
        duration: formData.duration,
        location: formData.location,
        meetingPoint: formData.meetingPoint,
        maxBookingCapacity: Number(formData.maxBookingCapacity),
        minBookingCapacity: Number(formData.minBookingCapacity),
        cancellationPolicy: formData.cancellationPolicy,
        included: formData.included.split(',').map((s) => s.trim()).filter(Boolean),
        excluded: formData.excluded.split(',').map((s) => s.trim()).filter(Boolean),
        requirements: formData.requirements.split(',').map((s) => s.trim()).filter(Boolean),
        ecoFriendly: formData.ecoFriendly,
        coverImage: formData.images.find((img) => img.isPrimary)?.url || formData.images[0]?.url || '',
        images: formData.images,
        status: publishImmediate && vendor?.verificationStatus === 'approved' ? 'published' : 'draft',
      }

      const res = await vendorServiceManagement.createService(payload)
      if (res.success) {
        toast.success(
          publishImmediate && vendor?.verificationStatus === 'approved'
            ? 'Service published and active on Lake Tana marketplace!'
            : 'Service created and saved to your drafts.'
        )
        router.push('/vendor/services')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create service.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const stepsList = [
    'General Details',
    'Pricing & Capacity',
    'Media Gallery',
    'Inclusions & Itinerary',
    'Eco-Tourism',
    'Review & Submit',
  ]

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Create Tourism Service">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stepper Progress Bar */}
          <div className="bg-surface-elevated p-4 rounded-xl border border-border">
            <div className="flex items-center justify-between overflow-x-auto pb-2 sm:pb-0 gap-2">
              {stepsList.map((st, idx) => {
                const sNum = idx + 1
                const isActive = currentStep === sNum
                const isCompleted = currentStep > sNum
                return (
                  <button
                    key={st}
                    onClick={() => setCurrentStep(sNum)}
                    className="flex items-center gap-2 shrink-0 text-left focus:outline-none"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-secondary-600 text-white'
                          : isCompleted
                          ? 'bg-success-600 text-white'
                          : 'bg-surface-muted text-text-muted'
                      }`}
                    >
                      {isCompleted ? '✓' : sNum}
                    </div>
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        isActive ? 'text-text-primary' : 'text-text-muted'
                      }`}
                    >
                      {st}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 1: General Details */}
          {currentStep === 1 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary">Step 1: General Information</h3>
              <p className="text-xs text-text-secondary">
                Describe the experience, monastery destination, or boat tour accurately for travelers.
              </p>

              <Input
                label="Service Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Ura Kidane Mehret & Zege Peninsula Island Boat Tour"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Service Category <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="boat_tour">Boat Tour & Excursion</option>
                    <option value="cultural_monastery">Monastery & Religious Tourism</option>
                    <option value="eco_lodge">Eco-Lodge & Sustainable Stay</option>
                    <option value="nature_wildlife">Bird Watching & Nature Trek</option>
                    <option value="guide_service">Private Guide & Cultural Escort</option>
                    <option value="fishing_dining">Traditional Lake Dining & Fishery</option>
                    <option value="other">Other Experience</option>
                  </select>
                </div>

                <Input
                  label="Estimated Duration"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 3 hours, Full Day (6 hours)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Operating Hub / Area"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bahir Dar Pier / Zege Peninsula"
                />

                <Input
                  label="Departure Meeting Point"
                  required
                  value={formData.meetingPoint}
                  onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                  placeholder="e.g. Bahir Dar Maritime Port Gate 2"
                />
              </div>

              <Textarea
                label="Full Experience Description"
                rows={5}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detail the itinerary, ancient church frescos to be visited, coffee ceremony on Zege, boat comfort, etc."
              />

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={() => setCurrentStep(2)}>
                  Next: Pricing & Capacity →
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Pricing & Capacity */}
          {currentStep === 2 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary">Step 2: Pricing & Guest Capacity</h3>
              <p className="text-xs text-text-secondary">
                Set transparent pricing in Ethiopian Birr (ETB). The platform commission will be clearly calculated.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Adult Base Price"
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />

                <Input
                  label="Child / Youth Price"
                  type="number"
                  value={formData.childPrice}
                  onChange={(e) => setFormData({ ...formData, childPrice: Number(e.target.value) })}
                />

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="ETB">ETB (Ethiopian Birr)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Maximum Capacity per Departure (Guests)"
                  type="number"
                  required
                  value={formData.maxBookingCapacity}
                  onChange={(e) => setFormData({ ...formData, maxBookingCapacity: Number(e.target.value) })}
                  placeholder="e.g. 12"
                />

                <Input
                  label="Minimum Guests to Run Tour"
                  type="number"
                  value={formData.minBookingCapacity}
                  onChange={(e) => setFormData({ ...formData, minBookingCapacity: Number(e.target.value) })}
                  placeholder="e.g. 1"
                />
              </div>

              <Input
                label="Cancellation & Refund Terms"
                value={formData.cancellationPolicy}
                onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  ← Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                  Next: Media Gallery →
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Media Gallery */}
          {currentStep === 3 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary">Step 3: High-Resolution Gallery</h3>
              <p className="text-xs text-text-secondary">
                Upload photos of your boat, life jackets, comfortable seating, monastery views, and lake sunsets.
              </p>

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

              {formData.images.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <p className="text-xs text-text-muted">No images added yet. Click above to upload tour photos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-border group bg-surface-muted">
                      <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-32 object-cover" />
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
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  ← Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(4)}>
                  Next: Inclusions & Itinerary →
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Inclusions & Requirements */}
          {currentStep === 4 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary">Step 4: Amenities & Traveler Requirements</h3>

              <Textarea
                label="Included in Price (comma-separated)"
                rows={3}
                value={formData.included}
                onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                placeholder="Safety life jackets, English-speaking guide, monastery entrance permits, bottled water"
              />

              <Textarea
                label="Excluded from Price (comma-separated)"
                rows={2}
                value={formData.excluded}
                onChange={(e) => setFormData({ ...formData, excluded: e.target.value })}
                placeholder="Personal church donations, tips, lunch"
              />

              <Textarea
                label="What Travelers Should Know / Bring"
                rows={2}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Modest clothing covering shoulders and knees for church sanctums, sun hat, slip-on shoes"
              />

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  ← Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(5)}>
                  Next: Eco-Tourism →
                </Button>
              </div>
            </Card>
          )}

          {/* Step 5: Eco-Tourism */}
          {currentStep === 5 && (
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-text-primary">Step 5: Lake Tana Sustainability Practices</h3>
              <p className="text-xs text-text-secondary">
                Highlight your green credentials. Certified eco-friendly tours receive higher marketplace visibility.
              </p>

              <div className="p-4 rounded-xl border border-border bg-surface-muted/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ecoFriendly}
                    onChange={(e) => setFormData({ ...formData, ecoFriendly: e.target.checked })}
                    className="h-5 w-5 rounded text-secondary-600 focus:ring-secondary-500 border-border"
                  />
                  <div>
                    <span className="text-sm font-bold text-text-primary block">
                      Certified Eco-Friendly Tourism Experience
                    </span>
                    <span className="text-xs text-text-secondary">
                      This service adheres to environmental protection protocols for Lake Tana Biosphere Reserve.
                    </span>
                  </div>
                </label>
              </div>

              {formData.ecoFriendly && (
                <Textarea
                  label="Sustainability Measures Implemented"
                  rows={3}
                  value={formData.ecoPractices}
                  onChange={(e) => setFormData({ ...formData, ecoPractices: e.target.value })}
                  placeholder="e.g. Reusable water dispensers on board, 10% proceeds go to Dek Island monastery preservation"
                />
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  ← Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(6)}>
                  Next: Review & Submit →
                </Button>
              </div>
            </Card>
          )}

          {/* Step 6: Review & Submit */}
          {currentStep === 6 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-text-primary">Step 6: Review Tourism Offering</h3>
                <p className="text-xs text-text-secondary">
                  Please review the details below before creating your service listing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-text-muted">Title:</span>
                  <span className="font-bold text-text-primary">{formData.title || 'Untitled'}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-text-muted">Category & Duration:</span>
                  <span className="font-semibold text-text-primary capitalize">
                    {formData.category.replace('_', ' ')} • {formData.duration}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-text-muted">Price:</span>
                  <span className="font-bold text-secondary-600">
                    {formData.price} {formData.currency} / person
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-text-muted">Max Capacity:</span>
                  <span className="font-semibold text-text-primary">{formData.maxBookingCapacity} guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Photos Uploaded:</span>
                  <span className="font-semibold text-text-primary">{formData.images.length} photos</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(5)} disabled={submitting}>
                  ← Back
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    isLoading={submitting}
                    className="w-1/2 sm:w-auto"
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSubmit(true)}
                    isLoading={submitting}
                    className="w-1/2 sm:w-auto"
                  >
                    Publish to Marketplace
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
