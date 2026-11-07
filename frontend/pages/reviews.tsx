import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  FaStar,
  FaReply,
  FaSearch,
  FaChevronRight,
} from 'react-icons/fa'

const reviewsData = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Eco-Tourist',
    rating: 5,
    date: '2 weeks ago',
    verified: true,
    text: 'The monastery tours were breathtaking! The guides were knowledgeable and the whole experience felt authentic and sustainable. Highly recommend the Zege Peninsula tour.',
    categories: { cleanliness: 5, ecoFriendly: 5, hospitality: 5, value: 4 },
    serviceType: 'Cultural Tour',
    vendorReply:
      "Thank you Sarah! We're thrilled you enjoyed the Zege tour. Your support helps us preserve these ancient sites.",
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Travel Blogger',
    rating: 5,
    date: '1 month ago',
    verified: true,
    text: 'Lake Tana Tourism made my Ethiopian adventure unforgettable. The boat ride at sunrise was magical! The eco-lodge was comfortable and the staff went above and beyond.',
    categories: { cleanliness: 5, ecoFriendly: 5, hospitality: 5, value: 5 },
    serviceType: 'Boat Tour',
    vendorReply: null,
  },
  {
    id: 3,
    name: 'Amina Hassan',
    role: 'Local Guide',
    rating: 5,
    date: '3 weeks ago',
    verified: true,
    text: 'As a local guide, I appreciate how this platform supports our community while promoting responsible tourism. The booking system is seamless.',
    categories: { cleanliness: 4, ecoFriendly: 5, hospitality: 5, value: 4 },
    serviceType: 'Cultural Tour',
    vendorReply:
      "Thank you Amina! We're proud to work with verified local guides who protect Lake Tana.",
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Nature Photographer',
    rating: 4,
    date: '1 week ago',
    verified: true,
    text: 'Incredible bird-watching trails around the lake wetlands. The eco-lodge was peaceful and solar-powered.',
    categories: { cleanliness: 4, ecoFriendly: 5, hospitality: 4, value: 4 },
    serviceType: 'Nature Walk',
    vendorReply: null,
  },
  {
    id: 5,
    name: 'Emily Carter',
    role: 'Solo Traveler',
    rating: 5,
    date: '5 days ago',
    verified: true,
    text: 'Stayed at the Forest Eco Lodge for 3 nights. Solar-powered, farm-to-table meals, and the most stunning sunset views over Lake Tana. Truly regenerative.',
    categories: { cleanliness: 5, ecoFriendly: 5, hospitality: 5, value: 4 },
    serviceType: 'Eco Lodge',
    vendorReply: null,
  },
]

export default function ReviewsPage() {
  const { t } = useLanguage()
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')

  const sorted = [...reviewsData]
    .filter(
      (r) =>
        filterType === 'all' ||
        r.serviceType.toLowerCase().includes(filterType.toLowerCase())
    )
    .filter(
      (r) =>
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.text.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating
      if (sort === 'lowest') return a.rating - b.rating
      return 0
    })

  return (
    <PublicLayout>
      <Head>
        <title>{t('reviews.title', 'Guest Reviews & Experiences')} | LTTMS</title>
        <meta
          name="description"
          content="Authentic guest reviews and ratings for Lake Tana monastery tours, boat cruises, and eco-lodges in Bahir Dar, Ethiopia."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-3">
                ⭐ {t('reviews.ratingSummary', 'Community Rating')} • 4.8 / 5.0
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                {t('reviews.title', 'Guest Reviews & Experiences')}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-primary-100/90 leading-relaxed">
                {t(
                  'reviews.subtitle',
                  'Discover authentic stories and feedback from conscious travelers exploring Lake Tana.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Controls Bar: Search & Filter */}
          <div className="bg-surface border border-surface-border rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
              <input
                type="text"
                placeholder={t('common.search', 'Search reviews...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <span>{t('reviews.sortBy', 'Sort by')}:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="newest">{t('reviews.newest', 'Newest')}</option>
                  <option value="highest">{t('reviews.highest', 'Highest Rated')}</option>
                  <option value="lowest">{t('reviews.lowest', 'Lowest Rated')}</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <span>{t('reviews.filterBy', 'Filter')}:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">{t('reviews.allCategories', 'All Categories')}</option>
                  <option value="Boat Tour">Boat Tours</option>
                  <option value="Cultural Tour">Monasteries</option>
                  <option value="Eco Lodge">Eco Lodges</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {sorted.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-7 shadow-sm transition-colors hover:border-primary-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center font-bold text-sm text-primary-700 dark:text-primary-300">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-text-primary">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>{item.role}</span>
                        <span>•</span>
                        <span>{item.serviceType}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < item.rating
                            ? 'text-gold-500 fill-current text-sm'
                            : 'text-surface-border text-sm'
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {item.text}
                </p>

                {item.vendorReply && (
                  <div className="bg-surface-muted border border-surface-border rounded-xl p-4 mt-3 flex items-start gap-3">
                    <FaReply className="text-primary-700 dark:text-primary-400 mt-1 shrink-0 text-xs" />
                    <div>
                      <span className="text-xs font-bold text-text-primary block">
                        {t('reviews.vendorResponse', 'Operator Response')}
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {item.vendorReply}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Book Experience CTA */}
          <div className="mt-12 bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 text-center shadow-sm">
            <h3 className="text-xl font-bold font-heading text-text-primary mb-2">
              {t('home.ctaTitle', 'Ready to Experience Lake Tana?')}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto mb-6">
              {t('home.ctaSubtitle')}
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm"
            >
              <span>{t('home.viewAllServices', 'Browse All Services')}</span>
              <FaChevronRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
