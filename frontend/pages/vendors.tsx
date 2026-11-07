import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { vendorService } from '@/features/vendors/services/vendorService'
import { Vendor } from '@/features/vendors/types'
import { VendorCard } from '@/features/vendors/components/VendorCard'
import { Button } from '@/components/ui/Button'

export default function VendorsDirectoryPage() {
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
        <title>Verified Local Tourism Partners & Boat Operators | LTTMS</title>
        <meta
          name="description"
          content="Connect with licensed Lake Tana boat captains, monastic guides, lakeside lodges, and cultural tour operators."
        />
      </Head>

      <div className="bg-surface-muted/30 min-h-screen pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-850 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
                🛡️ Verified Local Operators
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight">
                Our Tourism Partners & Boat Captains
              </h1>
              <p className="mt-3 text-primary-150 text-base sm:text-lg leading-relaxed">
                Empowering indigenous Bahir Dar boat cooperatives, heritage custodians, and certified eco-lodges dedicated to sustainable tourism on Lake Tana.
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by operator name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-white text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-md"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setEcoOnly(!ecoOnly)}
                className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                  ecoOnly
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-primary-900/60 text-primary-100 hover:bg-primary-800 border-primary-700/50'
                }`}
              >
                <span>🌿 Eco-Certified Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Vendor Join Banner */}
          <div className="bg-gradient-to-r from-primary-50 via-emerald-50 to-primary-50 border border-primary-200/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-primary-950 font-heading">
                Are you a local boat captain, guide, or lodge owner?
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
                Join the Lake Tana Tourism Marketplace to list your services, receive online reservations, and accept instant Chapa digital payments.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/vendor/register">
                <Button variant="primary" size="md">
                  Register as Vendor
                </Button>
              </Link>
              <Link href="/vendor/login">
                <Button variant="outline" size="md">
                  Vendor Portal Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-sm font-semibold text-text-secondary">
                {loading ? 'Loading operators...' : `Showing ${filteredVendors.length} Verified Partner${filteredVendors.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-44 bg-white rounded-2xl border border-surface-border p-5"></div>
                ))}
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
                <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
                  🚤
                </div>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  No Tourism Partners Found
                </h3>
                <p className="text-text-secondary max-w-md mx-auto text-sm">
                  We could not find any active partners matching your criteria. Try resetting your search or filter.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setSearch('')
                    setEcoOnly(false)
                  }}
                >
                  Reset Search
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
