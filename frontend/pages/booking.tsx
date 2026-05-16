import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { FaCalendarAlt, FaChevronRight, FaLeaf } from 'react-icons/fa'

export default function Bookings() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-800" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaCalendarAlt className="mr-2 text-cyan-300" />
              <span className="text-white text-sm font-medium">Manage Your Bookings</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Bookings</span>
            </h1>
            <p className="text-lg text-gray-200">Track and manage your Lake Tana experiences.</p>
          </div>
        </div>
      </section>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <FaCalendarAlt className="text-6xl text-primary/30 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Bookings</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">Sign in to view and manage your current and past bookings, payment status, and receipts.</p>
        <Link href="/vendor/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all">
          Sign In <FaChevronRight />
        </Link>
      </div>
      <Footer />
    </div>
  )
}
