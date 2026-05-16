import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                <FaLeaf />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 text-transparent bg-clip-text">
                  Lake Tana
                </div>
                <div className="text-sm text-cyan-200 font-medium">Eco-Tourism Platform</div>
              </div>
            </div>
            <p className="text-gray-300 mb-8 max-w-xs">
              Connecting conscious travelers with authentic Ethiopian experiences while supporting local communities and environmental conservation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-cyan-500 flex items-center justify-center transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-500 flex items-center justify-center transition-colors">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-white">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Experiences
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Lake Tana History
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="text-gray-300 hover:text-cyan-300 transition-colors flex items-center group">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Vendor Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-white">Categories</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors">Monastery Tours</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors">Boat Rides</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors">Eco-Hotels</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors">Local Restaurants</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors">Waterfall Hikes</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-emerald-300 transition-colors">Fishing Tours</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-white">Contact Us</h4>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-emerald-500/20 flex items-center justify-center mr-4">
                  <FaMapMarkerAlt className="text-cyan-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Location</div>
                  <div className="text-gray-300">Bahir Dar, Ethiopia</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-emerald-500/20 flex items-center justify-center mr-4">
                  <FaPhone className="text-cyan-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Phone</div>
                  <div className="text-gray-300">+251 91 234 5678</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-emerald-500/20 flex items-center justify-center mr-4">
                  <FaEnvelope className="text-cyan-300" />
                </div>
                <div>
                  <div className="font-semibold text-white">Email</div>
                  <div className="text-gray-300">info@laketana-eco.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Lake Tana Eco-Tourism. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Sustainability Report</a>
            </div>
          </div>
          
          {/* Eco Badge */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-green-600/10 border border-emerald-500/20 rounded-full px-6 py-3">
              <FaLeaf className="mr-2 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">100% Eco-Certified Tourism Platform</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
