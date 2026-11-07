import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { vendorService } from '@/features/vendors/services/vendorService'
import { Vendor } from '@/features/vendors/types'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service } from '@/features/services/types'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

export default function VendorProfilePage() {
  const router = useRouter()
  const { slug } = router.query

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug || Array.isArray(slug)) return

    const loadVendorData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await vendorService.getByIdOrSlug(slug)
        if (res.data) {
          const v = res.data
          setVendor(v)

          // Load services offered by this vendor
          try {
            setServicesLoading(true)
            const servRes = await marketplaceService.getAll({
              limit: 20,
            })
            if (servRes.data) {
              // Filter services belonging to this vendor
              const vendorServices = servRes.data.filter(
                (s) =>
                  s.vendor?._id === v._id ||
                  s.vendor?.slug === v.slug ||
                  (typeof s.vendor === 'string' && s.vendor === v._id)
              )
              setServices(vendorServices)
            }
          } catch (servErr) {
            console.error('Failed to load vendor services:', servErr)
          } finally {
            setServicesLoading(false)
          }
        } else {
          setError('Vendor not found')
        }
      } catch (err: any) {
        console.error('Failed to fetch vendor:', err)
        setError(err?.response?.data?.message || 'Vendor details could not be loaded')
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [slug])

  const businessTypeLabels: Record<string, string> = {
    hotel: 'Lakeside Hotel & Lodging',
    boat_operator: 'Boat Transport & Cruise Operator',
    tour_guide: 'Licensed Tour & Cultural Guide',
    restaurant: 'Lakeside Restaurant',
    eco_lodge: 'Sustainable Eco Lodge',
    handicraft: 'Artisan Cooperative',
    other: 'Tourism Partner',
  }

  return (
    <PublicLayout>
      <Head>
        <title>{vendor ? `${vendor.businessName} | Lake Tana Partner` : 'Vendor Profile | LTTMS'}</title>
        <meta
          name="description"
          content={vendor?.shortDescription || vendor?.description?.substring(0, 160) || 'Verified Lake Tana vendor'}
        />
      </Head>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
          <div className="h-64 bg-surface-border rounded-3xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-surface-border rounded w-1/3"></div>
              <div className="h-24 bg-surface-border rounded"></div>
            </div>
            <div className="h-48 bg-surface-border rounded"></div>
          </div>
        </div>
      ) : error || !vendor ? (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Operator Not Found</h1>
          <p className="text-text-secondary mb-6">{error || 'This tourism operator could not be located.'}</p>
          <Link href="/vendors">
            <Button variant="primary">Browse All Operators</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-surface-muted/30 pb-20">
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-surface-border py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center space-x-2 text-xs sm:text-sm text-text-muted">
                <Link href="/" className="hover:text-primary-600 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/vendors" className="hover:text-primary-600 transition-colors">
                  Partners
                </Link>
                <span>/</span>
                <span className="text-text-primary font-medium truncate">{vendor.businessName}</span>
              </nav>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
            {/* Vendor Profile Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-primary-50 border border-primary-200 shrink-0">
                    <img
                      src={vendor.logo || '/images/hotel.jpg'}
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/images/hotel.jpg'
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {businessTypeLabels[vendor.businessType] || vendor.businessType}
                      </Badge>
                      <Badge variant="success" size="sm">
                        ✓ Verified Partner
                      </Badge>
                      {vendor.ecoBadgeTier && vendor.ecoBadgeTier !== 'none' && (
                        <Badge variant="secondary" size="sm" className="capitalize">
                          🌿 {vendor.ecoBadgeTier} Eco Tier
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">
                      {vendor.businessName}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-secondary">
                      {vendor.location?.city && (
                        <span>📍 {vendor.location.city}, {vendor.location.region || 'Amhara, Ethiopia'}</span>
                      )}
                      {vendor.rating && (
                        <span className="flex items-center gap-1 font-bold text-text-primary">
                          <span className="text-amber-500">★</span>
                          <span>{vendor.rating.toFixed(1)}</span>
                          <span className="text-text-muted font-normal">
                            ({vendor.reviewCount || 0} reviews)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Contact Button */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {vendor.contactPhone && (
                    <a
                      href={`tel:${vendor.contactPhone}`}
                      className="px-4 py-2.5 rounded-xl border border-surface-border text-xs sm:text-sm font-semibold text-text-primary hover:bg-surface-muted transition-colors text-center"
                    >
                      📞 Call Operator
                    </a>
                  )}
                  {vendor.contactEmail && (
                    <a
                      href={`mailto:${vendor.contactEmail}`}
                      className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold transition-colors text-center"
                    >
                      ✉️ Send Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Vendor About & Listed Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: About & Credentials */}
              <div className="lg:col-span-1 space-y-6">
                <Card bordered className="bg-white shadow-xs">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                      About the Business
                    </h2>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {vendor.description ||
                        vendor.shortDescription ||
                        `${vendor.businessName} is a licensed and verified tourism service provider based in Lake Tana, committed to authentic visitor experiences and local heritage stewardship.`}
                    </p>

                    <div className="space-y-3 pt-3 border-t border-surface-border text-xs text-text-secondary">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Verification Status:</span>
                        <span className="font-semibold text-emerald-600">Fully Verified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Safety Vests / Equipment:</span>
                        <span className="font-semibold text-text-primary">Naval Standard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Payment Protection:</span>
                        <span className="font-semibold text-text-primary">Chapa Escrow</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Tours & Services */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-surface-border pb-3">
                  <h2 className="text-xl font-bold text-text-primary font-heading">
                    Experiences Offered by {vendor.businessName}
                  </h2>
                  <span className="text-xs text-text-muted">
                    {services.length} active service{services.length === 1 ? '' : 's'}
                  </span>
                </div>

                {servicesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2].map((n) => (
                      <div key={n} className="h-80 bg-white rounded-2xl border border-surface-border p-4"></div>
                    ))}
                  </div>
                ) : services.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-surface-border space-y-3">
                    <p className="text-sm text-text-secondary">
                      No tours or packages are currently listed online by this operator.
                    </p>
                    <Link href="/services">
                      <Button variant="outline" size="sm">
                        Explore All Lake Tana Tours
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {services.map((svc) => (
                      <ServiceCard key={svc._id} service={svc} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
