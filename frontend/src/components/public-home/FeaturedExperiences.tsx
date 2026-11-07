import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Service } from '@/features/services/types'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/contexts/LanguageContext'

const CURATED_FALLBACK_SERVICES: Service[] = [
  {
    _id: 'full-day-monasteries-cruise',
    title: 'Full-Day Island Monasteries Boat Expedition',
    slug: 'full-day-monasteries-cruise',
    description: 'Cruise the sacred waters of Lake Tana to explore Ura Kidane Mehret, Azwa Maryam, and Kibran Gebriel with an expert certified local guide.',
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
    },
    destination: {
      _id: 'd1',
      name: 'Zege Peninsula & Islands',
      slug: 'zege-peninsula',
    },
    ecoFriendly: true,
    rating: 4.9,
    reviewCount: 42,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'sunset-pelican-cruise',
    title: 'Lake Tana Sunset Cruise & Pelican Roost Safari',
    slug: 'sunset-pelican-cruise',
    description: 'An unforgettable 3-hour evening boat cruise to the Blue Nile river outlet where thousands of pelicans roost at sunset.',
    category: 'wildlife',
    price: 1500,
    currency: 'ETB',
    duration: '3 hours',
    location: 'Blue Nile Outlet, Bahir Dar',
    coverImage: '/images/fixedbgforhomepage.jpg',
    images: [{ url: '/images/fixedbgforhomepage.jpg', caption: 'Sunset over Lake Tana' }],
    vendor: {
      _id: 'v2',
      businessName: 'Bahir Dar Eco-Tour Operators',
      status: 'approved',
    },
    destination: {
      _id: 'd2',
      name: 'Blue Nile Outlet',
      slug: 'blue-nile-outlet',
    },
    ecoFriendly: true,
    rating: 4.8,
    reviewCount: 31,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'blue-nile-falls-trek',
    title: 'Blue Nile Falls Guided Trek & Portuguese Bridge',
    slug: 'blue-nile-falls-trek',
    description: 'Hike through rural Amhara countryside to the thunderous Tis Issat cascades and cross the historic 17th-century stone bridge.',
    category: 'tour',
    price: 1800,
    currency: 'ETB',
    duration: '5 hours',
    location: 'Tis Abay Village',
    coverImage: '/images/waterfall.jpg',
    images: [{ url: '/images/waterfall.jpg', caption: 'Blue Nile Falls' }],
    vendor: {
      _id: 'v3',
      businessName: 'Tis Abay Local Community Guides',
      status: 'approved',
    },
    destination: {
      _id: 'd3',
      name: 'Blue Nile Falls',
      slug: 'blue-nile-falls',
    },
    ecoFriendly: true,
    rating: 4.9,
    reviewCount: 58,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'waterfront-eco-lodge-stay',
    title: 'Waterfront Eco-Lodge Stay & Organic Farm Dining',
    slug: 'waterfront-eco-lodge-stay',
    description: 'Experience peaceful nights in solar-powered chalets overlooking Lake Tana, with fresh fish and farm-to-table organic meals.',
    category: 'hotel',
    price: 4500,
    currency: 'ETB',
    duration: '24 hours',
    location: 'Lake Shore Road, Bahir Dar',
    coverImage: '/images/hotel.jpg',
    images: [{ url: '/images/hotel.jpg', caption: 'Eco-lodge on Lake Tana' }],
    vendor: {
      _id: 'v4',
      businessName: 'Kuriftu Lake Sanctuary',
      status: 'approved',
    },
    destination: {
      _id: 'd4',
      name: 'Bahir Dar Shore',
      slug: 'bahir-dar-waterfront',
    },
    ecoFriendly: true,
    rating: 4.7,
    reviewCount: 36,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'manuscript-monastery-art',
    title: 'Ancient Ecclesiastical Art & Manuscript Discovery',
    slug: 'manuscript-monastery-art',
    description: 'An exclusive cultural tour focused on centuries-old parchment manuscripts, Ge’ez hymns, and monastic painting traditions.',
    category: 'monastery',
    price: 2200,
    currency: 'ETB',
    duration: '6 hours',
    location: 'Ura Kidane Mehret, Zege',
    coverImage: '/images/monastery.jpg',
    images: [{ url: '/images/monastery.jpg', caption: 'Ancient Manuscript Art' }],
    vendor: {
      _id: 'v5',
      businessName: 'Zege Peninsula Cultural Trust',
      status: 'approved',
    },
    destination: {
      _id: 'd5',
      name: 'Ura Kidane Mehret',
      slug: 'ura-kidane-mehret',
    },
    ecoFriendly: true,
    rating: 5.0,
    reviewCount: 22,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'tankwa-craft-experience',
    title: 'Traditional Papyrus Tankwa Boat Building & Paddling',
    slug: 'tankwa-craft-experience',
    description: 'Learn from local Weyto craftsmen how ancient papyrus reed boats are harvested, woven, and paddled across Lake Tana.',
    category: 'food',
    price: 1200,
    currency: 'ETB',
    duration: '2.5 hours',
    location: 'Bahir Dar Peninsula',
    coverImage: '/images/restaurant.webp',
    images: [{ url: '/images/restaurant.webp', caption: 'Artisan Workshop' }],
    vendor: {
      _id: 'v6',
      businessName: 'Weyto Heritage Guild',
      status: 'approved',
    },
    destination: {
      _id: 'd6',
      name: 'Bahir Dar Peninsula',
      slug: 'bahir-dar-peninsula',
    },
    ecoFriendly: true,
    rating: 4.8,
    reviewCount: 19,
    availability: true,
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
]

export const FeaturedExperiences: React.FC = () => {
  const { t, language } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    marketplaceService
      .getAll({ limit: 6, sortBy: 'featured' })
      .then((res) => {
        if (!isMounted) return
        if (res?.data && res.data.length > 0) {
          setServices(res.data)
        } else {
          setServices(CURATED_FALLBACK_SERVICES)
        }
      })
      .catch(() => {
        if (isMounted) setServices(CURATED_FALLBACK_SERVICES)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="py-20 bg-surface-muted dark:bg-surface-dark/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-widest block mb-2">
              {language === 'am' ? 'የተረጋገጡ የጉብኝት አገልግሎቶች' : 'Verified Excursions'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-text-primary">
              {t('home.topServicesTitle', 'Top Tourism Experiences')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary max-w-xl">
              {t(
                'home.topServicesSubtitle',
                'Book directly with certified boat operators, monastery tour guides, and eco-lodges.'
              )}
            </p>
          </div>

          <Link
            href="/services"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-surface-border bg-surface dark:bg-surface-dark hover:bg-surface-muted text-xs font-bold text-text-primary transition-all shadow-sm group"
          >
            <span>{t('home.viewAllServices', 'Browse All Services')}</span>
            <svg
              className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
