import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { vendorService } from '@/features/vendors/services/vendorService'
import { Vendor } from '@/features/vendors/types'
import { VendorCard } from '@/features/vendors/components/VendorCard'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'

export default function VendorsDirectoryPage() {
  const { t } = useLanguage()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ecoOnly, setEcoOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true)
        const res = await vendorService.getAll({
          page,
          limit: 12,
          search: search.trim() || undefined,
        })
        if (res.data) {
          setVendors(res.data)
          setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / 12) || 1)
        }
      } catch (err) {
        console.error('Failed to load vendors:', err)
        setVendors([])
      } finally {
        setLoading(false)
      }
    }

    loadVendors()
  }, [page, search])

  const filteredVendors = vendors.filter((v) => {
    if (ecoOnly && !v.ecoCertification && (!v.ecoBadgeTier || v.ecoBadgeTier === 'none')) {
      return false
    }
    return true
  })

  return (
    <PublicLayout>
      <Head>
        <title>{t('home.topVendorsTitle', 'Certified Local Operators')} | LTTMS</title>
        <meta
          name="description"
          content="Connect with licensed Lake Tana boat captains, monastic guides, lakeside lodges, and cultural tour operators."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-3">
                🛡️ {t('home.reason1Title', '100% Verified Local Operators')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight">
                {t('home.topVendorsTitle', 'Certified Local Operators')}
              </h1>
              <p className="mt-2 text-primary-100/90 text-sm sm:text-base leading-relaxed">
                {t(
                  'home.topVendorsSubtitle',
                  'Meet the verified local businesses and boat cooperatives powering Lake Tana eco-tourism.'
                )}
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('common.search', 'Search operators...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-surface border border-surface-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setEcoOnly(!ecoOnly)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${
                  ecoOnly
                    ? 'bg-primary-700 text-white border-primary-600 shadow-sm'
                    : 'bg-primary-900/60 text-primary-100 hover:bg-primary-800 border-primary-700/50'
                }`}
              >
                <span>🌿 {t('common.ecoCertified', 'Eco-Certified')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Vendor Join Banner */}
          <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary font-heading">
                Are you a local boat captain, guide, or lodge owner?
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
                Join the Lake Tana Tourism Marketplace to list your services, receive online reservations, and accept instant digital payments.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/vendor/register">
                <Button variant="primary" size="md">
                  {t('footer.becomeVendor', 'Become a Certified Vendor')}
                </Button>
              </Link>
              <Link href="/vendor/login">
                <Button variant="outline" size="md">
                  {t('footer.vendorPortal', 'Vendor Partner Portal')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs sm:text-sm font-semibold text-text-secondary">
                {loading
                  ? t('common.loading', 'Loading...')
                  : `Showing ${filteredVendors.length} Verified Partner${filteredVendors.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-44 bg-surface rounded-2xl border border-surface-border p-5"></div>
                ))}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="bg-surface rounded-2xl p-12 text-center border border-surface-border space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
                  🚤
                </div>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {t('common.noResults', 'No listings found matching your criteria')}
                </h3>
                <p className="text-text-secondary max-w-md mx-auto text-xs sm:text-sm">
                  We could not find any active partners matching your search. Try resetting your query or filter.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setSearch('')
                    setEcoOnly(false)
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVendors.map((vendor) => (
                    <VendorCard key={vendor._id} vendor={vendor} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      &larr; Previous
                    </Button>
                    <span className="text-xs text-text-secondary px-3 font-semibold">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next &rarr;
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
