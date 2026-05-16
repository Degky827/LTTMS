import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { FaBookOpen, FaChevronRight } from 'react-icons/fa'
import { lakeTanaHistorySources, lakeTanaHistoryTimeline } from '../data/lakeTanaHistory'

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/lake-tana-history.svg"
            alt="Lake Tana historical overview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaBookOpen className="mr-2 text-cyan-200" />
                <span className="text-white text-sm font-medium">Learning Hub</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                History of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Lake Tana</span>
              </h1>
              <p className="text-xl text-gray-200">
                Discover the historical timeline of Ethiopia's largest lake and its island monasteries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lakeTanaHistoryTimeline.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <p className="text-sm uppercase tracking-wider text-primary font-semibold mb-2">{item.period}</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h2>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4">Sources and Further Reading</h2>
            <div className="space-y-3">
              {lakeTanaHistorySources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                >
                  {source.label}
                </a>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/services"
                className="inline-flex items-center bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Explore Experiences
                <FaChevronRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
