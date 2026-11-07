import React from 'react'
import { PaymentReceipt } from '../types'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export interface ReceiptViewProps {
  receipt: PaymentReceipt
  onPrint?: () => void
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt, onPrint }) => {
  const handlePrint = () => {
    if (onPrint) onPrint()
    else window.print()
  }

  const currency = receipt.currency || 'ETB'
  const dateFormatted = receipt.paymentDate
    ? new Date(receipt.paymentDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString()

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-xl p-8 max-w-2xl mx-auto print:shadow-none print:border-none print:p-0">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <Logo />
          <p className="text-xs text-text-muted mt-2">
            Lake Tana Eco-Tourism & Booking Marketplace
          </p>
          <p className="text-[11px] text-text-muted">
            UNESCO Biosphere Reserve • Bahir Dar, Ethiopia
          </p>
        </div>

        <div className="text-right">
          <Badge variant="success" size="md" className="font-bold tracking-wider uppercase mb-1">
            Paid & Verified
          </Badge>
          <div className="text-xs text-text-muted font-mono">{receipt.receiptNumber}</div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-6 py-6 border-b border-border-light text-xs">
        <div>
          <span className="text-text-muted block font-medium uppercase tracking-wider text-[10px]">
            Billed To
          </span>
          <span className="font-bold text-sm text-text-primary block mt-1">
            {receipt.payer?.name || 'Tourist Guest'}
          </span>
          <span className="text-text-secondary block">{receipt.payer?.email}</span>
          {receipt.payer?.phone && (
            <span className="text-text-secondary block">{receipt.payer?.phone}</span>
          )}
        </div>

        <div className="text-right">
          <span className="text-text-muted block font-medium uppercase tracking-wider text-[10px]">
            Payment Details
          </span>
          <div className="mt-1 space-y-0.5">
            <p>
              <span className="text-text-muted">Date:</span>{' '}
              <span className="font-medium text-text-primary">{dateFormatted}</span>
            </p>
            <p>
              <span className="text-text-muted">Tx Reference:</span>{' '}
              <span className="font-mono font-bold text-primary-800 dark:text-primary-300">
                {receipt.transactionReference}
              </span>
            </p>
            <p>
              <span className="text-text-muted">Booking Reference:</span>{' '}
              <span className="font-mono font-bold text-text-primary">{receipt.bookingReference}</span>
            </p>
            <p>
              <span className="text-text-muted">Payment Gateway:</span>{' '}
              <span className="font-medium text-text-primary">Chapa ETB</span>
            </p>
          </div>
        </div>
      </div>

      {/* Service Details Table */}
      <div className="py-6 border-b border-border-light">
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
          Experience Breakdown
        </h4>
        <div className="bg-surface-muted rounded-xl p-4 border border-border-light space-y-2 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-sm text-text-primary block">
                {receipt.service?.title || 'Tour Service'}
              </span>
              <span className="text-text-muted">
                Provided by: {receipt.vendor?.businessName || 'Local Vendor'}
              </span>
              {receipt.bookingDetails?.date && (
                <span className="text-text-muted block mt-0.5">
                  Scheduled for: {new Date(receipt.bookingDetails.date).toLocaleDateString()}
                  {receipt.bookingDetails.timeSlot ? ` (${receipt.bookingDetails.timeSlot})` : ''}
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="font-bold text-sm text-text-primary">
                {Number(receipt.amount).toLocaleString()} {currency}
              </span>
              {receipt.bookingDetails?.guests && (
                <span className="text-text-muted block text-[11px]">
                  {receipt.bookingDetails.guests} Guest(s)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Total Box */}
      <div className="py-4 flex justify-between items-center text-sm font-bold border-b border-border">
        <span className="text-text-primary">Total Paid Amount:</span>
        <span className="text-2xl font-extrabold font-heading text-primary-800 dark:text-primary-300">
          {Number(receipt.amount).toLocaleString()} {currency}
        </span>
      </div>

      {/* Footer & Actions */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-text-muted text-center sm:text-left">
          Thank you for exploring Lake Tana and supporting local eco-tourism and preservation.
        </p>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 font-bold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Official Receipt
          </Button>
        </div>
      </div>
    </div>
  )
}
