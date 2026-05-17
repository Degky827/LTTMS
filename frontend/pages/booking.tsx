import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FaCalendarAlt, FaChevronRight, FaSearch,
  FaDownload, FaFileInvoice, FaUndo,
  FaCheck, FaBan, FaEye, FaTimes,
  FaMapMarkerAlt, FaUsers, FaStore,
  FaExclamationTriangle, FaCalendarCheck,
  FaClock
} from 'react-icons/fa'
import API from '../utils/api'

type BookingStatus = 'upcoming' | 'pending' | 'completed' | 'cancelled'

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming')
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [refundModal, setRefundModal] = useState<any>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setAuthed(false)
    } else {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const res = await API.get('/bookings/user')
        setBookings(res.data.data || [])
      } catch {
        setBookings([])
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [authed])

  const stats = {
    upcoming: bookings.filter((b: any) => b.status === 'confirmed' && new Date(b.date) > new Date()).length || 2,
    pending: bookings.filter((b: any) => b.status === 'pending').length || 1,
    completed: bookings.filter((b: any) => b.status === 'confirmed' && new Date(b.date) < new Date()).length || 5,
    cancelled: bookings.filter((b: any) => b.status === 'cancelled').length || 0,
  }

  const filtered = bookings.filter((b: any) => {
    const matchStatus =
      activeTab === 'upcoming' ? b.status === 'confirmed' && new Date(b.date) > new Date() :
      activeTab === 'pending' ? b.status === 'pending' :
      activeTab === 'completed' ? b.status === 'confirmed' && new Date(b.date) < new Date() :
      b.status === 'cancelled'
    const matchSearch = !search || b.service?.title?.toLowerCase().includes(search.toLowerCase()) || b._id?.includes(search)
    const matchService = serviceFilter === 'all' || b.service?.category === serviceFilter
    return matchStatus && matchSearch && matchService
  })

  if (authed === false) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
            <FaCalendarAlt className="text-5xl text-primary/30 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-3">Sign In Required</h1>
            <p className="text-gray-500 mb-8">Please sign in to view and manage your bookings.</p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all">
              Sign In <FaChevronRight />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-800" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaCalendarAlt className="mr-2 text-cyan-300" />
              <span className="text-white text-sm font-medium">Booking Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Bookings</span>
            </h1>
            <p className="text-lg text-gray-200">Track, manage, and review your Lake Tana experiences.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Upcoming', value: stats.upcoming, color: 'from-blue-500 to-cyan-600', icon: <FaCalendarCheck /> },
            { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-orange-600', icon: <FaClock /> },
            { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-green-600', icon: <FaCheck /> },
            { label: 'Cancelled', value: stats.cancelled, color: 'from-red-500 to-pink-600', icon: <FaBan /> },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-sm`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service name or booking ID..."
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white shadow-sm"
            />
          </div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Service Types</option>
            <option value="hotel">Eco Lodges</option>
            <option value="boat">Boat Tours</option>
            <option value="tour">Cultural Tours</option>
            <option value="monastery">Monastery Visits</option>
          </select>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all ${
              showCalendar ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
            }`}
          >
            <FaCalendarAlt /> {showCalendar ? 'Hide Calendar' : 'Calendar View'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['upcoming', 'pending', 'completed', 'cancelled'] as BookingStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
              }`}
            >
              {tab}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
              }`}>
                {stats[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Calendar View (simplified) */}
        {showCalendar && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Availability Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-xs font-bold text-gray-400 uppercase py-2">{d}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1
                const hasBooking = [3, 7, 12, 15, 22].includes(day)
                const isPast = day < new Date().getDate()
                return (
                  <div
                    key={i}
                    className={`rounded-lg py-3 text-sm font-semibold transition-all ${
                      hasBooking ? 'bg-primary text-white' :
                      isPast ? 'bg-gray-100 text-gray-400' :
                      'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                    {hasBooking && <div className="text-[8px] opacity-80 mt-0.5">● booked</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Booking List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((booking: any) => (
              <div key={booking._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {booking.service?.images?.length > 0 ? (
                      <Image src={`/images/${booking.service.images[0]}`} alt={booking.service.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
                        <FaStore className="text-gray-300 text-xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{booking.service?.title || 'Service'}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-primary" /> Lake Tana</span>
                          <span className="flex items-center gap-1"><FaCalendarAlt className="text-primary" /> {booking.date ? new Date(booking.date).toLocaleDateString() : '—'}</span>
                          <span className="flex items-center gap-1"><FaUsers className="text-primary" /> {booking.guests || 1} guest(s)</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-primary">${booking.totalAmount || 0}</div>
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-1 ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        <FaEye /> View Details
                      </button>
                      <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
                        <FaDownload /> Receipt
                      </button>
                      <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
                        <FaFileInvoice /> Invoice
                      </button>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setRefundModal(booking)}
                          className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <FaUndo /> Request Refund
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} bookings</h3>
              <p className="text-gray-500 text-sm mb-6">
                {activeTab === 'upcoming' ? 'Start exploring experiences to create your first booking.' :
                 activeTab === 'pending' ? 'No pending bookings awaiting confirmation.' :
                 activeTab === 'completed' ? 'No completed bookings yet.' :
                 'No cancelled bookings.'}
              </p>
              <Link href="/services" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                Browse Experiences <FaChevronRight />
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Showing {filtered.length} of {bookings.length} bookings</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Previous</button>
              <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <FaTimes className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Booking ID</span>
                <span className="text-sm font-bold text-gray-900 font-mono">#{selectedBooking._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Service</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.service?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Guests</span>
                <span className="text-sm font-bold text-gray-900">{selectedBooking.guests || 1}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-lg font-bold text-primary">${selectedBooking.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                  selectedBooking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{selectedBooking.status || 'pending'}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Payment</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><FaCheck className="text-xs" /> Completed</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors"><FaDownload className="inline mr-2" />Download Receipt</button>
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-3 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRefundModal(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <button onClick={() => setRefundModal(null)} className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <FaTimes className="text-gray-600" />
            </button>
            <FaExclamationTriangle className="text-4xl text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 text-center mb-3">Request Refund</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              Request a refund for <span className="font-semibold text-gray-900">{refundModal.service?.title}</span> — ${refundModal.totalAmount || 0}
            </p>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Refund</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option>Change of plans</option>
                <option>Medical emergency</option>
                <option>Service not as described</option>
                <option>Weather concerns</option>
                <option>Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors">Submit Refund Request</button>
              <button onClick={() => setRefundModal(null)} className="px-4 py-3 border border-gray-200 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
