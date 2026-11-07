import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service } from '@/features/services/types'

const EXPERIENCE_CATEGORIES = [
  { id: 'all', label: 'All Activities', icon: '✨' },
  { id: 'boat', label: 'Boat Trips', icon: '⛵' },
  { id: 'culture', label: 'Cultural Experiences', icon: '☕' },
  { id: 'monastery', label: 'Guided Monastery Tours', icon: '⛪' },
  { id: 'nature', label: 'Bird Watching & Nature', icon: '🦅' },
]

const CURATED_EXPERIENCES: Service[] = [
  // 1. Boat Trips
  {
    _id: 'full-day-monasteries-cruise',
    title: 'Full-Day Island Monasteries Boat Expedition',
    slug: 'full-day-monasteries-cruise',
    description: 'Cruise the sacred waters of Lake Tana aboard a verified cooperative motorboat. Explore Ura Kidane Mehret, Azwa Maryam, and Kibran Gebriel with an expert certified local guide.',
    shortDescription: 'Full-day motorboat charter to Zege Peninsula and 14th-century circular island monasteries.',
    category: 'boat',
    price: 2800,
    currency: 'ETB',
    duration: '8 Hours',
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
    _id: 'sunset-pelican-cruise',
    title: 'Sunset Lake Cruise & Pelican Roost Safari',
    slug: 'sunset-pelican-cruise',
    description: 'An unforgettable evening motorboat cruise to the Blue Nile river outlet where thousands of great white pelicans roost at sunset over tranquil waters.',
    shortDescription: 'Evening boat cruise to the Blue Nile outlet where thousands of pelicans roost at sunset.',
    category: 'boat',
    price: 1500,
    currency: 'ETB',
    duration: '3 Hours',
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
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'tankwa-reed-boat-paddle',
    title: 'Traditional Papyrus Tankwa Reed Boat Experience',
    slug: 'tankwa-craft-experience',
    description: 'Glide along Lake Tana’s peaceful shores in an authentic hand-woven papyrus reed boat. Learn the ancient boat-building traditions of the Weyto fishermen and try paddling.',
    shortDescription: 'Eco-friendly traditional reed boat journey guided by indigenous Weyto fishermen.',
    category: 'boat',
    price: 950,
    currency: 'ETB',
    duration: '2 Hours',
    location: 'Bahir Dar Peninsula Shore',
    coverImage: '/images/fixedbgforhomepage.jpg',
    images: [{ url: '/images/fixedbgforhomepage.jpg', caption: 'Papyrus Boat' }],
    vendor: {
      _id: 'v6',
      businessName: 'Weyto Heritage Guild',
      status: 'approved',
      rating: 4.8,
    },
    destination: {
      _id: 'd2',
      name: 'Bahir Dar Peninsula',
      slug: 'bahir-dar',
    },
    ecoFriendly: true,
    rating: 4.8,
    reviewCount: 27,
    availability: true,
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },

  // 2. Cultural Experiences
  {
    _id: 'cultural-fish-coffee-experience',
    title: 'Bahir Dar Fish Tasting & Traditional Buna Ceremony',
    slug: 'cultural-fish-coffee-experience',
    description: 'Savor freshly prepared Lake Tana fish with spicy awaze, followed by an authentic three-round Ethiopian buna ceremony roasted over hot coals with fragrant frankincense.',
    shortDescription: 'Authentic culinary experience featuring lake fish, injera, and traditional buna coffee ceremony.',
    category: 'culture',
    price: 1100,
    currency: 'ETB',
    duration: '2.5 Hours',
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
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'weyto-artisan-weaving',
    title: 'Indigenous Cotton Weaving & Tankwa Craft Workshop',
    slug: 'weyto-artisan-weaving',
    description: 'Visit an artisan cooperative in Bahir Dar to witness handloom weaving of traditional Ethiopian shema textiles and handcrafting of miniature papyrus reed boats.',
    shortDescription: 'Hands-on artisan workshop with local weavers and papyrus craftsmen.',
    category: 'culture',
    price: 850,
    currency: 'ETB',
    duration: '2 Hours',
    location: 'Artisan Village, Bahir Dar',
    coverImage: '/images/aboutpage.jpg',
    images: [{ url: '/images/aboutpage.jpg', caption: 'Artisan Workshop' }],
    vendor: {
      _id: 'v6',
      businessName: 'Weyto Heritage Guild',
      status: 'approved',
      rating: 4.7,
    },
    destination: {
      _id: 'd2',
      name: 'Bahir Dar City',
      slug: 'bahir-dar',
    },
    ecoFriendly: true,
    rating: 4.7,
    reviewCount: 18,
    availability: true,
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },

  // 3. Guided Monastery Tours
  {
    _id: 'zege-peninsula-guided-trek',
    title: 'Zege Peninsula & Ura Kidane Mehret Guided Tour',
    slug: 'zege-peninsula-guided-trek',
    description: 'Walk through dense indigenous coffee canopies accompanied by a licensed resident monastic guide, discovering 16th-century painted murals and ecclesiastical crowns.',
    shortDescription: 'Certified resident guide excursion through wild coffee forests to medieval round churches.',
    category: 'monastery',
    price: 1800,
    currency: 'ETB',
    duration: '4 Hours',
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
    _id: 'manuscript-monastery-art',
    title: 'Ancient Ecclesiastical Art & Ge’ez Manuscripts Pilgrimage',
    slug: 'manuscript-monastery-art',
    description: 'An exclusive cultural pilgrimage focusing on centuries-old parchment manuscripts, Ge’ez liturgical chants, and monastic painting traditions across northern island sanctuaries.',
    shortDescription: 'Curated scholarly tour of illuminated Ge’ez manuscripts and monastic art treasures.',
    category: 'monastery',
    price: 2200,
    currency: 'ETB',
    duration: '6 Hours',
    location: 'Ura Kidane Mehret & Azwa Maryam',
    coverImage: '/images/monastery.jpg',
    images: [{ url: '/images/monastery.jpg', caption: 'Ancient Manuscript Art' }],
    vendor: {
      _id: 'v5',
      businessName: 'Zege Peninsula Cultural Trust',
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
    reviewCount: 22,
    availability: true,
    isFeatured: false,
    status: 'published',
    createdAt: new Date().toISOString(),
  },

  // 4. Bird Watching & Nature Activities
  {
    _id: 'pelican-wetland-birdwatching',
    title: 'Lake Tana Wetland & Pelican Sanctuary Safari',
    slug: 'pelican-wetland-birdwatching',
    description: 'An expert ornithologist leads an excursion into Lake Tana UNESCO wetlands, home to over 217 bird species including great white pelicans, African fish eagles, and kingfishers.',
    shortDescription: 'Guided wetland birdwatching excursion observing over 217 bird species.',
    category: 'nature',
    price: 1600,
    currency: 'ETB',
    duration: '3 Hours',
    location: 'Lake Tana Wetlands, Bahir Dar',
    coverImage: '/images/lake-tana-hero-bg.jpg',
    images: [{ url: '/images/lake-tana-hero-bg.jpg', caption: 'Wetland Birds' }],
    vendor: {
      _id: 'v2',
      businessName: 'Bahir Dar Eco-Tour Operators',
      status: 'approved',
      rating: 4.9,
    },
    destination: {
      _id: 'd2',
      name: 'Lake Tana Biosphere',
      slug: 'bahir-dar',
    },
    ecoFriendly: true,
    rating: 4.9,
    reviewCount: 34,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'blue-nile-falls-trek',
    title: 'Blue Nile Falls (Tis Issat) Trek & Portuguese Bridge Hike',
    slug: 'blue-nile-falls-trek',
    description: 'Scenic countryside hike to the thunderous "Smoke of Fire" waterfall, across the 17th-century Portuguese Stone Bridge and traditional Gojjam agricultural villages.',
    shortDescription: 'Guided countryside trek to Ethiopia’s most celebrated 45m waterfall and Portuguese bridge.',
    category: 'nature',
    price: 2200,
    currency: 'ETB',
    duration: '5 Hours',
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
]

export default function ExperiencesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Sync category from URL query
  useEffect(() => {
    if (!router.isReady) return
    const qCat = typeof router.query.category === 'string' ? router.query.category : 'all'
    const qSearch = typeof router.query.search === 'string' ? router.query.search : ''
    setSelectedCategory(qCat)
    setSearch(qSearch)
    setSearchInput(qSearch)
  }, [router.isReady, router.query])

  // Fetch or filter experiences
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    marketplaceService
      .getAll({ limit: 40 })
      .then((res) => {
        if (!isMounted) return
        let list = res?.data && res.data.length > 0 ? res.data : CURATED_EXPERIENCES

        // Filter by category
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'boat') {
            list = list.filter((s) => s.category === 'boat')
          } else if (selectedCategory === 'culture') {
            list = list.filter((s) => s.category === 'food' || s.category === 'culture')
          } else if (selectedCategory === 'monastery') {
            list = list.filter((s) => s.category === 'monastery' || s.category === 'tour')
          } else if (selectedCategory === 'nature') {
            list = list.filter((s) => s.category === 'wildlife' || s.category === 'nature' || s.category === 'waterfall')
          }
        }

        // Filter by search
        if (search.trim()) {
          const lower = search.toLowerCase()
          list = list.filter(
            (s) =>
              s.title.toLowerCase().includes(lower) ||
              s.description.toLowerCase().includes(lower) ||
              s.location.toLowerCase().includes(lower)
          )
        }

        setServices(list)
      })
      .catch(() => {
        if (isMounted) {
          let list = CURATED_EXPERIENCES
          if (selectedCategory !== 'all') {
            list = list.filter((s) => {
              if (selectedCategory === 'boat') return s.category === 'boat'
              if (selectedCategory === 'culture') return s.category === 'culture' || s.category === 'food'
              if (selectedCategory === 'monastery') return s.category === 'monastery' || s.category === 'tour'
              if (selectedCategory === 'nature') return s.category === 'nature' || s.category === 'wildlife'
              return true
            })
          }
          if (search.trim()) {
            const lower = search.toLowerCase()
            list = list.filter(
              (s) =>
                s.title.toLowerCase().includes(lower) ||
                s.description.toLowerCase().includes(lower)
            )
          }
          setServices(list)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedCategory, search])

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId)
    router.push({
      pathname: '/experiences',
      query: { ...router.query, category: catId },
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    router.push({
      pathname: '/experiences',
      query: { ...router.query, search: searchInput },
    })
  }

  return (
    <PublicLayout>
      <Head>
        <title>Experiences — Unique Experiences | Lake Tana LTTMS</title>
        <meta
          name="description"
          content="Showcase unique activities tourists can book on Lake Tana: private boat trips, authentic cultural coffee ceremonies, guided monastery tours, and wetland bird watching."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors pb-24">
        {/* 1. Experiences Hero Header */}
        <div className="relative bg-[#143224] text-white pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-emerald-950">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              src="/images/Boat.jpg"
              alt="Unique Lake Tana Experiences"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143224] via-[#143224]/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AUTHENTIC VERIFIED ACTIVITIES</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Experiences — Unique Experiences
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                Showcase activities tourists can book: motorboat charters and traditional papyrus reed tankwa paddles, authentic cultural buna ceremonies, certified resident monastery guides, and wetland birdwatching safaris.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Search & Category Filter Console */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#132620] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 transition-colors">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search input */}
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
                  placeholder="Search boat trips, coffee ceremonies, monastery tours, birdwatching..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#244B3A] dark:focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Search Experiences</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Category Chips: Boat trips, Cultural experiences, Guided monastery tours, Bird watching */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {EXPERIENCE_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
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

        {/* 3. Activity Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {selectedCategory !== 'all'
                  ? `${EXPERIENCE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Filtered'} on Lake Tana`
                  : 'All Available Unique Experiences'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {loading ? 'Finding activities...' : `Showing ${services.length} activity package${services.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {(selectedCategory !== 'all' || search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearch('')
                  setSearchInput('')
                  router.push('/experiences')
                }}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Cards */}
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
                No activities found
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Try searching for boat trips, coffee ceremonies, or monastery guided tours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearch('')
                  setSearchInput('')
                  router.push('/experiences')
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#244B3A] hover:bg-[#1a382b] text-white text-xs font-bold transition-all shadow-sm"
              >
                Show All Experiences
              </button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
