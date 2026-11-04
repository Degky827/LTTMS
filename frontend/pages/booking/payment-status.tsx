import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaReceipt, FaArrowLeft, FaHome } from 'react-icons/fa'
import API from '../../utils/api'

export default function PaymentStatusPage() {
  const router = useRouter()
  const { tx_ref, txRef } = router.query

  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reference = tx_ref || txRef
    if (!reference) return

    const verifyTransaction = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await API.get(`/payments/verify/${reference}`)
        if (res.data?.success && res.data?.data?.verified) {
          setVerified(true)
          setPaymentData(res.data.data)
        } else {
          setVerified(false)
          setError(res.data?.message || 'Payment verification could not be confirmed')
        }
      } catch (err: any) {
        setVerified(false)
        setError(err.response?.data?.message || 'Error communicating with payment verification service')
      } finally {
        setLoading(false)
      }
    }

    verifyTransaction()
  }, [tx_ref, txRef])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
        {loading ? (
          <div className="py-12 space-y-4">
            <FaSpinner className="animate-spin text-5xl text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
            <p className="text-gray-500 text-sm">
              Connecting to Chapa gateway and confirming your Lake Tana reservation.
            </p>
          </div>
        ) : verified ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <FaCheckCircle />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-gray-900">Payment Confirmed!</h1>
              <p className="text-sm text-gray-600">
                Your reservation has been confirmed and verified with Lake Tana Tourism Management System.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-200/60 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {paymentData?.receiptNumber || 'RCP-2026-CONFIRMED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Ref:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {paymentData?.booking?.reference || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  Paid & Confirmed
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {paymentData?.receiptNumber && (
                <Link
                  href={`/api/v1/payments/receipt/${paymentData.receiptNumber}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-sm"
                >
                  <FaReceipt /> View Official Receipt
                </Link>
              )}
              <Link
                href="/tourist/dashboard"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all text-sm"
              >
                <FaHome /> Go to My Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <FaTimesCircle />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-gray-900">Payment Verification Failed</h1>
              <p className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">
                {error || 'Unable to confirm payment with payment gateway'}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold bg-gray-800 hover:bg-gray-900 text-white transition-all text-sm"
              >
                <FaArrowLeft /> Try Again
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-medium text-gray-500 hover:text-gray-700 text-sm"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
