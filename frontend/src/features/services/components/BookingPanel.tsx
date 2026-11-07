import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Service } from '../types'
import { AvailabilityCalendar } from './AvailabilityCalendar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export interface BookingPanelProps {
  service: Service
}

export const BookingPanel: React.FC<BookingPanelProps> = ({ service }) => {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(() => {
    // Tomorrow as default
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState(
    service.timeSlots?.[0] || 'Morning (09:00 - 12:00)'
  )
  const [showCalendar, setShowCalendar] = useState(false)

  const minCapacity = service.minBookingCapacity || 1
  const maxCapacity = service.maxBookingCapacity || service.dailyCapacity || 20

  const totalGuests = adults + children

  // Calculate pricing
  const { adultTotal, childTotal, grandTotal } = useMemo(() => {
    const adultPrice = service.price || 0
    const childPrice = service.childPrice !== undefined && service.childPrice !== null ? service.childPrice : adultPrice * 0.5

    const aTot = adultPrice * adults
    const cTot = childPrice * children
    const bTot = aTot + cTot
    const fee = 0 // Platform booking fee included in base price
    return {
      adultTotal: aTot,
      childTotal: cTot,
      baseTotal: bTot,
      serviceFee: fee,
      grandTotal: bTot + fee,
    }
  }, [service.price, service.childPrice, adults, children])

  const handleProceed = () => {
    const queryParams = new URLSearchParams({
      date: selectedDate,
      adults: String(adults),
      children: String(children),
      guests: String(totalGuests),
      timeSlot: selectedSlot,
    })
    router.push(`/booking/${service._id}?${queryParams.toString()}`)
  }

  const currency = service.currency || 'ETB'

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-xl sticky top-24">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-border-light pb-4 mb-5">
        <div>
          <span className="text-xs text-text-secondary block font-medium">Starting from</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-3xl font-extrabold font-heading text-primary-800 dark:text-primary-300">
              {Number(service.price).toLocaleString()}
            </span>
            <span className="text-sm font-bold text-text-secondary">{currency}</span>
            <span className="text-xs text-text-muted">/ person</span>
          </div>
        </div>
        <Badge variant={service.availability ? 'success' : 'danger'} size="sm">
          {service.availability ? 'Available for Booking' : 'Sold Out'}
        </Badge>
      </div>

      {/* Date Picker Button */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
          Experience Date
        </label>
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-muted hover:border-primary-500 transition-colors flex items-center justify-between text-left text-sm font-medium text-text-primary"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{selectedDate || 'Select Date'}</span>
          </div>
          <span className="text-xs text-primary-700 font-semibold">
            {showCalendar ? 'Close' : 'Change'}
          </span>
        </button>

        {showCalendar && (
          <div className="mt-3">
            <AvailabilityCalendar
              serviceId={service._id}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date)
                setShowCalendar(false)
              }}
              operatingDays={service.operatingDays}
              unavailableDates={service.unavailableDates}
            />
          </div>
        )}
      </div>

      {/* Time Slot Picker (if service has slots) */}
      {service.timeSlots && service.timeSlots.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            Select Time Slot
          </label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-muted text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {service.timeSlots.map((slot, idx) => (
              <option key={idx} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Participants Counter */}
      <div className="mb-5 space-y-3 bg-surface-muted p-3.5 rounded-xl border border-border-light">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-text-primary">Adults</div>
            <div className="text-[11px] text-text-muted">Age 13+</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={adults <= 1}
              onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-secondary disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="w-5 text-center text-sm font-bold text-text-primary">{adults}</span>
            <button
              type="button"
              disabled={totalGuests >= maxCapacity}
              onClick={() => setAdults((prev) => prev + 1)}
              className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-secondary disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-light">
          <div>
            <div className="text-xs font-bold text-text-primary">Children</div>
            <div className="text-[11px] text-text-muted">Age 2–12 (50% rate)</div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={children <= 0}
              onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
              className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-secondary disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="w-5 text-center text-sm font-bold text-text-primary">{children}</span>
            <button
              type="button"
              disabled={totalGuests >= maxCapacity}
              onClick={() => setChildren((prev) => prev + 1)}
              className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-secondary disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Transparent Price Breakdown */}
      <div className="space-y-1.5 text-xs text-text-secondary border-t border-border-light pt-3 mb-5">
        <div className="flex justify-between">
          <span>{Number(service.price).toLocaleString()} {currency} × {adults} Adult(s)</span>
          <span className="font-semibold text-text-primary">{adultTotal.toLocaleString()} {currency}</span>
        </div>
        {children > 0 && (
          <div className="flex justify-between">
            <span>Child rate × {children} Child(ren)</span>
            <span className="font-semibold text-text-primary">{childTotal.toLocaleString()} {currency}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Taxes & Eco Contribution</span>
          <span className="font-semibold text-emerald-600">Included</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border-light">
          <span>Total Amount</span>
          <span className="text-primary-800 dark:text-primary-300 font-heading text-lg">
            {grandTotal.toLocaleString()} {currency}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={!service.availability || totalGuests < minCapacity || totalGuests > maxCapacity}
        onClick={handleProceed}
        className="font-bold py-3.5 shadow-lg shadow-primary-700/20"
      >
        Continue to Reservation
      </Button>

      {/* Trust & Guarantee Notes */}
      <div className="mt-4 pt-3 border-t border-border-light text-center space-y-1 text-[11px] text-text-muted">
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium text-text-secondary">Secured by Chapa Payment Gateway</span>
        </div>
        <p>Free cancellation up to 48 hours prior to experience.</p>
      </div>
    </div>
  )
}
