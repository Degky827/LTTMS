import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { bookingService } from '@/features/bookings/services/bookingService'
import { Booking } from '@/features/bookings/types'
import { paymentService } from '@/features/payments/services/paymentService'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { useToast } from '@/components/feedback/ToastProvider'

export default function CheckoutPage() {
  const router = useRouter()
  const { id } = router.query
  const { addToast } = useToast()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || Array.isArray(id)) return

    const loadBooking = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await bookingService.getById(id)
        if (res.data) {
          setBooking(res.data)
        } else {
          setError('Booking reservation could not be found.')
        }
      } catch (err: any) {
        console.error('Failed to load booking:', err)
        setError(err?.response?.data?.message || 'Failed to load booking details.')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [id])

  const handlePayWithChapa = async () => {
    if (!booking) return

    try {
      setPaying(true)
      const returnUrl = `${window.location.origin}/booking/payment-status`
      const res = await paymentService.initialize(booking._id, returnUrl)

      if (res.data?.checkoutUrl) {
        // Redirect to Chapa hosted payment gateway
        window.location.href = res.data.checkoutUrl
      } else {
        throw new Error(res.message || 'Payment initialization did not return a checkout URL')
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err)
      addToast({
        type: 'error',
        title: 'Payment Gateway Error',
        message: err?.response?.data?.message || err?.message || 'Unable to connect to Chapa gateway.',
      })
      setPaying(false)
    }
  }

  const service = typeof booking?.service === 'object' ? booking?.service : null
  const vendor = typeof booking?.vendor === 'object' ? booking?.vendor : null

  return (
    <PublicLayout>
      <Head>
        <title>{booking ? `Checkout #${booking.bookingReference} | LTTMS` : 'Payment Checkout | LTTMS'}</title>
      </Head>

      <div className="bg-surface-muted/30 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header & Stepper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
            <div>
              <nav className="flex items-center space-x-2 text-xs text-text-muted mb-1">
                <Link href="/" className="hover:text-primary-600">Home</Link>
                <span>/</span>
                <Link href="/services" className="hover:text-primary-600">Marketplace</Link>
                <span>/</span>
                <span className="text-text-primary font-medium">Checkout</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading">
                Secure Payment Checkout
              </h1>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white">
                ✓
              </span>
              <span className="text-emerald-700">Details</span>
              <span className="text-gray-300">───</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white">
                2
              </span>
              <span className="text-primary-700 font-bold">Payment</span>
              <span className="text-gray-300">───</span>
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-muted text-text-muted border border-surface-border">
                3
              </span>
              <span className="text-text-muted">Confirmed</span>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 border border-surface-border animate-pulse space-y-4">
              <div className="h-6 bg-surface-border rounded w-1/3"></div>
              <div className="h-24 bg-surface-border rounded"></div>
              <div className="h-40 bg-surface-border rounded"></div>
            </div>
          ) : error || !booking ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                !
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {error || 'Reservation Not Found'}
              </h2>
              <Link href="/services">
                <Button variant="primary">Return to Marketplace</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Order Summary & Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-surface-border pb-4">
                    <div>
                      <span className="text-xs text-text-muted block">Booking Reference</span>
                      <span className="font-mono text-base font-bold text-primary-700">
                        #{booking.bookingReference}
                      </span>
                    </div>
                    <Badge
                      variant={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                      size="sm"
                      className="capitalize"
                    >
                      Payment: {booking.paymentStatus}
                    </Badge>
                  </div>

                  {/* Service Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-text-primary font-heading">
                      {booking.serviceTitleSnapshot || service?.title || 'Lake Tana Tour Experience'}
                    </h3>

                    {vendor && (
                      <p className="text-xs text-text-secondary">
                        Operator: <strong className="text-text-primary">{vendor.businessName}</strong>
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-surface-muted rounded-xl">
                        <span className="text-text-muted block">Date</span>
                        <span className="font-semibold text-text-primary">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="p-3 bg-surface-muted rounded-xl">
                        <span className="text-text-muted block">Departure</span>
                        <span className="font-semibold text-text-primary capitalize">
                          {booking.timeSlot ? booking.timeSlot.replace('_', ' ') : 'Morning (08:30)'}
                        </span>
                      </div>

                      <div className="p-3 bg-surface-muted rounded-xl">
                        <span className="text-text-muted block">Participants</span>
                        <span className="font-semibold text-text-primary">
                          {booking.guests} Guest{booking.guests === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                        <strong>Special notes:</strong> {booking.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Accepted Payment Methods Showcase */}
                <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    Accepted Local & International Payment Options
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl border border-surface-border bg-surface-muted/50 font-semibold text-text-primary">
                      📱 Telebirr
                    </div>
                    <div className="p-3 rounded-xl border border-surface-border bg-surface-muted/50 font-semibold text-text-primary">
                      🏦 CBE Birr
                    </div>
                    <div className="p-3 rounded-xl border border-surface-border bg-surface-muted/50 font-semibold text-text-primary">
                      💳 Visa / Mastercard
                    </div>
                    <div className="p-3 rounded-xl border border-surface-border bg-surface-muted/50 font-semibold text-text-primary">
                      ⚡ Awash & BoA
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Powered by Chapa Financial Technologies. Funds are held in verified escrow until your boat departure is confirmed by the Lake Tana Port Authority.
                  </p>
                </div>
              </div>

              {/* Payment Action Box */}
              <div className="md:col-span-1 space-y-6">
                <Card bordered className="bg-white shadow-md sticky top-24">
                  <CardContent className="p-6 space-y-5">
                    <h3 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                      Payment Summary
                    </h3>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-text-secondary">
                        <span>Participants:</span>
                        <span className="font-semibold text-text-primary">{booking.guests} Guests</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-text-primary">
                          {Number(booking.totalAmount).toLocaleString()} {booking.currency || 'ETB'}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Conservation Fee:</span>
                        <span className="font-semibold text-emerald-600">Included</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-border flex items-baseline justify-between">
                      <span className="text-sm font-bold text-text-primary">Total to Pay</span>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-primary-800 font-heading">
                          {Number(booking.totalAmount).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-text-secondary ml-1">
                          {booking.currency || 'ETB'}
                        </span>
                      </div>
                    </div>

                    {booking.paymentStatus === 'paid' ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200">
                          ✓ This reservation is already paid and confirmed!
                        </div>
                        <Link href="/tourist" className="block">
                          <Button variant="outline" className="w-full justify-center">
                            Go to Tourist Dashboard
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          variant="accent"
                          size="lg"
                          disabled={paying}
                          onClick={handlePayWithChapa}
                          className="w-full justify-center font-bold shadow-md text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800"
                        >
                          {paying ? 'Connecting to Chapa...' : 'Pay with Chapa →'}
                        </Button>
                        <p className="text-[11px] text-center text-text-muted">
                          You will be securely redirected to Chapa to complete your payment via Telebirr or Card.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
