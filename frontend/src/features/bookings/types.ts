export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired'

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed'

export interface BookingServiceSummary {
  _id: string
  title: string
  slug?: string
  price: number
  currency: string
  coverImage?: string
  duration?: string
  location?: string
  vendor?: {
    _id: string
    businessName: string
    contactPhone?: string
    contactEmail?: string
  }
}

export interface Booking {
  _id: string
  bookingReference: string
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  service: BookingServiceSummary
  vendor: {
    _id: string
    businessName: string
    contactEmail?: string
    contactPhone?: string
  }
  date: string
  timeSlot?: string
  guests: number
  adults?: number
  children?: number
  priceSnapshot?: number
  totalAmount: number
  totalPrice?: number
  currency: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  specialRequests?: string
  notes?: string
  serviceTitleSnapshot?: string
  cancellationPolicySnapshot?: string
  contactPhone?: string
  transactionId?: string
  cancellationReason?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateBookingPayload {
  service: string
  date: string
  guests: number
  adults?: number
  children?: number
  timeSlot?: string
  specialRequests?: string
  notes?: string
  serviceTitleSnapshot?: string
  cancellationPolicySnapshot?: string
  contactPhone?: string
  idempotencyKey?: string
}

export interface BookingListResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  totalPages?: number
  data: Booking[]
}

export interface RefundRequest {
  _id: string
  booking: string | Booking
  user: string
  vendor: string
  amount: number
  currency: string
  reason: string
  preferredMethod?: string
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'processing' | 'completed'
  adminNotes?: string
  rejectionReason?: string
  createdAt: string
}
