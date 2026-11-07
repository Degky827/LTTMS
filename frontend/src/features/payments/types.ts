export interface Payment {
  _id: string
  booking: string | any
  user: string | any
  vendor: string | any
  service?: string | any
  txRef: string
  transactionReference?: string
  receiptNumber?: string
  amount: number
  currency: string
  status: 'pending' | 'successful' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod?: string
  checkoutUrl?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

export interface PaymentReceipt {
  receiptNumber: string
  transactionReference: string
  bookingReference: string
  paymentDate: string
  amount: number
  currency: string
  paymentMethod?: string
  paymentStatus: string
  payer: {
    name: string
    email: string
    phone?: string
  }
  service: {
    title: string
    category?: string
  }
  vendor: {
    businessName: string
    contactEmail?: string
  }
  bookingDetails?: {
    date: string
    timeSlot?: string
    guests: number
  }
}

export interface InitializePaymentResponse {
  success: boolean
  message?: string
  data: {
    checkoutUrl: string
    txRef: string
    paymentId: string
    amount: number
    currency: string
  }
}

export interface VerifyPaymentResponse {
  success: boolean
  message?: string
  data: {
    verified: boolean
    alreadyVerified?: boolean
    paymentStatus?: string
    receiptNumber?: string
    status?: 'successful' | 'failed' | 'pending' | 'cancelled'
    txRef?: string
    amount?: number
    currency?: string
    booking?: {
      id?: string
      reference?: string
      status?: string
      paymentStatus?: string
      [key: string]: any
    }
  }
}
