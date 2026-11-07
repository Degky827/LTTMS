import React from 'react'
import Link from 'next/link'
import { Booking } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export interface BookingCardProps {
  booking: Booking
  onCancelClick?: (booking: Booking) => void
  onRefundClick?: (booking: Booking) => void
  onReviewClick?: (booking: Booking) => void
}

const STATUS_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  completed: 'primary',
  cancelled: 'danger',
  rejected: 'danger',
  expired: 'default',
}

const PAYMENT_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  paid: 'success',
  pending: 'warning',
  unpaid: 'danger',
  refunded: 'default',
  failed: 'danger',
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancelClick,
  onRefundClick,
  onReviewClick,
}) => {
  const service = booking.service || {}
  const vendor = booking.vendor || {}
  const currency = booking.currency || 'ETB'
  const amount = booking.totalAmount || booking.totalPrice || 0
  const dateStr = booking.date ? new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'Scheduled Date'

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canRefund = booking.paymentStatus === 'paid' && (booking.status === 'cancelled' || booking.status === 'rejected')
  const canPay = booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && booking.status !== 'rejected'
  const canReview = booking.status === 'completed'

  return (
    <Card bordered className="bg-surface hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-light bg-surface-muted/50">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-bold text-primary-900 dark:text-gray-200 bg-surface px-2.5 py-1 rounded-md border border-border">
            {booking.bookingReference}
          </span>
          <Badge variant={STATUS_VARIANTS[booking.status] || 'default'} size="sm" className="capitalize font-semibold">
            {booking.status}
          </Badge>
          <Badge variant={PAYMENT_VARIANTS[booking.paymentStatus] || 'default'} size="sm" className="capitalize">
            Payment: {booking.paymentStatus}
          </Badge>
        </div>

        <div className="text-right">
          <span className="text-xs text-text-muted block">Total Price</span>
          <span className="text-base font-extrabold text-primary-800 dark:text-primary-300 font-heading">
            {Number(amount).toLocaleString()} {currency}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-border-light shrink-0">
            <img
              src={service.coverImage || '/images/hotel.jpg'}
              alt={service.title || 'Tour'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hotel.jpg'
              }}
            />
          </div>

          <div>
            <h4 className="text-base font-bold font-heading text-text-primary line-clamp-1">
              {service.title || 'Lake Tana Excursion'}
            </h4>
            <p className="text-xs text-text-secondary mt-0.5">
              Provided by <span className="font-medium text-text-primary">{vendor.businessName || 'Local Vendor'}</span>
            </p>

            <div className="flex items-center gap-4 text-xs text-text-muted mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-text-secondary">
                <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateStr}
              </span>
              {booking.timeSlot && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {booking.timeSlot}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {booking.guests} Guest(s)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 w-full sm:w-auto">
          {canPay && (
            <Link href={`/checkout/${booking._id}`} className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="font-semibold shadow-sm w-full">
                Pay Now
              </Button>
            </Link>
          )}

          {canReview && onReviewClick && (
            <Button variant="secondary" size="sm" onClick={() => onReviewClick(booking)}>
              Write Review
            </Button>
          )}

          <Link href={`/tourist/bookings/${booking._id}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              Details
            </Button>
          </Link>

          {canCancel && onCancelClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelClick(booking)}
              className="text-danger hover:text-danger-700 hover:bg-danger-50 text-xs"
            >
              Cancel
            </Button>
          )}

          {canRefund && onRefundClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefundClick(booking)}
              className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              Request Refund
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
