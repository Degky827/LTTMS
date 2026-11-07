import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { DestinationCard } from '@/features/destinations/components/DestinationCard'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { VendorCard } from '@/features/vendors/components/VendorCard'
import { destinationService } from '@/features/destinations/services/destinationService'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { vendorService } from '@/features/vendors/services/vendorService'
import { Destination } from '@/features/destinations/types'
import { Service } from '@/features/services/types'
import { Vendor } from '@/features/vendors/types'

export default function HomePage() {
  const router = useRouter()

  // Search state
  const [searchDestination, setSearchDestination] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [searchGuests, setSearchGuests] = useState('2')

  // Data states
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      destinationService.getAll({ limit: 6, isFeatured: true }).catch(() => null),
      marketplaceService.getAll({ limit: 6, sortBy: 'featured' }).catch(() => null),
      vendorService.getAll({ limit: 4 }).catch(() => null),
    ]).then(([destRes, servRes, vendRes]) => {
      if (!isMounted) return
      if (destRes?.data) setDestinations(destRes.data)
      if (servRes?.data) setServices(servRes.data)
      if (vendRes?.data) setVendors(vendRes.data)
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchDestination && searchDestination !== 'all') params.append('destination', searchDestination)
    if (searchCategory && searchCategory !== 'all') params.append('category', searchCategory)
    if (searchDate) params.append('date', searchDate)
    if (searchGuests) params.append('guests', searchGuests)
    router.push(`/services?${params.toString()}`)
  }

  return (
    <PublicLayout>
      <Head>
        <title>Lake Tana Eco-Tourism & Booking Marketplace | LTTMS</title>
        <meta
          name="description"
          content="Discover Ethiopia's largest lake and UNESCO Biosphere Reserve. Book island monastery tours, boat cruises, lakeside eco-lodges, and birdwatching excursions."
        />
      </Head>

      {/* Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center bg-primary-950 overflow-hidden">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0">
          <img
            src="/images/monastery.jpg"
            alt="Lake Tana, Ethiopia"
            className="w-full h-full object-cover opacity-35 scale-105 transform motion-safe:animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/60 to-black/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>UNESCO Biosphere Reserve • Lake Tana, Ethiopia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Discover the Timeless Wonder of <span className="text-gold-400">Lake Tana</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Explore 14th-century island monasteries, unforgettable boat excursions, abundant wildlife, and authentic Ethiopian hospitality with verified local operators.
          </p>

          {/* Search Box Card */}
          <div className="mt-10 max-w-4xl mx-auto bg-surface dark:bg-surface-dark rounded-2xl shadow-2xl p-4 sm:p-5 border border-border-light text-left">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Destination Selector */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Destination
                </label>
                <div className="relative">
                  <select
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  >
                    <option value="all">All Destinations</option>
                    <option value="zege-peninsula">Zege Peninsula</option>
                    <option value="ura-kidane-mehret">Ura Kidane Mehret</option>
                    <option value="kibran-gebriel">Kibran Gebriel</option>
                    <option value="tana-qirqos">Tana Qirqos</option>
                    <option value="blue-nile-falls">Blue Nile Falls</option>
                    <option value="bahir-dar">Bahir Dar Coast</option>
                  </select>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Experience Type
                </label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full h-11 px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  <option value="all">All Categories</option>
                  <option value="boat">Boat Tours & Cruises</option>
                  <option value="monastery">Island Monasteries</option>
                  <option value="tour">Guided Excursions</option>
                  <option value="hotel">Eco-Lodges & Hotels</option>
                  <option value="food">Cultural & Dining</option>
                </select>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={searchDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full h-11 px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              {/* Guests and Submit */}
              <div className="flex items-end gap-2">
                <div className="w-1/2 sm:w-1/3">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Guests
                  </label>
                  <select
                    value={searchGuests}
                    onChange={(e) => setSearchGuests(e.target.value)}
                    className="w-full h-11 px-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="4">4 People</option>
                    <option value="6">6+ Group</option>
                  </select>
                </div>
                <div className="w-1/2 sm:w-2/3">
                  <Button variant="primary" size="md" fullWidth type="submit" className="h-11 font-bold shadow-md">
                    Find Tours
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-16 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">Heritage & Sacred Sites</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
                Explore Lake Tana Destinations
              </h2>
              <p className="text-sm text-text-secondary mt-1 max-w-xl">
                Ancient island sanctuaries, secluded forest peninsulas, and thunderous waterfalls across Lake Tana.
              </p>
            </div>
            <Link href="/destinations" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="font-semibold">
                View All Destinations &rarr;
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border-light p-8 text-center">
              <p className="text-sm text-text-secondary">Destinations are being populated from the Lake Tana database.</p>
              <Link href="/services">
                <Button variant="primary" size="sm" className="mt-4">Explore Tours</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Popular Tourism Experiences */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <Badge variant="success" size="sm" className="mb-2">Verified Excursions</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
                Popular Tourism Experiences
              </h2>
              <p className="text-sm text-text-secondary mt-1 max-w-xl">
                Book boat trips, historical monastery tours, and eco-lodges directly with verified local operators.
              </p>
            </div>
            <Link href="/services" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="font-semibold">
                Explore Marketplace &rarr;
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-muted rounded-2xl border border-border-light p-8 text-center">
              <p className="text-sm text-text-secondary">Tourism services are loading from the live marketplace.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose LTTMS Section */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-gold-400 text-xs font-bold uppercase tracking-widest block mb-2">
              Sustainable Tourism
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-heading">
              Why Explore Lake Tana with LTTMS?
            </h2>
            <p className="text-sm text-gray-300 mt-2">
              The official integrated digital platform preserving Lake Tana's natural heritage while empowering travelers and local communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-700/80 flex items-center justify-center text-gold-400 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">Verified Local Operators</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Every boat captain, guide, and hotel undergoes strict administrative verification for safety standards and license compliance.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-700/80 flex items-center justify-center text-gold-400 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">Secure Local & International Payments</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Pay with confidence using Chapa, supporting Ethiopian Telebirr, CBE Birr, and international cards with instant digital receipts.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-700/80 flex items-center justify-center text-gold-400 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">UNESCO Biosphere Preservation</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                A percentage of platform commission directly funds environmental conservation and monastery restoration around Lake Tana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Vendors */}
      <section className="py-16 bg-surface-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <Badge variant="warning" size="sm" className="mb-2">Hospitality Partners</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
                Meet Verified Lake Tana Vendors
              </h2>
              <p className="text-sm text-text-secondary mt-1 max-w-xl">
                Certified local tour guides, boat operators, and eco-lodges dedicated to high-quality travel experiences.
              </p>
            </div>
            <Link href="/vendors" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="font-semibold">
                All Verified Vendors &rarr;
              </Button>
            </Link>
          </div>

          {vendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vendors.map((vendor) => (
                <VendorCard key={vendor._id} vendor={vendor} />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border-light p-8 text-center text-sm text-text-secondary">
              Verified vendor directory is active and ready for reservations.
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
