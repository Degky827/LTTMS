import React, { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DestinationCard } from '@/features/destinations/components/DestinationCard'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Destination } from '@/features/destinations/types'

const DESTINATION_CATEGORIES = [
  { id: 'all', label: 'All Destinations', icon: '🗺️' },
  { id: 'monastery', label: 'Historic Monasteries', icon: '⛪' },
  { id: 'island', label: 'Island Sanctuaries', icon: '🏝️' },
  { id: 'waterfall', label: 'Natural Waterfalls', icon: '🌊' },
  { id: 'wildlife_sanctuary', label: 'Wildlife Reserves', icon: '🦅' },
  { id: 'historical_site', label: 'Heritage Sites', icon: '🏛️' },
]

const CURATED_DESTINATIONS: Destination[] = [
  {
    _id: 'zege-peninsula',
    name: 'Zege Peninsula Forest Sanctuary',
    slug: 'zege-peninsula',
    destinationType: 'monastery',
    shortDescription: 'Lush indigenous coffee canopy housing 14th-century circular monasteries, ancient trees, and sacred forest reserves.',
    description: 'A densely forested peninsula extending into southern Lake Tana. Renowned for its wild Arabica coffee trees, vervet monkeys, and ancient timber monasteries including Ura Kidane Mehret and Azwa Maryam.',
    coverImage: '/images/monastery.jpg',
    gallery: ['/images/monastery.jpg', '/images/hotel.jpg'],
    location: {
      address: 'Zege Peninsula',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    tags: ['Wild Coffee Forest', '14th-Century Frescoes', 'Monastic Trails'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ura-kidane-mehret',
    name: 'Ura Kidane Mehret Monastery',
    slug: 'ura-kidane-mehret',
    destinationType: 'monastery',
    shortDescription: 'Masterpiece of Ethiopian ecclesiastical art adorned with vibrant 16th-century painted parchment murals and royal crowns.',
    description: 'The most celebrated circular church on Lake Tana, built in the traditional thatched style. Its interior walls are completely covered with museum-grade biblical paintings, imperial crowns, and ancient brass processional crosses.',
    coverImage: '/images/monastery.jpg',
    gallery: ['/images/monastery.jpg'],
    location: {
      address: 'Zege Peninsula Interior',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    tags: ['16th-Century Murals', 'Imperial Crowns', 'Conical Thatched Dome'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'blue-nile-falls',
    name: 'Blue Nile Falls (Tis Issat)',
    slug: 'blue-nile-falls',
    destinationType: 'waterfall',
    shortDescription: 'The dramatic 45-meter "Smoke of Fire" waterfall, 17th-century Portuguese Stone Bridge, and scenic gorge hikes.',
    description: 'Known locally as Tis Issat ("Smoke of Fire"), the Blue Nile plunges over a 45-meter cliff creating perpetual mist, rainbows, and thunderous sound. Visitors cross Ethiopia’s oldest stone bridge built in 1626 by Emperor Susenyos.',
    coverImage: '/images/waterfall.jpg',
    gallery: ['/images/waterfall.jpg'],
    location: {
      address: 'Tis Abay Village',
      city: 'Bahir Dar District',
      region: 'Amhara',
    },
    tags: ['45m Cascading Plume', 'Portuguese Bridge (1626)', 'River Gorge Hike'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'kibran-gebriel',
    name: 'Kibran Gebriel Island Monastery',
    slug: 'kibran-gebriel',
    destinationType: 'island',
    shortDescription: 'Historic crescent island monastery founded in the 14th century, home to an invaluable library of illuminated manuscripts.',
    description: 'A rocky, densely wooded crescent-shaped island close to Bahir Dar. Established by Abba Zena Maryam in the 1300s, it preserves one of the most significant collections of early Ge’ez biblical manuscripts and historical relics.',
    coverImage: '/images/lake-tana-hero-bg.jpg',
    gallery: ['/images/lake-tana-hero-bg.jpg'],
    location: {
      address: 'Southern Lake Tana',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    tags: ['Ge’ez Manuscripts', '14th-Century Library', 'Island Sanctuary'],
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'bahir-dar-waterfront',
    name: 'Bahir Dar Waterfront Promenade & Pier',
    slug: 'bahir-dar',
    destinationType: 'viewpoint',
    shortDescription: 'Palm-lined lakefront promenade, vibrant boat departure piers, pelican roosting trees, and scenic sunset lookouts.',
    description: 'The energetic gateway to Lake Tana. Palm-fringed avenues lead to bustling municipal boat cooperatives, traditional lake fish dining spots, and panoramic sunset viewpoints over the calm waters.',
    coverImage: '/images/Boat.jpg',
    gallery: ['/images/Boat.jpg'],
    location: {
      address: 'Lake Tana Shoreline',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    tags: ['Boat Departure Pier', 'Sunset Viewpoint', 'Fish Market Dining'],
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'dega-estifanos',
    name: 'Dega Estifanos Island Monastery',
    slug: 'dega-estifanos',
    destinationType: 'island',
    shortDescription: 'Conical volcanic island sanctuary holding the mummified remains of medieval Ethiopian emperors.',
    description: 'Rising steeply from central Lake Tana, Dega Estifanos was founded in the 13th century. Within its treasury rest the preserved remains of famous Ethiopian emperors including Yekuno Amlak and Fasilides.',
    coverImage: '/images/hotel.jpg',
    gallery: ['/images/hotel.jpg'],
    location: {
      address: 'Central Lake Tana',
      city: 'Lake Tana Islands',
      region: 'Amhara',
    },
    tags: ['Imperial Mummies', '13th-Century Treasury', 'Conical Volcanic Island'],
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
]

export default function DestinationsPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [type, setType] = useState('all')

  // Sync with URL params
  useEffect(() => {
    if (!router.isReady) return
    const qSearch = typeof router.query.search === 'string' ? router.query.search : ''
    const qType = typeof router.query.type === 'string' ? router.query.type : 'all'

    setSearch(qSearch)
    setSearchInput(qSearch)
    setType(qType)
  }, [router.isReady, router.query])

  // Fetch or filter destinations
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    destinationService
      .getAll({
        limit: 30,
        search: search || undefined,
        type: type !== 'all' ? type : undefined,
      })
      .then((res) => {
        if (!isMounted) return
        if (res?.data && res.data.length > 0) {
          setDestinations(res.data)
        } else {
          // Filter curated fallback list
          let list = CURATED_DESTINATIONS
          if (type !== 'all') {
            list = list.filter((d) => d.destinationType === type)
          }
          if (search.trim()) {
            const lower = search.toLowerCase()
            list = list.filter(
              (d) =>
                d.name.toLowerCase().includes(lower) ||
                d.description.toLowerCase().includes(lower) ||
                d.location?.city?.toLowerCase().includes(lower) ||
                d.tags?.some((t) => t.toLowerCase().includes(lower))
            )
          }
          setDestinations(list)
        }
      })
      .catch(() => {
        if (isMounted) {
          let list = CURATED_DESTINATIONS
          if (type !== 'all') {
            list = list.filter((d) => d.destinationType === type)
          }
          if (search.trim()) {
            const lower = search.toLowerCase()
            list = list.filter(
              (d) =>
                d.name.toLowerCase().includes(lower) ||
                d.description.toLowerCase().includes(lower)
            )
          }
          setDestinations(list)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [search, type])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    router.push({
      pathname: '/destinations',
      query: { ...router.query, search: searchInput },
    })
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    router.push({
      pathname: '/destinations',
      query: { ...router.query, type: newType },
    })
  }

  // Popular / Recommended places
  const popularDestinations = useMemo(() => {
    return CURATED_DESTINATIONS.filter((d) => d.isFeatured).slice(0, 3)
  }, [])

  return (
    <PublicLayout>
      <Head>
        <title>Destinations — Discover Lake Tana | LTTMS</title>
        <meta
          name="description"
          content="Discover sacred island monasteries, thunderous waterfalls, ancient coffee forests, and wildlife reserves around Lake Tana, Ethiopia."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors pb-24">
        {/* 1. Large Destination Photography Hero Header */}
        <div className="relative bg-[#143224] text-white pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-emerald-950">
          <div className="absolute inset-0 z-0 opacity-35">
            <img
              src="/images/monastery.jpg"
              alt="Lake Tana Destination Photography"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/lake-tana-hero-bg.jpg'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143224] via-[#143224]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>UNESCO BIOSPHERE RESERVE • SACRED GEOGRAPHY</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Destinations — Discover Lake Tana
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                Introduce places tourists can visit: 14th-century circular monasteries hidden in dense coffee forests, the roaring plume of the Blue Nile Falls, and sacred island sanctuaries.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Destination Search & Filter Console */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#132620] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 transition-colors">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Keyword Search */}
              <div className="md:col-span-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by destination name, historical significance, or city..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#244B3A] dark:focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Search Destinations</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Category Filter Chips */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {DESTINATION_CATEGORIES.map((cat) => {
                const isActive = type === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleTypeChange(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-[#244B3A] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 3. Popular Destinations & Recommended Places (Highlighted Section) */}
        {!search && type === 'all' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Highlights of Lake Tana
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Popular & Recommended Places
                </h2>
              </div>
              <span className="hidden sm:inline-flex text-xs font-semibold text-slate-500 dark:text-slate-400">
                Top rated cultural & natural landmarks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
              {popularDestinations.map((destination) => (
                <DestinationCard key={destination._id} destination={destination} featured={true} />
              ))}
            </div>
          </div>
        )}

        {/* 4. All Destinations Catalog */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {search || type !== 'all' ? 'Filtered Destinations' : 'All Lake Tana Destinations'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {loading ? 'Loading destinations...' : `Showing ${destinations.length} destination${destinations.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {(search || type !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setType('all')
                  router.push('/destinations')
                }}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Cards Grid */}
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
                  <div className="h-8 rounded-xl bg-slate-200 dark:bg-slate-800 w-full mt-4" />
                </div>
              ))}
            </div>
          ) : destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {destinations.map((destination) => (
                <DestinationCard key={destination._id} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                No destinations found
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Try searching for monasteries, waterfalls, islands, or resetting your filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSearchInput('')
                  setType('all')
                  router.push('/destinations')
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#244B3A] hover:bg-[#1a382b] text-white text-xs font-bold transition-all shadow-sm"
              >
                Show All Destinations
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
