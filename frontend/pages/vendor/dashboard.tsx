import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import {
  FaDollarSign, FaCalendar, FaStar, FaPlus, FaTimes,
  FaStore, FaShip, FaHotel, FaUtensils, FaLeaf,
  FaCheckCircle, FaExclamationCircle, FaBell, FaCog,
  FaChartBar, FaUsers, FaEnvelope, FaShieldAlt,
  FaDownload, FaFileInvoice, FaTrash, FaEdit,
  FaCheck, FaBan, FaReply, FaComments, FaChartLine,
  FaEye, FaCalendarAlt, FaClock, FaMoneyBillWave,
  FaUserShield, FaKey, FaMobileAlt, FaGlobeAmericas,
  FaPercentage, FaHandHoldingHeart, FaRecycle,
  FaAward, FaClipboardList, FaUserCircle, FaCamera,
  FaSearch, FaFilter, FaSortAmountDown, FaLightbulb,
  FaArrowUp, FaArrowDown, FaExchangeAlt, FaBellSlash
} from 'react-icons/fa'
import Chat from '../../components/Chat'
import API from '../../utils/api'

const tabs = [
  { id: 'overview', label: 'Overview', icon: <FaChartBar /> },
  { id: 'profile', label: 'Profile', icon: <FaUserCircle /> },
  { id: 'services', label: 'Services', icon: <FaStore /> },
  { id: 'bookings', label: 'Bookings', icon: <FaCalendar /> },
  { id: 'revenue', label: 'Revenue', icon: <FaMoneyBillWave /> },
  { id: 'eco', label: 'Eco-Compliance', icon: <FaLeaf /> },
  { id: 'engagement', label: 'Engagement', icon: <FaComments /> },
  { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
  { id: 'notifications', label: 'Alerts', icon: <FaBell /> },
  { id: 'settings', label: 'Settings', icon: <FaCog /> },
]

const mockNotifications = [
  { id: 1, message: 'New booking received - Lake Tana Boat Tour', time: '2 min ago', type: 'booking' },
  { id: 2, message: 'Payment of $120 confirmed - Booking #1042', time: '15 min ago', type: 'payment' },
  { id: 3, message: 'Refund request for Booking #1038', time: '1 hour ago', type: 'refund' },
  { id: 4, message: 'Eco-score updated: 92/100', time: '3 hours ago', type: 'eco' },
  { id: 5, message: 'Commission rate update effective next month', time: '1 day ago', type: 'system' },
]

const mockReviews = [
  { id: 1, name: 'Sarah M.', rating: 5, text: 'Excellent service and very knowledgeable guide!', date: '2 days ago', response: '' },
  { id: 2, name: 'John D.', rating: 4, text: 'Great experience overall. The boat was comfortable and the views were breathtaking.', date: '1 week ago', response: 'Thank you John! We\'re glad you enjoyed the tour.' },
  { id: 3, name: 'Emma W.', rating: 5, text: 'The eco-lodge was amazing. Truly sustainable luxury.', date: '2 weeks ago', response: '' },
]

const ecoChecklistItems = [
  { id: 1, label: 'Waste segregation implemented', category: 'Waste Management' },
  { id: 2, label: 'Single-use plastics eliminated', category: 'Waste Management' },
  { id: 3, label: 'Solar/renewable energy in use', category: 'Energy' },
  { id: 4, label: 'Energy-efficient lighting installed', category: 'Energy' },
  { id: 5, label: 'Local community members employed', category: 'Community' },
  { id: 6, label: 'Fair wages paid to all staff', category: 'Community' },
  { id: 7, label: 'Water conservation measures active', category: 'Water' },
  { id: 8, label: 'Guests educated on eco-practices', category: 'Education' },
]

const analyticsData = {
  views: [320, 480, 560, 420, 680, 740, 820],
  bookings: [12, 18, 24, 16, 28, 32, 36],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}

export default function VendorDashboard() {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [vendorStats, setVendorStats] = useState({ revenue: 2450, bookings: 0, rating: 4.8 })
  const [vendorServices, setVendorServices] = useState([])
  const [vendorBookings, setVendorBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setAuthed(false)
    } else {
      setAuthed(true)
    }
  }, [])

  if (authed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
          <FaStore className="text-5xl text-primary/30 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-500 mb-8">Please log in to access your vendor dashboard.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go to Login
          </Link>
        </div>
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
  const [isAdding, setIsAdding] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [completedChecklist, setCompletedChecklist] = useState<number[]>([1, 3, 5])
  const [reviewResponses, setReviewResponses] = useState<Record<number, string>>({})
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [notifFilter, setNotifFilter] = useState('all')
  const [ecoScore, setEcoScore] = useState(72)

  const toggleChecklist = (id: number) => {
    setCompletedChecklist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const ecoPercentage = Math.round((completedChecklist.length / ecoChecklistItems.length) * 100)

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const servicesRes = await API.get('/services')
        setVendorServices(servicesRes.data.data)
        const bookingsRes = await API.get('/bookings/user')
        setVendorBookings(bookingsRes.data.data)
        setVendorStats((prev) => ({ ...prev, bookings: bookingsRes.data.count || 12 }))
      } catch (err) {
        console.error('Error fetching vendor data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVendorData()
  }, [])

  const recentBookings = vendorBookings.slice(0, 5)
  const pendingBookings = vendorBookings.filter((b: any) => b.status === 'pending')
  const completedBookings = vendorBookings.filter((b: any) => b.status === 'confirmed')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ===== Top Header ===== */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                LT
              </div>
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">Vendor Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900">Lake Tana Tours Ltd.</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center justify-end">
                <FaCheckCircle className="mr-1 text-emerald-500" /> Verified Partner
              </p>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
              <FaBell />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); router.push('/vendor/login') }}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-500 hover:text-primary"
            >
              {showMobileMenu ? <FaTimes /> : <FaStore />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Mobile Tab Menu ===== */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white border-b shadow-md z-30">
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false) }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== Desktop Sidebar + Content ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-0.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border border-primary/20'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'notifications' && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* ===== OVERVIEW ===== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `$${vendorStats.revenue}`, icon: <FaDollarSign />, color: 'from-blue-500 to-cyan-600', change: '+12.5%', up: true },
                    { label: 'Total Bookings', value: String(vendorStats.bookings || 12), icon: <FaCalendar />, color: 'from-emerald-500 to-green-600', change: '+8.2%', up: true },
                    { label: 'Avg Rating', value: String(vendorStats.rating), icon: <FaStar />, color: 'from-amber-500 to-orange-600', change: '0.2', up: true },
                    { label: 'Eco-Score', value: `${ecoScore}/100`, icon: <FaLeaf />, color: 'from-emerald-600 to-teal-600', change: '+5 pts', up: true },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                          {stat.icon}
                        </div>
                        <span className={`text-xs font-bold flex items-center ${stat.up ? 'text-emerald-600' : 'text-red-500'}`}>
                          {stat.up ? <FaArrowUp className="mr-0.5" /> : <FaArrowDown className="mr-0.5" />}
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Charts + Quick actions */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Revenue Performance (7 days)</h3>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                      {analyticsData.labels.map((label, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-gradient-to-t from-primary to-blue-500 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${(analyticsData.bookings[i] / 40) * 100}%` }}></div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button onClick={() => { setActiveTab('services'); setIsAdding(true) }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-blue-600/5 border border-primary/10 text-primary font-semibold text-sm hover:from-primary/10 hover:to-blue-600/10 transition-all">
                        <FaPlus className="p-1.5 bg-primary text-white rounded-lg w-8 h-8" /> Add New Service
                      </button>
                      <button onClick={() => setActiveTab('eco')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-green-600/5 border border-emerald-500/10 text-emerald-600 font-semibold text-sm hover:from-emerald-500/10 hover:to-green-600/10 transition-all">
                        <FaLeaf className="p-1.5 bg-emerald-500 text-white rounded-lg w-8 h-8" /> Eco Compliance
                      </button>
                      <button onClick={() => setActiveTab('revenue')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-600/5 border border-amber-500/10 text-amber-600 font-semibold text-sm hover:from-amber-500/10 hover:to-orange-600/10 transition-all">
                        <FaDownload className="p-1.5 bg-amber-500 text-white rounded-lg w-8 h-8" /> Download Report
                      </button>
                      <button onClick={() => setActiveTab('bookings')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-600/5 border border-purple-500/10 text-purple-600 font-semibold text-sm hover:from-purple-500/10 hover:to-purple-600/10 transition-all">
                        <FaCalendar className="p-1.5 bg-purple-500 text-white rounded-lg w-8 h-8" /> View Bookings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Bookings</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-sm font-semibold text-primary hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Service</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Customer</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loading ? (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
                        ) : recentBookings.length > 0 ? (
                          recentBookings.map((b: any) => (
                            <tr key={b._id} className="hover:bg-gray-50/50 transition">
                              <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{b.service?.title || 'N/A'}</td>
                              <td className="px-6 py-4 text-gray-600 text-sm">{b.user?.name || 'Guest'}</td>
                              <td className="px-6 py-4 text-gray-600 text-sm">{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                              <td className="px-6 py-4 font-bold text-gray-900 text-sm">${b.totalAmount || 0}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                  b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {b.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No bookings yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== PROFILE ===== */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Vendor Profile</h2>
                  <span className="flex items-center gap-1 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                    <FaCheckCircle /> KYC Verified
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-6 pb-8 border-b border-gray-100">
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 overflow-hidden">
                    LT
                    <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <FaCamera className="text-white text-lg" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Lake Tana Tours Ltd.</h3>
                    <p className="text-gray-500 text-sm">Member since January 2024</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold"><FaShieldAlt /> License #LT-2024-0842</span>
                      <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold"><FaLeaf /> Eco-Certified</span>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shrink-0">Edit Profile</button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Business Name</label>
                    <input type="text" defaultValue="Lake Tana Tours Ltd." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Contact Email</label>
                    <input type="email" defaultValue="info@laketana-tours.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                    <input type="tel" defaultValue="+251 91 234 5678" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">License Number</label>
                    <input type="text" defaultValue="LT-2024-0842" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Business Address</label>
                    <input type="text" defaultValue="Bahir Dar, Ethiopia, Lake Tana Shore" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Upload Certifications</label>
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-primary hover:text-primary transition-all">
                      <FaPlus /> Business License
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                      <FaPlus /> Eco Badge
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all">
                      <FaPlus /> Insurance
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== SERVICES ===== */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Service Management</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{vendorServices.length} active listings</p>
                  </div>
                  <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300">
                    <FaPlus /> New Service
                  </button>
                </div>

                <div className="grid gap-4">
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading services...</div>
                  ) : vendorServices.length > 0 ? (
                    vendorServices.map((service: any) => (
                      <div key={service._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-start hover:shadow-md transition-all">
                        <div className="relative w-full sm:w-28 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {service.images?.length > 0 ? (
                            <Image
                              src={`/images/${service.images[0]}`}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <FaStore className="text-gray-300 text-xl" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-gray-900">{service.title}</h3>
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{service.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-primary">${service.price}</div>
                              <span className={`text-xs font-semibold ${service.availability ? 'text-emerald-600' : 'text-red-500'}`}>
                                {service.availability ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                            {service.ecoFriendly && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><FaLeaf /> Eco</span>}
                            <span className="flex items-center gap-1"><FaEye /> 142 views</span>
                            <span className="flex items-center gap-1"><FaCalendarAlt /> 8 bookings</span>
                            <span className="flex items-center gap-1"><FaStar className="text-yellow-500" /> {service.rating || 'New'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"><FaEdit /></button>
                          <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FaTrash /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                      <FaStore className="text-4xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No services yet</h3>
                      <p className="text-gray-500 text-sm mb-6">Start by adding your first eco-tourism service.</p>
                      <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                        <FaPlus /> Add Your First Service
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== BOOKINGS ===== */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900">Booking Management</h2>
                  <div className="flex gap-2 text-sm">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Accept</button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-colors">Decline</button>
                  </div>
                </div>

                {/* Booking Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Pending', value: pendingBookings.length || 3, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Confirmed', value: completedBookings.length || 8, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Completed', value: vendorBookings.length || 14, color: 'text-blue-600', bg: 'bg-blue-50' },
                  ].map((s, i) => (
                    <div key={i} className={`${s.bg} rounded-2xl p-5 text-center`}>
                      <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-sm font-semibold text-gray-600 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">All</button>
                      <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">Pending</button>
                      <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">Confirmed</button>
                      <button className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">Refunds</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Booking ID</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Service</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Customer</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loading ? (
                          <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Loading bookings...</td></tr>
                        ) : vendorBookings.length > 0 ? (
                          vendorBookings.map((b: any) => (
                            <tr key={b._id} className="hover:bg-gray-50/50 transition">
                              <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">#{b._id?.slice(-6) || 'N/A'}</td>
                              <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{b.service?.title || 'N/A'}</td>
                              <td className="px-6 py-4 text-gray-600 text-sm">{b.user?.name || 'Guest'}</td>
                              <td className="px-6 py-4 text-gray-600 text-sm">{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                              <td className="px-6 py-4 font-bold text-gray-900 text-sm">${b.totalAmount || 0}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                  b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {b.status || 'pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1">
                                  {b.status === 'pending' && (
                                    <>
                                      <button className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title="Accept"><FaCheck /></button>
                                      <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Decline"><FaBan /></button>
                                    </>
                                  )}
                                  <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition" title="Details"><FaEye /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">No bookings found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== REVENUE ===== */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Revenue & Commission</h2>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">
                    <FaDownload /> Download Report
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="text-sm font-semibold text-emerald-100">Gross Revenue</div>
                    <div className="text-3xl font-black mt-1">$3,250</div>
                    <div className="text-sm text-emerald-100 mt-1">This month</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="text-sm font-semibold text-amber-100">Commission (15%)</div>
                    <div className="text-3xl font-black mt-1">-$487</div>
                    <div className="text-sm text-amber-100 mt-1">Platform fee</div>
                  </div>
                  <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white">
                    <div className="text-sm font-semibold text-blue-100">Net Earnings</div>
                    <div className="text-3xl font-black mt-1">$2,763</div>
                    <div className="text-sm text-blue-100 mt-1">After deductions</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Commission Breakdown</h3>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600">
                      <option>Last 30 Days</option>
                      <option>Last 3 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    {[
                      { booking: '#1042', service: 'Lake Tana Boat Tour', amount: 120, commission: 18, net: 102, date: 'May 14' },
                      { booking: '#1041', service: 'Monastery Guided Tour', amount: 85, commission: 12.75, net: 72.25, date: 'May 13' },
                      { booking: '#1040', service: 'Eco Lodge Stay - 2 Nights', amount: 240, commission: 36, net: 204, date: 'May 12' },
                      { booking: '#1039', service: 'Sunset Boat Cruise', amount: 55, commission: 8.25, net: 46.75, date: 'May 11' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs font-bold text-gray-400">{item.booking}</span>
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{item.service}</div>
                            <div className="text-xs text-gray-500">{item.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="text-gray-500 text-xs">Gross</div>
                            <div className="font-bold">${item.amount}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-600 text-xs">Commission</div>
                            <div className="font-bold text-amber-600">-${item.commission}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-600 text-xs">Net</div>
                            <div className="font-bold text-emerald-600">${item.net}</div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-primary"><FaFileInvoice /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <FaPercentage className="text-primary text-xl" />
                    <div>
                      <div className="font-semibold text-gray-900">Current Commission Rate: 15%</div>
                      <p className="text-xs text-gray-500">You earn 85% of every booking. Commission covers platform, payment processing, and marketing.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ECO-COMPLIANCE ===== */}
            {activeTab === 'eco' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Eco-Tourism Compliance</h2>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                    <FaAward /> Apply for Eco-Badge
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-emerald-100">Your Eco-Score</div>
                      <div className="text-5xl font-black mt-2">{ecoPercentage}%</div>
                      <div className="text-sm text-emerald-100 mt-2">
                        {ecoPercentage >= 80 ? 'Excellent! You\'re a sustainability leader.' :
                         ecoPercentage >= 50 ? 'Good progress. Keep improving!' :
                         'Start your eco-journey today.'}
                      </div>
                    </div>
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                      <FaLeaf className="text-4xl" />
                    </div>
                  </div>
                  <div className="mt-6 bg-white/20 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full transition-all duration-700" style={{ width: `${ecoPercentage}%` }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Sustainability Checklist</h3>
                  <div className="space-y-1">
                    {ecoChecklistItems.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                          completedChecklist.includes(item.id) ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                          completedChecklist.includes(item.id)
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {completedChecklist.includes(item.id) && <FaCheck className="text-xs" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold text-sm ${completedChecklist.includes(item.id) ? 'text-emerald-800' : 'text-gray-700'}`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{item.category}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={completedChecklist.includes(item.id)}
                          onChange={() => toggleChecklist(item.id)}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== ENGAGEMENT ===== */}
            {activeTab === 'engagement' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Reviews & Responses</h3>
                    <div className="space-y-4">
                      {mockReviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                                {review.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-sm text-gray-900">{review.name}</span>
                            </div>
                            <div className="flex text-yellow-400 text-xs">
                              {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                          <p className="text-xs text-gray-400 mb-3">{review.date}</p>
                          {review.response ? (
                            <div className="ml-4 pl-4 border-l-2 border-primary/30">
                              <p className="text-xs text-gray-500"><span className="font-semibold text-primary">Your response:</span> {review.response}</p>
                            </div>
                          ) : (
                            <div>
                              {replyingTo === review.id ? (
                                <div className="flex gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={reviewResponses[review.id] || ''}
                                    onChange={(e) => setReviewResponses((prev) => ({ ...prev, [review.id]: e.target.value }))}
                                    placeholder="Write your response..."
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                  />
                                  <button className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"><FaCheck /></button>
                                  <button onClick={() => setReplyingTo(null)} className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300 transition-colors"><FaTimes /></button>
                                </div>
                              ) : (
                                <button onClick={() => setReplyingTo(review.id)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-blue-700 transition-colors">
                                  <FaReply /> Reply
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Customer Messaging</h3>
                    <div className="h-[400px] overflow-y-auto">
                      <Chat />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Feedback Analytics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm font-semibold text-green-700 flex items-center gap-2"><FaArrowUp className="text-green-500" /> Positive</span>
                        <span className="font-bold text-green-700">78%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                        <span className="text-sm font-semibold text-amber-700 flex items-center gap-2"><FaExchangeAlt className="text-amber-500" /> Neutral</span>
                        <span className="font-bold text-amber-700">15%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                        <span className="text-sm font-semibold text-red-700 flex items-center gap-2"><FaArrowDown className="text-red-500" /> Negative</span>
                        <span className="font-bold text-red-700">7%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ANALYTICS ===== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Analytics & Insights</h2>
                  <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Views', value: '4,280', change: '+18%', icon: <FaEye />, color: 'from-blue-500 to-cyan-600' },
                    { label: 'Total Bookings', value: '36', change: '+12%', icon: <FaCalendarAlt />, color: 'from-emerald-500 to-green-600' },
                    { label: 'Conversion Rate', value: '0.84%', change: '+2.1%', icon: <FaChartLine />, color: 'from-purple-500 to-pink-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
                        <span className="text-xs font-bold text-emerald-600 flex items-center"><FaArrowUp className="mr-0.5" />{stat.change}</span>
                      </div>
                      <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Service Performance</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Lake Tana Boat Tour', views: 890, bookings: 12, rating: 4.9 },
                        { name: 'Monastery Guided Tour', views: 654, bookings: 8, rating: 4.8 },
                        { name: 'Eco Lodge Stay', views: 432, bookings: 6, rating: 4.7 },
                        { name: 'Sunset Cruise', views: 321, bookings: 5, rating: 4.6 },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">{s.name}</div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span><FaEye className="inline mr-1" />{s.views}</span>
                              <span><FaCalendarAlt className="inline mr-1" />{s.bookings}</span>
                              <span><FaStar className="inline mr-1 text-yellow-500" />{s.rating}</span>
                            </div>
                          </div>
                          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full" style={{ width: `${(s.views / 1000) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">AI-Powered Recommendations</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaLightbulb className="text-amber-500" />
                          <span className="font-bold text-sm text-gray-900">Pricing Suggestion</span>
                        </div>
                        <p className="text-sm text-gray-600">Consider a 10% weekend surcharge — demand is 40% higher on Saturdays.</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaLightbulb className="text-blue-500" />
                          <span className="font-bold text-sm text-gray-900">Seasonal Demand</span>
                        </div>
                        <p className="text-sm text-gray-600">Peak season approaching (Oct–Feb). Increase your listings now.</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaLeaf className="text-emerald-500" />
                          <span className="font-bold text-sm text-gray-900">Eco-Insight</span>
                        </div>
                        <p className="text-sm text-gray-600">Listing your eco-certification could boost bookings by 25%.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== NOTIFICATIONS ===== */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Notifications & Alerts</h2>
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <FaBellSlash /> Mark All Read
                  </button>
                </div>

                <div className="flex gap-2">
                  {['all', 'booking', 'payment', 'refund', 'eco', 'system'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setNotifFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        notifFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                        notif.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                        notif.type === 'refund' ? 'bg-amber-100 text-amber-600' :
                        notif.type === 'eco' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notif.type === 'booking' ? <FaCalendarAlt /> :
                         notif.type === 'payment' ? <FaDollarSign /> :
                         notif.type === 'refund' ? <FaExchangeAlt /> :
                         notif.type === 'eco' ? <FaLeaf /> :
                         <FaCog />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== SETTINGS ===== */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900">Security & Account Settings</h2>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><FaUserShield className="text-primary" /> Role Management</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Abebe K.', email: 'abebe@laketana-tours.com', role: 'Owner' },
                        { name: 'Meron T.', email: 'meron@laketana-tours.com', role: 'Staff' },
                        { name: 'Dawit H.', email: 'dawit@laketana-tours.com', role: 'Staff' },
                      ].map((person, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                              {person.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{person.name}</div>
                              <div className="text-xs text-gray-500">{person.email}</div>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            person.role === 'Owner' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {person.role}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-blue-700 transition-colors">
                      <FaPlus /> Invite Staff Member
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><FaKey className="text-primary" /> Password & Security</h3>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Current Password</label>
                        <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                        <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors">Update Password</button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><FaMobileAlt className="text-primary" /> Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account.</p>
                      <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition-all">
                        <FaShieldAlt /> Enable 2FA
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2"><FaGlobeAmericas className="text-primary" /> Webhook Settings</h3>
                      <p className="text-sm text-gray-600">Secure payment webhook URL for real-time updates.</p>
                      <div className="flex gap-2">
                        <input type="text" defaultValue="https://api.laketana-tours.com/webhooks/payment" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button className="px-4 py-2.5 bg-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-300 transition-colors">Test</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ===== Add Service Modal ===== */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-gray-900">Create New Service</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Service added (mock)!'); setIsAdding(false) }} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Service Title</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Sunset Eco Boat Tour" required />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Category</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Eco Lodge</option>
                    <option>Boat Tour</option>
                    <option>Cultural Tour</option>
                    <option>Nature Walk</option>
                    <option>Monastery Visit</option>
                    <option>Adventure Package</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Price ($)</label>
                  <input type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="45" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Description</label>
                  <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 h-28" placeholder="Describe your service and eco-features..."></textarea>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Images</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <FaPlus className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Upload images (max 5)</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <input type="checkbox" id="ecoCheck" className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500" />
                <label htmlFor="ecoCheck" className="text-sm font-semibold text-emerald-800">This is an eco-certified service</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all">Create Listing</button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
