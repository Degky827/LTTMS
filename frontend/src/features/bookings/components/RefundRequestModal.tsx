import React, { useState } from 'react'
import { Booking } from '../types'
import { bookingService } from '../services/bookingService'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/feedback/ToastProvider'

export interface RefundRequestModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [preferredMethod, setPreferredMethod] = useState('original_payment')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  if (!booking) return null

  const currency = booking.currency || 'ETB'
  const amount = booking.totalAmount || booking.totalPrice || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a detailed reason for the refund request')
      return
    }

    try {
      setLoading(true)
      setError('')
      await bookingService.submitRefundRequest(booking._id, {
        reason: reason.trim(),
        preferredMethod,
      })
      addToast({
        type: 'success',
        title: 'Refund Request Submitted',
        message: 'Your refund request has been submitted for review.',
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit refund request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Booking Refund">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-muted rounded-xl p-3.5 border border-border-light text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-text-muted">Booking Reference:</span>
            <span className="font-mono font-bold text-text-primary">{booking.bookingReference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Refundable Amount:</span>
            <span className="font-bold text-primary-800 dark:text-primary-300">
              {Number(amount).toLocaleString()} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Service:</span>
            <span className="font-medium text-text-primary">{booking.service?.title}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Preferred Refund Method
          </label>
          <Select
            value={preferredMethod}
            onChange={(e) => setPreferredMethod(e.target.value)}
            options={[
              { value: 'original_payment', label: 'Original Payment Method (Chapa)' },
              { value: 'telebirr', label: 'Telebirr Mobile Wallet' },
              { value: 'cbe', label: 'Commercial Bank of Ethiopia (CBE)' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Reason for Refund <span className="text-danger">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please detail why you are requesting a refund..."
            rows={3}
            disabled={loading}
            className="text-sm"
          />
          {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border-light">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading} disabled={loading || !reason.trim()}>
            Submit Refund Request
          </Button>
        </div>
      </form>
    </Modal>
  )
}
