import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { DestinationCard } from '@/features/destinations/components/DestinationCard'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Destination } from '@/features/destinations/types'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'

export default function DestinationsPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!router.isReady) return
    const qSearch = typeof router.query.search === 'string' ? router.query.search : ''
    const qType = typeof router.query.type === 'string' ? router.query.type : 'all'
    const qPage = parseInt(router.query.page as string, 10) || 1

    setSearch(qSearch)
    setType(qType)
    setPage(qPage)
  }, [router.isReady, router.query])

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    destinationService
      .getAll({
        page,
        limit: 9,
        search: search || undefined,
        type: type !== 'all' ? type : undefined,
      })
      .then((res) => {
        if (!isMounted) return
        setDestinations(res?.data || [])
        setTotalPages(res?.totalPages || 1)
        setTotal(res?.total || 0)
      })
      .catch(() => {
        if (!isMounted) return
        setDestinations([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [page, search, type])

  const handleSearchSubmit = (value: string) => {
    setSearch(value)
    setPage(1)
    router.push({
      pathname: '/destinations',
      query: { ...router.query, search: value, page: 1 },
    })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setType(val)
    setPage(1)
    router.push({
      pathname: '/destinations',
      query: { ...router.query, type: val, page: 1 },
    })
  }

  return (
    <PublicLayout>
      <Head>
        <title>Destinations & Island Monasteries | Lake Tana LTTMS</title>
        <meta
          name="description"
          content="Explore all destinations around Lake Tana: Zege Peninsula, Ura Kidane Mehret, Kibran Gebriel, Blue Nile Falls, and sacred island monasteries."
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <PageHeader
          title="Destinations & Sacred Islands"
          subtitle="Discover ancient Orthodox monasteries, biosphere reserves, and scenic landmarks across Lake Tana."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Destinations' },
          ]}
        />

        {/* Filters Bar */}
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-96">
            <SearchInput
              value={search}
              onChange={(val) => setSearch(val)}
              onSearch={handleSearchSubmit}
              placeholder="Search by destination name, history, or town..."
            />
          </div>

          <div className="w-full sm:w-64 flex items-center gap-2">
            <span className="text-xs text-text-secondary font-medium shrink-0">Category:</span>
            <Select
              value={type}
              onChange={handleTypeChange}
              options={[
                { value: 'all', label: 'All Destinations' },
                { value: 'monastery', label: 'Monasteries' },
                { value: 'island', label: 'Islands' },
                { value: 'waterfall', label: 'Waterfalls' },
                { value: 'wildlife_sanctuary', label: 'Wildlife Sanctuaries' },
                { value: 'historical_site', label: 'Historical Sites' },
              ]}
            />
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs text-text-secondary font-medium pb-2">
          <span>{loading ? 'Discovering destinations...' : `Showing ${total} Destination${total === 1 ? '' : 's'}`}</span>
        </div>

        {/* Grid & States */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 bg-surface rounded-2xl p-4 border border-border-light space-y-3">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : destinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setPage(p)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No destinations found"
            description="Try adjusting your keyword search or category filter to discover Lake Tana attractions."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setType('all')
                  router.push('/destinations')
                }}
              >
                Reset Filters
              </Button>
            }
          />
        )}
      </div>
    </PublicLayout>
  )
}
