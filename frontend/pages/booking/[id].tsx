import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { marketplaceService } from '@/features/services/services/marketplaceService'
import { Service } from '@/features/services/types'
import { bookingService } from '@/features/bookings/services/bookingService'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/feedback/ToastProvider'

export default function BookingWorkflowPage() {
  const router = useRouter()
  const { id, date: queryDate, adults: queryAdults, children: queryChildren, timeSlot: querySlot } = router.query
  const { user, isAuthenticated } = useAuth()
  const { addToast } = useToast()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Booking Form State
  const [bookingDate, setBookingDate] = useState<string>('')
  const [adults, setAdults] = useState<number>(1)
  const [children, setChildren] = useState<number>(0)
  const [timeSlot, setTimeSlot] = useState<string>('morning')
  const [specialRequests, setSpecialRequests] = useState<string>('')
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)

  // Traveler contact state
  const [contactName, setContactName] = useState<string>('')
  const [contactEmail, setContactEmail] = useState<string>('')
  const [contactPhone, setContactPhone] = useState<string>('')

  // Initialize service & form state
  useEffect(() => {
    if (!id || Array.isArray(id)) return

    const loadService = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await marketplaceService.getByIdOrSlug(id)
        if (res.data) {
          setService(res.data)
        } else {
          setError('Service not found')
        }
      } catch (err: any) {
        console.error('Failed to load service for booking:', err)
        setError(err?.response?.data?.message || 'Failed to load experience details')
      } finally {
        setLoading(false)
      }
    }

    loadService()
  }, [id])

  // Sync user info into form
  useEffect(() => {
    if (user) {
      setContactName(user.name || '')
      setContactEmail(user.email || '')
      if (user.phone) setContactPhone(user.phone)
    }
  }, [user])

  // Sync query parameters into state
  useEffect(() => {
    if (queryDate && typeof queryDate === 'string') {
      setBookingDate(queryDate)
    } else if (!bookingDate) {
      // Default to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setBookingDate(tomorrow.toISOString().split('T')[0])
    }

    if (queryAdults) {
      const parsedAdults = parseInt(String(queryAdults), 10)
      if (!isNaN(parsedAdults) && parsedAdults > 0) setAdults(parsedAdults)
    }

    if (queryChildren) {
      const parsedChildren = parseInt(String(queryChildren), 10)
      if (!isNaN(parsedChildren) && parsedChildren >= 0) setChildren(parsedChildren)
    }

    if (querySlot && typeof querySlot === 'string') {
      setTimeSlot(querySlot)
    }
  }, [queryDate, queryAdults, queryChildren, querySlot, bookingDate])

  // Price calculations
  const totalGuests = adults + children
  const adultPrice = service?.price || 0
  const childPrice = service?.childPrice !== undefined && service?.childPrice !== null ? service.childPrice : adultPrice * 0.5
  const adultTotal = adultPrice * adults
  const childTotal = childPrice * children
  const grandTotal = adultTotal + childTotal
  const currency = service?.currency || 'ETB'

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      addToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in or create an account to finalize your booking.',
      })
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)
      return
    }

    if (!service) {
      setError('Service is not loaded yet')
      return
    }

    if (!bookingDate) {
      setError('Please select a date for your tour')
      return
    }

    if (!agreedToTerms) {
      setError('Please accept the booking terms and cancellation policy')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        service: service._id,
        date: bookingDate,
        adults,
        children,
        guests: totalGuests,
        timeSlot,
        notes: specialRequests.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      }

      const res = await bookingService.create(payload)

      if (res.data) {
        const bookingId = res.data._id || (res.data as any).id
        addToast({
          type: 'success',
          title: 'Reservation Held',
          message: 'Your booking has been initiated. Proceeding to secure payment checkout.',
        })
        router.push(`/checkout/${bookingId}`)
      } else {
        throw new Error(res.message || 'Booking reservation could not be initialized')
      }
    } catch (err: any) {
      console.error('Booking submission failed:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to submit booking reservation')
      addToast({
        type: 'error',
        title: 'Booking Error',
        message: err?.response?.data?.message || 'Could not complete reservation hold.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <PublicLayout>
      <Head>
        <title>{service ? `Book ${service.title} | Lake Tana Tourism` : 'Book Tour | LTTMS'}</title>
      </Head>

      <div className="bg-surface-muted/30 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div>
              <nav className="flex items-center space-x-2 text-xs text-text-muted mb-1">
                <Link href="/" className="hover:text-primary-600">Home</Link>
                <span>/</span>
                <Link href="/services" className="hover:text-primary-600">Marketplace</Link>
                <span>/</span>
                <span className="text-text-primary font-medium">Reservation</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">
                Complete Your Reservation
              </h1>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white">
                1
              </span>
              <span className="text-primary-700 font-bold">Details</span>
              <span className="text-gray-300">───</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-muted text-text-muted border border-surface-border">
                2
              </span>
              <span className="text-text-muted">Payment</span>
              <span className="text-gray-300">───</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-muted text-text-muted border border-surface-border">
                3
              </span>
              <span className="text-text-muted">Confirmed</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
              <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-surface-border"></div>
              <div className="h-96 bg-white rounded-2xl border border-surface-border"></div>
            </div>
          ) : error && !service ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                !
              </div>
              <h2 className="text-xl font-bold text-text-primary">{error}</h2>
              <Link href="/services">
                <Button variant="primary">Browse Available Tours</Button>
              </Link>
            </div>
          ) : service && (
            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                    <span className="font-bold">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Section 1: Date & Time Selection */}
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                  <h2 className="text-lg font-bold text-text-primary font-heading border-b border-surface-border pb-3 flex items-center gap-2">
                    <span>1. Tour Date & Time Slot</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Select Date *
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Time Slot / Departure *
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="morning">Morning Departure (08:30 AM)</option>
                        <option value="afternoon">Afternoon Excursion (01:30 PM)</option>
                        <option value="sunset">Sunset Pelican Tour (04:30 PM)</option>
                        <option value="full_day">Full Day Expedition (08:00 AM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Participants */}
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                  <h2 className="text-lg font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    2. Guests & Travelers
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Adults */}
                    <div className="p-4 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">Adults</span>
                        <span className="text-xs text-text-muted">
                          {Number(adultPrice).toLocaleString()} {currency} each
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-surface-border flex items-center justify-center font-bold text-text-primary hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(adults + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-surface-border flex items-center justify-center font-bold text-text-primary hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="p-4 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-text-primary block">Children (Under 12)</span>
                        <span className="text-xs text-text-muted">
                          {Number(childPrice).toLocaleString()} {currency} each (50% off)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-surface-border flex items-center justify-center font-bold text-text-primary hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(children + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-surface-border flex items-center justify-center font-bold text-text-primary hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact & Special Requests */}
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                  <h2 className="text-lg font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    3. Traveler Contact & Special Requests
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Primary Contact Name *
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                        placeholder="e.g. Abebe Kebede"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                        placeholder="+251 91 234 5678"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Email Address (for Chapa e-receipt) *
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      placeholder="abebe@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Special Requests & Accessibility Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g., child life jacket sizes, English / French speaking guide, vegetarian meal requests..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Section 4: Policies and Agreement */}
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="termsCheckbox" className="text-xs text-text-secondary leading-relaxed">
                      I understand that boat departure times depend on Lake Tana naval weather safety conditions. I agree to the{' '}
                      <strong>{service.cancellationPolicy || '24-hour free cancellation policy'}</strong> and standard biosphere protection guidelines.
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Action */}
              <div className="lg:col-span-1 space-y-6">
                <Card bordered className="bg-white shadow-md sticky top-24">
                  <CardContent className="p-6 space-y-5">
                    {/* Tour Mini Card */}
                    <div className="flex items-center gap-3 border-b border-surface-border pb-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-muted shrink-0">
                        <img
                          src={service.coverImage || service.images?.[0]?.url || '/images/LakeTana.jpg'}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Badge variant="primary" size="sm" className="capitalize text-[10px] mb-1">
                          {service.category}
                        </Badge>
                        <h3 className="text-sm font-bold text-text-primary truncate">
                          {service.title}
                        </h3>
                        <span className="text-xs text-text-muted block">
                          📍 {service.location || 'Lake Tana'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Breakdown */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-text-secondary">
                        <span>Date:</span>
                        <span className="font-semibold text-text-primary">{bookingDate || 'Select date'}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Time Slot:</span>
                        <span className="font-semibold text-text-primary capitalize">{timeSlot.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Adults ({adults} × {Number(adultPrice).toLocaleString()} {currency}):</span>
                        <span className="font-semibold text-text-primary">
                          {Number(adultTotal).toLocaleString()} {currency}
                        </span>
                      </div>
                      {children > 0 && (
                        <div className="flex justify-between text-text-secondary">
                          <span>Children ({children} × {Number(childPrice).toLocaleString()} {currency}):</span>
                          <span className="font-semibold text-text-primary">
                            {Number(childTotal).toLocaleString()} {currency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-text-secondary">
                        <span>Service & Biosphere Fee:</span>
                        <span className="font-semibold text-emerald-600">Included</span>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="pt-3 border-t border-surface-border flex items-baseline justify-between">
                      <span className="text-sm font-bold text-text-primary">Total Amount</span>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-primary-800 font-heading">
                          {Number(grandTotal).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-text-secondary ml-1">{currency}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submitting || !agreedToTerms}
                      className="w-full justify-center shadow-md font-bold"
                    >
                      {submitting ? 'Reserving Experience...' : 'Proceed to Payment →'}
                    </Button>

                    <p className="text-[11px] text-center text-text-muted">
                      🔒 Payments are securely processed via Chapa Payment Gateway with bank-grade encryption.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </form>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
