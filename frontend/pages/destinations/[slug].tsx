import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Destination } from '@/features/destinations/types'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service } from '@/features/services/types'
import { ServiceCard } from '@/features/services/components/ServiceCard'

export default function DestinationDetailPage() {
  const router = useRouter()
  const { slug } = router.query

  const [destination, setDestination] = useState<Destination | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!slug || Array.isArray(slug)) return

    const loadDestination = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await destinationService.getByIdOrSlug(slug)
        if (res.data) {
          setDestination(res.data)
          setSelectedImage(res.data.coverImage || '/placeholder-destination.jpg')

          // Load services linked to this destination
          try {
            setServicesLoading(true)
            const servRes = await marketplaceService.getAll({
              destination: res.data._id,
              limit: 6,
            })
            if (servRes.data) {
              setServices(servRes.data)
            }
          } catch (servErr) {
            console.error('Failed to load destination services:', servErr)
          } finally {
            setServicesLoading(false)
          }
        } else {
          setError('Destination not found')
        }
      } catch (err: any) {
        console.error('Error fetching destination:', err)
        setError(err?.response?.data?.message || 'Failed to load destination details')
      } finally {
        setLoading(false)
      }
    }

    loadDestination()
  }, [slug])

  const destinationTypeLabels: Record<string, string> = {
    monastery: 'Ancient Monastery',
    island: 'Scenic Island',
    waterfall: 'Natural Waterfall',
    wildlife_sanctuary: 'Wildlife Sanctuary',
    historical_site: 'Historical Heritage',
    cultural_village: 'Cultural Village',
    viewpoint: 'Panoramic Viewpoint',
    other: 'Attraction',
  }

  return (
    <PublicLayout>
      <Head>
        <title>{destination ? `${destination.name} | Lake Tana Tourism` : 'Destination Details | LTTMS'}</title>
        <meta
          name="description"
          content={destination?.shortDescription || destination?.description?.substring(0, 160) || 'Discover Lake Tana destinations'}
        />
      </Head>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
          <div className="h-8 bg-surface-border rounded w-1/4"></div>
          <div className="h-96 bg-surface-border rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-6 bg-surface-border rounded w-3/4"></div>
              <div className="h-4 bg-surface-border rounded w-full"></div>
              <div className="h-4 bg-surface-border rounded w-5/6"></div>
            </div>
            <div className="h-64 bg-surface-border rounded-xl"></div>
          </div>
        </div>
      ) : error || !destination ? (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Destination Not Found</h1>
          <p className="text-text-secondary mb-6">
            {error || 'We could not locate the requested destination along Lake Tana.'}
          </p>
          <Link href="/destinations">
            <Button variant="primary">Browse All Destinations</Button>
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
                <Link href="/destinations" className="hover:text-primary-600 transition-colors">
                  Destinations
                </Link>
                <span>/</span>
                <span className="text-text-primary font-medium truncate">{destination.name}</span>
              </nav>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
            {/* Title & Metadata Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="primary" size="sm">
                    {destinationTypeLabels[destination.destinationType] || destination.destinationType}
                  </Badge>
                  {destination.isFeatured && (
                    <Badge variant="accent" size="sm">
                      UNESCO Biosphere Highlight
                    </Badge>
                  )}
                  {destination.location?.city && (
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      📍 {destination.location.city}, {destination.location.region || 'Amhara, Ethiopia'}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary font-heading">
                  {destination.name}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/services?destination=${destination._id}`}>
                  <Button variant="primary" size="md">
                    Find Boat Tours & Guides
                  </Button>
                </Link>
              </div>
            </div>

            {/* Gallery / Hero Display */}
            <div className="space-y-4">
              <div className="relative w-full h-80 sm:h-96 lg:h-[480px] rounded-3xl overflow-hidden shadow-md bg-surface-border">
                <Image
                  src={selectedImage || destination.coverImage || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80'}
                  alt={destination.name}
                  fill
                  priority
                  className="object-cover transition-all duration-300"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                {destination.shortDescription && (
                  <p className="absolute bottom-6 left-6 right-6 text-white text-base sm:text-lg max-w-2xl drop-shadow-md">
                    {destination.shortDescription}
                  </p>
                )}
              </div>

              {/* Thumbnail Bar */}
              {destination.gallery && destination.gallery.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {destination.coverImage && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(destination.coverImage || null)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === destination.coverImage ? 'border-primary-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={destination.coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                    </button>
                  )}
                  {destination.gallery.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === imgUrl ? 'border-primary-500 scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content & Sidebar Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                    About {destination.name}
                  </h2>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {destination.description}
                  </p>
                </div>

                {/* Cultural & Historical Significance */}
                {(destination.historicalSignificance || destination.culturalSignificance) && (
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-border shadow-xs space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary font-heading">
                      History & Sacred Heritage
                    </h2>

                    {destination.historicalSignificance && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-700">
                          Historical Background
                        </h3>
                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                          {destination.historicalSignificance}
                        </p>
                      </div>
                    )}

                    {destination.culturalSignificance && (
                      <div className="space-y-2 pt-2 border-t border-surface-border">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-700">
                          Cultural Traditions & Customs
                        </h3>
                        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                          {destination.culturalSignificance}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ecological & Conservation Significance */}
                {destination.ecologicalSignificance && (
                  <div className="bg-emerald-50/60 rounded-2xl p-6 sm:p-8 border border-emerald-200/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌿</span>
                      <h2 className="text-lg sm:text-xl font-bold text-emerald-950 font-heading">
                        UNESCO Lake Tana Biosphere Reserve Protection
                      </h2>
                    </div>
                    <p className="text-emerald-900/90 text-sm sm:text-base leading-relaxed">
                      {destination.ecologicalSignificance}
                    </p>
                    <p className="text-xs text-emerald-800 italic pt-2">
                      Visitors are requested to observe zero-waste principles, respect monastic sanctuaries, and protect local pelican and bird nesting zones.
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar: Practical Info & Visiting Details */}
              <div className="space-y-6">
                <Card bordered className="bg-white shadow-xs">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                      Visiting Information
                    </h3>

                    {/* Entry Fees */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Entry Fee
                      </span>
                      {destination.entryFee ? (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between items-center text-text-secondary">
                            <span>Ethiopian Citizens</span>
                            <span className="font-semibold text-text-primary">
                              {destination.entryFee.citizens !== undefined
                                ? `${destination.entryFee.citizens} ETB`
                                : 'Free'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-text-secondary">
                            <span>Resident Expats</span>
                            <span className="font-semibold text-text-primary">
                              {destination.entryFee.residents !== undefined
                                ? `${destination.entryFee.residents} ETB`
                                : 'Standard'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-text-secondary">
                            <span>Foreign Tourists</span>
                            <span className="font-semibold text-text-primary">
                              {destination.entryFee.foreigners !== undefined
                                ? `${destination.entryFee.foreigners} ETB`
                                : 'Standard'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted">Standard admission fee set by local monastic/community authority.</p>
                      )}
                    </div>

                    {/* Visiting Hours */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Visiting Hours
                      </span>
                      <p className="text-sm font-medium text-text-primary">
                        {destination.visitingHours || 'Daily from sunrise to 5:30 PM (Boat arrivals only)'}
                      </p>
                    </div>

                    {/* Best Time to Visit */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Best Time to Visit
                      </span>
                      <p className="text-sm font-medium text-text-primary">
                        {destination.bestTimeToVisit || 'October to March (Calm waters & sunny days)'}
                      </p>
                    </div>

                    {/* Coordinates & Location */}
                    {destination.location && (
                      <div className="space-y-1 pt-2 border-t border-surface-border">
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Geography
                        </span>
                        <p className="text-sm text-text-secondary">
                          {destination.location.address || `${destination.location.city || 'Lake Tana'}, Bahir Dar, Ethiopia`}
                        </p>
                        {destination.location.coordinates?.latitude && (
                          <p className="text-xs font-mono text-text-muted">
                            Lat: {destination.location.coordinates.latitude.toFixed(4)}, Long: {destination.location.coordinates.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {destination.tags && destination.tags.length > 0 && (
                      <div className="pt-2 border-t border-surface-border">
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
                          Tags
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {destination.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Link href={`/services?destination=${destination._id}`} className="block">
                        <Button variant="primary" className="w-full justify-center">
                          Book a Tour to {destination.name}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tours & Experiences at this Destination */}
            <div className="pt-8 border-t border-surface-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary font-heading">
                    Experiences & Tours Visiting {destination.name}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Certified boat operators, eco-guides, and island excursion packages.
                  </p>
                </div>
                <Link href={`/services?destination=${destination._id}`}>
                  <Button variant="outline" size="sm">
                    View All Matching Tours &rarr;
                  </Button>
                </Link>
              </div>

              {servicesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-80 bg-surface-border rounded-2xl"></div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-surface-border">
                  <p className="text-text-secondary mb-4">
                    No specific package tours are listed exclusively for this destination yet.
                  </p>
                  <Link href="/services">
                    <Button variant="outline" size="sm">
                      Explore All Lake Tana Boat Tours
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((svc) => (
                    <ServiceCard key={svc._id} service={svc} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
