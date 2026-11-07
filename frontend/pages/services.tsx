import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service, ServiceQueryParams } from '@/features/services/types'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Destination } from '@/features/destinations/types'

const CATEGORIES = [
  { id: 'all', label: 'All Experiences', icon: '✨' },
  { id: 'hotel', label: 'Lodges & Stays', icon: '🏡' },
  { id: 'boat', label: 'Boat Transportation', icon: '⛵' },
  { id: 'tour', label: 'Tour Guides', icon: '🥾' },
  { id: 'food', label: 'Cultural Activities', icon: '🍲' },
]

const SORT_OPTIONS: Array<{ value: NonNullable<ServiceQueryParams['sortBy']>; label: string }> = [
  { value: 'featured', label: 'Featured & Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Additions' },
]

const CURATED_FALLBACK_SERVICES: Service[] = [
  {
    _id: 'full-day-monasteries-cruise',
    title: 'Full-Day Island Monasteries Boat Expedition',
    slug: 'full-day-monasteries-cruise',
    description: 'Cruise the sacred waters of Lake Tana to explore Ura Kidane Mehret, Azwa Maryam, and Kibran Gebriel with an expert certified local guide.',
    shortDescription: 'Full-day motorboat cruise to Zege Peninsula and 14th-century circular island monasteries.',
    category: 'boat',
    price: 2800,
    currency: 'ETB',
    duration: '8 hours',
    location: 'Bahir Dar Pier, Lake Tana',
    coverImage: '/images/Boat.jpg',
    images: [{ url: '/images/Boat.jpg', caption: 'Lake Tana Boat Cruise' }],
    vendor: {
      _id: 'v1',
      businessName: 'Lake Tana Boatmen Cooperative',
      status: 'approved',
      rating: 4.9,
    },
    destination: {
      _id: 'd1',
      name: 'Zege Peninsula & Islands',
      slug: 'zege-peninsula',
    },
    ecoFriendly: true,
    rating: 4.9,
    reviewCount: 48,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'kuriftu-resort-lake-tana',
    title: 'Kuriftu Resort & Lakeside Eco-Lodge Stay',
    slug: 'kuriftu-resort-lake-tana',
    description: 'Luxury waterfront eco-lodge featuring handcrafted stone and wood architecture, serene lakefront gardens, spa therapies, and organic Ethiopian dining.',
    shortDescription: 'Waterfront eco-resort with panoramic Lake Tana sunset views and cultural spa amenities.',
    category: 'hotel',
    price: 4500,
    currency: 'ETB',
    duration: 'Per Night',
    location: 'Lake Tana Shore, Bahir Dar',
    coverImage: '/images/hotel.jpg',
    images: [{ url: '/images/hotel.jpg', caption: 'Lakeside Eco-Lodge' }],
    vendor: {
      _id: 'v2',
      businessName: 'Kuriftu Hospitality Group',
      status: 'approved',
      rating: 4.8,
    },
    destination: {
      _id: 'd2',
      name: 'Bahir Dar Waterfront',
      slug: 'bahir-dar',
    },
    ecoFriendly: true,
    rating: 4.8,
    reviewCount: 36,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'zege-peninsula-guided-trek',
    title: 'Zege Peninsula & Ura Kidane Mehret Guided Tour',
    slug: 'zege-peninsula-guided-trek',
    description: 'Walk through dense indigenous coffee canopies accompanied by a licensed resident monastic guide, discovering 16th-century painted murals and ecclesiastical crowns.',
    shortDescription: 'Certified resident guide excursion through wild coffee forests to medieval round churches.',
    category: 'tour',
    price: 1800,
    currency: 'ETB',
    duration: '4 hours',
    location: 'Zege Peninsula, Lake Tana',
    coverImage: '/images/monastery.jpg',
    images: [{ url: '/images/monastery.jpg', caption: 'Monastery Murals' }],
    vendor: {
      _id: 'v3',
      businessName: 'Zege Certified Heritage Guides Association',
      status: 'approved',
      rating: 5.0,
    },
    destination: {
      _id: 'd1',
      name: 'Zege Peninsula',
      slug: 'zege-peninsula',
    },
    ecoFriendly: true,
    rating: 5.0,
    reviewCount: 52,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'sunset-pelican-cruise',
    title: 'Sunset Lake Cruise & Pelican Sanctuary Safari',
    slug: 'sunset-pelican-cruise',
    description: 'An unforgettable 3-hour evening boat cruise to the Blue Nile river outlet where thousands of great white pelicans roost at sunset over the tranquil waters.',
    shortDescription: 'Evening boat cruise to the Blue Nile outlet where thousands of pelicans roost at sunset.',
    category: 'boat',
    price: 1500,
    currency: 'ETB',
    duration: '3 hours',
    location: 'Blue Nile Outlet, Bahir Dar',
    coverImage: '/images/lake-tana-hero-bg.jpg',
    images: [{ url: '/images/lake-tana-hero-bg.jpg', caption: 'Lake Sunset' }],
    vendor: {
      _id: 'v1',
      businessName: 'Lake Tana Boatmen Cooperative',
      status: 'approved',
      rating: 4.9,
    },
    destination: {
      _id: 'd2',
      name: 'Blue Nile Outlet',
      slug: 'bahir-dar',
    },
    ecoFriendly: true,
    rating: 4.9,
    reviewCount: 39,
    availability: true,
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'blue-nile-falls-trek',
    title: 'Blue Nile Falls (Tis Issat) Hiking & Cultural Day Excursion',
    slug: 'blue-nile-falls-trek',
    description: 'Scenic countryside hike to the thunderous "Smoke of Fire" waterfall, across the 17th-century Portuguese Stone Bridge and traditional Gojjam agricultural villages.',
    shortDescription: 'Guided countryside trek to Ethiopia’s most celebrated 45m waterfall and Portuguese bridge.',
    category: 'tour',
    price: 2200,
    currency: 'ETB',
    duration: '5 hours',
    location: 'Tis Abay Village, 30km from Bahir Dar',
    coverImage: '/images/waterfall.jpg',
    images: [{ url: '/images/waterfall.jpg', caption: 'Blue Nile Falls' }],
    vendor: {
      _id: 'v4',
      businessName: 'Tis Abay Eco-Trek Guides',
      status: 'approved',
      rating: 4.8,
    },
    destination: {
      _id: 'd3',
      name: 'Blue Nile Falls (Tis Issat)',
      slug: 'blue-nile-falls',
    },
    ecoFriendly: true,
    rating: 4.8,
    reviewCount: 64,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'cultural-fish-coffee-experience',
    title: 'Bahir Dar Fresh Fish Tasting & Traditional Buna Ceremony',
    slug: 'cultural-fish-coffee-experience',
    description: 'Savor freshly prepared Lake Tana fish with spicy awaze, followed by an authentic Ethiopian coffee ceremony roasted over hot coals with fragrant frankincense.',
    shortDescription: 'Authentic culinary experience featuring lake fish, injera, and three-round buna coffee ceremony.',
    category: 'food',
    price: 1100,
    currency: 'ETB',
    duration: '2.5 hours',
    location: 'Fish Market Pier, Bahir Dar',
    coverImage: '/images/restaurant.webp',
    images: [{ url: '/images/restaurant.webp', caption: 'Cultural Dining' }],
    vendor: {
      _id: 'v5',
      businessName: 'Tana Women Culinary Cooperative',
      status: 'approved',
      rating: 4.9,
    },
    destination: {
      _id: 'd2',
      name: 'Bahir Dar Pier',
      slug: 'bahir-dar',
    },
    ecoFriendly: true,
    rating: 4.9,
    reviewCount: 31,
    availability: true,
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
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
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [ecoFriendly, setEcoFriendly] = useState(false)
  const [sortBy, setSortBy] = useState<ServiceQueryParams['sortBy']>('featured')
  const [page, setPage] = useState(1)

  // Data state
  const [services, setServices] = useState<Service[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // 1. Fetch available destinations for the filter dropdown
  useEffect(() => {
    destinationService
      .getAll({ limit: 50 })
      .then((res) => {
        if (res.data && res.data.length > 0) setDestinations(res.data)
      })
      .catch(() => {})
  }, [])

  // 2. Sync incoming query parameters from URL
  useEffect(() => {
    if (!router.isReady) return

    const q = router.query
    const initialCategory = typeof q.category === 'string' ? q.category : 'all'
    const initialDest = typeof q.destination === 'string' ? q.destination : 'all'
    const initialSearch = typeof q.search === 'string' ? q.search : (typeof q.q === 'string' ? q.q : '')
    const initialMinPrice = typeof q.minPrice === 'string' ? q.minPrice : ''
    const initialMaxPrice = typeof q.maxPrice === 'string' ? q.maxPrice : ''
    const initialAvail = q.availability === 'true'
    const initialEco = q.ecoFriendly === 'true'
    const initialSort = (typeof q.sortBy === 'string' ? q.sortBy : 'featured') as ServiceQueryParams['sortBy']
    const initialPage = Number(q.page) || 1

    setCategory(initialCategory)
    setSelectedDestination(initialDest)
    setSearch(initialSearch)
    setSearchInput(initialSearch)
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setAvailabilityOnly(initialAvail)
    setEcoFriendly(initialEco)
    setSortBy(initialSort)
    setPage(initialPage)

    setIsReady(true)
  }, [router.isReady, router.query])

  // 3. Load services with fallback support
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams: ServiceQueryParams = {
        page,
        limit: 12,
        sortBy,
        category: category !== 'all' ? category : undefined,
        destination: selectedDestination !== 'all' ? selectedDestination : undefined,
        search: search.trim() || undefined,
        ecoFriendly: ecoFriendly ? true : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }

      const res = await marketplaceService.getAll(queryParams)
      if (res?.data && res.data.length > 0) {
        let filtered = res.data
        if (availabilityOnly) {
          filtered = filtered.filter((s) => s.availability !== false)
        }
        setServices(filtered)
        setTotal(filtered.length)
      } else {
        // Apply local filter to curated fallbacks
        let fallbackList = CURATED_FALLBACK_SERVICES
        if (category !== 'all') {
          if (category === 'tour') {
            fallbackList = fallbackList.filter((s) => s.category === 'tour' || s.category === 'monastery')
          } else if (category === 'food') {
            fallbackList = fallbackList.filter((s) => s.category === 'food' || s.category === 'wildlife')
          } else {
            fallbackList = fallbackList.filter((s) => s.category === category)
          }
        }
        if (selectedDestination !== 'all') {
          fallbackList = fallbackList.filter(
            (s) =>
              s.destination?.slug === selectedDestination ||
              s.location.toLowerCase().includes(selectedDestination.toLowerCase())
          )
        }
        if (search.trim()) {
          const lower = search.toLowerCase()
          fallbackList = fallbackList.filter(
            (s) => s.title.toLowerCase().includes(lower) || s.description.toLowerCase().includes(lower)
          )
        }
        if (minPrice) {
          fallbackList = fallbackList.filter((s) => s.price >= Number(minPrice))
        }
        if (maxPrice) {
          fallbackList = fallbackList.filter((s) => s.price <= Number(maxPrice))
        }
        if (availabilityOnly) {
          fallbackList = fallbackList.filter((s) => s.availability)
        }
        if (ecoFriendly) {
          fallbackList = fallbackList.filter((s) => s.ecoFriendly)
        }

        setServices(fallbackList)
        setTotal(fallbackList.length)
      }
    } catch {
      setServices(CURATED_FALLBACK_SERVICES)
      setTotal(CURATED_FALLBACK_SERVICES.length)
    } finally {
      setLoading(false)
    }
  }, [category, selectedDestination, search, ecoFriendly, availabilityOnly, minPrice, maxPrice, sortBy, page])

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

    Object.keys(updated).forEach((key) => {
      if (
        updated[key] === '' ||
        updated[key] === 'all' ||
        updated[key] === undefined ||
        updated[key] === false ||
        (key === 'page' && updated[key] === 1)
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

  const handlePricePreset = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
    setPage(1)
    updateUrl({ minPrice: min, maxPrice: max, page: 1 })
  }

  const handleResetFilters = () => {
    setSearch('')
    setSearchInput('')
    setCategory('all')
    setSelectedDestination('all')
    setMinPrice('')
    setMaxPrice('')
    setAvailabilityOnly(false)
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
    if (availabilityOnly) count++
    if (minPrice || maxPrice) count++
    return count
  }, [category, selectedDestination, search, ecoFriendly, availabilityOnly, minPrice, maxPrice])

  return (
    <PublicLayout>
      <Head>
        <title>Explore Lake Tana | Tourism Services & Experiences | LTTMS</title>
        <meta
          name="description"
          content="Explore available tourism services on Lake Tana: verified boat charters, lakeside eco-lodges, expert monastic tour guides, and cultural experiences in Bahir Dar."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors">
        {/* 1. Explore Panoramic Header */}
        <div className="relative bg-[#143224] text-white pt-16 pb-20 sm:pt-20 sm:pb-24 overflow-hidden border-b border-emerald-950">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              src="/images/lake-tana-hero-bg.jpg"
              alt="Lake Tana Panorama"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/Boat.jpg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143224] via-[#143224]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>UNESCO BIOSPHERE TOURISM MARKETPLACE</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Explore Lake Tana
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                Discover verified boat transportation, lakeside eco-lodges, expert monastic tour guides, and authentic cultural activities directly with local operators.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Large Search & Filter Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#132620] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 transition-colors">
            {/* Primary Search Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search by Service Name */}
              <div className="md:col-span-5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by service name or keyword..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#244B3A] dark:focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Location Select */}
              <div className="md:col-span-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#244B3A] dark:text-emerald-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <select
                  value={selectedDestination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#244B3A] dark:focus:ring-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All Locations & Pier Desks</option>
                  <option value="zege-peninsula">Zege Peninsula</option>
                  <option value="bahir-dar">Bahir Dar Waterfront</option>
                  <option value="ura-kidane-mehret">Ura Kidane Mehret</option>
                  <option value="blue-nile-falls">Blue Nile Falls (Tis Issat)</option>
                  <option value="kibran-gebriel">Kibran Gebriel Island</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d.slug || d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Search Services</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Secondary Filter Controls: Price, Availability, Eco & Reset */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              {/* Quick Price Range Presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400 mr-1">Price (ETB):</span>
                <button
                  type="button"
                  onClick={() => handlePricePreset('', '1500')}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    maxPrice === '1500' && !minPrice
                      ? 'bg-[#244B3A] text-white border-[#244B3A]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Under 1,500
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset('1500', '3500')}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    minPrice === '1500' && maxPrice === '3500'
                      ? 'bg-[#244B3A] text-white border-[#244B3A]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  1,500 – 3,500
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset('3500', '')}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    minPrice === '3500' && !maxPrice
                      ? 'bg-[#244B3A] text-white border-[#244B3A]'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  3,500+
                </button>
              </div>

              {/* Availability & Eco Toggles */}
              <div className="flex items-center gap-3">
                {/* Instant Availability */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={availabilityOnly}
                    onChange={(e) => {
                      setAvailabilityOnly(e.target.checked)
                      setPage(1)
                      updateUrl({ availability: e.target.checked, page: 1 })
                    }}
                    className="w-4 h-4 rounded text-[#244B3A] focus:ring-[#244B3A] border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span>Available Today</span>
                </label>

                {/* Eco Certified */}
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={ecoFriendly}
                    onChange={(e) => {
                      setEcoFriendly(e.target.checked)
                      setPage(1)
                      updateUrl({ ecoFriendly: e.target.checked, page: 1 })
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span>Eco Certified</span>
                </label>

                {/* Reset Filters Button */}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline px-2 py-1"
                  >
                    Reset ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Category Tabs & Results Counter Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            {/* Category Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-[#244B3A] text-white shadow-sm shadow-[#244B3A]/30'
                        : 'bg-white dark:bg-[#132620] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Sort Dropdown & Results Count */}
            <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>{loading ? 'Searching...' : `Showing ${total} Experience${total === 1 ? '' : 's'}`}</span>
              <div className="flex items-center gap-1.5">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const casted = e.target.value as ServiceQueryParams['sortBy']
                    setSortBy(casted)
                    setPage(1)
                    updateUrl({ sortBy: casted, page: 1 })
                  }}
                  className="bg-white dark:bg-[#132620] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-xs focus:outline-none cursor-pointer"
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
        </div>

        {/* 4. Service Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-white dark:bg-[#132620] border border-slate-200/80 dark:border-slate-800/80 p-4 animate-pulse space-y-4"
                >
                  <div className="h-48 rounded-xl bg-slate-200 dark:bg-slate-800 w-full" />
                  <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 w-3/4" />
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-full" />
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 w-1/2" />
                  <div className="h-8 rounded-xl bg-slate-200 dark:bg-slate-800 w-full mt-4" />
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                No services found
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Try widening your search terms, clearing price limits, or selecting All Experiences.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#244B3A] hover:bg-[#1a382b] text-white text-xs font-bold transition-all shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
