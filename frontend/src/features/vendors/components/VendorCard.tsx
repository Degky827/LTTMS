import React from 'react'
import Link from 'next/link'
import { Vendor } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export interface VendorCardProps {
  vendor: Vendor
}

const TYPE_LABELS: Record<string, string> = {
  hotel: 'Lakeside Hotel',
  boat_operator: 'Boat Transport & Cruise',
  tour_guide: 'Licensed Tour Guide',
  restaurant: 'Local Cuisine',
  eco_lodge: 'Eco Lodge',
  handicraft: 'Artisan Crafts',
  other: 'Tourism Partner',
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor }) => {
  const typeLabel = TYPE_LABELS[vendor.businessType] || vendor.businessType || 'Tourism Partner'
  const logoUrl = vendor.logo || '/images/hotel.jpg'

  return (
    <Link href={`/vendors/${vendor.slug || vendor._id}`} className="group block h-full">
      <Card
        hoverable
        bordered
        className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-surface p-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-border-light shrink-0 relative">
            <img
              src={logoUrl}
              alt={vendor.businessName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel.jpg'
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="primary" size="sm" className="text-[10px] uppercase font-bold tracking-wider">
                {typeLabel}
              </Badge>
              {vendor.status === 'approved' && (
                <Badge variant="success" size="sm" className="text-[10px] font-semibold flex items-center gap-1">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </Badge>
              )}
            </div>

            <h3 className="text-base font-bold font-heading text-text-primary group-hover:text-primary-700 transition-colors mt-1.5 truncate">
              {vendor.businessName}
            </h3>

            {vendor.location?.city && (
              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3 text-text-secondary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{vendor.location.city}, Lake Tana</span>
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-text-secondary mt-3.5 line-clamp-2 leading-relaxed flex-1">
          {vendor.shortDescription || vendor.description || 'Experienced tourism and hospitality provider operating on Lake Tana and Bahir Dar.'}
        </p>

        <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gold-500 font-bold">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{vendor.rating ? Number(vendor.rating).toFixed(1) : '5.0'}</span>
          </div>

          <span className="font-semibold text-primary-700 dark:text-primary-400 group-hover:underline">
            View Profile &rarr;
          </span>
        </div>
      </Card>
    </Link>
  )
}
