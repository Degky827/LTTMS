import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa'

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-800" />
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaEnvelope className="mr-2 text-sky-300" />
              <span className="text-white text-sm font-medium">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-300">Us</span>
            </h1>
            <p className="text-lg text-gray-200">We're here to help plan your eco-adventure.</p>
          </div>
        </div>
      </section>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <input type="text" placeholder="Your Name" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
                <input type="email" placeholder="Your Email" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
              </div>
              <input type="text" placeholder="Subject" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
              <textarea rows={5} placeholder="Your Message" className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"></textarea>
              <button className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all">Send Message</button>
            </form>
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 to-blue-600/10 flex items-center justify-center text-primary shrink-0"><FaMapMarkerAlt /></div>
              <div><h3 className="font-bold text-gray-900">Location</h3><p className="text-gray-600 text-sm mt-1">Bahir Dar, Ethiopia<br />Lake Tana Shoreline</p></div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 flex items-center justify-center text-emerald-500 shrink-0"><FaPhone /></div>
              <div><h3 className="font-bold text-gray-900">Phone</h3><p className="text-gray-600 text-sm mt-1">+251 91 234 5678</p></div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 flex items-center justify-center text-cyan-500 shrink-0"><FaEnvelope /></div>
              <div><h3 className="font-bold text-gray-900">Email</h3><p className="text-gray-600 text-sm mt-1">info@laketana-eco.com</p></div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 flex items-center justify-center text-emerald-500 shrink-0"><FaLeaf /></div>
              <div><h3 className="font-bold text-gray-900">Eco-Tourism Support</h3><p className="text-gray-600 text-sm mt-1">eco@laketana-eco.com</p></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
