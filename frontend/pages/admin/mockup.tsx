import {
  FaChartBar, FaUsers, FaStore, FaCalendarCheck, FaDollarSign,
  FaLeaf, FaStar, FaFileAlt, FaBell, FaEnvelope, FaCog,
  FaCheck, FaTimes, FaQuoteLeft, FaStar as FaStarFull,
  FaChevronDown,
  FaArrowUp, FaExclamationTriangle, FaClock, FaCheckCircle
} from 'react-icons/fa'

const navItems = [
  { icon: <FaChartBar />, label: 'Dashboard', active: false },
  { icon: <FaUsers />, label: 'User Management', active: false },
  { icon: <FaStore />, label: 'Vendor Management', active: false },
  { icon: <FaCalendarCheck />, label: 'Bookings', active: false },
  { icon: <FaDollarSign />, label: 'Payments', active: true },
  { icon: <FaLeaf />, label: 'Eco Compliance', active: false },
  { icon: <FaStar />, label: 'Reviews', active: false },
  { icon: <FaFileAlt />, label: 'Reports', active: false },
]

const metricCards = [
  { label: 'Total Bookings', value: '1,250', icon: <FaCalendarCheck />, color: 'from-sky-400 to-blue-500' },
  { label: 'Revenue This Month', value: '$24,540', badge: '+12%', badgeColor: 'bg-emerald-500', icon: <FaDollarSign />, color: 'from-emerald-400 to-teal-500' },
  { label: 'New Vendors Pending', value: '8', icon: <FaStore />, color: 'from-orange-400 to-amber-500' },
  { label: 'Refund Requests', value: '5', icon: <FaExclamationTriangle />, color: 'from-rose-400 to-pink-500' },
]

const chartData = [
  { month: 'Jan', blue: 400, green: 800 },
  { month: 'Feb', blue: 600, green: 950 },
  { month: 'Mar', blue: 800, green: 1100 },
  { month: 'Apr', blue: 550, green: 1300 },
  { month: 'May', blue: 900, green: 1450 },
  { month: 'Jun', blue: 1100, green: 1700 },
]

const bookingStatuses = [
  { label: 'Upcoming', value: 320, color: 'bg-blue-500', light: 'bg-blue-50' },
  { label: 'Completed', value: 875, color: 'bg-emerald-500', light: 'bg-emerald-50' },
  { label: 'Cancelled', value: 5, color: 'bg-red-400', light: 'bg-red-50' },
]

const ecoData = [
  { label: 'Waste Management', value: 42, color: 'bg-emerald-400' },
  { label: 'Renewable Energy', value: 28, color: 'bg-orange-400' },
  { label: 'Water Conservation', value: 15, color: 'bg-emerald-500' },
]

const vendorApprovals = [
  { name: 'Green Lake Lodge', type: 'Accommodation', eco: false },
  { name: 'Nile Explorers', type: 'Tour Operator', eco: false },
]

const recentReviews = [
  { name: 'Sarah M.', avatar: 'S', text: 'Absolutely stunning experience on Lake Tana. The boat ride was serene and our guide was incredibly knowledgeable about the monasteries.', rating: 5 },
  { name: 'James K.', avatar: 'J', text: 'Green Lake Lodge was the highlight of our trip. Eco-friendly and luxurious at the same time. Highly recommend!', rating: 5 },
  { name: 'Priya R.', avatar: 'P', text: 'The bird watching tour exceeded all expectations. Saw over 30 species in one morning!', rating: 5 },
]

export default function AdminMockup() {
  const maxVal = Math.max(...chartData.map(d => Math.max(d.blue, d.green)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]">
      <div className="flex h-screen overflow-hidden">

        {/* ===== SIDEBAR ===== */}
        <aside className="w-64 shrink-0 h-screen bg-white/40 backdrop-blur-xl border-r border-white/50 shadow-lg relative overflow-hidden hidden lg:flex flex-col">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <FaLeaf className="text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">LakeTana</h1>
                <p className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">Admin Dashboard</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-white/80 text-blue-600 shadow-md shadow-blue-100/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto relative">
            <svg viewBox="0 0 256 200" className="w-full h-auto opacity-60" preserveAspectRatio="xMidYMax meet">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="256" height="200" fill="url(#skyGrad)" />
              <ellipse cx="128" cy="170" rx="160" ry="40" fill="url(#lakeGrad)" />
              <rect x="0" y="165" width="256" height="35" fill="#bae6fd" fillOpacity="0.2" />
              {[0, 1, 2].map(i => (
                <ellipse key={i} cx={60 + i * 60} cy={130} rx="40" ry="6" fill="white" fillOpacity={0.08 - i * 0.02} />
              ))}
              <path d="M160 160 Q170 145, 185 140 Q195 138, 190 145 Q185 152, 178 158 Z" fill="#94a3b8" fillOpacity="0.3" />
              <line x1="160" y1="160" x2="155" y2="168" stroke="#94a3b8" strokeWidth="0.8" strokeOpacity="0.3" />
              <line x1="155" y1="168" x2="140" y2="175" stroke="#94a3b8" strokeWidth="0.5" strokeOpacity="0.2" />
              <path d="M128 155 Q135 140, 145 138 Q152 136, 150 142 Q148 148, 140 153 Z" fill="#64748b" fillOpacity="0.25" />
              <line x1="128" y1="155" x2="120" y2="168" stroke="#64748b" strokeWidth="0.6" strokeOpacity="0.2" />
              <circle cx="95" cy="105" r="8" fill="white" fillOpacity="0.05" />
              <circle cx="105" cy="98" r="5" fill="white" fillOpacity="0.04" />
              <circle cx="85" cy="110" r="3" fill="white" fillOpacity="0.03" />
            </svg>
          </div>
        </aside>

        {/* ===== MAIN ===== */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ===== TOP NAVBAR ===== */}
          <header className="shrink-0 bg-white/50 backdrop-blur-xl border-b border-white/60 shadow-sm">
            <div className="flex items-center justify-between px-6 lg:px-8 h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-sky-200">
                  LT
                </div>
                <span className="text-sm font-bold text-gray-700 tracking-tight">LakeTana Admin Dashboard</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="relative p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-600 transition">
                  <FaBell className="text-lg" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
                <button className="relative p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-600 transition">
                  <FaEnvelope className="text-lg" />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white">3</span>
                </button>
                <button className="relative p-2 rounded-xl hover:bg-white/60 text-gray-400 hover:text-gray-600 transition">
                  <FaCog className="text-lg" />
                </button>
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <div className="flex items-center gap-2 pl-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-sky-200">
                    A
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-700 leading-tight">Admin</p>
                    <p className="text-[10px] text-gray-400 leading-tight">Super Admin</p>
                  </div>
                  <FaChevronDown className="text-gray-300 text-xs ml-1" />
                </div>
              </div>
            </div>
          </header>

          {/* ===== MAIN CONTENT ===== */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

              {/* Page Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-sm text-gray-400 mt-1">Welcome back, Admin. Here is your overview.</p>
              </div>

              {/* ===== METRIC CARDS ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {metricCards.map((card) => (
                  <div
                    key={card.label}
                    className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/70 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white shadow-lg`}>
                        {card.icon}
                      </div>
                      {card.badge && (
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${card.badgeColor}`}>
                          <FaArrowUp className="text-[8px]" /> {card.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">{card.value}</p>
                    <p className="text-xs font-medium text-gray-400 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* ===== TWO COLUMN LAYOUT ===== */}
              <div className="grid xl:grid-cols-3 gap-6 mb-8">

                {/* LEFT: Bookings Overview (spans 2 cols) */}
                <div className="xl:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/70 shadow-lg shadow-gray-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-gray-800">Bookings Overview</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className="text-xs text-gray-400">2025</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-gray-400">2026</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="h-48 mb-6">
                    <svg viewBox="0 0 540 160" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      {[0, 40, 80, 120].map(y => (
                        <line key={y} x1="30" y1={y} x2="530" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
                      ))}

                      {/* Blue area */}
                      <path
                        d={`M30 ${160 - (chartData[0].blue / maxVal) * 120}
                          ${chartData.map((d, i) => `L${30 + i * 85} ${160 - (d.blue / maxVal) * 120}`).join(' ')}
                          L${30 + (chartData.length - 1) * 85} 160 L30 160 Z`}
                        fill="url(#blueArea)"
                      />

                      {/* Green area */}
                      <path
                        d={`M30 ${160 - (chartData[0].green / maxVal) * 120}
                          ${chartData.map((d, i) => `L${30 + i * 85} ${160 - (d.green / maxVal) * 120}`).join(' ')}
                          L${30 + (chartData.length - 1) * 85} 160 L30 160 Z`}
                        fill="url(#greenArea)"
                      />

                      {/* Blue line */}
                      <path
                        d={`M30 ${160 - (chartData[0].blue / maxVal) * 120} ${chartData.map((d, i) => `L${30 + i * 85} ${160 - (d.blue / maxVal) * 120}`).join(' ')}`}
                        fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      />

                      {/* Green line */}
                      <path
                        d={`M30 ${160 - (chartData[0].green / maxVal) * 120} ${chartData.map((d, i) => `L${30 + i * 85} ${160 - (d.green / maxVal) * 120}`).join(' ')}`}
                        fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      />

                      {/* Data points - blue */}
                      {chartData.map((d, i) => (
                        <circle key={`bp${i}`} cx={30 + i * 85} cy={160 - (d.blue / maxVal) * 120} r="3.5" fill="white" stroke="#3b82f6" strokeWidth="2" />
                      ))}

                      {/* Data points - green */}
                      {chartData.map((d, i) => (
                        <circle key={`gp${i}`} cx={30 + i * 85} cy={160 - (d.green / maxVal) * 120} r="3.5" fill="white" stroke="#10b981" strokeWidth="2" />
                      ))}

                      {/* X-axis labels */}
                      {chartData.map((d, i) => (
                        <text key={i} x={30 + i * 85} y="150" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="Inter, sans-serif">
                          {d.month}
                        </text>
                      ))}
                    </svg>
                  </div>

                  {/* Booking Statuses */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    {bookingStatuses.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                          {s.label === 'Upcoming' ? <FaClock /> : s.label === 'Completed' ? <FaCheckCircle /> : <FaTimes />}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-800">{s.value.toLocaleString()}</p>
                          <p className="text-[10px] font-medium text-gray-400">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">

                  {/* Earnings & Commission */}
                  <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/70 shadow-lg shadow-gray-200/50">
                    <h3 className="text-base font-bold text-gray-800 mb-4">Earnings & Commission</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-3xl font-black text-gray-800 tracking-tight">$58,230</p>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-1">Platform Commission</p>
                            <p className="text-xl font-bold text-emerald-600">$5,820</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                            10%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Eco Compliance Stats */}
                  <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/70 shadow-lg shadow-gray-200/50">
                    <h3 className="text-base font-bold text-gray-800 mb-4">Eco Compliance Stats</h3>
                    <div className="space-y-5">
                      {ecoData.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">{item.label}</span>
                            <span className="text-sm font-bold text-gray-800">{item.value}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full ${item.color} shadow-sm transition-all duration-500`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ===== BOTTOM GRID: Vendor Approvals + Recent Reviews ===== */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Vendor Approvals */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/70 shadow-lg shadow-gray-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Vendor Approvals</h3>
                  <div className="overflow-hidden rounded-xl border border-gray-100/80">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Vendor</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Type</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Eco Badge</th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {vendorApprovals.map((v) => (
                          <tr key={v.name} className="hover:bg-white/40 transition">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                  {v.name.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{v.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">{v.type}</td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
                                <FaTimes className="text-[8px]" /> Pending
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-1.5">
                                <button className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-100 border border-emerald-100/50 transition flex items-center gap-1">
                                  <FaCheck /> Approve
                                </button>
                                <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold hover:bg-blue-100 border border-blue-100/50 transition flex items-center gap-1">
                                  <FaTimes /> Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Reviews */}
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/70 shadow-lg shadow-gray-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Recent Reviews</h3>
                  <div className="space-y-4 mb-5">
                    {recentReviews.map((review) => (
                      <div key={review.name} className="p-4 rounded-xl bg-white/40 border border-gray-100/60">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {review.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-gray-700">{review.name}</span>
                              <div className="flex text-orange-400 text-[10px] gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <FaStarFull key={i} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              <FaQuoteLeft className="inline text-gray-300 mr-1 text-[10px]" />
                              {review.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-200">
                    Manage Reviews
                  </button>
                </div>

              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}
