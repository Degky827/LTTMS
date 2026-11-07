import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { reviewService } from '@/features/reviews/services/reviewService'
import { Review } from '@/features/reviews/types'
import { useToast } from '@/components/feedback/ToastProvider'

export default function TouristReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { addToast } = useToast()

  const loadReviews = async () => {
    try {
      setLoading(true)
      const res = await reviewService.getMyReviews()
      if (res.data) {
        setReviews(res.data)
      }
    } catch (err) {
      console.error('Failed to load user reviews:', err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      setDeletingId(id)
      await reviewService.delete(id)
      addToast({
        type: 'success',
        title: 'Review Deleted',
        message: 'Your review has been removed.',
      })
      setReviews((prev) => prev.filter((r) => r._id !== id))
    } catch (err: any) {
      console.error('Failed to delete review:', err)
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete review.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>My Reviews & Feedback | LTTMS</title>
      </Head>
      <TouristLayout title="My Reviews">
        <PageHeader
          title="My Reviews & Experience Feedback"
          subtitle="Manage the feedback and ratings you've shared about Lake Tana boat captains, guides, and lodges."
          breadcrumbs={[
            { label: 'Tourist Dashboard', href: '/tourist' },
            { label: 'My Reviews' },
          ]}
          actions={
            <Link href="/tourist/marketplace">
              <Button variant="primary" size="sm">
                Explore More Tours
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-2xl border border-surface-border"></div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
              ⭐
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              No Reviews Submitted Yet
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              After embarking on a boat excursion or cultural monastery tour, share your experience here to help fellow travelers explore safely and sustainably.
            </p>
            <Link href="/tourist/bookings">
              <Button variant="primary">View Completed Bookings</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => {
              const service = typeof rev.service === 'object' ? rev.service : null
              const serviceTitle = service?.title || 'Lake Tana Tour Experience'

              return (
                <Card key={rev._id} bordered className="bg-white shadow-xs">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-500 text-sm">
                            {'★'.repeat(rev.rating)}
                            <span className="text-gray-300">{'★'.repeat(5 - rev.rating)}</span>
                          </div>
                          <span className="text-xs font-bold text-text-primary">
                            {rev.rating}.0 / 5.0
                          </span>
                          <span className="text-xs text-text-muted">
                            • {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {service?.slug ? (
                          <Link
                            href={`/services/${service.slug}`}
                            className="text-base font-bold text-primary-700 hover:underline block"
                          >
                            {serviceTitle} &rarr;
                          </Link>
                        ) : (
                          <h4 className="text-base font-bold text-text-primary">{serviceTitle}</h4>
                        )}

                        <p className="text-sm text-text-secondary leading-relaxed pt-1">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === rev._id}
                          onClick={() => handleDelete(rev._id)}
                          className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {deletingId === rev._id ? 'Deleting...' : 'Delete Review'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TouristLayout>
    </ProtectedRoute>
  )
}
