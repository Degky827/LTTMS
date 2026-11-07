import React, { useState } from 'react'
import { Booking } from '../types'
import { bookingService } from '../services/bookingService'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/feedback/ToastProvider'

export interface CancelBookingModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  if (!booking) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation')
      return
    }

    try {
      setLoading(true)
      setError('')
      await bookingService.cancel(booking._id, reason.trim())
      addToast({
        type: 'success',
        title: 'Booking Cancelled',
        message: `Reservation ${booking.bookingReference} has been cancelled successfully.`,
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Reservation">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-300">
          <p className="font-semibold mb-1">Cancellation Notice</p>
          <p>
            You are requesting to cancel reservation <strong>{booking.bookingReference}</strong> for{' '}
            <strong>{booking.service?.title}</strong>. If payment was already completed, an eligible refund request can be filed upon cancellation.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Reason for Cancellation <span className="text-danger">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you need to cancel this experience..."
            rows={3}
            disabled={loading}
            className="text-sm"
          />
          {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border-light">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Keep Reservation
          </Button>
          <Button variant="danger" type="submit" isLoading={loading} disabled={loading || !reason.trim()}>
            Confirm Cancellation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
