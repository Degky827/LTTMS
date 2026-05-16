import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import { useRouter } from 'next/router'
import API from '../../utils/api'

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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!service?._id) {
      setError('Service details are not ready. Please refresh and try again.')
      return
    }

    try {
      setSubmitting(true)
      await API.post('/bookings', {
        service: service._id,
        date,
        guests
      })
      setSuccessMessage('Booking submitted successfully. You can track it from your booking history.')
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Please login first to book this experience.')
      } else {
        setError(err?.response?.data?.message || 'Booking failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loadingService ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !service ? (
          <div className="text-center py-16 text-red-600 font-semibold">Service not found.</div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Service Details */}
          <div>
            <div className="relative h-96 mb-6 shadow-lg rounded-lg overflow-hidden">
              {service.images?.length > 0 ? (
                <Image 
                  src={`/images/${service.images[0]}`} 
                  alt={service.title} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
                  <span className="text-6xl opacity-30">🌿</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
            <div className="flex items-center mb-4">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-semibold">{service.rating || 0}</span>
              <span className="text-gray-600 ml-2">({service.rating ? 'User ratings available' : 'No ratings yet'})</span>
            </div>
            <div className="flex items-center text-gray-600 mb-6">
              <FaMapMarkerAlt className="mr-2" />
              <span>{service.vendor?.location || 'Lake Tana Region, Ethiopia'}</span>
            </div>
            <p className="text-gray-700 mb-6">
              {service.description}
            </p>
            
            {/* Reviews */}
            <h3 className="text-2xl font-bold mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">5.0</span>
                  </div>
                  <p className="text-gray-700">Amazing experience! Highly recommended.</p>
                  <p className="text-sm text-gray-500 mt-2">- Tourist Name</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
              <div className="text-3xl font-bold text-primary mb-6">${service.price} <span className="text-lg text-gray-600">/ person</span></div>
              
              <form onSubmit={handleBooking} className="space-y-4">
                {error && <div className="rounded-md bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
                {successMessage && <div className="rounded-md bg-green-50 text-green-700 px-4 py-3 text-sm">{successMessage}</div>}
                <div>
                  <label className="block text-sm font-semibold mb-2">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Number of Guests</label>
                  <input 
                    type="number" 
                    min="1"
                    value={guests}
                    onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>${service.price} × {guests} guest(s)</span>
                    <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
