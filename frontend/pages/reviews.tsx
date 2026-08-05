import { useState } from 'react'
import Link from 'next/link'
import {
  FaStar, FaRegStar, FaQuoteLeft, FaChevronRight,
  FaLeaf, FaCheckCircle, FaShieldAlt, FaFlag, FaThumbsUp,
  FaCamera, FaSearch, FaReply,
  FaAward, FaTrophy, FaUserCheck,
  FaExclamationTriangle, FaTrash, FaClock,
  FaStore
} from 'react-icons/fa'

const reviewsData = [
  {
    id: 1, name: 'Sarah Johnson', role: 'Eco-Tourist', rating: 5,
    date: '2 weeks ago', verified: true,
    text: 'The monastery tours were breathtaking! The guides were knowledgeable and the whole experience felt authentic and sustainable. Highly recommend the Zege Peninsula tour.',
    categories: { cleanliness: 5, ecoFriendly: 5, hospitality: 5, value: 4 },
    serviceType: 'Cultural Tour',
    vendorReply: 'Thank you Sarah! We\'re thrilled you enjoyed the Zege tour. Your support helps us preserve these ancient sites.',
    photos: []
  },
  {
    id: 2, name: 'Michael Chen', role: 'Travel Blogger', rating: 5,
    date: '1 month ago', verified: true,
    text: 'Lake Tana Tourism made my Ethiopian adventure unforgettable. The boat ride at sunrise was magical! The eco-lodge was comfortable and the staff went above and beyond.',
    categories: { cleanliness: 5, ecoFriendly: 5, hospitality: 5, value: 5 },
    serviceType: 'Boat Tour',
    vendorReply: null,
    photos: []
  },
  {
    id: 3, name: 'Amina Hassan', role: 'Local Guide', rating: 5,
    date: '3 weeks ago', verified: true,
    text: 'As a local guide, I appreciate how this platform supports our community while promoting responsible tourism. The booking system is seamless.',
    categories: { cleanliness: 4, ecoFriendly: 5, hospitality: 5, value: 4 },
    serviceType: 'Cultural Tour',
    vendorReply: 'Thank you Amina! We\'re proud to work with local guides like you.',
    photos: []
  },
  {
    id: 4, name: 'David Park', role: 'Nature Photographer', rating: 4,
    date: '1 week ago', verified: true,
    text: 'Incredible bird-watching trails. The eco-lodge was comfortable and the staff were wonderful. Would have liked more guided birding sessions.',
    categories: { cleanliness: 4, ecoFriendly: 5, hospitality: 4, value: 4 },
    serviceType: 'Nature Walk',
    vendorReply: null,
    photos: []
  },
  {
    id: 5, name: 'Emily Carter', role: 'Solo Traveler', rating: 5,
    date: '5 days ago', verified: true,
    text: 'Stayed at the Forest Eco Lodge for 3 nights. Solar-powered, farm-to-table meals, and the most stunning sunset views over Lake Tana. A truly regenerative experience.',
    categories: { cleanliness: 5, ecoFriendly: 5, hospitality: 5, value: 4 },
    serviceType: 'Eco Lodge',
    vendorReply: null,
    photos: []
  },
  {
    id: 6, name: 'James Mwangi', role: 'Family Traveler', rating: 3,
    date: '2 months ago', verified: true,
    text: 'The boat tour was nice but felt a bit rushed. The guide was knowledgeable but we would have appreciated more time at the monasteries.',
    categories: { cleanliness: 3, ecoFriendly: 4, hospitality: 3, value: 3 },
    serviceType: 'Boat Tour',
    vendorReply: 'Thank you for your feedback James. We\'ve extended our monastery tour duration based on guest input. We hope you\'ll give us another chance!',
    photos: []
  },
]

const avgRating = (reviewsData.reduce((s, r) => s + r.rating, 0) / reviewsData.length).toFixed(1)
const ratingDistribution = {
  5: reviewsData.filter(r => r.rating === 5).length,
  4: reviewsData.filter(r => r.rating === 4).length,
  3: reviewsData.filter(r => r.rating === 3).length,
  2: reviewsData.filter(r => r.rating === 2).length,
  1: reviewsData.filter(r => r.rating === 1).length,
}

const categoryAvg = (cat: keyof typeof reviewsData[0]['categories']) =>
  (reviewsData.reduce((s, r) => s + r.categories[cat], 0) / reviewsData.length).toFixed(1)

export default function Reviews() {
  const [sort, setSort] = useState('newest')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitRating, setSubmitRating] = useState(5)
  const [submitText, setSubmitText] = useState('')
  const [submitHover, setSubmitHover] = useState(0)

  const sorted = [...reviewsData]
    .filter(r => filterType === 'all' || r.serviceType.toLowerCase().includes(filterType.toLowerCase()))
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sort === 'highest') return b.rating - a.rating
      if (sort === 'lowest') return a.rating - b.rating
      return 0
    })

  return (
    <div>

      {/* Hero */}
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-10 w-64 h-64 bg-purple-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 right-10 w-80 h-80 bg-pink-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaQuoteLeft className="mr-2 text-pink-300" />
              <span className="text-white text-sm font-medium">Trusted Feedback</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Reviews & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">Ratings</span>
            </h1>
            <p className="text-lg text-gray-200">Real feedback from verified travelers. Your voice builds a better eco-tourism community.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* ===== Review Aggregation Summary ===== */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {/* Overall Score */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center md:col-span-1">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">{avgRating}</div>
            <div className="flex justify-center my-2 text-yellow-400 text-lg">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>{s <= Math.round(Number(avgRating)) ? <FaStar /> : <FaRegStar />}</span>
              ))}
            </div>
            <div className="text-sm text-gray-500 font-semibold">{reviewsData.length} verified reviews</div>
          </div>

          {/* Star Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 md:col-span-2">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star as keyof typeof ratingDistribution]
                const pct = (count / reviewsData.length) * 100
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-gray-600 w-4">{star}</span>
                    <FaStar className="text-yellow-400 text-xs" />
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Category Scores</h3>
            <div className="space-y-3">
              {[
                { label: 'Cleanliness', key: 'cleanliness' as const, color: 'text-blue-500', bg: 'bg-blue-500' },
                { label: 'Eco-Friendliness', key: 'ecoFriendly' as const, color: 'text-emerald-500', bg: 'bg-emerald-500' },
                { label: 'Hospitality', key: 'hospitality' as const, color: 'text-purple-500', bg: 'bg-purple-500' },
                { label: 'Value', key: 'value' as const, color: 'text-amber-500', bg: 'bg-amber-500' },
              ].map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-600">{c.label}</span>
                    <span className={c.color}>{categoryAvg(c.key)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className={`h-full ${c.bg} rounded-full`} style={{ width: `${(Number(categoryAvg(c.key)) / 5) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Filters ===== */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 bg-white shadow-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          >
            <option value="all">All Services</option>
            <option value="eco lodge">Eco Lodges</option>
            <option value="boat tour">Boat Tours</option>
            <option value="cultural tour">Cultural Tours</option>
            <option value="nature walk">Nature Walks</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {/* ===== Top Rated Highlight ===== */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-amber-500 text-xl" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Top Rated Service</p>
              <p className="text-xs text-gray-600">Lake Tana Boat Tour — 5.0 ★ (12 reviews)</p>
            </div>
          </div>
          <Link href="/services?sortBy=rating" className="shrink-0 text-amber-600 font-semibold text-sm hover:underline">View All Top Rated →</Link>
        </div>

        {/* ===== Reviews List ===== */}
        <div className="space-y-6">
          {sorted.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              {/* Review Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shrink-0">
                  {review.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{review.name}</h3>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        <FaUserCheck /> Verified Tourist
                      </span>
                    )}
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{review.serviceType}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? <FaStar /> : <FaRegStar />}</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-600 leading-relaxed mb-4">{review.text}</p>

              {/* Category Score Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(review.categories).map(([key, val]) => (
                  <span key={key} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
                    {key === 'cleanliness' ? '🧹' : key === 'ecoFriendly' ? '🌿' : key === 'hospitality' ? '🤝' : '💰'}
                    {key === 'ecoFriendly' ? 'Eco' : key.charAt(0).toUpperCase() + key.slice(1)}: {val}/5
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                  <FaLeaf /> Eco-Certified Tour
                </span>
              </div>

              {/* Photo Upload Placeholder */}
              <div className="flex gap-2 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-400 border-2 border-dashed border-purple-200 cursor-pointer hover:border-purple-400 transition-colors">
                  <FaCamera />
                </div>
              </div>

              {/* Vendor Reply */}
              {review.vendorReply && (
                <div className="ml-8 pl-5 border-l-2 border-purple-300 bg-purple-50/50 rounded-r-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FaStore className="text-purple-500 text-sm" />
                    <span className="font-bold text-sm text-gray-900">Vendor Response</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.vendorReply}</p>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id ? (
                <div className="ml-8 flex gap-2 mt-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response..."
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <button className="px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors"><FaCheckCircle /></button>
                  <button onClick={() => setReplyingTo(null)} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"><FaTrash /></button>
                </div>
              ) : (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors px-3 py-1.5 bg-purple-50 rounded-lg hover:bg-purple-100"
                  >
                    <FaReply /> Reply
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <FaFlag /> Report
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-500 transition-colors px-3 py-1.5 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <FaThumbsUp /> Helpful
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ===== Trust & Transparency Section ===== */}
        <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-8 mt-12 text-white">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <FaShieldAlt className="text-2xl text-cyan-300 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Verified Only</h3>
                <p className="text-sm text-gray-300">Reviews are only accepted from travelers with completed bookings. No fake reviews.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FaExclamationTriangle className="text-2xl text-amber-300 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Fraud Detection</h3>
                <p className="text-sm text-gray-300">Our AI flags suspicious patterns. Admins review and remove spam or offensive content.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FaAward className="text-2xl text-emerald-300 mt-1" />
              <div>
                <h3 className="font-bold text-lg mb-2">Eco-Badge Highlighted</h3>
                <p className="text-sm text-gray-300">Eco-certified vendors are highlighted so you can make informed sustainable choices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full px-6 py-3 mb-6">
            <FaClock className="mr-2 text-purple-500" />
            <span className="text-purple-700 font-semibold text-sm">Have you traveled with us? Share your experience and earn loyalty points!</span>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <FaStar /> Write a Review
            </button>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Browse Services <FaChevronRight />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Submit Review Modal ===== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
            <button onClick={() => setShowSubmitModal(false)} className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <FaTrash className="text-gray-500 text-sm" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
            <p className="text-sm text-gray-500 mb-6">Your feedback helps other travelers and supports eco-tourism.</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Overall Rating</label>
              <div className="flex justify-center gap-2 text-4xl">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubmitRating(s)}
                    onMouseEnter={() => setSubmitHover(s)}
                    onMouseLeave={() => setSubmitHover(0)}
                    className={`transition-all hover:scale-110 ${s <= (submitHover || submitRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
              <textarea
                value={submitText}
                onChange={(e) => setSubmitText(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photos (optional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors cursor-pointer">
                <FaCamera className="text-2xl text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload photos from your trip</p>
              </div>
            </div>

            <button
              onClick={() => { alert('Review submitted! Thank you for your feedback.'); setShowSubmitModal(false) }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Submit Review
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              <FaShieldAlt className="inline mr-1" /> You'll earn 50 loyalty points for this review.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
