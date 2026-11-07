import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { destinationService } from '@/features/destinations/services/destinationService'
import { Destination } from '@/features/destinations/types'
import { useLanguage } from '@/contexts/LanguageContext'

const DEST_TYPE_LABELS: Record<string, { en: string; am: string }> = {
  all: { en: 'All Destinations', am: 'ሁሉም መዳረሻዎች' },
  monastery: { en: 'Island Monastery', am: 'የደሴት ገዳም' },
  island: { en: 'Island', am: 'ደሴት' },
  waterfall: { en: 'Waterfall', am: 'ፏፏቴ' },
  wildlife_sanctuary: { en: 'Wildlife Reserve', am: 'የዱር እንስሳት ጥበቃ' },
  historical_site: { en: 'Historical Site', am: 'ታሪካዊ ስፍራ' },
  cultural_village: { en: 'Cultural Village', am: 'ባህላዊ መንደር' },
}

export default function TouristDestinationsPage() {
  const { language } = useLanguage()
  const isAm = language === 'am'

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  const loadDestinations = async () => {
    try {
      setLoading(true)
      const res = await destinationService.getAll({ limit: 50 })
      if (res.data) {
        setDestinations(res.data)
      }
    } catch (err) {
      console.error('Failed to load destinations:', err)
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDestinations()
  }, [])

  const filtered = destinations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase())) ||
      (d.location?.city && d.location.city.toLowerCase().includes(search.toLowerCase()))
    const matchesType = selectedType === 'all' || d.destinationType === selectedType
    return matchesSearch && matchesType
  })

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>{isAm ? 'የጣና መዳረሻዎች | ጣና ቱሪዝም' : 'Lake Tana Destinations | LTTMS'}</title>
      </Head>
      <TouristLayout title={isAm ? 'መዳረሻዎች' : 'Destinations'}>
        <PageHeader
          title={isAm ? 'የጣና ሐይቅ እና የባሕር ዳር መዳረሻዎች' : 'Lake Tana & Bahir Dar Destinations'}
          subtitle={
            isAm
              ? 'ጥንታዊ የደሴት ገዳማት፣ የጢስ አባይ ፏፏቴ፣ የዘጌ ልሳነ ምድር እና የጣና የተፈጥሮ ቅርሶችን ያስሱ።'
              : 'Discover 14th-century island monasteries, Tis Issat Blue Nile Falls, Zege peninsula, and sacred biosphere sanctuaries.'
          }
          breadcrumbs={[
            { label: isAm ? 'ዳሽቦርድ' : 'Dashboard', href: '/tourist' },
            { label: isAm ? 'መዳረሻዎች' : 'Destinations' },
          ]}
          actions={
            <Link href="/tourist/marketplace">
              <Button variant="primary" size="sm">
                {isAm ? 'ሁሉንም ጉብኝቶች ፈልግ' : 'Browse All Tours'}
              </Button>
            </Link>
          }
        />

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-lake-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isAm
                    ? 'መዳረሻዎችን በስም ወይም በቦታ ይፈልጉ (ምሳሌ፡ ኡራ ኪዳነ ምሕረት፣ ጢስ አባይ)...'
                    : 'Search destinations by name or region (e.g. Ura Kidane Mehret, Blue Nile)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border text-sm text-text-primary bg-surface-muted/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
              <svg
                className="w-5 h-5 text-text-muted absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-border text-sm text-text-primary bg-surface-muted/30 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(DEST_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {isAm ? v.am : v.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-88 bg-white rounded-2xl border border-surface-border animate-pulse p-4"
              ></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4 my-8">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
              📍
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              {isAm ? 'ምንም መዳረሻ አልተገኘም' : 'No Destinations Found'}
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              {isAm
                ? 'በመረጡት ፍለጋ የተዛመደ መዳረሻ አልተገኘም። እባክዎ ፍለጋዎን ይቀይሩ።'
                : 'No destinations matched your criteria. Try adjusting your search query.'}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('')
                setSelectedType('all')
              }}
            >
              {isAm ? 'ሁሉንም አሳይ' : 'Reset Search'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filtered.map((d) => {
              const imageUrl = d.coverImage || (d.gallery && d.gallery[0]) || '/images/hero-2.jpg'
              const typeLabel = DEST_TYPE_LABELS[d.destinationType] || {
                en: d.destinationType || 'Destinations',
                am: d.destinationType || 'መዳረሻ',
              }

              return (
                <Card
                  key={d._id}
                  bordered
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-lake-md transition-all duration-200 flex flex-col group"
                >
                  <div className="relative h-52 w-full bg-surface-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero-2.jpg'
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black/60 text-white backdrop-blur-xs">
                        {isAm ? typeLabel.am : typeLabel.en}
                      </span>
                    </div>

                    {d.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="primary" size="sm">
                          ★ {isAm ? 'ተመራጭ' : 'Featured'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-text-secondary mb-1">
                        <span>📍</span>
                        <span>{d.location?.city || 'Lake Tana, Bahir Dar'}</span>
                        {d.location?.region && <span>· {d.location.region}</span>}
                      </div>

                      <h3 className="font-bold text-lg text-text-primary font-heading line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {d.name}
                      </h3>

                      <p className="text-xs text-text-secondary line-clamp-3 mt-2 leading-relaxed">
                        {d.shortDescription || d.description}
                      </p>

                      {d.visitingHours && (
                        <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                          <span>🕒</span>
                          <span>{d.visitingHours}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-surface-border flex items-center gap-2">
                      <Link
                        href={`/tourist/marketplace?destination=${d._id}`}
                        className="flex-1"
                      >
                        <Button variant="primary" size="sm" className="w-full font-semibold shadow-lake-sm">
                          {isAm ? 'እዚህ ያሉ ጉዞዎችን እይ' : 'Explore Tours Here'}
                        </Button>
                      </Link>

                      <Link href={`/destinations/${d.slug || d._id}`}>
                        <Button variant="outline" size="sm">
                          {isAm ? 'ዝርዝር' : 'Details'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </TouristLayout>
    </ProtectedRoute>
  )
}
