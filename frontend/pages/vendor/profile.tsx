import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { vendorService } from '@/features/vendors/services/vendorService'
import { mediaUploadService } from '@/features/vendors/services/mediaUploadService'
import { useToast } from '@/contexts/ToastContext'

export default function VendorProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    businessType: 'boat_operator',
    businessDescription: '',
    businessEmail: '',
    phone: '',
    altPhone: '',
    website: '',
    location: '',
    address: '',
    city: 'Bahir Dar',
    region: 'Amhara',
    operatingHours: '',
    registrationNumber: '',
    licenseNumber: '',
    taxId: '',
    logo: '',
    coverImage: '',
    languages: 'Amharic, English',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const res = await vendorService.getMyProfile()
        if (res?.success && res.data) {
          const v = res.data
          setForm({
            businessName: v.businessName || '',
            businessType: v.businessType || 'boat_operator',
            businessDescription: v.businessDescription || v.description || '',
            businessEmail: v.businessEmail || v.contactEmail || '',
            phone: v.phone || v.contactPhone || '',
            altPhone: v.altPhone || '',
            website: v.website || '',
            location: v.location || 'Bahir Dar Harbor',
            address: v.address || '',
            city: v.city || 'Bahir Dar',
            region: v.region || 'Amhara',
            operatingHours: v.operatingHours || 'Daily 06:00 - 18:00',
            registrationNumber: v.registrationNumber || '',
            licenseNumber: v.licenseNumber || '',
            taxId: v.taxId || '',
            logo: v.logo || '',
            coverImage: v.coverImage || '',
            languages: v.languages && v.languages.length > 0 ? v.languages.join(', ') : 'Amharic, English',
          })
        }
      } catch (err: any) {
        toast.error('Failed to load vendor profile.')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'coverImage') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        const uploadRes = await mediaUploadService.uploadImage(file)
        if (uploadRes.success && uploadRes.data?.url) {
          setForm((prev) => ({ ...prev, [type]: uploadRes.data.url }))
          toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully!`)
        }
      } catch (err) {
        toast.error('Image upload failed.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {
        businessName: form.businessName,
        businessType: form.businessType,
        businessDescription: form.businessDescription,
        description: form.businessDescription,
        businessEmail: form.businessEmail,
        contactEmail: form.businessEmail,
        phone: form.phone,
        altPhone: form.altPhone,
        website: form.website,
        location: form.location,
        address: form.address,
        city: form.city,
        region: form.region,
        operatingHours: form.operatingHours,
        registrationNumber: form.registrationNumber,
        licenseNumber: form.licenseNumber,
        taxId: form.taxId,
        logo: form.logo,
        coverImage: form.coverImage,
        languages: form.languages.split(',').map((l) => l.trim()).filter(Boolean),
      }

      const res = await vendorService.updateMyProfile(payload)
      if (res.success) {
        toast.success('Business profile updated successfully!')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="Business Profile">
          <div className="py-20 text-center text-text-secondary">
            <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading enterprise profile...</p>
          </div>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Business Profile">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header & Verification Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Manage Enterprise Profile</h2>
              <p className="text-sm text-text-secondary">
                Update how {form.businessName || 'your tourism enterprise'} appears to travelers across Lake Tana and Bahir Dar.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Media & Visual Identity Card */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-primary mb-4">Visual Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Business Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border border-border bg-surface-muted overflow-hidden flex items-center justify-center shrink-0">
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-text-muted font-medium">No Logo</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                      className="text-xs text-text-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
                    />
                    <p className="text-[11px] text-text-muted mt-1">Recommended: 400x400 PNG or WebP</p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Marketplace Cover Banner
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-xl border border-border bg-surface-muted overflow-hidden flex items-center justify-center shrink-0">
                    {form.coverImage ? (
                      <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-text-muted font-medium">No Cover</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'coverImage')}
                      className="text-xs text-text-secondary file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
                    />
                    <p className="text-[11px] text-text-muted mt-1">Recommended: 1200x400 Landscape Photo</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Primary Business Information */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-primary mb-4">Enterprise Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Enterprise Name"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Business Type <span className="text-danger-500">*</span>
                </label>
                <select
                  value={form.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="boat_operator">Boat Tour Operator</option>
                  <option value="eco_lodge">Eco-Lodge / Sustainable Stay</option>
                  <option value="hotel">Hotel / Guest House</option>
                  <option value="guide">Licensed Tour Guide</option>
                  <option value="tour_operator">Tour Operator</option>
                  <option value="handicraft">Handicrafts & Cultural Center</option>
                  <option value="restaurant">Traditional Dining / Fish Market</option>
                  <option value="other">Other Tourism Service</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Enterprise Description & Story"
                  rows={4}
                  value={form.businessDescription}
                  onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                  placeholder="Describe your tourism services, boats, captains, lodge amenities, and Lake Tana heritage..."
                />
              </div>

              <Input
                label="Operating Hours"
                value={form.operatingHours}
                onChange={(e) => setForm({ ...form, operatingHours: e.target.value })}
                placeholder="e.g. Daily 06:00 - 18:30"
              />

              <Input
                label="Languages Spoken (comma-separated)"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                placeholder="Amharic, English, Oromo"
              />
            </div>
          </Card>

          {/* Contact & Location Details */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-primary mb-4">Contact & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Direct Phone Number"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <Input
                label="Alternative Phone"
                value={form.altPhone}
                onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
              />

              <Input
                label="Official Business Email"
                type="email"
                value={form.businessEmail}
                onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
              />

              <Input
                label="Primary Operating Hub (Lake Tana)"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Bahir Dar Port / Mangrove Marina"
              />

              <Input
                label="City / Town"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              <Input
                label="Region / State"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />

              <div className="md:col-span-2">
                <Input
                  label="Physical Office / Departure Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Kebele 04, Lakefront Promenade, Bahir Dar"
                />
              </div>

              <Input
                label="Website URL"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </Card>

          {/* Legal & Regulatory Registrations */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-text-primary mb-4">Registration & Licensing Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Commercial Registration Number"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                placeholder="e.g. CR-BD-2024-884"
              />

              <Input
                label="Tourism Trade License Number"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="e.g. TL-AMH-9921"
              />

              <Input
                label="Tax Identification Number (TIN)"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                placeholder="e.g. 0081726354"
              />
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="lg" isLoading={saving}>
              Save Enterprise Profile
            </Button>
          </div>
        </form>
      </VendorLayout>
    </ProtectedRoute>
  )
}
