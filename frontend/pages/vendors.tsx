import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FaStar, FaLeaf, FaChevronRight, FaSearch,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaShieldAlt,
  FaCheckCircle, FaFilter, FaStore
} from 'react-icons/fa'
import API from '../utils/api'

export default function Vendors() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ecoOnly, setEcoOnly] = useState(false)

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await API.get('/vendors')
        setVendors(res.data.data || [])
      } catch {
        setVendors([])
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [])

  const filtered = vendors.filter((v) => {
    const matchSearch = v.businessName?.toLowerCase().includes(search.toLowerCase()) ||
                        v.description?.toLowerCase().includes(search.toLowerCase())
    const matchEco = ecoOnly ? v.ecoCertified : true
    return matchSearch && matchEco
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-56 overflow-hidden">
        <Image
          src="/images/LakeTana.jpg"
          alt="Vendors Directory"
          fill
          className="object-cover scale-110 animate-zoom"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                Vendors
              </span>
            </h1>
            <p className="text-lg text-gray-200 max-w-xl">Verified eco-tourism partners around Lake Tana.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Vendor Dashboard CTA */}
        <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/10 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaStore className="text-primary text-xl" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Are you a tourism vendor?</p>
              <p className="text-xs text-gray-500">Manage your services, bookings, and revenue.</p>
            </div>
          </div>
          <Link href="/vendor/login" className="shrink-0 bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
            Access Dashboard
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors by name or service..."
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white shadow-sm"
            />
          </div>
          <label className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:border-emerald-300 transition-colors shrink-0">
            <input
              type="checkbox"
              checked={ecoOnly}
              onChange={() => setEcoOnly(!ecoOnly)}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
            />
            <FaLeaf className="text-emerald-500" />
            <span className="text-sm font-semibold text-gray-700">Eco-Certified Only</span>
          </label>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vendor) => (
              <div
                key={vendor._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {vendor.businessName?.charAt(0) || 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{vendor.businessName || 'Vendor'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {vendor.ecoCertified && (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            <FaLeaf /> Eco-Certified
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          <FaShieldAlt /> Verified
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500 text-sm shrink-0">
                      <FaStar className="mr-0.5" />
                      <span className="font-bold text-gray-900">4.8</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {vendor.description || 'Experienced eco-tourism vendor serving Lake Tana visitors with authentic experiences.'}
                  </p>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="mr-2 text-primary shrink-0" />
                      <span className="truncate">{vendor.location || 'Bahir Dar, Ethiopia'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaPhone className="mr-2 text-primary shrink-0" />
                      <span>{vendor.phone || '+251 91 234 5678'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaEnvelope className="mr-2 text-primary shrink-0" />
                      <span className="truncate">{vendor.email || 'vendor@laketana.com'}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                  <Link
                    href={`/services?vendor=${vendor._id}`}
                    className="flex-1 text-center bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    View Services
                  </Link>
                  <button className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <FaMapMarkerAlt className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
