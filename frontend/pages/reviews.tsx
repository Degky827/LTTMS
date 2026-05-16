import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { FaStar, FaQuoteLeft, FaChevronRight } from 'react-icons/fa'

export default function Reviews() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaQuoteLeft className="mr-2 text-pink-300" />
              <span className="text-white text-sm font-medium">Traveler Feedback</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Reviews & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">Ratings</span>
            </h1>
            <p className="text-lg text-gray-200">Hear from fellow travelers.</p>
          </div>
        </div>
      </section>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            { name: 'Sarah Johnson', role: 'Eco-Tourist', rating: 5, text: 'The monastery tours were breathtaking! The guides were knowledgeable and the whole experience felt authentic and sustainable.' },
            { name: 'Michael Chen', role: 'Travel Blogger', rating: 5, text: 'Lake Tana Tourism made my Ethiopian adventure unforgettable. The boat ride at sunrise was magical!' },
            { name: 'Amina Hassan', role: 'Local Guide', rating: 5, text: 'As a local guide, I appreciate how this platform supports our community while promoting responsible tourism.' },
            { name: 'David Park', role: 'Nature Photographer', rating: 4, text: 'Incredible bird-watching trails. The eco-lodge was comfortable and the staff were wonderful.' },
          ].map((review, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-lg font-bold">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
                <div className="ml-auto flex text-yellow-400">
                  {[...Array(review.rating)].map((_, j) => <FaStar key={j} />)}
                </div>
              </div>
              <p className="text-gray-600 italic">&ldquo;{review.text}&rdquo;</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all">
            Share Your Experience <FaChevronRight />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
