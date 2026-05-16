import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaLeaf, FaTree, FaHandHoldingHeart, FaRecycle, FaChevronRight,
  FaAward, FaSeedling, FaSolarPanel, FaWater, FaGlobeAfrica,
  FaCalculator, FaDonate, FaHandsHelping, FaBookOpen,
  FaVideo, FaShieldAlt, FaCheckCircle, FaStar, FaUsers,
  FaMapMarkerAlt, FaSearch, FaFilter, FaDownload, FaArrowRight,
  FaQuoteLeft, FaLightbulb, FaTrash, FaHeart, FaCamera,
  FaChartLine, FaTrophy, FaMedal, FaPhone, FaEnvelope
} from 'react-icons/fa'
import { GiPlantWatering, GiWindmill } from 'react-icons/gi'

const tips = [
  { icon: <FaLeaf />, title: 'Travel Responsibly', desc: 'Respect local customs, dress modestly at religious sites, and always ask permission before taking photos of people.' },
  { icon: <FaWater />, title: 'Protect Lake Tana', desc: 'Never dispose of waste in the lake. Use reef-safe sunscreen and avoid single-use plastics.' },
  { icon: <FaTrash />, title: 'Reduce Plastic Use', desc: 'Carry a reusable water bottle and shopping bag. Many eco-lodges offer refill stations.' },
  { icon: <FaTree />, title: 'Stay on Trails', desc: 'When hiking, stick to marked trails to protect fragile ecosystems and avoid disturbing wildlife.' },
  { icon: <FaHandHoldingHeart />, title: 'Support Local', desc: 'Buy handicrafts directly from artisans, eat at local restaurants, and hire community guides.' },
  { icon: <FaCamera />, title: 'Respect Heritage Sites', desc: 'Do not touch ancient paintings or artifacts in monasteries. Follow photography rules.' },
]

const badgeTiers = [
  { tier: 'Bronze', icon: <FaMedal />, color: 'from-amber-600 to-yellow-500', req: '3+ criteria met', desc: 'Beginning the sustainability journey' },
  { tier: 'Silver', icon: <FaShieldAlt />, color: 'from-gray-400 to-gray-300', req: '5+ criteria met', desc: 'Committed to eco-friendly practices' },
  { tier: 'Gold', icon: <FaAward />, color: 'from-yellow-500 to-amber-400', req: '7+ criteria met', desc: 'Leader in sustainable tourism' },
  { tier: 'Platinum', icon: <FaTrophy />, color: 'from-cyan-400 to-blue-500', req: 'All criteria met', desc: 'Exemplary eco-tourism standard' },
]

const ecoVendors = [
  { name: 'Lake Tana Eco Lodge', badge: 'Platinum', category: 'Eco Lodge', location: 'Bahir Dar Shore', image: '/images/hotel.jpg', features: ['Solar Power', 'Rainwater Harvesting', 'Local Employment'] },
  { name: 'Green Boat Tours', badge: 'Gold', category: 'Boat Tour', location: 'Lake Tana', image: '/images/Boat.jpg', features: ['Electric Motors', 'No Plastic Policy', 'Guide Training'] },
  { name: 'Zege Monastery Guides', badge: 'Silver', category: 'Cultural Tour', location: 'Zege Peninsula', image: '/images/monastery.jpg', features: ['Heritage Preservation', 'Local Guides', 'Donation Program'] },
  { name: 'Blue Nile Eco Adventures', badge: 'Gold', category: 'Adventure', location: 'Blue Nile Falls', image: '/images/waterfall.jpg', features: ['Carbon Offsetting', 'Waste Management', 'Community Share'] },
]

const projects = [
  { title: 'Lake Tana Reforestation', icon: <FaTree />, goal: 'Plant 50,000 trees by 2027', progress: 68, donors: 340, raised: 12800 },
  { title: 'Monastery Preservation', icon: <FaBookOpen />, goal: 'Restore 5 ancient monasteries', progress: 42, donors: 185, raised: 6700 },
  { title: 'Clean Water Initiative', icon: <FaWater />, goal: 'Provide filters to 20 communities', progress: 55, donors: 220, raised: 9200 },
]

const ecoScoreFeatures = [
  { label: 'Eco-Friendly Bookings', value: 8, total: 12, icon: <FaLeaf /> },
  { label: 'Gold+ Vendors Supported', value: 5, total: 8, icon: <FaAward /> },
  { label: 'Community Contributions', value: 3, total: 6, icon: <FaHandHoldingHeart /> },
]

export default function EcoTourism() {
  const [activeSection, setActiveSection] = useState('overview')
  const [donationAmount, setDonationAmount] = useState(25)
  const [volForm, setVolForm] = useState({ name: '', email: '', interest: 'reforestation' })
  const [carbonActivity, setCarbonActivity] = useState('boat')
  const [volSubmitted, setVolSubmitted] = useState(false)
  const [donSubmitted, setDonSubmitted] = useState(false)

  const carbonFootprints: Record<string, { label: string; kg: number; tip: string }> = {
    boat: { label: 'Boat Tour (2hr)', kg: 12, tip: 'Offset by planting 1 tree (~15kg CO₂)' },
    walk: { label: 'Eco-Walk (2hr)', kg: 2, tip: 'Already low-impact. Keep it up!' },
    drive: { label: 'Car Transfer (20km)', kg: 8, tip: 'Offset by planting 1 tree or carpool' },
    lodge: { label: 'Eco-Lodge Stay (night)', kg: 6, tip: 'Solar-powered lodges reduce impact by 60%' },
  }

  const sectionNav = [
    { id: 'overview', label: 'Overview', icon: <FaGlobeAfrica /> },
    { id: 'badges', label: 'Eco-Badges', icon: <FaAward /> },
    { id: 'carbon', label: 'Footprint Tracker', icon: <FaCalculator /> },
    { id: 'community', label: 'Community', icon: <FaUsers /> },
    { id: 'tips', label: 'Sustainability Tips', icon: <FaLightbulb /> },
    { id: 'vendors', label: 'Green Vendors', icon: <FaLeaf /> },
    { id: 'dashboard', label: 'My Dashboard', icon: <FaChartLine /> },
    { id: 'volunteer', label: 'Volunteer & Donate', icon: <FaDonate /> },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-10 w-64 h-64 bg-emerald-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 right-10 w-80 h-80 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaLeaf className="mr-2 text-emerald-300" />
              <span className="text-white text-sm font-medium">Conscious Travel</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Eco-<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Tourism</span> Hub
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl">
              Travel responsibly. Protect Lake Tana&apos;s heritage. Track your impact.
            </p>
          </div>
        </div>
      </section>

      {/* Section Nav */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-thin">
            {sectionNav.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeSection === s.id
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-20">
        {/* ===== 1. OVERVIEW ===== */}
        {activeSection === 'overview' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaLeaf className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Sustainable Tourism
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500"> That Matters</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Every journey on our platform contributes to conservation, empowers communities, and preserves Lake Tana&apos;s natural and cultural heritage for generations to come.
              </p>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {[
                { value: '5,200+', label: 'Trees Planted', icon: <FaTree />, color: 'from-emerald-500 to-green-600' },
                { value: '340', label: 'Eco-Certified Vendors', icon: <FaAward />, color: 'from-amber-500 to-orange-600' },
                { value: '12.5T', label: 'CO₂ Offset (kg)', icon: <FaGlobeAfrica />, color: 'from-blue-500 to-cyan-600' },
                { value: '85%', label: 'Community Revenue', icon: <FaUsers />, color: 'from-purple-500 to-pink-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-2xl shadow-md`}>{s.icon}</div>
                  <div className="text-3xl font-black text-gray-900">{s.value}</div>
                  <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Badge Tiers Preview */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 mb-16">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Eco-Badge Certification Tiers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badgeTiers.map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-all">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white text-2xl shadow-md`}>{b.icon}</div>
                    <h4 className="font-bold text-gray-900 text-lg">{b.tier}</h4>
                    <p className="text-xs text-gray-500 mt-1">{b.req} · {b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Carbon Calculator */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaCalculator className="text-emerald-500" /> Quick Carbon Check
              </h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select an activity:</label>
                  <div className="space-y-2">
                    {Object.entries(carbonFootprints).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setCarbonActivity(key)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                          carbonActivity === key
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center p-8 bg-gray-50 rounded-2xl">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                    {carbonFootprints[carbonActivity].kg}
                  </div>
                  <div className="text-gray-500 font-semibold mt-1">kg CO₂</div>
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700 border border-emerald-200">
                    {carbonFootprints[carbonActivity].tip}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== 2. ECO-BADGES ===== */}
        {activeSection === 'badges' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaAward className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Certification Program</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Eco-Badge Certification</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Vendors earn badges by meeting strict sustainability criteria. Badges build trust and help you choose truly eco-friendly experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {badgeTiers.map((b, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-all">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white text-4xl shadow-lg`}>{b.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{b.tier}</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-3">{b.req}</p>
                  <p className="text-sm text-gray-600">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Criteria */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Sustainability Criteria</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: <FaSolarPanel />, label: 'Renewable Energy', desc: 'Solar or wind power for operations' },
                  { icon: <FaTrash />, label: 'Waste Reduction', desc: 'Recycling program & no single-use plastics' },
                  { icon: <FaUsers />, label: 'Local Employment', desc: '80%+ staff from local communities' },
                  { icon: <FaWater />, label: 'Water Conservation', desc: 'Rainwater harvesting & efficient fixtures' },
                  { icon: <FaTree />, label: 'Carbon Offsetting', desc: 'Tree planting & carbon credits' },
                  { icon: <FaHandHoldingHeart />, label: 'Community Investment', desc: 'Revenue share with local projects' },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shrink-0">{c.icon}</div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{c.label}</div>
                      <div className="text-xs text-gray-500">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== 3. CARBON FOOTPRINT TRACKER ===== */}
        {activeSection === 'carbon' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaCalculator className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Track Your Impact</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Carbon Footprint Tracker</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Calculate your travel emissions and offset them through our conservation programs.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Estimate Your Trip</h3>
                <div className="space-y-4">
                  {Object.entries(carbonFootprints).map(([key, val]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                        carbonActivity === key ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <input type="radio" name="activity" value={key} checked={carbonActivity === key} onChange={() => setCarbonActivity(key)} className="sr-only" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${carbonActivity === key ? 'border-emerald-500' : 'border-gray-300'}`}>
                        {carbonActivity === key && <div className="w-3 h-3 rounded-full bg-emerald-500"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900">{val.label}</div>
                        <div className="text-xs text-gray-500">{val.kg} kg CO₂</div>
                      </div>
                      <div className="text-lg font-bold text-emerald-600">{val.kg}kg</div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-4">Your Eco-Score</h3>
                  <div className="text-6xl font-black mb-2">72</div>
                  <p className="text-emerald-100">out of 100 — Good start!</p>
                </div>
                <div className="mt-8 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Low-impact bookings</span><span className="font-bold">8/12</span></div>
                    <div className="h-2 bg-white/20 rounded-full"><div className="h-2 bg-white rounded-full" style={{ width: '67%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Eco-vendors supported</span><span className="font-bold">5/8</span></div>
                    <div className="h-2 bg-white/20 rounded-full"><div className="h-2 bg-white rounded-full" style={{ width: '63%' }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Offset contributions</span><span className="font-bold">3/6</span></div>
                    <div className="h-2 bg-white/20 rounded-full"><div className="h-2 bg-white rounded-full" style={{ width: '50%' }}></div></div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                  <p className="text-sm font-semibold">💡 Tip: {carbonFootprints[carbonActivity].tip}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== 4. COMMUNITY ENGAGEMENT ===== */}
        {activeSection === 'community' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaUsers className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Community First</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Community Engagement</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Your tourism directly supports local communities across Lake Tana.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: <FaHandHoldingHeart className="text-3xl" />, title: 'Handicraft Support', desc: 'Buy authentic textiles, pottery, and jewelry directly from local artisans.', impact: '340+ artisans supported' },
                { icon: <FaUsers className="text-3xl" />, title: 'Cultural Events', desc: 'Attend traditional coffee ceremonies, music performances, and festivals.', impact: '50+ events annually' },
                { icon: <FaTree className="text-3xl" />, title: 'Conservation Projects', desc: 'Join community-led lake clean-ups and reforestation efforts.', impact: '12 ongoing projects' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-all">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">{c.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{c.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{c.desc}</p>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">{c.impact}</span>
                </div>
              ))}
            </div>

            {/* Project Progress */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Active Community Projects</h3>
            <div className="space-y-4">
              {projects.map((p, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xl shrink-0">{p.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{p.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{p.goal}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-emerald-600">{p.progress}% complete</span>
                          <span className="text-gray-500">${p.raised.toLocaleString()} raised</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full"><div className="h-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: `${p.progress}%` }}></div></div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FaUsers className="text-emerald-500" /> {p.donors} donors</span>
                        <button className="text-emerald-600 font-semibold hover:underline">Contribute →</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== 5. SUSTAINABILITY TIPS ===== */}
        {activeSection === 'tips' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaLightbulb className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Green Travel Guide</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Sustainability Tips</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Simple actions every traveler can take to protect Lake Tana&apos;s environment and culture.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tips.map((tip, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">{tip.icon}</div>
                    <h3 className="font-bold text-gray-900">{tip.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== 6. GREEN VENDOR DIRECTORY ===== */}
        {activeSection === 'vendors' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaLeaf className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Certified Partners</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Green Vendor Directory</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Browse vendors who meet our strict eco-certification standards.</p>
            </div>
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
              {['All', 'Eco Lodge', 'Boat Tour', 'Cultural Tour', 'Adventure'].map((f, i) => (
                <button key={i} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'}`}>{f}</button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {ecoVendors.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-40">
                    <Image src={v.image} alt={v.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <FaAward /> {v.badge}
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold text-lg">{v.name}</h3>
                      <p className="text-xs text-white/80">{v.category} · {v.location}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {v.features.map((f, j) => (
                        <span key={j} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold"><FaCheckCircle /> {f}</span>
                      ))}
                    </div>
                    <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-blue-700 transition-colors">
                      View Services <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== 7. ECO-TOURISM DASHBOARD ===== */}
        {activeSection === 'dashboard' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaChartLine className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Your Impact</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Eco-Tourism Dashboard</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Track your personal contribution to sustainable tourism around Lake Tana.</p>
            </div>

            {/* Score Overview */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-emerald-100">Personal Eco-Score</div>
                  <div className="text-6xl font-black mt-2">72</div>
                  <div className="text-sm text-emerald-100 mt-2">🌿 Eco-Conscious Traveler</div>
                </div>
                <div className="text-right">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <FaLeaf className="text-5xl" />
                  </div>
                  <div className="text-xs text-emerald-100 mt-2">Level 3 · 4 badges</div>
                </div>
              </div>
              <div className="mt-6 bg-white/20 rounded-full h-3">
                <div className="bg-white h-3 rounded-full transition-all" style={{ width: '72%' }}></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {ecoScoreFeatures.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">{f.icon}</div>
                    <span className="text-lg font-black text-gray-900">{f.value}/{f.total}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">{f.label}</div>
                  <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: `${(f.value / f.total) * 100}%` }}></div></div>
                </div>
              ))}
            </div>

            {/* Badges Earned */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Badges Earned</h3>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'First Eco-Booking', icon: <FaLeaf />, color: 'from-emerald-500 to-green-600' },
                  { label: 'Tree Planter', icon: <FaTree />, color: 'from-green-600 to-emerald-700' },
                  { label: 'Community Supporter', icon: <FaUsers />, color: 'from-blue-500 to-cyan-600' },
                  { label: '5x Eco-Traveler', icon: <FaStar />, color: 'from-amber-500 to-orange-600' },
                  { label: 'Offset Champion', icon: <FaGlobeAfrica />, color: 'from-purple-500 to-pink-600' },
                  { label: '???', icon: <FaAward />, color: 'from-gray-300 to-gray-400' },
                ].map((b, i) => (
                  <div key={i} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${b.color} text-white text-sm font-semibold shadow-sm`}>
                    {b.icon} {b.label}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== 8. VOLUNTEER & DONATE ===== */}
        {activeSection === 'volunteer' && (
          <section>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2 mb-4">
                <FaDonate className="mr-2 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-sm">Give Back</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Volunteer & Donate</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Support Lake Tana&apos;s conservation and community projects directly.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Donation */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <FaDonate className="text-3xl text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Donate to Conservation</h3>
                <p className="text-sm text-gray-600 mb-6">100% of your donation goes directly to Lake Tana projects.</p>
                <div className="flex gap-3 mb-6">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                        donationAmount === amt
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-transparent shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-semibold text-gray-700">Custom:</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button
                  onClick={() => { setDonSubmitted(true); setTimeout(() => setDonSubmitted(false), 3000) }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  {donSubmitted ? <><FaCheckCircle className="inline mr-2" /> Thank You!</> : `Donate $${donationAmount}`}
                </button>
                <p className="text-xs text-gray-400 mt-3 text-center">Secure payment via Telebirr, CBE, or PayPal</p>
              </div>

              {/* Volunteer */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <FaHandsHelping className="text-3xl text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Volunteer Sign-Up</h3>
                <p className="text-sm text-gray-600 mb-6">Join our eco-tourism initiatives and make a hands-on difference.</p>
                {volSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                    <FaCheckCircle className="text-3xl text-emerald-500 mx-auto mb-3" />
                    <h4 className="font-bold text-emerald-800">You&apos;re Signed Up!</h4>
                    <p className="text-sm text-emerald-600 mt-1">We&apos;ll contact you with volunteer opportunities.</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setVolSubmitted(true) }} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={volForm.name}
                      onChange={(e) => setVolForm({ ...volForm, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={volForm.email}
                      onChange={(e) => setVolForm({ ...volForm, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      required
                    />
                    <select
                      value={volForm.interest}
                      onChange={(e) => setVolForm({ ...volForm, interest: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
                    >
                      <option value="reforestation">Tree Planting & Reforestation</option>
                      <option value="cleanup">Lake Clean-Up Drives</option>
                      <option value="monastery">Monastery Preservation</option>
                      <option value="education">Community Education</option>
                      <option value="wildlife">Wildlife Conservation</option>
                    </select>
                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all">
                      Sign Up to Volunteer
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Projects Your Donation Supports</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {projects.map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-2xl">{p.icon}</div>
                    <h4 className="font-bold text-gray-900">{p.title}</h4>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-600">{p.progress}%</span>
                        <span className="text-gray-500">${p.raised.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: `${p.progress}%` }}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="sticky bottom-0 bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-2"><FaLeaf /> Every booking plants a tree and supports local communities.</p>
          <Link href="/services" className="shrink-0 bg-white text-emerald-700 px-5 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2">
            Book an Eco-Tour <FaArrowRight />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
