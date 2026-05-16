import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useState } from 'react'
import { FaStar, FaMapMarkerAlt, FaWifi, FaParking, FaSwimmingPool } from 'react-icons/fa'

export default function HotelBooking() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Hotel booking submitted! (Connect to backend)')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Hotel Details */}
          <div>
            <img 
              src="/images/hotel.jpg" 
              alt="Luxury Hotel on Lake Tana" 
              className="w-full h-96 object-cover rounded-lg mb-6 shadow-lg"
            />
            <h1 className="text-3xl font-bold mb-4">Lake Tana Luxury Hotel</h1>
            <div className="flex items-center mb-4">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-semibold">4.7</span>
              <span className="text-gray-600 ml-2">(89 reviews)</span>
            </div>
            <div className="flex items-center text-gray-600 mb-6">
              <FaMapMarkerAlt className="mr-2" />
              <span>Bahir Dar, Ethiopia</span>
            </div>
            <p className="text-gray-700 mb-6">
              Experience luxury accommodation with stunning views of Lake Tana. Our hotel offers 
              modern amenities, traditional Ethiopian hospitality, and easy access to all major attractions.
            </p>
            
            {/* Amenities */}
            <h3 className="text-2xl font-bold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <FaWifi className="text-primary mr-2" />
                <span>Free WiFi</span>
              </div>
              <div className="flex items-center">
                <FaParking className="text-primary mr-2" />
                <span>Free Parking</span>
              </div>
              <div className="flex items-center">
                <FaSwimmingPool className="text-primary mr-2" />
                <span>Swimming Pool</span>
              </div>
              <div className="flex items-center">
                <FaStar className="text-primary mr-2" />
                <span>Restaurant</span>
              </div>
            </div>
            
            {/* Reviews */}
            <h3 className="text-2xl font-bold mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-semibold">5.0</span>
                  </div>
                  <p className="text-gray-700">Excellent service and beautiful lake views!</p>
                  <p className="text-sm text-gray-500 mt-2">- Guest Name</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
              <div className="text-3xl font-bold text-primary mb-6">$120 <span className="text-lg text-gray-600">/ night</span></div>
              
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Check-in Date</label>
                  <input 
                    type="date" 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2">Check-out Date</label>
                  <input 
                    type="date" 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
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
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>$120 × 1 night</span>
                    <span>$120</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>$120</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                >
                  Reserve Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
