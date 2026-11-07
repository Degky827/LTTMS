import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service } from '@/features/services/types'
import { reviewService } from '@/features/reviews/services/reviewService'
import { Review } from '@/features/reviews/types'
import { BookingPanel } from '@/features/services/components/BookingPanel'
import { ReviewCard } from '@/features/reviews/components/ReviewCard'
import { ReviewFormModal } from '@/features/reviews/components/ReviewFormModal'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'

export default function ServiceDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const { isAuthenticated } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedServices, setRelatedServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  useEffect(() => {
    if (!slug || Array.isArray(slug)) return

    const loadService = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await marketplaceService.getByIdOrSlug(slug)
        if (res.data) {
          const svc = res.data
          setService(svc)
          const initialImg =
            svc.coverImage ||
            svc.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'
          setSelectedImage(initialImg)

          // Load reviews
          try {
            setReviewsLoading(true)
            const revRes = await reviewService.getByService(svc._id)
            if (revRes.data) {
              setReviews(revRes.data)
            }
          } catch (rErr) {
            console.error('Error loading service reviews:', rErr)
          } finally {
            setReviewsLoading(false)
          }

          // Load related services
          try {
            const relRes = await marketplaceService.getAll({
              category: svc.category,
              limit: 3,
            })
            if (relRes.data) {
              setRelatedServices(relRes.data.filter((s) => s._id !== svc._id).slice(0, 3))
            }
          } catch (relErr) {
            console.error('Error loading related services:', relErr)
          }
        } else {
          setError('Service not found')
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err)
        setError(err?.response?.data?.message || 'Failed to load tour details')
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [slug])

  const refreshReviews = async () => {
    if (!service?._id) return
    try {
      const res = await reviewService.getByService(service._id)
      if (res.data) setReviews(res.data)
    } catch (err) {
      console.error('Failed to refresh reviews:', err)
    }
  }

  return (
    <PublicLayout>
      <Head>
        <title>{service ? `${service.title} | Lake Tana Experiences` : 'Tour Details | LTTMS'}</title>
        <meta
          name="description"
          content={service?.shortDescription || service?.description?.substring(0, 160) || 'Book tours on Lake Tana'}
        />
      </Head>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
          <div className="h-6 bg-surface-border rounded w-1/4"></div>
          <div className="h-10 bg-surface-border rounded w-3/4"></div>
          <div className="h-96 bg-surface-border rounded-3xl w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-surface-border rounded-2xl"></div>
              <div className="h-48 bg-surface-border rounded-2xl"></div>
            </div>
            <div className="h-96 bg-surface-border rounded-2xl"></div>
          </div>
        </div>
      ) : error || !service ? (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Experience Not Found</h1>
          <p className="text-text-secondary mb-6">{error || 'This tour experience may have been unlisted or removed.'}</p>
          <Link href="/services">
            <Button variant="primary">Browse All Lake Tana Tours</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-surface-muted/30 pb-20">
          {/* Breadcrumb Header */}
          <div className="bg-white border-b border-surface-border py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center space-x-2 text-xs sm:text-sm text-text-muted">
                <Link href="/" className="hover:text-primary-600 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/services" className="hover:text-primary-600 transition-colors">
                  Marketplace
                </Link>
                <span>/</span>
                <Link
                  href={`/services?category=${service.category}`}
                  className="hover:text-primary-600 transition-colors capitalize"
                >
                  {service.category}
                </Link>
                <span>/</span>
                <span className="text-text-primary font-medium truncate max-w-[200px] sm:max-w-none">
                  {service.title}
                </span>
              </nav>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
            {/* Title & Top Metadata */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm" className="capitalize">
                  {service.category}
                </Badge>
                {service.ecoFriendly && (
                  <Badge variant="success" size="sm">
                    🌿 Eco-Certified Biosphere Tour
                  </Badge>
                )}
                {service.isFeatured && (
                  <Badge variant="accent" size="sm">
                    Top Recommended
                  </Badge>
                )}
                <span className="text-xs text-text-muted flex items-center gap-1 ml-1">
                  📍 {service.location || 'Lake Tana, Bahir Dar'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary font-heading">
                {service.title}
              </h1>

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5 font-bold text-text-primary">
                  <span className="text-amber-500">★</span>
                  <span>{service.rating ? service.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-text-muted font-normal">
                    ({service.reviewCount || reviews.length} reviews)
                  </span>
                </div>
                <span>•</span>
                <span>Duration: <strong className="text-text-primary">{service.duration || 'Half Day'}</strong></span>
                {service.destination && (
                  <>
                    <span>•</span>
                    <Link
                      href={`/destinations/${service.destination.slug || service.destination._id}`}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      Destination: {service.destination.name}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="relative w-full h-80 sm:h-96 lg:h-[460px] rounded-3xl overflow-hidden shadow-md bg-surface-border">
                <Image
                  src={
                    selectedImage ||
                    service.coverImage ||
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={service.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {/* Gallery Thumbnails */}
              {service.images && service.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {service.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === img.url ? 'border-primary-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt={img.caption || `Photo ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Layout Grid: Tour Details + Sticky Booking Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Extensive Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Highlights Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-surface-border shadow-xs text-center">
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted uppercase tracking-wider block">Duration</span>
                    <span className="text-sm font-bold text-text-primary">{service.duration || 'Flexible'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted uppercase tracking-wider block">Difficulty</span>
                    <span className="text-sm font-bold text-text-primary capitalize">{service.difficulty || 'Easy'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted uppercase tracking-wider block">Group Capacity</span>
                    <span className="text-sm font-bold text-text-primary">
                      {service.dailyCapacity ? `Up to ${service.dailyCapacity}` : '1-20 Guests'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-text-muted uppercase tracking-wider block">Confirmation</span>
                    <span className="text-sm font-bold text-emerald-600">Instant</span>
                  </div>
                </div>

                {/* Full Description */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                    Experience Overview
                  </h2>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {service.description}
                  </p>
                </div>

                {/* What is Included & Excluded */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                    What&apos;s Included
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Included */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                        Included in Price
                      </h3>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        {service.included && service.included.length > 0 ? (
                          service.included.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>Licensed boat operator and fuel</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>Certified life safety jackets</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>UNESCO Biosphere tourist conservation pass</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Excluded */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">✕</span>
                        Not Included
                      </h3>
                      <ul className="space-y-2 text-sm text-text-secondary">
                        {service.excluded && service.excluded.length > 0 ? (
                          service.excluded.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-gray-400 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-400 font-bold">•</span>
                              <span>Individual monastery entrance fees (payable at gates)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-400 font-bold">•</span>
                              <span>Personal beverages and souvenirs</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-400 font-bold">•</span>
                              <span>Guide gratuities</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Meeting Point & Policies */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                    Meeting Point & Departure
                  </h2>
                  <div className="space-y-3">
                    <p className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-lg">📍</span>
                      <span>
                        <strong>Meeting Point:</strong> {service.meetingPoint || 'Bahir Dar Marine Jetty, Lake Tana Port'}
                      </span>
                    </p>
                    <p className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-lg">⏰</span>
                      <span>
                        <strong>Departure Times:</strong> Morning departures start at 08:30 AM. Please arrive 15 minutes prior.
                      </span>
                    </p>
                    <p className="text-sm text-text-secondary flex items-start gap-2">
                      <span className="text-lg">🛡️</span>
                      <span>
                        <strong>Cancellation Policy:</strong> {service.cancellationPolicy || 'Free cancellation up to 24 hours before tour start.'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Vendor Profile Card */}
                {service.vendor && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                      Operated by Verified Local Vendor
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
                          {service.vendor.businessName?.[0] || 'V'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-text-primary font-heading">
                            {service.vendor.businessName}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="accent" size="sm">
                              Verified Boat Operator
                            </Badge>
                            {service.vendor.rating && (
                              <span className="text-xs text-text-muted">
                                ★ {service.vendor.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link href={`/vendors/${service.vendor.slug || service.vendor._id}`}>
                        <Button variant="outline" size="sm">
                          View Vendor Profile &rarr;
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                        Verified Explorer Reviews
                      </h2>
                      <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                        Ratings and authentic accounts from travelers on Lake Tana.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push(`/login?redirect=/services/${slug}`)
                        } else {
                          setReviewModalOpen(true)
                        }
                      }}
                    >
                      Write a Review
                    </Button>
                  </div>

                  {reviewsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2].map((n) => (
                        <div key={n} className="h-24 bg-surface-muted rounded-xl"></div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <p className="text-sm text-text-secondary">
                        No reviews yet for this experience. Be the first traveler to share your journey!
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            router.push(`/login?redirect=/services/${slug}`)
                          } else {
                            setReviewModalOpen(true)
                          }
                        }}
                      >
                        Submit First Review
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <ReviewCard key={rev._id} review={rev} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sticky Booking Widget */}
              <div className="lg:col-span-1">
                <BookingPanel service={service} />
              </div>
            </div>

            {/* Related Tours & Experiences */}
            {relatedServices.length > 0 && (
              <div className="pt-12 border-t border-surface-border space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary font-heading">
                    Other Recommended Experiences
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Explore more adventures and cultural boat excursions across Lake Tana.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedServices.map((relSvc) => (
                    <ServiceCard key={relSvc._id} service={relSvc} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Submission Modal */}
          {service && (
            <ReviewFormModal
              isOpen={reviewModalOpen}
              onClose={() => setReviewModalOpen(false)}
              serviceId={service._id}
              serviceTitle={service.title}
              onSuccess={refreshReviews}
            />
          )}
        </div>
      )}
    </PublicLayout>
  )
}
