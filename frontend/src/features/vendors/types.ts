export type BusinessType =
  | 'boat_operator'
  | 'hotel'
  | 'lodge'
  | 'eco_lodge'
  | 'restaurant'
  | 'guide'
  | 'tour_operator'
  | 'handicraft'
  | 'other'

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'blacklisted' | 'inactive'

export type VerificationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'

export type EcoBadgeTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'

export interface VendorDocument {
  _id: string
  vendor: string
  documentType: 'business_license' | 'tax_id' | 'boat_permit' | 'tour_guide_cert' | 'insurance' | 'id_card' | 'other'
  fileUrl: string
  originalFilename: string
  mimeType: string
  fileSize: number
  status: 'pending' | 'verified' | 'rejected'
  rejectionReason?: string
  verifiedAt?: string
  createdAt: string
}

export interface VerificationHistoryItem {
  _id: string
  action: string
  previousStatus?: string
  newStatus: string
  actor?: {
    _id: string
    name: string
    role: string
  }
  notes?: string
  createdAt: string
}

export interface VendorPayoutDetails {
  method?: 'bank_transfer' | 'cbe_birr' | 'telebirr'
  bankName?: string
  accountNumber?: string
  accountName?: string
  phone?: string
}

export interface Vendor {
  _id: string
  user: string | { _id: string; name: string; email: string; phone?: string }
  businessName: string
  slug: string
  businessType: BusinessType
  businessDescription?: string
  description?: string
  shortDescription?: string
  registrationNumber?: string
  licenseNumber?: string
  taxId?: string
  logo?: string
  coverImage?: string
  gallery?: string[]
  establishedDate?: string
  businessEmail?: string
  contactEmail?: string
  phone: string
  altPhone?: string
  contactPhone?: string
  website?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  location?: any
  address?: string
  city?: string
  region?: string
  zone?: string
  woreda?: string
  coordinates?: {
    latitude?: number
    longitude?: number
  }
  operatingHours?: string
  languages?: string[]
  servicesOffered?: string[]
  destinations?: Array<{
    _id: string
    name: string
    slug: string
  }>
  services?: any[]
  ecoTourismInfo?: {
    practices?: string[]
    certifications?: string[]
    communityInitiatives?: string
  }
  ecoCertification?: boolean
  ecoBadgeTier?: EcoBadgeTier
  ecoBadges?: any[]
  verificationStatus: VerificationStatus
  status: VendorStatus
  licenseFile?: string
  adminNotes?: string
  rejectionReason?: string
  approvedAt?: string
  payoutDetails?: VendorPayoutDetails
  rating?: number
  reviewCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface VendorVerificationStatusResponse {
  success: boolean
  data: {
    status: VendorStatus
    verificationStatus: VerificationStatus
    rejectionReason?: string
    approvedAt?: string
    documents: VendorDocument[]
    history: VerificationHistoryItem[]
  }
}

export interface VendorListResponse {
  success: boolean
  count: number
  total?: number
  page?: number
  totalPages?: number
  data: Vendor[]
}

// Vendor Booking Statistics
export interface VendorBookingStats {
  totalBookings: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  rejected: number
  expired: number
  estimatedRevenue: number
  totalGuestsServed: number
}

// Vendor Booking Details
export interface VendorBooking {
  _id: string
  bookingReference: string
  service: {
    _id: string
    title: string
    price: number
    currency: string
    images?: Array<{ url: string; isPrimary?: boolean }>
    duration?: number
    meetingPoint?: string
  }
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  vendor: string
  destination?: {
    _id: string
    name: string
    slug: string
  }
  date: string
  timeSlot?: string
  guests: number
  adultGuests?: number
  childGuests?: number
  totalAmount: number
  currency: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'expired'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  specialRequests?: string
  contactPhone?: string
  contactEmail?: string
  statusHistory?: Array<{
    status: string
    timestamp: string
    changedBy?: string
    reason?: string
  }>
  createdAt: string
  updatedAt: string
}

export interface VendorBookingsResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  data: VendorBooking[]
}

// Financial Ledger & Settlement
export interface VendorLedgerEntry {
  _id: string
  vendor: string
  entryType: 'credit' | 'debit' | 'settlement' | 'adjustment'
  amount: number
  balanceAfter: number
  description: string
  booking?: {
    _id: string
    bookingReference: string
    totalAmount: number
    date: string
  }
  settlement?: {
    _id: string
    settlementReference: string
    status: string
    payoutMethod: string
  }
  createdAt: string
}

export interface VendorFinanceOverview {
  vendor: {
    id: string
    businessName: string
    payoutDetails?: VendorPayoutDetails
  }
  availableBalance: number
  pendingBalance: number
  totalGrossEarnings: number
  totalCommissionPaid: number
  totalSettled: number
  pendingSettlementsAmount: number
}

export interface VendorCommission {
  _id: string
  vendor: string
  booking?: {
    _id: string
    bookingReference: string
    totalAmount: number
    date: string
  }
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  vendorNetAmount: number
  status: 'pending' | 'processed' | 'refunded'
  createdAt: string
}

export interface VendorSettlement {
  _id: string
  vendor: string
  settlementReference: string
  amount: number
  payoutMethod: 'bank_transfer' | 'cbe_birr' | 'telebirr'
  payoutDetails: VendorPayoutDetails
  status: 'pending' | 'approved' | 'processed' | 'rejected'
  notes?: string
  processedAt?: string
  rejectedReason?: string
  createdAt: string
}

export interface RequestSettlementPayload {
  amount: number
  payoutMethod?: 'bank_transfer' | 'cbe_birr' | 'telebirr'
  payoutDetails?: VendorPayoutDetails
  notes?: string
}

// Eco Badge & Applications
export interface EcoBadgeCriteria {
  category: string
  description: string
  required: boolean
}

export interface EcoBadge {
  _id: string
  name: string
  tier: EcoBadgeTier
  description: string
  icon?: string
  criteria?: EcoBadgeCriteria[]
  isActive: boolean
}

export interface EcoBadgeApplication {
  _id: string
  vendor: string
  badge: EcoBadge
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  sustainabilityPractices: string[]
  evidenceDocuments: string[]
  adminFeedback?: string
  submittedAt: string
  reviewedAt?: string
}

// Support Tickets
export interface TicketMessage {
  _id: string
  sender: {
    _id: string
    name: string
    role: string
  }
  message: string
  attachments?: string[]
  createdAt: string
}

export interface SupportTicket {
  _id: string
  ticketNumber: string
  user: string
  subject: string
  category: 'booking' | 'payment' | 'verification' | 'technical' | 'service' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'
  description: string
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}
