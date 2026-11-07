export interface DestinationLocation {
  address?: string
  city?: string
  region?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface Destination {
  _id: string
  name: string
  slug: string
  destinationType: 'monastery' | 'island' | 'waterfall' | 'wildlife_sanctuary' | 'historical_site' | 'cultural_village' | 'viewpoint' | 'other'
  description: string
  shortDescription?: string
  historicalSignificance?: string
  culturalSignificance?: string
  ecologicalSignificance?: string
  location?: DestinationLocation
  coverImage?: string
  gallery?: string[]
  isFeatured: boolean
  status: 'published' | 'draft' | 'archived'
  entryFee?: {
    citizens?: number
    residents?: number
    foreigners?: number
    currency?: string
  }
  visitingHours?: string
  bestTimeToVisit?: string
  tags?: string[]
  createdAt?: string
}

export interface DestinationListResponse {
  success: boolean
  count: number
  total: number
  page: number
  totalPages: number
  data: Destination[]
}
