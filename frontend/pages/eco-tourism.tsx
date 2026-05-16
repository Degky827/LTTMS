import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { FaLeaf, FaTree, FaHandHoldingHeart, FaRecycle, FaChevronRight } from 'react-icons/fa'

export default function EcoTourism() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-800" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaLeaf className="mr-2 text-emerald-300" />
              <span className="text-white text-sm font-medium">Sustainable Travel</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Eco-<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Tourism</span>
            </h1>
            <p className="text-lg text-gray-200">Travel responsibly. Protect Lake Tana's heritage.</p>
          </div>
        </div>
      </section>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: <FaHandHoldingHeart size={36} />, title: 'Support Local Communities', desc: '70% of your booking supports local guides, drivers, and vendors.' },
            { icon: <FaTree size={36} />, title: 'Reduce Carbon Footprint', desc: 'We plant a tree for every booking and offset all tour carbon emissions.' },
            { icon: <FaRecycle size={36} />, title: 'Conservation Efforts', desc: 'Join lake clean-up and reforestation projects during your stay.' },
          ].map((item, i) => (
            <div key={i} className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Your Impact</h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">Use our carbon footprint tracker to see how your travels contribute to a healthier planet.</p>
          <Link href="/services" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all">
            Browse Eco Tours <FaChevronRight />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
