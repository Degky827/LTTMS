export interface ReviewUser {
  _id: string
  name: string
  avatar?: string
}

export interface ReviewServiceSummary {
  _id: string
  title: string
  slug?: string
}

export interface Review {
  _id: string
  service: string | ReviewServiceSummary
  user: ReviewUser
  vendor?: string
  booking?: string
  rating: number
  comment: string
  status?: 'pending' | 'approved' | 'rejected'
  vendorResponse?: {
    response: string
    respondedAt: string
  }
  createdAt: string
}

export interface CreateReviewPayload {
  service: string
  rating: number
  comment: string
  booking?: string
}

export interface ReviewListResponse {
  success: boolean
  count: number
  data: Review[]
}
