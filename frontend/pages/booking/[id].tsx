import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FaStar, FaMapMarkerAlt, FaLeaf, FaUsers,
  FaCalendarAlt, FaClock, FaShieldAlt, FaCheckCircle,
  FaCreditCard, FaMobileAlt, FaPaypal,
  FaArrowLeft, FaBell
} from 'react-icons/fa'
import { useRouter } from 'next/router'
import API from '../../utils/api'

const paymentMethods = [
  { id: 'telebirr', name: 'Telebirr', icon: <FaMobileAlt />, color: 'from-green-500 to-emerald-600' },
  { id: 'cbe', name: 'CBE Birr', icon: <FaMobileAlt />, color: 'from-blue-600 to-blue-800' },
  { id: 'amole', name: 'Amole', icon: <FaMobileAlt />, color: 'from-amber-500 to-orange-600' },
  { id: 'paypal', name: 'PayPal', icon: <FaPaypal />, color: 'from-blue-500 to-indigo-600' },
  { id: 'stripe', name: 'Stripe', icon: <FaCreditCard />, color: 'from-purple-500 to-purple-700' },
]

export default function BookingPage() {
  const router = useRouter()
  const { id } = router.query
  const [service, setService] = useState<any>(null)
  const [loadingService, setLoadingService] = useState(true)
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('telebirr')
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!id || Array.isArray(id)) return
    const fetchService = async () => {
      try {
        setLoadingService(true)
        setError('')
        const res = await API.get(`/services/${id}`)
        setService(res.data.data)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load service details')
      } finally {
        setLoadingService(false)
      }
    }
    fetchService()
  }, [id])

  const totalPrice = useMemo(() => {
    const basePrice = Number(service?.price || 0)
    return basePrice * guests
  }, [service?.price, guests])

  const todayStr = new Date().toISOString().split('T')[0]

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    if (!service?._id) { setError('Service details are not ready.'); return }
    if (!agreed) { setError('Please agree to the terms and conditions.'); return }
    try {
      setSubmitting(true)
      await API.post('/bookings', { service: service._id, date, guests, paymentMethod })
      setSuccessMessage('Booking confirmed! Check your email for the receipt. Vendor has been notified.')
    } catch (err: any) {
      if (err?.response?.status === 401) setError('Please login first to book.')
      else setError(err?.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {loadingService ? (
        <div className="flex-1 flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : !service ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="text-6xl mb-4">🌿</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <Link href="/services" className="text-primary font-semibold hover:underline">Browse services</Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors text-sm font-semibold">
            <FaArrowLeft /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Service Details */}
            <div className="lg:col-span-3 space-y-6">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
                {service.images?.length > 0 ? (
                  <Image src={`/images/${service.images[0]}`} alt={service.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
                    <span className="text-6xl opacity-30">🌿</span>
                  </div>
                )}
                {service.ecoFriendly && (
                  <div className="absolute top-5 left-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-lg">
                    <FaLeaf className="mr-2" /> Eco-Certified
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => <FaStar key={i} className={`${i < (service.rating || 0) ? 'text-yellow-400' : 'text-gray-200'} mr-0.5`} />)}
                    <span className="ml-2 font-semibold text-gray-900">{service.rating || 'New'}</span>
                  </div>
                  <span className="flex items-center text-gray-500"><FaMapMarkerAlt className="mr-1 text-primary" /> Lake Tana Region</span>
                  <span className="flex items-center text-gray-500"><FaClock className="mr-1 text-primary" /> 3-4 hours</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{service.description}</p>

              {/* Itinerary Preview */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">What to Expect</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <span className="text-sm text-gray-600">Welcome and introduction at the meeting point</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <span className="text-sm text-gray-600">Guided tour with experienced local guide</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <span className="text-sm text-gray-600">Refreshments and cultural insights along the way</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">4</div>
                    <span className="text-sm text-gray-600">Return journey with memorable experiences</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">From</div>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                      ${service.price}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">per person</div>
                </div>

                <form onSubmit={handleBooking} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <FaShieldAlt className="mt-0.5 shrink-0" /> {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                      <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-500" /> {successMessage}
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaCalendarAlt className="text-primary" /> Select Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={todayStr}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                      required
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaUsers className="text-primary" /> Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={guests}
                      onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaCreditCard className="text-primary" /> Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold transition-all border ${
                            paymentMethod === pm.id
                              ? `bg-gradient-to-r ${pm.color} text-white border-transparent shadow-md`
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                          }`}
                        >
                          {pm.icon}
                          {pm.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">${service.price} × {guests} guest(s)</span>
                      <span className="font-semibold text-gray-900">${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-semibold text-gray-900">${(totalPrice * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                        ${(totalPrice + totalPrice * 0.05).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-xs text-gray-500">
                      I agree to the <span className="text-primary font-semibold">Terms & Conditions</span> and <span className="text-primary font-semibold">Cancellation Policy</span>. I understand this booking supports eco-tourism.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-4 rounded-xl font-bold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Processing...</>
                    ) : (
                      <><FaCheckCircle /> Confirm Booking</>
                    )}
                  </button>
                </form>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <FaShieldAlt className="text-emerald-500" />
                  <span>Secured with JWT encryption · Your data is protected</span>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-4">
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <FaBell className="text-primary" /> Provider
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {service.vendor?.businessName?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{service.vendor?.businessName || 'Lake Tana Tours'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <FaLeaf className="text-emerald-500" /> Verified Eco-Partner
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
