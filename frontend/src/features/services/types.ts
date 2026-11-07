export interface ServiceImage {
  url: string
  caption?: string
  isCover?: boolean
}

export interface ServiceVendor {
  _id: string
  businessName: string
  slug?: string
  logo?: string
  contactEmail?: string
  contactPhone?: string
  status?: string
  rating?: number
  ecoBadgeTier?: string
}

export interface ServiceDestination {
  _id: string
  name: string
  slug: string
  location?: {
    city?: string
    region?: string
  }
}

export interface Service {
  _id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  currency: string
  pricingType?: 'per_person' | 'per_group' | 'fixed'
  childPrice?: number
  groupPrice?: number
  category: string
  categoryRef?: {
    _id: string
    name: string
    slug: string
  }
  subcategory?: {
    _id: string
    name: string
    slug: string
  }
  destination?: ServiceDestination
  vendor: ServiceVendor
  location: string
  duration: string
  difficulty?: 'easy' | 'moderate' | 'challenging'
  rating: number
  reviewCount: number
  images?: ServiceImage[]
  coverImage?: string
  ecoFriendly: boolean
  ecoBadges?: Array<{
    badge: {
      _id: string
      name: string
      slug: string
      tier: string
      iconUrl?: string
    }
    awardedAt: string
  }>
  included?: string[]
  excluded?: string[]
  requirements?: string[]
  meetingPoint?: string
  cancellationPolicy?: string
  dailyCapacity?: number
  minBookingCapacity?: number
  maxBookingCapacity?: number
  operatingDays?: number[]
  timeSlots?: string[]
  unavailableDates?: string[]
  availability: boolean
  isFeatured: boolean
  status: 'published' | 'draft' | 'archived' | 'rejected'
  createdAt?: string
}

export interface ServiceListResponse {
  success: boolean
  count: number
  total: number
  page: number
  totalPages: number
  data: Service[]
}

export interface ServiceQueryParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  destination?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  ecoFriendly?: boolean
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
}
