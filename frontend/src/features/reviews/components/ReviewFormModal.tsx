import React, { useState } from 'react'
import { reviewService } from '../services/reviewService'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/feedback/ToastProvider'

export interface ReviewFormModalProps {
  serviceId: string
  serviceTitle: string
  bookingId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  serviceId,
  serviceTitle,
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) {
      setError('Please provide written feedback for this experience.')
      return
    }

    try {
      setLoading(true)
      setError('')
      await reviewService.submit({
        service: serviceId,
        rating,
        comment: comment.trim(),
        booking: bookingId,
      })
      addToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for sharing your feedback with the Lake Tana travel community.',
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Experience">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="text-xs text-text-muted block">Experience</span>
          <h4 className="text-sm font-bold text-text-primary">{serviceTitle}</h4>
        </div>

        {/* Rating Stars Selection */}
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Your Rating
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <svg
                  className={`w-7 h-7 ${
                    star <= rating ? 'text-gold-400 fill-current' : 'text-gray-300 dark:text-gray-700'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="text-sm font-bold text-text-secondary ml-2">{rating} of 5 Stars</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">
            Written Feedback <span className="text-danger">*</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your tour, the guide, boat journey, scenery, or hospitality..."
            rows={4}
            disabled={loading}
            className="text-sm"
          />
          {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border-light">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading} disabled={loading || !comment.trim()}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  )
}
