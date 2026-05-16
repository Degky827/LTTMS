import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  FaStar, FaLeaf, FaChevronRight, FaShip, FaHotel,
  FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers,
  FaHeart, FaRegHeart, FaTimes, FaClock, FaShieldAlt,
  FaGlobeAfrica, FaTree, FaCompass, FaStore
} from 'react-icons/fa'
import { GiChurch, GiCampingTent } from 'react-icons/gi'
import API from '../utils/api'
import Link from 'next/link'
import { useRouter } from 'next/router'

const VALID_SORT_OPTIONS = ['featured', 'rating', 'price-low', 'price-high'] as const
const VALID_CATEGORIES = ['all', 'monastery', 'boat', 'waterfall', 'hotel', 'food', 'tour'] as const

const normalizeNonNegativeNumber = (value: string): string => {
  if (value === '') return ''
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) return ''
  return String(parsed)
}

export default function Services() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [ecoOnly, setEcoOnly] = useState(false)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('featured')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalServices, setTotalServices] = useState(0)
  const [fetchError, setFetchError] = useState('')
  const [isQueryReady, setIsQueryReady] = useState(false)
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const pageSize = 8

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (!router.isReady) return

    const queryFilterRaw = typeof router.query.category === 'string' ? router.query.category : 'all'
    const querySortRaw = typeof router.query.sortBy === 'string' ? router.query.sortBy : 'featured'
    const querySearch = typeof router.query.search === 'string' ? router.query.search : ''
    const queryMinPriceRaw = typeof router.query.minPrice === 'string' ? router.query.minPrice : ''
    const queryMaxPriceRaw = typeof router.query.maxPrice === 'string' ? router.query.maxPrice : ''
    const queryEco = router.query.ecoOnly === 'true'
    const queryPage = Number(router.query.page)
    const normalizedFilter = VALID_CATEGORIES.includes(queryFilterRaw as any) ? queryFilterRaw : 'all'
    const normalizedSort = VALID_SORT_OPTIONS.includes(querySortRaw as any) ? querySortRaw : 'featured'
    const normalizedMin = normalizeNonNegativeNumber(queryMinPriceRaw)
    const normalizedMax = normalizeNonNegativeNumber(queryMaxPriceRaw)

    setFilter(normalizedFilter)
    setSortBy(normalizedSort)
    setSearchTerm(querySearch)
    setSearchInput(querySearch)
    setMinPrice(normalizedMin)
    setMaxPrice(normalizedMax)
    setMinPriceInput(normalizedMin)
    setMaxPriceInput(normalizedMax)
    setEcoOnly(queryEco)
    setPage(Number.isInteger(queryPage) && queryPage > 0 ? queryPage : 1)
    setIsQueryReady(true)
  }, [router.isReady])

  useEffect(() => {
    if (!isQueryReady) return

    const fetchServices = async () => {
      try {
        setLoading(true)
        setFetchError('')
        const params = {
          page,
          limit: pageSize,
          sortBy,
          ...(filter !== 'all' ? { category: filter } : {}),
          ...(ecoOnly ? { ecoFriendly: true } : {}),
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(minPrice !== '' ? { minPrice } : {}),
          ...(maxPrice !== '' ? { maxPrice } : {})
        }

        const res = await API.get('/services', { params })
        setServices(res.data.data)
        setTotalPages(res.data.totalPages || 1)
        setTotalServices(res.data.total || 0)
      } catch (err) {
        console.error('Error fetching services:', err)
        setFetchError('Unable to load experiences. Please try again.')
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [filter, ecoOnly, sortBy, page, searchTerm, minPrice, maxPrice, isQueryReady])

  useEffect(() => {
    if (!isQueryReady) return

    const nextQuery: Record<string, string> = {}
    if (filter !== 'all') nextQuery.category = filter
    if (sortBy !== 'featured') nextQuery.sortBy = sortBy
    if (ecoOnly) nextQuery.ecoOnly = 'true'
    if (searchTerm) nextQuery.search = searchTerm
    if (minPrice !== '') nextQuery.minPrice = minPrice
    if (maxPrice !== '') nextQuery.maxPrice = maxPrice
    if (page > 1) nextQuery.page = String(page)

    router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true }
    )
  }, [filter, sortBy, ecoOnly, searchTerm, minPrice, maxPrice, page, isQueryReady, router])

  useEffect(() => {
    if (!isQueryReady) return
    setPage(1)
  }, [filter, ecoOnly, sortBy, minPrice, maxPrice])

  const applySearchAndPriceFilters = () => {
    const normalizedMin = normalizeNonNegativeNumber(minPriceInput)
    const normalizedMax = normalizeNonNegativeNumber(maxPriceInput)
    setMinPrice(normalizedMin)
    setMaxPrice(normalizedMax)
    setMinPriceInput(normalizedMin)
    setMaxPriceInput(normalizedMax)
    setSearchTerm(searchInput.trim())
    setPage(1)
  }

  const removeFilterChip = (type: 'category' | 'eco' | 'search' | 'minPrice' | 'maxPrice') => {
    if (type === 'category') setFilter('all')
    if (type === 'eco') setEcoOnly(false)
    if (type === 'search') { setSearchInput(''); setSearchTerm('') }
    if (type === 'minPrice') { setMinPrice(''); setMinPriceInput('') }
    if (type === 'maxPrice') { setMaxPrice(''); setMaxPriceInput('') }
    setPage(1)
  }

  const clearAllFilters = () => {
    setFilter('all'); setEcoOnly(false); setSortBy('featured')
    setSearchTerm(''); setSearchInput('')
    setMinPrice(''); setMaxPrice(''); setMinPriceInput(''); setMaxPriceInput('')
    setPage(1)
  }

  const categories = [
    { id: 'all', label: 'All Experiences', icon: <FaGlobeAfrica size={20} />, color: 'from-gray-500 to-gray-700', desc: 'Browse everything' },
    { id: 'hotel', label: 'Eco Lodges', icon: <FaHotel size={20} />, color: 'from-amber-500 to-orange-600', desc: 'Sustainable accommodations' },
    { id: 'boat', label: 'Boat Tours', icon: <FaShip size={20} />, color: 'from-blue-500 to-cyan-600', desc: 'Guided trips across the lake' },
    { id: 'tour', label: 'Cultural Tours', icon: <FaCompass size={20} />, color: 'from-purple-500 to-indigo-600', desc: 'History & local artisans' },
    { id: 'waterfall', label: 'Nature Walks', icon: <FaTree size={20} />, color: 'from-emerald-500 to-teal-600', desc: 'Bird-watching & eco-trails' },
    { id: 'monastery', label: 'Monastery Visits', icon: <GiChurch size={20} />, color: 'from-red-500 to-pink-600', desc: 'Spiritual heritage exploration' },
    { id: 'food', label: 'Adventure Packages', icon: <GiCampingTent size={20} />, color: 'from-sky-500 to-blue-600', desc: 'Multi-day experiences' },
  ]

  const featuredPackages = [
    {
      title: 'Blue Nile Falls Adventure',
      image: '/images/waterfall.jpg',
      desc: 'Full-day guided hike to the spectacular "Smoking Water" falls',
      price: 45,
      rating: 4.9,
      duration: '8 hours'
    },
    {
      title: 'Island Monastery Tour',
      image: '/images/monastery.jpg',
      desc: 'Visit ancient monasteries on the islands of Lake Tana',
      price: 35,
      rating: 4.8,
      duration: '6 hours'
    },
    {
      title: 'Forest Eco Lodge Retreat',
      image: '/images/hotel.jpg',
      desc: '2-night sustainable stay with forest walks and local cuisine',
      price: 120,
      rating: 4.9,
      duration: '3 days'
    },
    {
      title: 'Bird Watching Safari',
      image: '/images/Boat.jpg',
      desc: 'Early morning bird-spotting expedition with expert guides',
      price: 30,
      rating: 4.7,
      duration: '4 hours'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* ===== Hero ===== */}
      <section className="relative h-72 overflow-hidden">
        <Image
          src="/images/bgservice.avif"
          alt="Lake Tana Eco-Tourism Services"
          fill
          className="object-cover scale-110 animate-zoom"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-5">
                <FaLeaf className="mr-2 text-emerald-300" />
                <span className="text-white text-sm font-medium">Sustainable Experiences</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                Explore Our{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                  Eco-Tourism Services
                </span>
              </h1>
              <p className="text-lg text-gray-200 max-w-xl">
                Discover authentic experiences around Lake Tana.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ===== Featured Packages ===== */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Featured{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  Packages
                </span>
              </h2>
              <p className="text-gray-600 mt-1">Top-rated experiences handpicked for you</p>
            </div>
            <Link
              href="/services?sortBy=rating"
              className="hidden sm:flex items-center text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
            >
              View All <FaChevronRight className="ml-1 text-xs" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPackages.map((pkg, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Featured
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{pkg.title}</h3>
                    <div className="flex items-center text-yellow-500 text-xs">
                      <FaStar className="mr-1" />{pkg.rating}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{pkg.desc}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">From </span>
                      <span className="font-bold text-primary">${pkg.price}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <FaClock className="mr-1" />{pkg.duration}
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-4 flex gap-2">
                  <Link
                    href={`/booking/${idx}`}
                    className="flex-1 text-center bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Book Now
                  </Link>
                  <button className="border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Category Tabs ===== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <FaSearch className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`group flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-300 shrink-0 ${
                  filter === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-white border border-gray-200 text-gray-700 hover:shadow-md hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  filter === cat.id ? 'bg-white/20' : `bg-gradient-to-r ${cat.color} text-white`
                }`}>
                  {cat.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{cat.label}</div>
                  <div className={`text-xs mt-0.5 ${filter === cat.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {cat.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ===== Search & Filter Panel ===== */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6 sticky top-24">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FaSearch className="mr-2 text-primary" />
                  Search & Filters
                </h3>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearchAndPriceFilters()}
                    placeholder="Search experiences..."
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Price Range (USD)</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="number"
                    min="0"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    placeholder="Min"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    placeholder="Max"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={maxPriceInput === '' ? 500 : Number(maxPriceInput)}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$0</span>
                  <span>$500+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="featured">Popularity</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                <div className="flex items-center">
                  <FaLeaf className="text-emerald-500 mr-3" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">Eco-Certified</div>
                    <div className="text-xs text-gray-500">Sustainable only</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={ecoOnly} onChange={() => setEcoOnly(!ecoOnly)} />
                  <div className={`w-11 h-6 rounded-full transition-colors ${ecoOnly ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform shadow-md ${ecoOnly ? 'translate-x-5' : ''}`}></div>
                </label>
              </div>

              <button
                onClick={applySearchAndPriceFilters}
                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                <FaSearch className="mr-2" /> Apply Filters
              </button>
            </div>
          </div>

          {/* ===== Service Grid ===== */}
          <div className="flex-1 min-w-0">
            {/* Active Filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              {filter !== 'all' && (
                <button onClick={() => removeFilterChip('category')} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  {categories.find(c => c.id === filter)?.label}
                  <FaTimes className="ml-1.5 text-[10px]" />
                </button>
              )}
              {ecoOnly && (
                <button onClick={() => removeFilterChip('eco')} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                  <FaLeaf className="mr-1 text-xs" />Eco-Certified
                  <FaTimes className="ml-1.5 text-[10px]" />
                </button>
              )}
              {searchTerm && (
                <button onClick={() => removeFilterChip('search')} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                  "{searchTerm}"
                  <FaTimes className="ml-1.5 text-[10px]" />
                </button>
              )}
              {minPrice !== '' && (
                <button onClick={() => removeFilterChip('minPrice')} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
                  Min: ${minPrice}
                  <FaTimes className="ml-1.5 text-[10px]" />
                </button>
              )}
              {maxPrice !== '' && (
                <button onClick={() => removeFilterChip('maxPrice')} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                  Max: ${maxPrice}
                  <FaTimes className="ml-1.5 text-[10px]" />
                </button>
              )}
              {(filter !== 'all' || ecoOnly || searchTerm || minPrice !== '' || maxPrice !== '') && (
                <button onClick={clearAllFilters} className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  Clear All
                </button>
              )}
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {totalServices}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                    Services
                  </span>{' '}
                  Found
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {ecoOnly ? 'Eco-certified experiences' : 'All available experiences'}
                  {filter !== 'all' && ` in ${categories.find(c => c.id === filter)?.label}`}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center text-sm text-gray-500">
                Sorted by:
                <span className="font-semibold text-gray-900 ml-1">
                  {sortBy === 'featured' && 'Popularity'}
                  {sortBy === 'rating' && 'Highest Rated'}
                  {sortBy === 'price-low' && 'Price: Low to High'}
                  {sortBy === 'price-high' && 'Price: High to Low'}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : services.map((service) => (
                <div
                  key={service._id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 border border-gray-100"
                >
                  <div className="relative h-52 overflow-hidden">
                    {service.images?.length > 0 ? (
                      <Image
                        src={`/images/${service.images[0]}`}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FaStore className="text-gray-300 text-4xl" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {service.ecoFriendly && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
                        <FaLeaf className="mr-1.5 text-xs" />
                        ECO-CERTIFIED
                      </div>
                    )}

                    <button
                      onClick={() => toggleWishlist(service._id)}
                      className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      {wishlist.has(service._id) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="text-gray-600" />
                      )}
                    </button>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center text-white text-sm">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={`${i < (service.rating || 0) ? 'text-yellow-400' : 'text-white/30'} mr-0.5 text-xs`} />
                          ))}
                          <span className="ml-2 font-semibold text-sm">{service.rating || 'New'}</span>
                        </div>
                        <span className="mx-2 text-white/50">|</span>
                        <span className="text-white/80 text-xs capitalize">{service.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3
                        className="text-lg font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSelectedService(service)}
                      >
                        {service.title}
                      </h3>
                      <div className="text-right shrink-0 ml-3">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">From</div>
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                          ${service.price}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                    <div className="flex items-center text-xs text-gray-500 gap-4 mb-5">
                      <span className="flex items-center">
                        <FaClock className="mr-1.5 text-primary" /> 3-4 hours
                      </span>
                      <span className="flex items-center">
                        <FaUsers className="mr-1.5 text-primary" /> Up to 6
                      </span>
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-1.5 text-primary" /> Lake Tana
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        View Details
                      </button>
                      <Link
                        href={`/booking/${service._id}`}
                        className="flex-1 text-center bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {fetchError && (
              <div className="mt-6 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm border border-red-100">{fetchError}</div>
            )}

            {services.length === 0 && !loading && (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-4">🌿</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No experiences found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                  {ecoOnly
                    ? 'No eco-certified experiences match your filters. Try adjusting your search.'
                    : 'No experiences match your current filters.'}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                >
                  Clear All Filters <FaChevronRight className="ml-2 text-xs" />
                </button>
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                        page === p
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Service Details Modal ===== */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedService(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg z-10"
            >
              <FaTimes className="text-gray-700" />
            </button>

            <div className="relative h-64">
              {selectedService.images?.length > 0 ? (
                <Image
                  src={`/images/${selectedService.images[0]}`}
                  alt={selectedService.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <FaStore className="text-gray-400 text-5xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              {selectedService.ecoFriendly && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-lg">
                  <FaLeaf className="mr-2" />
                  ECO-CERTIFIED
                </div>
              )}
              <div className="absolute bottom-6 left-6">
                <h2 className="text-3xl font-bold text-white">{selectedService.title}</h2>
                <div className="flex items-center text-white/80 mt-2 text-sm">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-semibold">{selectedService.rating || 'New'}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{selectedService.category}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-primary">${selectedService.price}</div>
                  <div className="text-xs text-gray-500 mt-1">Per Person</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">3-4h</div>
                  <div className="text-xs text-gray-500 mt-1">Duration</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">Up to 6</div>
                  <div className="text-xs text-gray-500 mt-1">Group Size</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center text-2xl">
                    <FaShieldAlt className="text-emerald-500" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Eco-Certified</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedService.description}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Itinerary Highlights</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 mr-3">1</div>
                    <span className="text-gray-600">Welcome and introduction at the meeting point</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 mr-3">2</div>
                    <span className="text-gray-600">Guided tour with experienced local guide</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 mr-3">3</div>
                    <span className="text-gray-600">Refreshments and cultural insights along the way</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 mr-3">4</div>
                    <span className="text-gray-600">Return journey with memorable experiences</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Payment Options</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm">Telebirr</span>
                  <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm">CBE Birr</span>
                  <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm">PayPal</span>
                  <span className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm">Visa/Mastercard</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href={`/booking/${selectedService._id}`}
                  className="flex-1 text-center bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Book Now — ${selectedService.price}
                </Link>
                <button className="px-6 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Contact Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CTA Section ===== */}
      <section className="py-16 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-5 w-64 h-64 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 right-5 w-80 h-80 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FaLeaf className="text-5xl text-emerald-300 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Travel Responsibly – Support Local Communities & Preserve Lake Tana's Heritage
          </h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Every booking contributes to conservation efforts and empowers local families across Bahir Dar.
          </p>
          <Link
            href="/eco-tourism"
            className="inline-flex items-center bg-white text-emerald-800 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <span>Learn About Eco-Tourism</span>
            <FaChevronRight className="ml-2" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
