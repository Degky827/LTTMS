import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { vendorService } from '@/features/vendors/services/vendorService'
import { mediaUploadService } from '@/features/vendors/services/mediaUploadService'
import { VendorDocument, VerificationStatus } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorVerificationPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('draft')
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [documents, setDocuments] = useState<VendorDocument[]>([])
  const [history, setHistory] = useState<any[]>([])

  // New Document Upload State
  const [selectedDocType, setSelectedDocType] = useState('business_license')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const loadVerificationData = async () => {
    try {
      setLoading(true)
      const res = await vendorService.getVerificationStatus()
      if (res?.success && res.data) {
        setVerificationStatus(res.data.verificationStatus)
        setRejectionReason(res.data.rejectionReason || null)
        setDocuments(res.data.documents || [])
        setHistory(res.data.history || [])
      }
    } catch (err: any) {
      console.error('Failed to load verification status', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVerificationData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size cannot exceed 5MB.')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please choose a document file to upload.')
      return
    }

    setUploading(true)
    setUploadProgress(10)
    try {
      // 1. Upload file binary
      const uploadRes = await mediaUploadService.uploadImage(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      if (!uploadRes.success || !uploadRes.data?.url) {
        throw new Error('Upload failed. Invalid server response.')
      }

      // 2. Register document record with KYC endpoint
      await vendorService.uploadVerificationDocument({
        documentType: selectedDocType,
        fileUrl: uploadRes.data.url,
        originalFilename: selectedFile.name,
        mimeType: selectedFile.type || 'image/jpeg',
        fileSize: selectedFile.size,
      })

      toast.success('Document uploaded and added to your verification dossier.')
      setSelectedFile(null)
      loadVerificationData()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload document.'
      toast.error(msg)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmitForReview = async () => {
    if (documents.length === 0) {
      toast.error('Please upload at least one valid business document before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const res = await vendorService.submitVerification()
      if (res.success) {
        toast.success('Your verification dossier has been submitted to the Lake Tana Tourism Administration!')
        loadVerificationData()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Submission failed.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" size="md">Verified Enterprise</Badge>
      case 'submitted':
      case 'under_review':
        return <Badge variant="warning" size="md">Pending Administrative Review</Badge>
      case 'rejected':
        return <Badge variant="danger" size="md">Action Required / Rejected</Badge>
      default:
        return <Badge variant="default" size="md">Draft Dossier</Badge>
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="KYC Verification & Licensing">
          <div className="py-20 text-center text-text-secondary">
            <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading verification status...</p>
          </div>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="KYC Verification & Licensing">
        <div className="space-y-6">
          {/* Status Banner */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-text-primary">Verification Status</h2>
                  {getStatusBadge(verificationStatus)}
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Lake Tana tourism regulations require all boat operators, lodges, and tour guides to verify their licenses and identity to publish bookable services.
                </p>
              </div>

              {verificationStatus === 'draft' && (
                <Button
                  variant="primary"
                  onClick={handleSubmitForReview}
                  isLoading={submitting}
                  disabled={documents.length === 0}
                >
                  Submit Dossier for Review
                </Button>
              )}
            </div>

            {/* Rejection / Action Note */}
            {verificationStatus === 'rejected' && rejectionReason && (
              <div className="mt-4 p-4 rounded-xl bg-danger-50 border border-danger-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-bold text-danger-800">Feedback from Tourism Authority</h4>
                    <p className="mt-1 text-sm text-danger-700">{rejectionReason}</p>
                    <p className="mt-2 text-xs text-danger-600">Please upload the requested updated documents and submit again.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Document Panel */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-base font-bold text-text-primary mb-4">
                  Add Verification Document
                </h3>
                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Document Type
                    </label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    >
                      <option value="business_license">Commercial Trade License</option>
                      <option value="boat_permit">Lake Tana Maritime / Naval Permit</option>
                      <option value="tour_guide_cert">Regional Tourism Guide License</option>
                      <option value="id_card">National ID / Kebele Card / Passport</option>
                      <option value="insurance">Passenger Liability Insurance</option>
                      <option value="tax_id">Tax Identification Certificate (TIN)</option>
                      <option value="other">Other Official Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Select File (Image/Scan, max 5MB)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="w-full text-xs text-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-xs text-text-secondary truncate">
                        Selected: <span className="font-semibold">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>

                  {uploading && uploadProgress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={uploading}
                    disabled={!selectedFile || verificationStatus === 'approved'}
                    className="w-full justify-center"
                  >
                    Upload Document
                  </Button>
                </form>

                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                    Acceptance Criteria
                  </h4>
                  <ul className="text-xs text-text-secondary space-y-1.5 list-disc pl-4">
                    <li>Must be clear, legible, and uncropped.</li>
                    <li>Boat permits must show active maritime safety inspection.</li>
                    <li>Guide credentials must be recognized by the Amhara Tourism Bureau.</li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Uploaded Documents List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-base font-bold text-text-primary mb-4">
                  Dossier Documents ({documents.length})
                </h3>

                {documents.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                    <svg className="w-12 h-12 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium text-text-secondary">No documents uploaded yet.</p>
                    <p className="text-xs text-text-muted mt-1">Upload your business license or maritime permit using the form on the left.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-lg bg-primary-50 text-primary-800 shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary capitalize truncate">
                              {doc.documentType.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-text-secondary truncate">
                              {doc.originalFilename} • {(doc.fileSize / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {doc.status === 'verified' && <Badge variant="success">Verified</Badge>}
                          {doc.status === 'pending' && <Badge variant="warning">Under Review</Badge>}
                          {doc.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}

                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-muted"
                            title="View Document"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Review Audit History */}
              {history.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-base font-bold text-text-primary mb-4">
                    Verification Audit History
                  </h3>
                  <div className="space-y-4">
                    {history.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-secondary-600 mt-2 shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary capitalize">
                            {item.action?.replace('_', ' ')}
                          </p>
                          {item.notes && <p className="text-xs text-text-secondary mt-0.5">{item.notes}</p>}
                          <p className="text-[11px] text-text-muted mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
