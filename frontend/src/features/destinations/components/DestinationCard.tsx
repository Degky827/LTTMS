import React from 'react'
import Link from 'next/link'
import { Destination } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

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

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, featured }) => {
  const imageUrl = destination.coverImage || destination.gallery?.[0] || '/images/monastery.jpg'
  const typeLabel = TYPE_LABELS[destination.destinationType] || destination.destinationType

  return (
    <Link href={`/destinations/${destination.slug || destination._id}`} className="group block h-full">
      <Card
        hoverable
        bordered
        className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-surface"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails
              (e.target as HTMLImageElement).src = '/images/monastery.jpg'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="primary" size="sm" className="backdrop-blur-md bg-primary-700/85 text-white border-0 font-medium shadow-sm">
              {typeLabel}
            </Badge>
            {(featured || destination.isFeatured) && (
              <Badge variant="warning" size="sm" className="font-semibold shadow-sm">
                Featured
              </Badge>
            )}
          </div>

          {destination.location?.city && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90 font-medium">
              <svg className="w-3.5 h-3.5 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{destination.location.city}, Ethiopia</span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-text-primary group-hover:text-primary-700 transition-colors line-clamp-1">
              {destination.name}
            </h3>
            <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
              {destination.shortDescription || destination.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-xs font-semibold text-primary-700">
            <span>Explore Details & Tours</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  )
}
