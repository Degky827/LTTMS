import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { vendorService } from '@/features/vendors/services/vendorService'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import { Service } from '@/features/services/types'
import { useToast } from '@/contexts/ToastContext'

interface ReviewItem {
  _id: string
  service: { _id: string; title: string }
  user: { _id: string; name: string; avatar?: string }
  rating: number
  title?: string
  comment: string
  vendorResponse?: {
    response: string
    respondedAt: string
  }
  createdAt: string
}

export default function VendorReviewsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all')
  const [reviews, setReviews] = useState<ReviewItem[]>([])

  // Response form
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reviewToReport, setReviewToReport] = useState<ReviewItem | null>(null)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDesc, setReportDesc] = useState('')
  const [submittingReport, setSubmittingReport] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const pRes = await vendorService.getMyProfile()
      if (pRes.success && pRes.data) {
        const sRes = await vendorServiceManagement.getMyServices(pRes.data._id)
        if (sRes.success && sRes.data) {
          setServices(sRes.data)

          // Collect reviews for services
          const collected: ReviewItem[] = []
          for (const s of sRes.data) {
            try {
              const rRes = await vendorServiceManagement.getReviewsForService(s._id, 1, 20)
              if (rRes.success && rRes.data) {
                collected.push(...rRes.data)
              }
            } catch (err) {
              // ignore
            }
          }
          setReviews(collected)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSendResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response message.')
      return
    }

    setSubmittingReply(true)
    try {
      const res = await vendorServiceManagement.respondToReview(reviewId, responseText.trim())
      if (res.success) {
        toast.success('Your official vendor reply has been posted.')
        setReplyingReviewId(null)
        setResponseText('')
        loadData()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit response.'
      toast.error(msg)
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleReportReview = async () => {
    if (!reviewToReport) return
    setSubmittingReport(true)
    try {
      const res = await vendorServiceManagement.reportReview(
        reviewToReport._id,
        reportReason,
        reportDesc
      )
      if (res.success) {
        toast.success('Review reported for administration moderation.')
        setReportModalOpen(false)
        setReviewToReport(null)
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to report review.'
      toast.error(msg)
    } finally {
      setSubmittingReport(false)
    }
  }

  const filteredReviews = selectedServiceId === 'all'
    ? reviews
    : reviews.filter((r) => r.service?._id === selectedServiceId)

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0'

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Customer Reviews & Reputation">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Customer Reviews & Ratings
              </h2>
              <p className="text-sm text-text-secondary">
                Monitor feedback, reply officially to traveler comments, and maintain high service standards.
              </p>
            </div>

            {services.length > 0 && (
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value="all">All Services ({reviews.length} reviews)</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Rating Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-primary-950 to-primary-900 text-white shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-primary-200 uppercase tracking-wider font-semibold">
                  Average Rating
                </span>
                <p className="text-3xl font-extrabold mt-1 text-white">
                  ★ {avgRating} <span className="text-sm font-normal text-primary-300">/ 5.0</span>
                </p>
                <p className="text-xs text-primary-200 mt-1">Based on {reviews.length} verified ratings</p>
              </div>
            </Card>

            <Card className="p-6">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Total Reviews
              </span>
              <p className="text-3xl font-extrabold text-text-primary mt-1">
                {reviews.length}
              </p>
              <p className="text-xs text-text-secondary mt-1">Guest feedback submitted</p>
            </Card>

            <Card className="p-6">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                Vendor Response Rate
              </span>
              <p className="text-3xl font-extrabold text-secondary-600 mt-1">
                {reviews.length > 0
                  ? `${Math.round((reviews.filter((r) => r.vendorResponse).length / reviews.length) * 100)}%`
                  : '100%'}
              </p>
              <p className="text-xs text-text-secondary mt-1">Answered with official reply</p>
            </Card>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="py-20 text-center text-text-secondary">
              <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-sm font-semibold text-text-primary">No reviews yet.</p>
              <p className="text-xs text-text-muted mt-1">
                When travelers complete your tours and rate their experience, their feedback will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((r) => (
                <Card key={r._id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-800 font-bold flex items-center justify-center shrink-0 text-sm">
                        {r.user?.name ? r.user.name[0] : 'G'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-text-primary">{r.user?.name || 'Traveler'}</h4>
                          <span className="text-warning-500 font-bold text-xs">
                            {'★'.repeat(r.rating || 5)}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted">
                          Tour: <span className="font-medium text-text-secondary">{r.service?.title || 'Tour'}</span> • {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReviewToReport(r)
                        setReportModalOpen(true)
                      }}
                      className="text-xs text-text-muted hover:text-danger-600 transition-colors"
                    >
                      Report Flag
                    </button>
                  </div>

                  <div className="mt-3 text-sm text-text-secondary leading-relaxed">
                    {r.title && <p className="font-bold text-text-primary mb-1">{r.title}</p>}
                    <p>{r.comment}</p>
                  </div>

                  {/* Existing Vendor Response */}
                  {r.vendorResponse && (
                    <div className="mt-4 p-4 rounded-xl bg-surface-muted border-l-4 border-secondary-600 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-primary-950">Official Vendor Reply:</span>
                        <span className="text-text-muted">{new Date(r.vendorResponse.respondedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-text-secondary">{r.vendorResponse.response}</p>
                    </div>
                  )}

                  {/* Reply Form Trigger */}
                  {!r.vendorResponse && replyingReviewId !== r._id && (
                    <div className="mt-4 pt-3 border-t border-border flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReplyingReviewId(r._id)
                          setResponseText('')
                        }}
                      >
                        Reply to Review
                      </Button>
                    </div>
                  )}

                  {/* Active Reply Editor */}
                  {!r.vendorResponse && replyingReviewId === r._id && (
                    <div className="mt-4 pt-3 border-t border-border space-y-3">
                      <textarea
                        rows={3}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a polite, professional reply to this traveler..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-secondary-500"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingReviewId(null)}
                          disabled={submittingReply}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSendResponse(r._id)}
                          isLoading={submittingReply}
                        >
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Report Review Modal */}
          <Modal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            title="Report Review for Moderation"
          >
            <div className="space-y-4">
              <p className="text-xs text-text-secondary">
                Report this review to the Lake Tana Administration if it contains spam, abusive language, or false information.
              </p>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-danger-500"
                >
                  <option value="spam">Spam / Promotional Content</option>
                  <option value="harassment">Harassment or Inappropriate Language</option>
                  <option value="fake_review">Fake Review / Never Attended Tour</option>
                  <option value="irrelevant">Irrelevant to this Tour</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Explain why this review should be moderated..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-xs focus:outline-none focus:ring-2 focus:ring-danger-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setReportModalOpen(false)} disabled={submittingReport}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleReportReview} isLoading={submittingReport}>
                  Submit Report
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
