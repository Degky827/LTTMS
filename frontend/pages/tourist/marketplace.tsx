import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Service, ServiceQueryParams } from '@/features/services/types'
import { Destination } from '@/features/destinations/types'
import { wishlistStorage } from '@/lib/storage/wishlistStorage'
import { useToast } from '@/components/feedback/ToastProvider'
import { useLanguage } from '@/contexts/LanguageContext'

const CATEGORIES = [
  { id: 'all', labelEn: 'All Categories', labelAm: 'ሁሉም ክፍሎች' },
  { id: 'boat_tour', labelEn: '⛵ Boat Tours', labelAm: '⛵ የጀልባ ጉዞዎች' },
  { id: 'monastery_visit', labelEn: '⛪ Island Monasteries', labelAm: '⛪ የደሴት ገዳማት' },
  { id: 'eco_lodge', labelEn: '🌿 Eco-Lodges', labelAm: '🌿 ኢኮ-ሎጆች' },
  { id: 'guided_hike', labelEn: '🥾 Guided Hiking', labelAm: '🥾 የእግር ጉዞ' },
  { id: 'birdwatching', labelEn: '🦅 Birdwatching', labelAm: '🦅 የአእዋፍ ዕይታ' },
  { id: 'cultural_tour', labelEn: '🏺 Cultural Heritage', labelAm: '🏺 ባህላዊ ቅርስ' },
  { id: 'craft_workshop', labelEn: '🧵 Artisan Crafts', labelAm: '🧵 ባህላዊ እደ-ጥበብ' },
]

export default function TouristMarketplacePage() {
  const router = useRouter()
  const { language } = useLanguage()
  const isAm = language === 'am'
  const { addToast } = useToast()

  const [services, setServices] = useState<Service[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDestination, setSelectedDestination] = useState<string>('all')
  const [sortBy, setSortBy] = useState<ServiceQueryParams['sortBy']>('featured')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Wishlist state
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    const syncWishlist = () => {
      const items = wishlistStorage.getSaved()
      setSavedIds(items.map((i) => i._id || (i as any).id))
    }
    syncWishlist()
    window.addEventListener('lttms_saved_updated', syncWishlist)
    return () => window.removeEventListener('lttms_saved_updated', syncWishlist)
  }, [])

  // Sync initial query params from URL (e.g., from destinations page)
  useEffect(() => {
    if (router.query.destination && typeof router.query.destination === 'string') {
      setSelectedDestination(router.query.destination)
    }
    if (router.query.category && typeof router.query.category === 'string') {
      setSelectedCategory(router.query.category)
    }
    if (router.query.search && typeof router.query.search === 'string') {
      setSearch(router.query.search)
    }
  }, [router.query])

  // Load destinations for the filter dropdown
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const res = await destinationService.getAll({ limit: 50 })
        if (res.data) {
          setDestinations(res.data)
        }
      } catch (e) {
        console.warn('Could not load destinations list:', e)
      }
    }
    loadDestinations()
  }, [])

  // Fetch experiences
  const loadMarketplace = useCallback(async () => {
    try {
      setLoading(true)
      const res = await marketplaceService.getAll({
        search: search.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        destination: selectedDestination !== 'all' ? selectedDestination : undefined,
        sortBy,
        page,
        limit: 9,
      })

      if (res.data) {
        setServices(res.data)
        setTotalPages(res.totalPages || 1)
        setTotalCount(res.total || res.count || res.data.length)
      }
    } catch (err) {
      console.error('Failed to load marketplace services:', err)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, selectedDestination, sortBy, page])

  useEffect(() => {
    loadMarketplace()
  }, [loadMarketplace])

  const handleToggleWishlist = (service: Service) => {
    const isNowSaved = wishlistStorage.toggle(service)
    const title = service.title
    addToast({
      type: isNowSaved ? 'success' : 'info',
      title: isNowSaved ? (isAm ? 'ተቀምጧል' : 'Saved to Wishlist') : (isAm ? 'ተሰርዟል' : 'Removed from Wishlist'),
      message: isNowSaved
        ? `${title} ${isAm ? 'ወደተቀመጡ ተሞክሮዎች ታክሏል።' : 'has been saved to your experiences.'}`
        : `${title} ${isAm ? 'ከተቀመጡ ተሞክሮዎች ተወግዷል።' : 'has been removed.'}`,
    })
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSelectedDestination('all')
    setSortBy('featured')
    setPage(1)
  }

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>{isAm ? 'የቱሪዝም ገበያ | ጣና ቱሪዝም' : 'Explore Tourism Marketplace | LTTMS'}</title>
      </Head>
      <TouristLayout title={isAm ? 'የቱሪስት ገበያ' : 'Tourist Marketplace'}>
        <PageHeader
          title={isAm ? 'የጣና ሐይቅ የቱሪዝም ገበያ' : 'Lake Tana Tourism Marketplace'}
          subtitle={
            isAm
              ? 'የተረጋገጡ የጀልባ አስጎብኚዎችን፣ ጥንታዊ የደሴት ገዳማትንና ኢኮ-ሎጆችን ይፈልጉና ያስይዙ።'
              : 'Discover & book certified boat captains, ancient island monasteries, eco-lodges, and cultural adventures.'
          }
          breadcrumbs={[
            { label: isAm ? 'ዳሽቦርድ' : 'Dashboard', href: '/tourist' },
            { label: isAm ? 'ገበያ' : 'Marketplace' },
          ]}
          actions={
            <Link href="/tourist/saved">
              <Button variant="outline" size="sm" className="relative">
                ❤️ {isAm ? 'የተቀመጡ' : 'Saved Wishlist'}
                {savedIds.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-bold bg-primary-600 text-white rounded-full">
                    {savedIds.length}
                  </span>
                )}
              </Button>
            </Link>
          }
        />

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-lake-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder={
                  isAm
                    ? 'በስም ወይም በቦታ ይፈልጉ (ምሳሌ፡ ደብረ ማርያም፣ የጀልባ ጉዞ)...'
                    : 'Search tours, guides, or destinations (e.g. Zege, Boat tour)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm text-text-primary bg-surface-muted/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <svg
                className="w-5 h-5 text-text-muted absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Destination Dropdown */}
            <div>
              <select
                value={selectedDestination}
                onChange={(e) => {
                  setSelectedDestination(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm text-text-primary bg-surface-muted/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{isAm ? 'ሁሉም መዳረሻዎች' : 'All Destinations'}</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any)
                  setPage(1)
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm text-text-primary bg-surface-muted/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              >
                <option value="featured">{isAm ? 'ተመራጭ ቅደም ተከተል' : 'Featured & Recommended'}</option>
                <option value="price-asc">{isAm ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
                <option value="price-desc">{isAm ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
                <option value="rating">{isAm ? 'ከፍተኛ ደረጃ የተሰጣቸው' : 'Highest Rated'}</option>
                <option value="newest">{isAm ? 'አዳዲስ ጉብኝቶች' : 'Newest Listed'}</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-surface-border">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setPage(1)
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-primary-600 text-white shadow-lake-sm'
                      : 'bg-surface-muted text-text-secondary hover:text-text-primary hover:bg-gray-200'
                  }`}
                >
                  {isAm ? cat.labelAm : cat.labelEn}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs sm:text-sm font-semibold text-text-secondary">
            {isAm
              ? `የተገኙ አገልግሎቶች፡ ${totalCount}`
              : `Showing ${services.length} of ${totalCount} verified experiences`}
          </p>
          {(search || selectedCategory !== 'all' || selectedDestination !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary-600 font-bold hover:underline"
            >
              {isAm ? 'ማጣሪያዎችን አጽዳ' : 'Clear all filters'}
            </button>
          )}
        </div>

        {/* Experiences Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 bg-white rounded-2xl border border-surface-border animate-pulse p-4"
              ></div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4 my-8">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
              🔍
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              {isAm ? 'ምንም አገልግሎት አልተገኘም' : 'No Experiences Found'}
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              {isAm
                ? 'በመረጡት ማጣሪያ የሚዛመድ የቱሪዝም አገልግሎት የለም። እባክዎ ፍለጋዎን ይቀይሩ።'
                : 'No tourism services matched your selected criteria. Try adjusting your search or category filters.'}
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              {isAm ? 'ሁሉንም አገልግሎቶች አሳይ' : 'Reset All Filters'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {services.map((item) => {
              const isSaved = savedIds.includes(item._id || (item as any).id)
              const vendor = item.vendor || ({} as any)
              const dest = item.destination || ({} as any)
              const imageUrl = item.coverImage || (item.images && item.images[0]?.url) || '/images/hero-1.jpg'

              return (
                <Card
                  key={item._id}
                  bordered
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-lake-md transition-all duration-200 flex flex-col group"
                >
                  {/* Image Container with Badges & Wishlist Button */}
                  <div className="relative h-48 w-full bg-surface-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero-1.jpg'
                      }}
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black/60 text-white backdrop-blur-xs capitalize">
                        {item.category?.replace('_', ' ') || 'Eco-Tour'}
                      </span>
                      {item.ecoFriendly && (
                        <span className="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white backdrop-blur-xs flex items-center gap-1">
                          🌿 Eco
                        </span>
                      )}
                    </div>

                    {/* Bookmark Heart Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleWishlist(item)}
                      aria-label="Save to Wishlist"
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs shadow-md transition-all ${
                        isSaved
                          ? 'bg-red-50 text-red-600 hover:scale-110 ring-2 ring-red-400'
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <svg
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={isSaved ? 0 : 2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    {/* Destination tag */}
                    {dest.name && (
                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-white/90 text-text-primary text-xs font-semibold shadow-xs">
                        📍 {dest.name}
                      </div>
                    )}
                  </div>

                  {/* Content Body */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Operator Info */}
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                        <span>{vendor.businessName || 'Verified Operator'}</span>
                        <span className="text-primary-600 text-xs font-bold" title="Verified Lake Tana Operator">
                          ✓
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-base text-text-primary font-heading line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
                        {item.shortDescription || item.description}
                      </p>

                      {/* Rating & Duration */}
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-3">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          ★ {item.rating > 0 ? item.rating.toFixed(1) : '5.0'}
                          <span className="text-text-muted font-normal">
                            ({item.reviewCount || 0})
                          </span>
                        </span>
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            ⏱️ {item.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                      <div>
                        <span className="text-xs text-text-muted block">
                          {isAm ? 'ዋጋ' : 'From'}
                        </span>
                        <span className="text-base font-extrabold text-primary-700 font-heading">
                          {Number(item.price).toLocaleString()} {item.currency || 'ETB'}
                        </span>
                        <span className="text-xs text-text-secondary ml-1">
                          /{item.pricingType === 'per_group' ? (isAm ? 'ቡድን' : 'group') : (isAm ? 'ሰው' : 'person')}
                        </span>
                      </div>

                      <Link href={`/services/${item.slug || item._id}`}>
                        <Button variant="primary" size="sm" className="font-semibold shadow-lake-sm">
                          {isAm ? 'ቦታ ያዝ' : 'View & Book'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              &larr; {isAm ? 'ቀዳሚ' : 'Previous'}
            </Button>
            <span className="text-xs text-text-secondary px-3 font-semibold">
              {isAm ? `ገጽ ${page} ከ ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {isAm ? 'ቀጣይ' : 'Next'} &rarr;
            </Button>
          </div>
        )}
      </TouristLayout>
    </ProtectedRoute>
  )
}
