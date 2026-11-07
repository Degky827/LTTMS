import React from 'react'
import Link from 'next/link'
import { Service } from '../types'

export interface ServiceCardProps {
  service: Service
}

const CATEGORY_NAMES: Record<string, string> = {
  boat: 'Boat Transportation',
  monastery: 'Monastic Excursion',
  hotel: 'Eco Lodge & Stay',
  tour: 'Guided Tour',
  food: 'Cultural Dining',
  wildlife: 'Wildlife & Wetlands',
  waterfall: 'Waterfalls & Hikes',
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const imageUrl = service.coverImage || service.images?.[0]?.url || '/images/hotel.jpg'
  const vendorName = service.vendor?.businessName || 'Verified Local Operator'
  const currency = service.currency || 'ETB'
  const targetSlug = service.slug || service._id
  const categoryLabel = CATEGORY_NAMES[service.category] || service.category || 'Experience'

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* 1. Large Imagery Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link href={`/services/${targetSlug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hotel.jpg'
            }}
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#244B3A]/90 backdrop-blur-md text-white shadow-sm border border-white/20 capitalize">
            {categoryLabel}
          </span>
          {service.ecoFriendly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600/90 backdrop-blur-md text-white shadow-sm border border-emerald-400/30">
              <svg className="w-3 h-3 text-emerald-200 fill-current" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486z" clipRule="evenodd" />
              </svg>
              <span>Eco Certified</span>
            </span>
          )}
        </div>

        {/* Availability Badge */}
        {service.availability && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/95 text-white shadow-sm border border-white/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Available</span>
            </span>
          </div>
        )}

        {/* Bottom Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 dark:bg-[#0B1613]/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 text-right">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider leading-none">
            From
          </span>
          <span className="text-sm sm:text-base font-extrabold font-heading text-[#173829] dark:text-emerald-400 leading-tight">
            {Number(service.price).toLocaleString()} <span className="text-xs font-semibold">{currency}</span>
          </span>
        </div>
      </div>

      {/* 2. Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor Name & Rating Header */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
              {vendorName}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-slate-800 dark:text-slate-100 font-extrabold">
                {service.rating ? Number(service.rating).toFixed(1) : '5.0'}
              </span>
              {service.reviewCount > 0 && (
                <span className="text-slate-500 dark:text-slate-400 font-normal">({service.reviewCount})</span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-[#244B3A] dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
            <Link href={`/services/${targetSlug}`}>{service.title}</Link>
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {service.shortDescription || service.description}
          </p>

          {/* Meta Tags: Location & Duration */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            {service.location && (
              <span className="inline-flex items-center gap-1 truncate max-w-[160px]">
                <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{service.location}</span>
              </span>
            )}
            {service.duration && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{service.duration}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Dual Action Buttons: View Details & Book Now */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          {/* View Details */}
          <Link
            href={`/services/${targetSlug}`}
            className="flex-1 py-2 px-3 text-center text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            View Details
          </Link>

          {/* Book Now */}
          <Link
            href={`/services/${targetSlug}#booking`}
            className="flex-1 py-2 px-3 text-center text-xs font-bold rounded-xl bg-[#244B3A] hover:bg-[#1b392c] text-white shadow-sm transition-all transform active:scale-95 flex items-center justify-center gap-1"
          >
            <span>Book Now</span>
            <svg className="w-3.5 h-3.5 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
