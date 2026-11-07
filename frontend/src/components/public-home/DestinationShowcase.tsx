import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Destination } from '@/features/destinations/types'
import { destinationService } from '@/features/destinations/services/destinationService'
import { DestinationCard } from '@/features/destinations/components/DestinationCard'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/contexts/LanguageContext'

// Curated fallbacks representing Lake Tana destinations if database is newly seeded
const CURATED_FALLBACK_DESTINATIONS: Destination[] = [
  {
    _id: 'zege-peninsula',
    name: 'Zege Peninsula Forest Sanctuary',
    slug: 'zege-peninsula',
    shortDescription: 'Lush indigenous coffee forest housing 14th-century circular monasteries.',
    description: 'A densely forested peninsula on Lake Tana famous for ancient monasteries and wild coffee.',
    coverImage: '/images/monastery.jpg',
    gallery: ['/images/monastery.jpg'],
    destinationType: 'monastery',
    location: {
      address: 'Zege Peninsula, Lake Tana',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'ura-kidane-mehret',
    name: 'Ura Kidane Mehret Monastery',
    slug: 'ura-kidane-mehret',
    shortDescription: 'Masterpiece of Ethiopian ecclesiastical art with vivid 16th-century murals.',
    description: 'The most famous circular church on the Zege Peninsula, richly adorned with historical paintings.',
    coverImage: '/images/monastery.jpg',
    gallery: ['/images/monastery.jpg'],
    destinationType: 'monastery',
    location: {
      address: 'Zege Peninsula',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'blue-nile-falls',
    name: 'Blue Nile Falls (Tis Issat)',
    slug: 'blue-nile-falls',
    shortDescription: 'The dramatic "Smoking Water" waterfall fed by Lake Tana.',
    description: 'Spectacular 45-meter-high waterfalls that mark the beginnings of the Blue Nile River.',
    coverImage: '/images/waterfall.jpg',
    gallery: ['/images/waterfall.jpg'],
    destinationType: 'waterfall',
    location: {
      address: 'Tis Abay Village',
      city: 'Tis Abay',
      region: 'Amhara',
    },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'kibran-gebriel',
    name: 'Kibran Gebriel Island Monastery',
    slug: 'kibran-gebriel',
    shortDescription: '14th-century monastery island surrounded by towering acacia and ficus trees.',
    description: 'Renowned for its historic library housing centuries-old parchment manuscripts.',
    coverImage: '/images/Boat.jpg',
    gallery: ['/images/Boat.jpg'],
    destinationType: 'monastery',
    location: {
      address: 'South Lake Tana',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'tana-qirqos',
    name: 'Tana Qirqos Historic Island',
    slug: 'tana-qirqos',
    shortDescription: 'Ancient sacred island steeped in Ethiopian biblical and imperial traditions.',
    description: 'An isolated eastern island where ancient religious artifacts were safeguarded for centuries.',
    coverImage: '/images/LakeTana.jpg',
    gallery: ['/images/LakeTana.jpg'],
    destinationType: 'historical_site',
    location: {
      address: 'Eastern Lake Tana',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'bahir-dar-waterfront',
    name: 'Bahir Dar Harbor & Lake Shore',
    slug: 'bahir-dar-waterfront',
    shortDescription: 'Lively palm-lined waterfront promenades, boat docks, and sunset viewpoints.',
    description: 'The primary launchpad for lake excursions, lakeside dining, and evening lakeside strolls.',
    coverImage: '/images/hotel.jpg',
    gallery: ['/images/hotel.jpg'],
    destinationType: 'viewpoint',
    location: {
      address: 'Lake Tana Shoreline',
      city: 'Bahir Dar',
      region: 'Amhara',
    },
    isFeatured: true,
    status: 'published',
    createdAt: new Date().toISOString(),
  },
]

export const DestinationShowcase: React.FC = () => {
  const { t, language } = useLanguage()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    destinationService
      .getAll({ limit: 6, isFeatured: true })
      .then((res) => {
        if (!isMounted) return
        if (res?.data && res.data.length > 0) {
          setDestinations(res.data)
        } else {
          setDestinations(CURATED_FALLBACK_DESTINATIONS)
        }
      })
      .catch(() => {
        if (isMounted) setDestinations(CURATED_FALLBACK_DESTINATIONS)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="py-20 bg-surface dark:bg-surface-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-widest block mb-2">
              {language === 'am' ? 'ቅዱሳን እና ተፈጥሯዊ ቅርሶች' : 'Sacred & Natural Heritage'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-text-primary">
              {t('home.featuredDestinationsTitle', 'Explore Lake Tana Destinations')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary max-w-xl">
              {t(
                'home.featuredDestinationsSubtitle',
                'Ancient island sanctuaries, secluded forest peninsulas, and thunderous waterfalls across Lake Tana.'
              )}
            </p>
          </div>

          <Link
            href="/destinations"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-surface-border bg-surface dark:bg-surface-dark hover:bg-surface-muted text-xs font-bold text-text-primary transition-all shadow-sm group"
          >
            <span>{t('home.viewAllDestinations', 'View All Destinations')}</span>
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

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} featured={dest.isFeatured} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
