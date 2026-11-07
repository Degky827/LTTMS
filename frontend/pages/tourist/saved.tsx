import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { wishlistStorage } from '@/lib/storage/wishlistStorage'
import { Service } from '@/features/services/types'
import { useToast } from '@/components/feedback/ToastProvider'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TouristSavedExperiencesPage() {
  const { language } = useLanguage()
  const isAm = language === 'am'
  const { addToast } = useToast()

  const [savedItems, setSavedItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const syncList = () => {
    setSavedItems(wishlistStorage.getSaved())
    setLoading(false)
  }

  useEffect(() => {
    syncList()
    window.addEventListener('lttms_saved_updated', syncList)
    return () => window.removeEventListener('lttms_saved_updated', syncList)
  }, [])

  const handleRemove = (service: Service) => {
    const id = service._id || (service as any).id
    wishlistStorage.remove(id)
    addToast({
      type: 'info',
      title: isAm ? 'ተወግዷል' : 'Removed from Wishlist',
      message: `${service.title} ${isAm ? 'ከተቀመጡ ተሞክሮዎች ተወግዷል።' : 'has been removed.'}`,
    })
  }

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>{isAm ? 'የተቀመጡ ተሞክሮዎች | ጣና ቱሪዝም' : 'Saved Experiences | LTTMS'}</title>
      </Head>
      <TouristLayout title={isAm ? 'የተቀመጡ ተሞክሮዎች' : 'Saved Experiences'}>
        <PageHeader
          title={isAm ? 'የተቀመጡ ተሞክሮዎች' : 'My Saved Experiences'}
          subtitle={
            isAm
              ? 'ለቀጣይ የጣና ሐይቅ ጉዞዎ ያስቀመጧቸው የጀልባ ጉብኝቶችና የገዳማት አስጎብኚዎች።'
              : 'Your bookmarked boat tours, island monastery excursions, and eco-lodge retreats.'
          }
          breadcrumbs={[
            { label: isAm ? 'ዳሽቦርድ' : 'Dashboard', href: '/tourist' },
            { label: isAm ? 'የተቀመጡ' : 'Saved' },
          ]}
          actions={
            <Link href="/tourist/marketplace">
              <Button variant="primary" size="sm">
                {isAm ? 'ተጨማሪ ፈልግ' : 'Explore More Tours'}
              </Button>
            </Link>
          }
        />

        {/* Local Storage Disclaimer Pill */}
        <div className="bg-primary-50/80 border border-primary-200/80 rounded-xl p-3.5 mb-6 flex items-center justify-between text-xs text-primary-900">
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>
              {isAm
                ? 'እነዚህ ተሞክሮዎች ለፈጣን እቅድ በዚህ መሳሪያዎ ላይ ተቀምጠዋል።'
                : 'These items are saved in your browser for fast offline trip planning.'}
            </span>
          </div>
          {savedItems.length > 0 && (
            <span className="font-bold">
              {savedItems.length} {isAm ? 'ተሞክሮዎች' : 'items'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 bg-white rounded-2xl border border-surface-border animate-pulse p-4"
              ></div>
            ))}
          </div>
        ) : savedItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4 my-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto">
              ❤️
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              {isAm ? 'ምንም የተቀመጠ ተሞክሮ የለም' : 'No Saved Experiences Yet'}
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              {isAm
                ? 'በገበያው ውስጥ የሚወዷቸውን ጉብኝቶች የልብ ምልክቷን በመጫን እዚህ ማስቀመጥ ይችላሉ።'
                : 'Tap the heart icon on any tour or monastery excursion in the marketplace to save it here for later.'}
            </p>
            <Link href="/tourist/marketplace">
              <Button variant="primary">
                {isAm ? 'ገበያውን ያስሱ' : 'Browse Marketplace'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {savedItems.map((item) => {
              const vendor = item.vendor || ({} as any)
              const dest = item.destination || ({} as any)
              const imageUrl = item.coverImage || (item.images && item.images[0]?.url) || '/images/hero-1.jpg'

              return (
                <Card
                  key={item._id || (item as any).id}
                  bordered
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-lake-md transition-all duration-200 flex flex-col group"
                >
                  <div className="relative h-48 w-full bg-surface-muted overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero-1.jpg'
                      }}
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      title="Remove from saved"
                      className="absolute top-3 right-3 p-2 rounded-full bg-white text-red-600 shadow-md hover:bg-red-50 hover:scale-110 transition-all"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {dest.name && (
                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-white/90 text-text-primary text-xs font-semibold shadow-xs">
                        📍 {dest.name}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">
                        {vendor.businessName || 'Verified Operator'} ✓
                      </p>
                      <h3 className="font-bold text-base text-text-primary font-heading line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
                        {item.shortDescription || item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-surface-border flex items-center justify-between">
                      <div>
                        <span className="text-xs text-text-muted block">
                          {isAm ? 'ዋጋ' : 'Price'}
                        </span>
                        <span className="text-base font-extrabold text-primary-700 font-heading">
                          {Number(item.price).toLocaleString()} {item.currency || 'ETB'}
                        </span>
                      </div>

                      <Link href={`/services/${item.slug || item._id || (item as any).id}`}>
                        <Button variant="primary" size="sm" className="font-semibold shadow-lake-sm">
                          {isAm ? 'ቦታ ያዝ' : 'View & Book'}
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
