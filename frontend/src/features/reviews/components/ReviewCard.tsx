import React from 'react'
import { Review } from '../types'
import { Avatar } from '@/components/ui/Avatar'

export interface ReviewCardProps {
  review: Review
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const userName = review.user?.name || 'Verified Explorer'
  const dateFormatted = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  const serviceTitle = typeof review.service === 'object' ? review.service?.title : null

  return (
    <div className="bg-surface rounded-xl border border-border-light p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={userName} src={review.user?.avatar} size="sm" />
          <div>
            <h5 className="text-sm font-bold text-text-primary leading-tight">{userName}</h5>
            {serviceTitle && (
              <span className="text-[11px] text-text-muted block">{serviceTitle}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating ? 'text-gold-400 fill-current' : 'text-gray-300 dark:text-gray-700'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs font-bold text-text-secondary ml-1">{review.rating}.0</span>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">{review.comment}</p>

      {review.vendorResponse?.response && (
        <div className="bg-surface-muted border-l-2 border-primary-600 rounded-r-lg p-3 text-xs mt-2">
          <span className="font-semibold text-primary-900 dark:text-primary-300 block mb-0.5">
            Vendor Response:
          </span>
          <p className="text-text-secondary">{review.vendorResponse.response}</p>
        </div>
      )}

      {dateFormatted && (
        <div className="text-[10px] text-text-muted text-right">{dateFormatted}</div>
      )}
    </div>
  )
}
