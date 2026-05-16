import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  FaChartBar, FaStore, FaUsers, FaCalendarCheck, FaDollarSign,
  FaLeaf, FaStar, FaBell, FaShieldAlt, FaSignOutAlt, FaBars,
  FaTimes, FaCheck, FaBan, FaSearch, FaEye, FaDownload,
  FaChevronRight, FaFilter, FaSortAmountDown, FaPlus,
  FaTrash, FaReply, FaUserShield, FaKey, FaMobileAlt,
  FaGlobeAmericas, FaPercentage, FaHandHoldingHeart,
  FaRecycle, FaAward, FaClipboardList, FaUserCircle,
  FaCamera, FaLightbulb, FaArrowUp, FaArrowDown,
  FaExchangeAlt, FaBellSlash, FaExclamationTriangle,
  FaExclamationCircle, FaInfoCircle, FaCheckCircle,
  FaEnvelope, FaPaperPlane, FaHistory, FaLock,
  FaFileInvoice, FaMoneyBillWave, FaShip, FaHotel,
  FaUtensils, FaWater, FaTree, FaFlag
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import API from '../../utils/api'

const tabs = [
  { id: 'overview', label: 'Overview', icon: <FaChartBar /> },
  { id: 'vendors', label: 'Vendors', icon: <FaStore /> },
  { id: 'users', label: 'Users', icon: <FaUsers /> },
  { id: 'bookings', label: 'Bookings', icon: <FaCalendarCheck /> },
  { id: 'payments', label: 'Payments', icon: <FaDollarSign /> },
  { id: 'eco', label: 'Eco-Compliance', icon: <FaLeaf /> },
  { id: 'reviews', label: 'Reviews', icon: <FaStar /> },
  { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  { id: 'security', label: 'Security & Audit', icon: <FaShieldAlt /> },
]

const categoryIcons: Record<string, any> = { tour: <FaShip />, hotel: <FaHotel />, food: <FaUtensils />, monastery: <FaWater />, boat: <FaShip />, waterfall: <FaTree /> }

const mockVendors = [
  { id: '1', businessName: 'EcoTours Bahir Dar', user: { name: 'Abebe K.', email: 'abebe@ecotours.com' }, ecoCertification: true, status: 'approved', rating: 4.8, totalBookings: 156, revenue: 12450 },
  { id: '2', businessName: 'Tana Boat Services', user: { name: 'Meron T.', email: 'meron@tanaboat.com' }, ecoCertification: false, status: 'pending', rating: 4.2, totalBookings: 89, revenue: 6700 },
  { id: '3', businessName: 'Green Lodge Lake Tana', user: { name: 'Dawit H.', email: 'dawit@greenlodge.com' }, ecoCertification: true, status: 'approved', rating: 4.9, totalBookings: 234, revenue: 28900 },
  { id: '4', businessName: 'Blue Nile Guides', user: { name: 'Sara W.', email: 'sara@bluenile.com' }, ecoCertification: false, status: 'suspended', rating: 3.5, totalBookings: 12, revenue: 980 },
  { id: '5', businessName: 'Monastery Tour Experts', user: { name: 'Yonas A.', email: 'yonas@monastery.com' }, ecoCertification: true, status: 'pending', rating: 4.6, totalBookings: 67, revenue: 5400 },
]

const mockUsers = [
  { id: '1', name: 'John Traveler', email: 'john@email.com', role: 'tourist', isVerified: true, createdAt: '2026-01-15', loginAttempts: 0 },
  { id: '2', name: 'Sarah Adventurer', email: 'sarah@email.com', role: 'tourist', isVerified: true, createdAt: '2026-02-20', loginAttempts: 0 },
  { id: '3', name: 'Admin User', email: 'admin@laketana.com', role: 'admin', isVerified: true, createdAt: '2025-12-01', loginAttempts: 0 },
  { id: '4', name: 'Suspicious User', email: 'spam@email.com', role: 'tourist', isVerified: false, createdAt: '2026-05-01', loginAttempts: 12 },
]

const mockBookings = [
  { id: '1', user: { name: 'John D.' }, service: { title: 'Lake Tana Boat Tour', vendor: { businessName: 'EcoTours Bahir Dar' } }, totalAmount: 85, status: 'confirmed', paymentStatus: 'paid', guests: 2, date: '2026-05-20' },
  { id: '2', user: { name: 'Emma W.' }, service: { title: 'Monastery Guided Tour', vendor: { businessName: 'Monastery Tour Experts' } }, totalAmount: 120, status: 'pending', paymentStatus: 'unpaid', guests: 4, date: '2026-06-01' },
  { id: '3', user: { name: 'Mike R.' }, service: { title: 'Eco-Lodge Stay', vendor: { businessName: 'Green Lodge Lake Tana' } }, totalAmount: 450, status: 'completed', paymentStatus: 'paid', guests: 2, date: '2026-04-15' },
  { id: '4', user: { name: 'Lisa K.' }, service: { title: 'Boat Tour', vendor: { businessName: 'Tana Boat Services' } }, totalAmount: 65, status: 'cancelled', paymentStatus: 'unpaid', guests: 1, date: '2026-05-10' },
]

const mockTransactions = [
  { id: '1', transactionId: 'TXN-001', user: 'John D.', service: 'Lake Tana Boat Tour', amount: 85, commission: 4.25, status: 'paid', date: '2026-05-20', method: 'Telebirr' },
  { id: '2', transactionId: 'TXN-002', user: 'Emma W.', service: 'Monastery Guided Tour', amount: 120, commission: 6.00, status: 'paid', date: '2026-05-19', method: 'PayPal' },
  { id: '3', transactionId: 'TXN-003', user: 'Mike R.', service: 'Eco-Lodge Stay', amount: 450, commission: 22.50, status: 'paid', date: '2026-04-15', method: 'CBE Birr' },
  { id: '4', transactionId: 'TXN-004', user: 'Lisa K.', service: 'Boat Tour', amount: 65, commission: 3.25, status: 'refunded', date: '2026-05-10', method: 'Amole' },
]

const mockReviews = [
  { id: '1', user: { name: 'Alice M.' }, service: { title: 'Lake Tana Boat Tour', vendor: { businessName: 'EcoTours' } }, rating: 5, comment: 'Amazing experience! The guide was very knowledgeable.', createdAt: '2026-05-18' },
  { id: '2', user: { name: 'Bob J.' }, service: { title: 'Monastery Tour', vendor: { businessName: 'Monastery Experts' } }, rating: 2, comment: 'Disappointing. The boat was late and the guide rushed us.', createdAt: '2026-05-15' },
  { id: '3', user: { name: 'Spam User' }, service: { title: 'Eco-Lodge', vendor: { businessName: 'Green Lodge' } }, rating: 5, comment: 'Great place!!! Check out my website for cheap tours!!! www.spam-link.com', createdAt: '2026-05-14' },
]

const statusColors: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', suspended: 'bg-red-100 text-red-700', rejected: 'bg-red-100 text-red-700', blacklisted: 'bg-gray-100 text-gray-700' }

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState<any>({ users: 0, vendors: 0, services: 0, bookings: 0, pendingVendors: 0, totalRevenue: 0 })
  const [vendorFilter, setVendorFilter] = useState('all')
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all' })

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return }
    if (!loading && user && user.role !== 'admin') { router.push('/'); return }
    if (user?.role === 'admin') {
      API.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {})
    }
  }, [loading, user, router])

  if (loading || !user || user.role !== 'admin') return null

  const handleLogout = async () => { await logout(); router.push('/login') }

  const TabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab stats={stats} />
      case 'vendors': return <VendorsTab vendors={mockVendors} filter={vendorFilter} setFilter={setVendorFilter} />
      case 'users': return <UsersTab users={mockUsers} />
      case 'bookings': return <BookingsTab bookings={mockBookings} />
      case 'payments': return <PaymentsTab transactions={mockTransactions} />
      case 'eco': return <EcoTab vendors={mockVendors} />
      case 'reviews': return <ReviewsTab reviews={mockReviews} />
      case 'notifications': return <NotificationsTab announcement={announcement} setAnnouncement={setAnnouncement} />
      case 'security': return <SecurityTab />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-64 overflow-hidden lg:overflow-visible'}`}>
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm"><FaLeaf /></div>
            <div>
              <div className="text-sm font-bold">Lake Tana</div>
              <div className="text-[9px] text-blue-200 font-medium">Admin Panel</div>
            </div>
          </Link>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-blue-100 hover:bg-white/5'}`}>
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="pt-4 border-t border-white/10 mt-4">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 transition-all"><FaSignOutAlt /> Logout</button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><FaBars /></button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">{user?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border text-sm"><FaUserCircle className="text-gray-400" /> <span className="text-gray-600 font-medium">{user?.name}</span> <span className="text-[10px] font-semibold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Admin</span></div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition text-sm font-medium hidden sm:block">Logout</button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          <TabContent />
        </div>
      </div>
    </div>
  )
}

// ==================== OVERVIEW TAB ====================
function OverviewTab({ stats }: { stats: any }) {
  const statCards = [
    { label: 'Total Users', value: stats.users, icon: <FaUsers />, color: 'from-blue-500 to-cyan-600' },
    { label: 'Vendors', value: stats.vendors, icon: <FaStore />, color: 'from-amber-500 to-orange-600' },
    { label: 'Bookings', value: stats.bookings, icon: <FaCalendarCheck />, color: 'from-emerald-500 to-green-600' },
    { label: 'Revenue', value: `$${stats.totalRevenue?.toLocaleString() || '0'}`, icon: <FaDollarSign />, color: 'from-purple-500 to-indigo-600' },
    { label: 'Pending Vendors', value: stats.pendingVendors, icon: <FaExclamationTriangle />, color: 'from-red-500 to-rose-600' },
    { label: 'Services', value: stats.services, icon: <FaTree />, color: 'from-teal-500 to-cyan-600' },
  ]

  const weekData = [4200, 5600, 3800, 7200, 6100, 8900, 9500]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxVal = Math.max(...weekData)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><FaChartBar className="text-primary" /> Weekly Revenue</h3>
          <div className="h-48 flex items-end justify-between gap-3">
            {weekData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500">${(v / 1000).toFixed(1)}k</span>
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-blue-500 rounded-t-lg transition-all duration-500" style={{ height: `${(v / maxVal) * 100}%` }}></div>
                </div>
                <span className="text-[10px] text-gray-400">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><FaLeaf className="text-emerald-500" /> Platform Health</h3>
          <div className="space-y-4">
            {[
              { label: 'Vendor Approval Rate', value: 78, color: 'bg-emerald-500' },
              { label: 'Booking Completion', value: 92, color: 'bg-blue-500' },
              { label: 'Avg Eco-Score', value: 74, color: 'bg-amber-500' },
              { label: 'User Satisfaction', value: 88, color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-600 font-medium">{item.label}</span><span className="font-bold text-gray-900">{item.value}%</span></div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.value}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== VENDORS TAB ====================
function VendorsTab({ vendors, filter, setFilter }: { vendors: any[]; filter: string; setFilter: (f: string) => void }) {
  const filtered = filter === 'all' ? vendors : vendors.filter(v => v.status === filter)
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2><p className="text-sm text-gray-500">Approve, suspend, and verify vendors</p></div>
        <div className="flex bg-gray-100 p-1 rounded-xl">{['all', 'pending', 'approved', 'suspended'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr>{['Vendor', 'Contact', 'Eco-Badge', 'Rating', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {filtered.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-blue-600/10 flex items-center justify-center text-primary font-bold text-xs">{v.businessName.charAt(0)}</div><span className="font-semibold text-gray-900">{v.businessName}</span></div></td>
                  <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{v.user?.name}</p><p className="text-xs text-gray-500">{v.user?.email}</p></td>
                  <td className="px-6 py-4">{v.ecoCertification ? <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold"><FaCheckCircle /> Certified</span> : <span className="text-gray-400 text-xs">—</span>}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-1 text-amber-400 text-sm">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className={i < Math.round(v.rating) ? '' : 'text-gray-200'} />)}<span className="text-gray-500 text-xs ml-1">{v.rating}</span></div></td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[v.status] || 'bg-gray-100 text-gray-700'}`}>{v.status}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    {v.status === 'pending' && <><button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100"><FaCheck className="inline mr-1" />Approve</button><button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"><FaBan className="inline mr-1" />Reject</button></>}
                    {v.status === 'approved' && <><button className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100"><FaBan className="inline mr-1" />Suspend</button><button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"><FaCheckCircle className="inline mr-1" />Badge</button></>}
                    {v.status === 'suspended' && <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100"><FaCheck className="inline mr-1" />Reinstate</button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== USERS TAB ====================
function UsersTab({ users }: { users: any[] }) {
  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">User Management</h2><p className="text-sm text-gray-500">Manage tourist accounts, roles, and monitor suspicious activity</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr>{['Name', 'Email', 'Role', 'Verified', 'Activity', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">{u.name.charAt(0)}</div><span className="font-semibold text-gray-900">{u.name}</span></div></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'vendor' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.role}</span></td>
                  <td className="px-6 py-4">{u.isVerified ? <span className="text-emerald-600 text-sm"><FaCheckCircle className="inline" /> Verified</span> : <span className="text-gray-400 text-sm">Unverified</span>}</td>
                  <td className="px-6 py-4">{u.loginAttempts > 5 ? <span className="text-red-600 text-xs font-bold flex items-center gap-1"><FaExclamationTriangle /> {u.loginAttempts} failed attempts</span> : <span className="text-gray-400 text-xs">Normal</span>}</td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"><FaBan className="inline mr-1" />Deactivate</button>
                    <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"><FaKey className="inline mr-1" />Reset PW</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== BOOKINGS TAB ====================
function BookingsTab({ bookings }: { bookings: any[] }) {
  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Booking Oversight</h2><p className="text-sm text-gray-500">View all bookings, resolve disputes, override when necessary</p></div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr>{['Service', 'Tourist', 'Vendor', 'Amount', 'Status', 'Payment', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {bookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{b.service?.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.user?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.service?.vendor?.businessName}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">${b.totalAmount}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'pending' ? 'bg-amber-100 text-amber-700' : b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span></td>
                  <td className="px-6 py-4"><span className={`text-xs font-bold ${b.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-gray-400'}`}>{b.paymentStatus}</span></td>
                  <td className="px-6 py-4"><div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100"><FaExclamationTriangle className="inline mr-1" />Dispute</button>
                    <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"><FaBan className="inline mr-1" />Cancel</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== PAYMENTS TAB ====================
function PaymentsTab({ transactions }: { transactions: any[] }) {
  const totalCommission = transactions.reduce((s, t) => s + (t.status === 'paid' ? t.commission : 0), 0)
  const totalRevenue = transactions.reduce((s, t) => s + (t.status === 'paid' ? t.amount : 0), 0)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p><p className="text-2xl font-black text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission Earned (5%)</p><p className="text-2xl font-black text-emerald-600 mt-1">${totalCommission.toLocaleString()}</p></div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission Rate</p><p className="text-2xl font-black text-gray-900 mt-1">5%</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Transaction History</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-sm font-semibold hover:bg-primary/10"><FaDownload /> Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr>{['Transaction ID', 'User', 'Service', 'Amount', 'Commission', 'Method', 'Status'].map(h => <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 text-xs font-mono font-bold text-gray-900">{t.transactionId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.service}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">${t.amount}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 font-semibold">${t.commission.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.method}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== ECO TAB ====================
function EcoTab({ vendors }: { vendors: any[] }) {
  const certified = vendors.filter(v => v.ecoCertification)
  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Eco-Tourism Compliance</h2><p className="text-sm text-gray-500">Track sustainability scores and approve eco-badges</p></div>
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Eco-Certified Vendors</p><p className="text-3xl font-black text-gray-900 mt-2">{certified.length}/{vendors.length}</p><p className="text-sm text-emerald-600 mt-1">{(certified.length / vendors.length * 100).toFixed(0)}% certified</p></div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100"><p className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Badge Requests</p><p className="text-3xl font-black text-gray-900 mt-2">{vendors.filter(v => v.status === 'pending').length}</p></div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Avg Eco-Score</p><p className="text-3xl font-black text-gray-900 mt-2">74%</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b"><h3 className="font-bold text-gray-900">Vendor Eco-Status</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr>{['Vendor', 'Eco-Badge', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {vendors.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{v.businessName}</td>
                  <td className="px-6 py-4">{v.ecoCertification ? <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold"><FaCheckCircle /> Certified</span> : <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg text-xs"><FaLeaf /> Pending</span>}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[v.status] || ''}`}>{v.status}</span></td>
                  <td className="px-6 py-4">{!v.ecoCertification && <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100"><FaCheck className="inline mr-1" /> Approve Badge</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== REVIEWS TAB ====================
function ReviewsTab({ reviews }: { reviews: any[] }) {
  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Review Moderation</h2><p className="text-sm text-gray-500">Monitor reviews for authenticity and remove offensive content</p></div>
      <div className="space-y-4">
        {reviews.map((r: any) => (
          <div key={r.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">{r.user?.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap"><span className="font-bold text-gray-900">{r.user?.name}</span><span className="text-xs text-gray-400">{r.createdAt}</span><span className="text-xs text-gray-400">·</span><span className="text-xs text-gray-500">{r.service?.title}</span><span className="text-xs text-gray-500">·</span><span className="text-xs text-gray-500">{r.service?.vendor?.businessName}</span></div>
                  <div className="flex text-amber-400 text-xs my-2">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className={i < r.rating ? '' : 'text-gray-200'} />)}</div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                  {r.comment.includes('www.') && <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-lg text-xs text-red-600 font-bold"><FaExclamationTriangle /> Suspected spam</div>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"><FaTrash /> Remove</button>
                <button className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100"><FaFlag /> Flag</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== NOTIFICATIONS TAB ====================
function NotificationsTab({ announcement, setAnnouncement }: { announcement: { title: string; message: string; target: string }; setAnnouncement: (a: any) => void }) {
  const [sent, setSent] = useState(false)
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Announcement</h2>
        <p className="text-sm text-gray-500 mb-6">Send system-wide announcements to all users</p>
        <form onSubmit={handleSend} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          {sent && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2"><FaCheckCircle /> Announcement sent successfully!</div>}
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Title</label><input type="text" value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} placeholder="e.g., Platform Update" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Message</label><textarea rows={4} value={announcement.message} onChange={e => setAnnouncement({ ...announcement, message: e.target.value })} placeholder="Write your announcement..." required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50 resize-none" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-2">Target</label><select value={announcement.target} onChange={e => setAnnouncement({ ...announcement, target: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50"><option value="all">All Users</option><option value="tourists">Tourists Only</option><option value="vendors">Vendors Only</option></select></div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"><FaPaperPlane /> Send Announcement</button>
        </form>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Alerts</h2>
        <p className="text-sm text-gray-500 mb-6">Real-time alerts for failed payments and booking anomalies</p>
        <div className="space-y-3">
          {[
            { type: 'payment', icon: <FaExclamationCircle className="text-red-500" />, message: 'Payment failed for Booking #1042 — Insufficient funds', time: '5 min ago', color: 'bg-red-50 border-red-100' },
            { type: 'fraud', icon: <FaExclamationTriangle className="text-amber-500" />, message: 'Suspicious login attempt detected — IP: 45.33.xx.xx', time: '12 min ago', color: 'bg-amber-50 border-amber-100' },
            { type: 'booking', icon: <FaInfoCircle className="text-blue-500" />, message: 'Booking anomaly: 5 same-day cancellations from Vendor #3', time: '1 hour ago', color: 'bg-blue-50 border-blue-100' },
            { type: 'system', icon: <FaCheckCircle className="text-emerald-500" />, message: 'System backup completed successfully', time: '2 hours ago', color: 'bg-emerald-50 border-emerald-100' },
            { type: 'vendor', icon: <FaStore className="text-purple-500" />, message: 'New vendor registration pending approval: Blue Nile Eco Tours', time: '3 hours ago', color: 'bg-purple-50 border-purple-100' },
          ].map((alert, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${alert.color}`}>
              <span className="text-lg mt-0.5">{alert.icon}</span>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900">{alert.message}</p><p className="text-xs text-gray-500 mt-0.5">{alert.time}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== SECURITY TAB ====================
function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false)
  return (
    <div>
      <div className="mb-6"><h2 className="text-2xl font-bold text-gray-900">Security & Audit</h2><p className="text-sm text-gray-500">Role-based access, audit logs, and security settings</p></div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FaUserShield className="text-primary" /> Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b"><div><p className="font-medium text-gray-900">Two-Factor Authentication</p><p className="text-xs text-gray-500">Add an extra layer of security to your admin account</p></div><button onClick={() => setTwoFA(!twoFA)} className={`relative w-12 h-6 rounded-full transition-colors ${twoFA ? 'bg-emerald-500' : 'bg-gray-200'}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${twoFA ? 'translate-x-6' : 'translate-x-0.5'}`}></div></button></div>
              <div className="flex items-center justify-between py-3 border-b"><div><p className="font-medium text-gray-900">Session Timeout</p><p className="text-xs text-gray-500">Auto-logout after inactivity</p></div><span className="text-sm font-semibold text-gray-900">30 min</span></div>
              <div className="flex items-center justify-between py-3"><div><p className="font-medium text-gray-900">Login Notifications</p><p className="text-xs text-gray-500">Email alerts for new admin logins</p></div><div className="relative w-12 h-6 rounded-full bg-emerald-500"><div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm translate-x-6"></div></div></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FaLock className="text-primary" /> Active Sessions</h3>
            <div className="space-y-3">
              {[
                { device: 'Chrome on Windows', ip: '196.188.xx.xx', time: 'Current session', active: true },
                { device: 'Safari on iPhone', ip: '196.188.xx.xx', time: '2 hours ago', active: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0"><div><p className="text-sm font-medium text-gray-900">{s.device}</p><p className="text-xs text-gray-500">{s.ip} · {s.time}</p></div>{s.active ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <button className="text-xs text-red-500 font-semibold hover:underline">Revoke</button>}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FaHistory className="text-primary" /> Recent Audit Logs</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[
                { action: 'Vendor approved', admin: 'Admin', target: 'EcoTours Bahir Dar', time: '10 min ago' },
                { action: 'Booking cancelled', admin: 'Admin', target: 'Booking #1042', time: '25 min ago' },
                { action: 'Refund approved', admin: 'Admin', target: 'Booking #1038 — $65.00', time: '1 hour ago' },
                { action: 'Vendor suspended', admin: 'Admin', target: 'Blue Nile Guides', time: '2 hours ago' },
                { action: 'Review removed', admin: 'Admin', target: 'Spam review #12', time: '3 hours ago' },
                { action: 'Eco-badge approved', admin: 'Admin', target: 'Green Lodge Lake Tana', time: '5 hours ago' },
                { action: 'User role changed', admin: 'Admin', target: 'user@email.com → vendor', time: '1 day ago' },
                { action: 'Announcement sent', admin: 'Admin', target: 'Platform update v2.1', time: '2 days ago' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">{log.admin.charAt(0)}</div><div className="min-w-0"><p className="text-sm font-medium text-gray-900">{log.action}</p><p className="text-xs text-gray-500">{log.target} · {log.time}</p></div></div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
            <h3 className="font-bold text-gray-900 mb-2"><FaShieldAlt className="inline mr-2 text-purple-600" /> GDPR Compliance</h3>
            <p className="text-sm text-gray-600 mb-4">All admin actions are logged and auditable. Data is encrypted at rest and in transit. User data can be exported or deleted upon request.</p>
            <div className="flex gap-2"><button className="px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 border hover:shadow-sm"><FaDownload className="inline mr-1" /> Export User Data</button></div>
          </div>
        </div>
      </div>
    </div>
  )
}
