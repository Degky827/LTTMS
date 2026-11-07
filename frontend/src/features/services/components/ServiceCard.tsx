import React from 'react'
import Link from 'next/link'
import { Service } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export interface ServiceCardProps {
  service: Service
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const imageUrl = service.coverImage || service.images?.[0]?.url || '/images/hotel.jpg'
  const vendorName = service.vendor?.businessName || 'Verified Local Partner'
  const currency = service.currency || 'ETB'

  return (
    <Link href={`/services/${service.slug || service._id}`} className="group block h-full">
      <Card
        hoverable
        bordered
        className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-surface"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hotel.jpg'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="primary" size="sm" className="backdrop-blur-md bg-primary-800/85 text-white border-0 font-medium capitalize">
              {service.category}
            </Badge>
            {service.ecoFriendly && (
              <Badge variant="success" size="sm" className="font-semibold shadow-sm flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486z" clipRule="evenodd" />
                </svg>
                Eco Certified
              </Badge>
            )}
          </div>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-3 right-3 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md border border-border-light text-right">
            <span className="text-[10px] text-text-secondary block font-medium uppercase tracking-wider">From</span>
            <span className="text-sm font-extrabold font-heading text-primary-700 dark:text-primary-400">
              {Number(service.price).toLocaleString()} {currency}
            </span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Vendor & Rating */}
            <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
              <span className="font-medium truncate max-w-[170px] text-primary-900 dark:text-gray-200">
                {vendorName}
              </span>
              <div className="flex items-center gap-1 text-gold-500 font-bold shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{service.rating ? Number(service.rating).toFixed(1) : '5.0'}</span>
                {service.reviewCount > 0 && (
                  <span className="text-text-muted font-normal">({service.reviewCount})</span>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold font-heading text-text-primary group-hover:text-primary-700 transition-colors line-clamp-1">
              {service.title}
            </h3>

            <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
              {service.shortDescription || service.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-3">
              {service.location && (
                <span className="flex items-center gap-1 truncate max-w-[130px]">
                  <svg className="w-3.5 h-3.5 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {service.location}
                </span>
              )}
              {service.duration && (
                <span className="flex items-center gap-1 shrink-0">
                  <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration}
                </span>
              )}
            </div>

            <span className="font-semibold text-primary-700 dark:text-primary-400 group-hover:underline shrink-0">
              View Tour &rarr;
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
