import React from 'react'
import Link from 'next/link'
import { Destination } from '../types'

export interface DestinationCardProps {
  destination: Destination
  featured?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  monastery: 'Historic Monastery',
  island: 'Island Sanctuary',
  waterfall: 'Natural Waterfall',
  wildlife_sanctuary: 'Wildlife Reserve',
  historical_site: 'Heritage Site',
  cultural_village: 'Cultural Village',
  viewpoint: 'Scenic Viewpoint',
  other: 'Attraction',
}

const DEFAULT_ATTRACTIONS: Record<string, string[]> = {
  monastery: ['Ancient Frescoes', 'Ecclesiastical Relics', 'Forest Trails'],
  island: ['Sacred Sanctuaries', 'Boat Access', 'Rare Parchments'],
  waterfall: ['Tis Issat Plume', 'Portuguese Bridge', 'Birdwatching'],
  wildlife_sanctuary: ['Great White Pelicans', 'Wetlands', 'Hippopotamus'],
  historical_site: ['Medieval History', 'Royal Tombs', 'Sacred Lore'],
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, featured }) => {
  const imageUrl = destination.coverImage || destination.gallery?.[0] || '/images/monastery.jpg'
  const typeLabel = TYPE_LABELS[destination.destinationType] || destination.destinationType || 'Heritage Destination'
  const targetSlug = destination.slug || destination._id

  // Determine attractions from tags or type defaults
  const attractions =
    destination.tags && destination.tags.length > 0
      ? destination.tags.slice(0, 3)
      : DEFAULT_ATTRACTIONS[destination.destinationType] || ['Sacred Heritage', 'Lake Views', 'Local Culture']

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-emerald-600/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* 1. Large Destination Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link href={`/destinations/${targetSlug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/monastery.jpg'
            }}
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#244B3A]/90 backdrop-blur-md text-white shadow-sm border border-white/20">
            {typeLabel}
          </span>
          {(featured || destination.isFeatured) && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500/90 backdrop-blur-md text-slate-950 shadow-sm border border-amber-300/30">
              Recommended
            </span>
          )}
        </div>

        {/* Location Overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-xs text-white/95 font-semibold drop-shadow-sm">
          <svg className="w-4 h-4 text-emerald-300 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>
            {destination.location?.city ? `${destination.location.city}, Lake Tana` : 'Lake Tana, Bahir Dar'}
          </span>
        </div>
      </div>

      {/* 2. Destination Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Destination Name */}
          <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-[#244B3A] dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
            <Link href={`/destinations/${targetSlug}`}>{destination.name}</Link>
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {destination.shortDescription || destination.description}
          </p>

          {/* Key Attractions & Highlights */}
          <div className="mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              Key Attractions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {attractions.map((attraction, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                >
                  {attraction}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. View Destination Action */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            href={`/destinations/${targetSlug}`}
            className="w-full inline-flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#244B3A] dark:hover:bg-[#244B3A] text-slate-800 dark:text-slate-100 hover:text-white dark:hover:text-white font-semibold text-xs transition-all duration-200 group/btn"
          >
            <span>View Destination</span>
            <svg
              className="w-4 h-4 text-slate-500 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
