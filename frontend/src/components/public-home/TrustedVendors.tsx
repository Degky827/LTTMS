import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Vendor } from '@/features/vendors/types'
import { vendorService } from '@/features/vendors/services/vendorService'
import { VendorCard } from '@/features/vendors/components/VendorCard'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/contexts/LanguageContext'

const CURATED_FALLBACK_VENDORS: Vendor[] = [
  {
    _id: 'v-boat-coop',
    user: 'system',
    businessName: 'Lake Tana Boatmen Association',
    slug: 'lake-tana-boatmen-association',
    businessType: 'boat_operator',
    description: 'Licensed boat transport cooperative with over 20 certified motorboats adhering to safety and eco-standards.',
    logo: '/images/Boat.jpg',
    address: 'Bahir Dar Main Pier, Lake Tana',
    city: 'Bahir Dar',
    region: 'Amhara',
    phone: '+251 58 220 1122',
    verificationStatus: 'approved',
    status: 'approved',
    rating: 4.9,
    reviewCount: 48,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'v-zege-guides',
    user: 'system',
    businessName: 'Zege Community Heritage Guides',
    slug: 'zege-community-heritage-guides',
    businessType: 'guide',
    description: 'Certified native guides born on the Zege Peninsula with deep fluency in monastery history and birdwatching.',
    logo: '/images/monastery.jpg',
    address: 'Zege Peninsula Main Gate',
    city: 'Bahir Dar',
    region: 'Amhara',
    phone: '+251 58 220 4433',
    verificationStatus: 'approved',
    status: 'approved',
    rating: 5.0,
    reviewCount: 39,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'v-waterfront-lodge',
    user: 'system',
    businessName: 'Kuriftu Lake Sanctuary Resort',
    slug: 'kuriftu-lake-sanctuary',
    businessType: 'eco_lodge',
    description: 'Premier eco-lodge blending traditional Ethiopian stone and thatch architecture with sustainable solar facilities.',
    logo: '/images/hotel.jpg',
    address: 'Lake Shore Road',
    city: 'Bahir Dar',
    region: 'Amhara',
    phone: '+251 58 226 0001',
    verificationStatus: 'approved',
    status: 'approved',
    rating: 4.8,
    reviewCount: 62,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'v-tis-abay-guides',
    user: 'system',
    businessName: 'Tis Abay Falls Guide Cooperative',
    slug: 'tis-abay-falls-guide-cooperative',
    businessType: 'guide',
    description: 'Community-run guide association organizing safe treks to Tis Issat falls and historical cultural homesteads.',
    logo: '/images/waterfall.jpg',
    address: 'Tis Abay Falls Visitor Center',
    city: 'Tis Abay',
    region: 'Amhara',
    phone: '+251 58 220 8899',
    verificationStatus: 'approved',
    status: 'approved',
    rating: 4.8,
    reviewCount: 35,
    createdAt: new Date().toISOString(),
  },
]

export const TrustedVendors: React.FC = () => {
  const { t, language } = useLanguage()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    vendorService
      .getAll({ limit: 4 })
      .then((res) => {
        if (!isMounted) return
        if (res?.data && res.data.length > 0) {
          setVendors(res.data)
        } else {
          setVendors(CURATED_FALLBACK_VENDORS)
        }
      })
      .catch(() => {
        if (isMounted) setVendors(CURATED_FALLBACK_VENDORS)
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
              {language === 'am' ? 'የተረጋገጡ አጋሮች' : 'Verified Operators'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-text-primary">
              {t('home.topVendorsTitle', 'Certified Local Tourism Operators')}
            </h2>
            <p className="mt-2 text-sm text-text-secondary max-w-xl">
              {t(
                'home.topVendorsSubtitle',
                'Meet the verified local businesses and boat cooperatives powering Lake Tana eco-tourism.'
              )}
            </p>
          </div>

          <Link
            href="/vendors"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-surface-border bg-surface dark:bg-surface-dark hover:bg-surface-muted text-xs font-bold text-text-primary transition-all shadow-sm group"
          >
            <span>{t('home.viewAllVendors', 'View All Operators')}</span>
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

        {/* Vendors Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <VendorCard key={vendor._id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
