import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { FaHistory, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'

export default function BookingHistory() {
  const bookings = [
    {
      id: 'BK-001',
      service: 'Monastery Island Tour',
      date: 'May 10, 2026',
      amount: 45,
      status: 'Confirmed',
      vendor: 'Lake Tana Tours'
    },
    {
      id: 'BK-002',
      service: 'Traditional Dinner',
      date: 'May 12, 2026',
      amount: 25,
      status: 'Pending',
      vendor: 'Habesha Resto'
    },
    {
      id: 'BK-003',
      service: 'Blue Nile Falls Hike',
      date: 'April 20, 2026',
      amount: 40,
      status: 'Completed',
      vendor: 'Eco Guides BD'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <FaCheckCircle className="text-green-500" />
      case 'Pending': return <FaClock className="text-yellow-500" />
      case 'Completed': return <FaCheckCircle className="text-blue-500" />
      default: return <FaTimesCircle className="text-red-500" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 flex items-center">
            <FaHistory className="mr-4 text-primary" />
            My Booking History
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage and track your Lake Tana experiences</p>
        </div>

        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition group">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary text-2xl group-hover:bg-primary group-hover:text-white transition">
                  {booking.service.includes('Tour') ? '⛵' : booking.service.includes('Dinner') ? '🍲' : '🥾'}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{booking.service}</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded text-gray-400">{booking.id}</span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">{booking.vendor} • {booking.date}</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:space-x-12 border-t md:border-t-0 pt-4 md:pt-0 mt-4 md:mt-0">
                <div className="text-left md:text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Paid</p>
                  <p className="text-xl font-black text-gray-900">${booking.amount}</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                  {getStatusIcon(booking.status)}
                  <span className="font-bold text-sm text-gray-700">{booking.status}</span>
                </div>
                <button className="hidden lg:block text-primary font-bold hover:underline">
                  View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500">Your future adventures will appear here.</p>
            <Link href="/services" className="mt-8 inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-primary/20 transition">
              Start Exploring
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
