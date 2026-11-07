import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { paymentService } from '@/features/payments/services/paymentService'
import { PaymentReceipt } from '@/features/payments/types'
import { ReceiptView } from '@/features/payments/components/ReceiptView'
import { Button } from '@/components/ui/Button'

export default function PaymentStatusPage() {
  const router = useRouter()
  const { tx_ref, txRef, trx_ref } = router.query

  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)

  useEffect(() => {
    const reference = (tx_ref || txRef || trx_ref) as string
    if (!reference) {
      if (router.isReady) {
        setLoading(false)
        setError('No transaction reference found in callback URL.')
      }
      return
    }

    const verify = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await paymentService.verify(reference)

        if (res.success && res.data?.verified) {
          setVerified(true)

          // Try loading receipt
          const identifier = res.data.receiptNumber || reference
          try {
            const receiptRes = await paymentService.getReceipt(identifier)
            if (receiptRes.data) {
              setReceipt(receiptRes.data)
            }
          } catch (receiptErr) {
            console.error('Failed to load full receipt data, using verification summary:', receiptErr)
            // Construct receipt from verification response
            setReceipt({
              receiptNumber: res.data.receiptNumber || `RCP-${reference.slice(-8).toUpperCase()}`,
              transactionReference: reference,
              bookingReference: res.data.booking?.reference || 'CONFIRMED',
              paymentDate: new Date().toISOString(),
              amount: res.data.amount || 0,
              currency: res.data.currency || 'ETB',
              paymentMethod: 'chapa',
              paymentStatus: 'completed',
              payer: {
                name: (res.data as any).user?.name || 'Valued Traveler',
                email: (res.data as any).user?.email || '',
              },
              service: {
                title: res.data.booking?.serviceTitle || 'Lake Tana Tour Experience',
              },
              vendor: {
                businessName: 'Lake Tana Certified Operator',
              },
              bookingDetails: {
                date: res.data.booking?.date || new Date().toISOString(),
                guests: res.data.booking?.guests || 1,
              },
            })
          }
        } else {
          setVerified(false)
          setError(res.message || 'Payment verification could not be confirmed.')
        }
      } catch (err: any) {
        console.error('Verification failed:', err)
        setVerified(false)
        setError(
          err?.response?.data?.message ||
            'Failed to verify transaction with Chapa payment gateway.'
        )
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [router.isReady, tx_ref, txRef, trx_ref])

  return (
    <PublicLayout>
      <Head>
        <title>Payment Verification | LTTMS</title>
      </Head>

      <div className="bg-surface-muted/30 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-md space-y-4">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
              <h2 className="text-2xl font-extrabold text-text-primary font-heading">
                Verifying Payment with Chapa...
              </h2>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                Securely confirming your transaction and locking in your Lake Tana tour reservation.
              </p>
            </div>
          ) : !verified ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-surface-border shadow-md space-y-5">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
                ✕
              </div>
              <h1 className="text-2xl font-extrabold text-text-primary font-heading">
                Payment Verification Unsuccessful
              </h1>
              <p className="text-text-secondary text-sm max-w-md mx-auto">
                {error || 'We could not confirm completion of your payment. If funds were deducted, please contact support with your reference.'}
              </p>

              {(tx_ref || txRef) && (
                <div className="p-3 bg-surface-muted rounded-xl font-mono text-xs text-text-muted inline-block">
                  Reference: {(tx_ref || txRef) as string}
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Link href="/services">
                  <Button variant="primary">Return to Marketplace</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Success Banner */}
              <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                  ✓
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
                  Reservation Confirmed & Paid!
                </h1>
                <p className="text-emerald-100 text-sm max-w-lg mx-auto">
                  Your Lake Tana experience is booked. Your e-receipt and boarding confirmation have been generated below.
                </p>
              </div>

              {/* Official Receipt Card */}
              {receipt && <ReceiptView receipt={receipt} />}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 print:hidden">
                <Link href="/tourist">
                  <Button variant="primary" size="lg">
                    Go to My Bookings Dashboard →
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    Explore More Tours
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
