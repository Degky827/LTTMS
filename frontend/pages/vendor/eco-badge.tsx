import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { vendorEcoBadgeService } from '@/features/vendors/services/vendorEcoBadgeService'
import { mediaUploadService } from '@/features/vendors/services/mediaUploadService'
import { EcoBadge, EcoBadgeApplication } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorEcoBadgePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [badges, setBadges] = useState<EcoBadge[]>([])
  const [applications, setApplications] = useState<EcoBadgeApplication[]>([])

  // Apply Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<EcoBadge | null>(null)
  const [selectedPractices, setSelectedPractices] = useState<string[]>([])
  const [customPractice, setCustomPractice] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([])
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const defaultPracticeOptions = [
    'Electric or low-emission 4-stroke boat engines',
    '100% Single-use plastic prohibition on all tours',
    'Certified local monastery community benefit sharing (min 5% ticket proceeds)',
    'Lake Tana Biosphere Reserve bird-nesting zone speed limit compliance',
    'Zero bilge discharge & use of eco-friendly boat maintenance products',
    'Employment of certified local community guides from Zege / Dek Island',
    'Organic locally-sourced hospitality & Ethiopian traditional coffee',
  ]

  const loadData = async () => {
    try {
      setLoading(true)
      const [bRes, aRes] = await Promise.all([
        vendorEcoBadgeService.getAllBadges(),
        vendorEcoBadgeService.getMyApplications(),
      ])

      if (bRes.success && bRes.data) {
        setBadges(bRes.data)
      }
      if (aRes.success && aRes.data) {
        setApplications(aRes.data)
      }
    } catch (err) {
      console.error('Failed to load eco badge data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const togglePractice = (practice: string) => {
    if (selectedPractices.includes(practice)) {
      setSelectedPractices(selectedPractices.filter((p) => p !== practice))
    } else {
      setSelectedPractices([...selectedPractices, practice])
    }
  }

  const handleAddCustomPractice = () => {
    if (!customPractice.trim()) return
    setSelectedPractices([...selectedPractices, customPractice.trim()])
    setCustomPractice('')
  }

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadingEvidence(true)
      try {
        const res = await mediaUploadService.uploadImage(file)
        if (res.success && res.data?.url) {
          setEvidenceFiles((prev) => [...prev, res.data.url])
          toast.success('Evidence photo/certificate uploaded!')
        }
      } catch (err) {
        toast.error('Failed to upload evidence.')
      } finally {
        setUploadingEvidence(false)
      }
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBadge) return
    if (selectedPractices.length === 0) {
      toast.error('Please select or specify at least one sustainability practice.')
      return
    }

    setSubmitting(true)
    try {
      const res = await vendorEcoBadgeService.apply({
        badgeId: selectedBadge._id,
        sustainabilityPractices: selectedPractices,
        evidenceDocuments: evidenceFiles,
      })

      if (res.success) {
        toast.success(`Application for "${selectedBadge.name}" submitted successfully!`)
        setApplyModalOpen(false)
        setSelectedPractices([])
        setEvidenceFiles([])
        loadData()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Application submission failed.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const openApplyModal = (badge: EcoBadge) => {
    setSelectedBadge(badge)
    setSelectedPractices([])
    setEvidenceFiles([])
    setApplyModalOpen(true)
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Badge variant="primary">Platinum Tier</Badge>
      case 'gold':
        return <Badge variant="warning">Gold Tier</Badge>
      case 'silver':
        return <Badge variant="default">Silver Tier</Badge>
      case 'bronze':
        return <Badge variant="secondary">Bronze Tier</Badge>
      default:
        return <Badge variant="default">{tier}</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Eco-Tourism Badges & Sustainability">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Lake Tana Biosphere Eco-Certification
              </h2>
              <p className="text-sm text-text-secondary">
                Apply for official eco-tourism badges to boost your marketplace ranking and earn traveler trust.
              </p>
            </div>
          </div>

          {/* Badge Tiers Catalog */}
          {loading && (
            <div className="py-6 text-center text-text-secondary text-sm">
              Loading eco-certification badges...
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const hasApplied = applications.some((a) => a.badge?._id === badge._id)
              return (
                <Card key={badge._id} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🌿</span>
                      {getTierBadge(badge.tier)}
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mb-4">
                      {badge.description}
                    </p>

                    {badge.criteria && badge.criteria.length > 0 && (
                      <div className="space-y-1 mb-4">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                          Criteria Highlights
                        </span>
                        <ul className="text-[11px] text-text-secondary list-disc pl-4 space-y-0.5">
                          {badge.criteria.slice(0, 3).map((c, idx) => (
                            <li key={idx}>{c.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant={hasApplied ? 'outline' : 'primary'}
                      className="w-full justify-center"
                      onClick={() => openApplyModal(badge)}
                    >
                      {hasApplied ? 'Submit Update / Reapply' : 'Apply for Badge'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Past Applications Table */}
          <Card className="overflow-hidden p-0">
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-bold text-text-primary">
                Your Eco-Badge Applications ({applications.length})
              </h3>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center text-text-secondary">
                <p className="text-sm font-semibold text-text-primary">No applications filed yet.</p>
                <p className="text-xs text-text-muted mt-1">
                  Choose a badge above and document your sustainability practices to apply.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Applied Badge</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Practices Documented</th>
                      <th className="py-3 px-4">Review Status</th>
                      <th className="py-3 px-4">Feedback / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-xs text-text-primary">
                          {app.badge?.name || 'Eco Badge'}
                          <span className="block text-[10px] text-text-muted capitalize">
                            {app.badge?.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {app.sustainabilityPractices?.length || 0} sustainability actions
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              app.status === 'approved'
                                ? 'success'
                                : app.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {app.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-muted">
                          {app.adminFeedback || 'Under technical evaluation by Lake Tana Authority'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Application Modal */}
          <Modal
            isOpen={applyModalOpen}
            onClose={() => setApplyModalOpen(false)}
            title={`Apply for ${selectedBadge?.name || 'Eco-Badge'}`}
          >
            <form onSubmit={handleApply} className="space-y-4">
              <p className="text-xs text-text-secondary">
                Select the sustainable practices implemented in your operations and upload supporting verification evidence.
              </p>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Implemented Sustainability Practices
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {defaultPracticeOptions.map((opt) => {
                    const checked = selectedPractices.includes(opt)
                    return (
                      <label
                        key={opt}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                          checked
                            ? 'bg-secondary-50/50 border-secondary-300 text-text-primary font-medium'
                            : 'bg-surface border-border text-text-secondary hover:bg-surface-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePractice(opt)}
                          className="mt-0.5 rounded text-secondary-600 focus:ring-secondary-500 border-border"
                        />
                        <span>{opt}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Add Additional Custom Practice
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Solar panels installed on boat canopy"
                    value={customPractice}
                    onChange={(e) => setCustomPractice(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddCustomPractice}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Upload Photo / Permit Evidence
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceUpload}
                  disabled={uploadingEvidence}
                  className="text-xs text-text-secondary file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
                />
                {uploadingEvidence && (
                  <span className="text-xs text-secondary-600 ml-2 animate-pulse">Uploading evidence...</span>
                )}
                {evidenceFiles.length > 0 && (
                  <p className="text-xs text-success-600 font-semibold mt-1">
                    ✓ {evidenceFiles.length} evidence file(s) attached
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setApplyModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
