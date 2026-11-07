import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service, ServiceQueryParams } from '@/features/services/types'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Destination } from '@/features/destinations/types'
import { Button } from '@/components/ui/Button'

const CATEGORIES = [
  { id: 'all', label: 'All Experiences', icon: '✨' },
  { id: 'boat', label: 'Boat Excursions', icon: '⛵' },
  { id: 'monastery', label: 'Monastic Tours', icon: '⛪' },
  { id: 'waterfall', label: 'Blue Nile Falls', icon: '🌊' },
  { id: 'tour', label: 'Guided Treks', icon: '🥾' },
  { id: 'hotel', label: 'Eco Lodges', icon: '🏡' },
  { id: 'food', label: 'Cultural Dining', icon: '🍲' },
]

const SORT_OPTIONS: Array<{ value: NonNullable<ServiceQueryParams['sortBy']>; label: string }> = [
  { value: 'featured', label: 'Featured & Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Additions' },
]

export default function ServicesPage() {
  const router = useRouter()

  // State initialized from router query
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedDestination, setSelectedDestination] = useState('all')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [rating, setRating] = useState<number>(0)
  const [ecoFriendly, setEcoFriendly] = useState(false)
  const [sortBy, setSortBy] = useState<ServiceQueryParams['sortBy']>('featured')
  const [page, setPage] = useState(1)

  // Data state
  const [services, setServices] = useState<Service[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)

  // 1. Fetch available destinations for the filter dropdown
  useEffect(() => {
    destinationService
      .getAll({ limit: 50 })
      .then((res) => {
        if (res.data) setDestinations(res.data)
      })
      .catch((err) => console.error('Failed to load destinations for filter:', err))
  }, [])

  // 2. Sync incoming query parameters from URL
  useEffect(() => {
    if (!router.isReady) return

    const q = router.query
    const initialCategory = typeof q.category === 'string' ? q.category : 'all'
    const initialDest = typeof q.destination === 'string' ? q.destination : 'all'
    const initialSearch = typeof q.search === 'string' ? q.search : ''
    const initialMinPrice = typeof q.minPrice === 'string' ? q.minPrice : ''
    const initialMaxPrice = typeof q.maxPrice === 'string' ? q.maxPrice : ''
    const initialRating = Number(q.rating) || 0
    const initialEco = q.ecoFriendly === 'true'
    const initialSort = (typeof q.sortBy === 'string' ? q.sortBy : 'featured') as ServiceQueryParams['sortBy']
    const initialPage = Number(q.page) || 1

    setCategory(initialCategory)
    setSelectedDestination(initialDest)
    setSearch(initialSearch)
    setSearchInput(initialSearch)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setRating(initialRating)
    setEcoFriendly(initialEco)
    setSortBy(initialSort)
    setPage(initialPage)

    setIsReady(true)
  }, [router.isReady, router.query])

  // 3. Load services whenever filter states change
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams: ServiceQueryParams = {
        page,
        limit: 9,
        sortBy,
        category: category !== 'all' ? category : undefined,
        destination: selectedDestination !== 'all' ? selectedDestination : undefined,
        search: search.trim() || undefined,
        ecoFriendly: ecoFriendly ? true : undefined,
        rating: rating > 0 ? rating : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }

      const res = await marketplaceService.getAll(queryParams)
      if (res.data) {
        setServices(res.data)
        setTotal(res.total || res.count || res.data.length)
        setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / 9) || 1)
      }
    } catch (err) {
      console.error('Error fetching marketplace services:', err)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [category, selectedDestination, search, ecoFriendly, rating, minPrice, maxPrice, sortBy, page])

  useEffect(() => {
    if (isReady) {
      fetchServices()
    }
  }, [isReady, fetchServices])

  // Update URL on filter changes
  const updateUrl = (newQuery: Record<string, any>) => {
    const updated = {
      ...router.query,
      ...newQuery,
    }

    // Clean up empty params
    Object.keys(updated).forEach((key) => {
      if (
        updated[key] === '' ||
        updated[key] === 'all' ||
        updated[key] === undefined ||
        updated[key] === false ||
        (key === 'page' && updated[key] === 1) ||
        (key === 'rating' && updated[key] === 0)
      ) {
        delete updated[key]
      }
    })

    router.push({ pathname: '/services', query: updated }, undefined, { shallow: true })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
    updateUrl({ search: searchInput, page: 1 })
  }

  const handleCategoryChange = (catId: string) => {
    setCategory(catId)
    setPage(1)
    updateUrl({ category: catId, page: 1 })
  }

  const handleDestinationChange = (destId: string) => {
    setSelectedDestination(destId)
    setPage(1)
    updateUrl({ destination: destId, page: 1 })
  }

  const handleEcoToggle = () => {
    const nextVal = !ecoFriendly
    setEcoFriendly(nextVal)
    setPage(1)
    updateUrl({ ecoFriendly: nextVal, page: 1 })
  }

  const handleSortChange = (newSort: string) => {
    const casted = newSort as ServiceQueryParams['sortBy']
    setSortBy(casted)
    setPage(1)
    updateUrl({ sortBy: casted, page: 1 })
  }

  const handleRatingChange = (newRating: number) => {
    const target = rating === newRating ? 0 : newRating
    setRating(target)
    setPage(1)
    updateUrl({ rating: target, page: 1 })
  }

  const handlePriceApply = () => {
    setPage(1)
    updateUrl({ minPrice, maxPrice, page: 1 })
  }

  const handleResetFilters = () => {
    setSearch('')
    setSearchInput('')
    setCategory('all')
    setSelectedDestination('all')
    setMinPrice('')
    setMaxPrice('')
    setRating(0)
    setEcoFriendly(false)
    setSortBy('featured')
    setPage(1)
    router.push('/services', undefined, { shallow: true })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (category !== 'all') count++
    if (selectedDestination !== 'all') count++
    if (search) count++
    if (ecoFriendly) count++
    if (rating > 0) count++
    if (minPrice || maxPrice) count++
    return count
  }, [category, selectedDestination, search, ecoFriendly, rating, minPrice, maxPrice])

  return (
    <PublicLayout>
      <Head>
        <title>Lake Tana Tours & Experiences Marketplace | LTTMS</title>
        <meta
          name="description"
          content="Browse and book verified boat charters, monastic cultural tours, eco-guides, and island excursions on UNESCO Lake Tana."
        />
      </Head>

      <div className="bg-surface-muted/30 min-h-screen pb-20">
        {/* Marketplace Hero Header */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
                🌿 UNESCO Biosphere Certified Marketplace
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight">
                Explore Lake Tana Tours & Activities
              </h1>
              <p className="mt-2 text-primary-150 text-sm sm:text-base leading-relaxed">
                Connect directly with licensed local boat captains, certified monastic guides, and sustainable hospitality providers.
              </p>
            </div>

            {/* Quick Keyword Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search boat rides, Zege monasteries, birdwatching..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-md"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                      updateUrl({ search: '' })
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button type="submit" variant="accent" size="lg" className="whitespace-nowrap justify-center">
                Search Tours
              </Button>
            </form>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    category === cat.id
                      ? 'bg-white text-primary-950 font-bold shadow-md'
                      : 'bg-primary-900/60 text-primary-100 hover:bg-primary-800 border border-primary-700/50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section: Sidebar Filters + Services Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Subheader / Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-text-secondary">
                {loading ? 'Searching marketplace...' : `Showing ${total} available experience${total === 1 ? '' : 's'}`}
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-surface-border text-xs font-semibold text-text-primary shadow-xs"
              >
                <span>⚙️ Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-surface-border text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-xs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
            {/* Desktop Filters Sidebar */}
            <aside className={`lg:block ${mobileFiltersOpen ? 'block' : 'hidden'} lg:col-span-1`}>
              <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-6 sticky top-24">
                <div className="flex items-center justify-between border-b border-surface-border pb-3">
                  <h3 className="font-heading font-bold text-text-primary text-base">Filter Tours</h3>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs text-primary-600 hover:underline font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Eco-Friendly Toggle */}
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1">
                      🌿 Eco-Certified
                    </span>
                    <span className="text-[11px] text-emerald-700">Zero-emission or conservation verified</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ecoFriendly}
                    onChange={handleEcoToggle}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                {/* Destination Dropdown Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                    Destination / Island
                  </label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-surface-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all">All Lake Tana Destinations</option>
                    {destinations.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                    Price Range (ETB)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min ETB"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Max ETB"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-surface-muted border border-surface-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-xs mt-2"
                    onClick={handlePriceApply}
                  >
                    Apply Price Filter
                  </Button>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                    Customer Rating
                  </label>
                  <div className="space-y-1.5">
                    {[4, 3].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          rating === star
                            ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
                            : 'hover:bg-surface-muted text-text-secondary'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                          <span className="ml-1">{star}+ Stars</span>
                        </span>
                        {rating === star && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Safety Guarantee */}
                <div className="pt-4 border-t border-surface-border text-xs text-text-muted space-y-2">
                  <div className="flex items-center gap-2 text-text-primary font-semibold">
                    <span>🛡️ Verified Booking</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    All boat captains possess certified safety vests and verified naval permits. Chapa escrow ensures verified service delivery.
                  </p>
                </div>
              </div>
            </aside>

            {/* Services Grid & Pagination */}
            <main className="lg:col-span-3 space-y-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="h-96 bg-white rounded-2xl border border-surface-border p-4 space-y-4">
                      <div className="h-48 bg-surface-border rounded-xl"></div>
                      <div className="h-4 bg-surface-border rounded w-3/4"></div>
                      <div className="h-3 bg-surface-border rounded w-1/2"></div>
                      <div className="h-8 bg-surface-border rounded mt-4"></div>
                    </div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
                  <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
                    🔍
                  </div>
                  <h3 className="text-xl font-bold text-text-primary font-heading">
                    No Matching Experiences Found
                  </h3>
                  <p className="text-text-secondary max-w-md mx-auto text-sm">
                    We could not find any services matching your active filters. Try broadening your criteria or reset filters.
                  </p>
                  <Button variant="primary" size="md" onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((svc) => (
                      <ServiceCard key={svc._id} service={svc} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-8 border-t border-surface-border">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => {
                          const prev = Math.max(page - 1, 1)
                          setPage(prev)
                          updateUrl({ page: prev })
                          window.scrollTo({ top: 200, behavior: 'smooth' })
                        }}
                      >
                        &larr; Previous
                      </Button>
                      <span className="text-xs font-semibold text-text-secondary px-3">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => {
                          const next = Math.min(page + 1, totalPages)
                          setPage(next)
                          updateUrl({ page: next })
                          window.scrollTo({ top: 200, behavior: 'smooth' })
                        }}
                      >
                        Next &rarr;
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
