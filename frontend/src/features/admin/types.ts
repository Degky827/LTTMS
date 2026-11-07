export interface AdminApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  count?: number
  total?: number
  pagination?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface AdminOverviewStats {
  touristCount: number
  totalVendors: number
  approvedVendors: number
  pendingVendors: number
  suspendedVendors: number
  activeServices: number
  totalServices: number
  totalBookings: number
  bookingStatusBreakdown: Record<string, number>
  totalGrossVolume: number
  totalCommissions: number
  totalVendorEarnings: number
  pendingSettlementsAmount: number
  pendingSettlementsCount: number
  pendingRefundsCount: number
  openTicketsCount: number
  totalTicketsCount: number
  totalReviewsCount: number
  flaggedReviewsCount: number
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'tourist' | 'vendor' | 'support' | 'admin' | 'super_admin'
  phone?: string
  avatar?: string
  isActive: boolean
  isSuspended?: boolean
  suspendedReason?: string
  suspendedAt?: string
  lockUntil?: string
  isVerified?: boolean
  createdAt: string
  updatedAt?: string
  vendorProfile?: any
}

export interface AdminUserStatusPayload {
  isActive?: boolean
  isSuspended?: boolean
  suspendedReason?: string
  lock?: boolean
}

export interface AdminAssignRolePayload {
  role: 'tourist' | 'vendor' | 'support' | 'admin' | 'super_admin'
}

export interface AdminVendor {
  _id: string
  businessName: string
  businessType?: string
  description?: string
  location?: any
  contactEmail?: string
  contactPhone?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'blacklisted'
  verificationStatus?: 'pending' | 'under_review' | 'approved' | 'rejected'
  rejectionReason?: string
  approvedAt?: string
  ecoCertification?: boolean
  documents?: Array<{
    type: string
    name: string
    url: string
    verified?: boolean
    uploadedAt: string
  }>
  user: {
    _id: string
    name: string
    email: string
    phone?: string
    createdAt?: string
  }
  rating?: number
  totalBookings?: number
  totalRevenue?: number
  createdAt: string
}

export interface AdminVendorStatusPayload {
  status: 'approved' | 'rejected' | 'pending' | 'suspended' | 'blacklisted'
  reason?: string
}

export interface AdminService {
  _id: string
  title: string
  slug?: string
  description: string
  category: {
    _id: string
    name: string
    slug?: string
  }
  destination: {
    _id: string
    name: string
    region?: string
  }
  vendor: {
    _id: string
    businessName: string
    contactEmail?: string
  }
  price: number
  currency: string
  duration?: string
  maxCapacity?: number
  images?: Array<{ url: string; caption?: string; isPrimary?: boolean }>
  featured?: boolean
  isActive: boolean
  status?: 'draft' | 'pending' | 'active' | 'archived'
  rejectionReason?: string
  rating?: number
  reviewsCount?: number
  createdAt: string
}

export interface AdminBooking {
  _id: string
  bookingReference: string
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  vendor: {
    _id: string
    businessName: string
    contactEmail?: string
  }
  service: {
    _id: string
    title: string
    price: number
    currency: string
  }
  destination?: {
    _id: string
    name: string
  }
  date: string
  timeSlot?: string
  participants: {
    adults: number
    children?: number
  }
  totalAmount: number
  currency?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed'
  transactionId?: string
  specialRequests?: string
  statusHistory?: Array<{
    status: string
    changedBy?: { name: string; role: string }
    reason?: string
    timestamp: string
  }>
  createdAt: string
}

export interface AdminPayment {
  _id: string
  txRef: string
  booking?: {
    _id: string
    bookingReference: string
    totalAmount: number
  }
  user?: {
    _id: string
    name: string
    email: string
  }
  vendor?: {
    _id: string
    businessName: string
  }
  amount: number
  currency: string
  status: 'pending' | 'successful' | 'failed' | 'refunded'
  paymentMethod?: string
  provider?: string
  createdAt: string
  verifiedAt?: string
}

export interface AdminCommissionRule {
  _id: string
  name: string
  rate: number
  category?: { _id: string; name: string } | string
  vendor?: { _id: string; businessName: string } | string
  isDefault?: boolean
  minAmount?: number
  maxAmount?: number
  isActive: boolean
  createdAt: string
}

export interface AdminCommissionTransaction {
  _id: string
  booking: {
    _id: string
    bookingReference: string
  }
  vendor: {
    _id: string
    businessName: string
  }
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  vendorEarning: number
  status: 'pending' | 'earned' | 'settled' | 'refunded'
  createdAt: string
}

export interface AdminSettlement {
  _id: string
  vendor: {
    _id: string
    businessName: string
    contactEmail?: string
  }
  amount: number
  status: 'requested' | 'approved' | 'processing' | 'completed' | 'rejected'
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: {
    _id: string
    name: string
  }
  rejectionReason?: string
  bankReference?: string
  completedAt?: string
  destinationBank?: string
  accountNumber?: string
  accountHolderName?: string
}

export interface AdminRefundRequest {
  _id: string
  booking: {
    _id: string
    bookingReference: string
    totalAmount: number
    service?: { title: string }
  }
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  vendor: {
    _id: string
    businessName: string
    contact?: string
    phone?: string
  }
  amount: number
  reason: string
  status: 'submitted' | 'requested' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'processed'
  adminNote?: string
  rejectionReason?: string
  reviewedBy?: { name: string; email: string }
  payment?: {
    txRef?: string
    status?: string
    paymentMethod?: string
    amount?: number
  }
  createdAt: string
  updatedAt?: string
}

export interface AdminReview {
  _id: string
  user: {
    _id: string
    name: string
    email?: string
  }
  service: {
    _id: string
    title: string
  }
  vendor?: {
    _id: string
    businessName: string
  }
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected' | 'hidden' | 'flagged'
  flagged?: boolean
  moderationReason?: string
  reports?: Array<{
    reporter: { _id: string; name: string }
    reason: string
    createdAt: string
  }>
  createdAt: string
}

export interface AdminSupportTicket {
  _id: string
  ticketNumber: string
  subject: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_for_user' | 'waiting_for_vendor' | 'resolved' | 'closed' | 'reopened'
  user: {
    _id: string
    name: string
    email: string
    role: string
    phone?: string
  }
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  relatedBooking?: any
  relatedPayment?: any
  messages: Array<{
    _id?: string
    sender: {
      _id: string
      name: string
      role: string
    }
    senderRole?: string
    message: string
    visibility?: 'public' | 'internal'
    createdAt: string
  }>
  createdAt: string
  updatedAt?: string
}

export interface AdminEcoBadgeApplication {
  _id: string
  vendor: {
    _id: string
    businessName: string
    contactEmail?: string
  }
  badge: {
    _id: string
    name: string
    tier: string
    description?: string
  }
  sustainabilityPractices: string[]
  evidenceFiles: string[]
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  rejectionReason?: string
  reviewNotes?: string
  reviewedBy?: { name: string }
  createdAt: string
}

export interface AuditLogEntry {
  _id: string
  action: string
  actor?: {
    _id: string
    name: string
    email: string
    role: string
  }
  targetEntity?: string
  targetId?: string
  details?: Record<string, any>
  ipAddress?: string
  timestamp: string
}
