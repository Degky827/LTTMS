export interface SupportMessage {
  _id?: string
  sender: any
  senderRole?: string
  message: string
  attachments?: Array<{ url: string; filename: string }>
  visibility?: 'public' | 'internal'
  createdAt: string
}

export interface SupportTicket {
  _id: string
  ticketNumber: string
  user: any
  userRole?: string
  subject: string
  description: string
  category: 'booking' | 'payment' | 'refund' | 'vendor' | 'service_quality' | 'account' | 'technical' | 'safety' | 'eco_guideline' | 'general'
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'assigned' | 'in_progress' | 'waiting_for_user' | 'waiting_on_user' | 'waiting_for_vendor' | 'resolved' | 'closed' | 'reopened'
  assignedTo?: any
  relatedBooking?: any
  relatedPayment?: any
  relatedVendor?: any
  messages: SupportMessage[]
  resolution?: {
    resolvedAt?: string
    notes?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateTicketDTO {
  subject: string
  description: string
  category?: string
  priority?: string
  relatedBooking?: string
}

export interface SupportTicketListResponse {
  success: boolean
  count?: number
  total?: number
  totalPages?: number
  data: SupportTicket[]
}
