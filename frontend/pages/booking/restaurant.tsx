import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useState } from 'react'
import { FaStar, FaMapMarkerAlt, FaClock, FaUtensils } from 'react-icons/fa'

export default function RestaurantBooking() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(2)

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Restaurant reservation submitted! (Connect to backend)')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Restaurant Details */}
          <div>
            <img 
              src="/images/restorant.webp" 
              alt="Traditional Ethiopian Restaurant" 
              className="w-full h-96 object-cover rounded-lg mb-6 shadow-lg"
            />
            <h1 className="text-3xl font-bold mb-4">Traditional Ethiopian Restaurant</h1>
            <div className="flex items-center mb-4">
              <FaStar className="text-yellow-400 mr-1" />
              <span className="font-semibold">4.6</span>
              <span className="text-gray-600 ml-2">(156 reviews)</span>
            </div>
            <div className="flex items-center text-gray-600 mb-6">
              <FaMapMarkerAlt className="mr-2" />
              <span>Bahir Dar City Center, Ethiopia</span>
            </div>
            <p className="text-gray-700 mb-6">
              Enjoy authentic Ethiopian cuisine with traditional coffee ceremonies. Our restaurant 
              offers a unique dining experience featuring local dishes, fresh ingredients from Lake Tana, 
              and warm Ethiopian hospitality.
            </p>
            
            {/* Features */}
            <h3 className="text-2xl font-bold mb-4">Restaurant Features</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <FaUtensils className="text-primary mr-2" />
                <span>Traditional Cuisine</span>
              </div>
              <div className="flex items-center">
                <FaClock className="text-primary mr-2" />
                <span>Open Daily</span>
              </div>
              <div className="flex items-center">
                <FaStar className="text-primary mr-2" />
                <span>Coffee Ceremony</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-primary mr-2" />
                <span>Lake View</span>
              </div>
            </div>

            {/* Menu Highlights */}
            <h3 className="text-2xl font-bold mb-4">Menu Highlights</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between border-b pb-2">
                <span>Doro Wat (Chicken Stew)</span>
                <span className="font-semibold">$12</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Kitfo (Minced Beef)</span>
                <span className="font-semibold">$15</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Vegetarian Platter</span>
                <span className="font-semibold">$10</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Fresh Lake Tana Fish</span>
                <span className="font-semibold">$18</span>
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
                  <p className="text-gray-700">Delicious food and authentic Ethiopian experience!</p>
                  <p className="text-sm text-gray-500 mt-2">- Diner Name</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reservation Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Make a Reservation</h2>
              
              <form onSubmit={handleBooking} className="space-y-4">
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
                  <label className="block text-sm font-semibold mb-2">Time</label>
                  <select 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="13:30">1:30 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="18:30">6:30 PM</option>
                    <option value="19:00">7:00 PM</option>
                    <option value="19:30">7:30 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Number of Guests</label>
                  <input 
                    type="number" 
                    min="1"
                    max="12"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Average meal cost is $25 per person. 
                    Final bill will be settled at the restaurant.
                  </p>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                >
                  Confirm Reservation
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You can cancel or modify your reservation up to 2 hours before the scheduled time
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
