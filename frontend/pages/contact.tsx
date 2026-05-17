import Navbar from '../components/Navbar'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaLeaf, FaPaperPlane, FaUndo, FaCheckCircle, FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaGithub, FaQuestionCircle, FaComments, FaStore, FaExternalLinkAlt } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setSubmitted(true)
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    }
  }

  const handleReset = () => {
    setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    setErrors({})
    setSubmitted(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-72 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/bgservice&about.avif" alt="Contact Lake Tana" fill className="object-cover scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaEnvelope className="mr-2 text-cyan-300" />
                <span className="text-white text-sm font-medium">We'd Love to Hear From You</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Get in Touch <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">With Us</span>
              </h1>
              <p className="text-lg text-gray-200 max-w-xl">
                We're here to help with bookings, vendor support, and eco-tourism inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left — Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <FaCheckCircle className="text-white text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-emerald-700 text-lg">We'll respond within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your Name"
                        className={`w-full border ${errors.name ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className={`w-full border ${errors.email ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50"
                    >
                      <option>Booking</option>
                      <option>Vendor Support</option>
                      <option>Eco-Tourism</option>
                      <option>General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
                    <textarea
                      rows={6}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className={`w-full border ${errors.message ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50 resize-none`}
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1.5">{errors.message}</p>}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                      <FaPaperPlane /> Send Message
                    </button>
                    <button type="button" onClick={handleReset} className="px-6 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
                      <FaUndo /> Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right — Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 flex items-center justify-center text-cyan-500 shrink-0"><FaEnvelope /></div>
              <div><h3 className="font-bold text-gray-900">Email</h3><a href="mailto:desalegnky827@gmail.com" className="text-gray-600 text-sm mt-1 block hover:text-primary">desalegnky827@gmail.com</a></div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-600/10 flex items-center justify-center text-emerald-500 shrink-0"><FaPhone /></div>
              <div><h3 className="font-bold text-gray-900">Phone</h3><a href="tel:+251908720092" className="text-gray-600 text-sm mt-1 block hover:text-primary">+251 908 720 092</a></div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-start gap-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 to-blue-600/10 flex items-center justify-center text-primary shrink-0"><FaMapMarkerAlt /></div>
              <div><h3 className="font-bold text-gray-900">Address</h3><p className="text-gray-600 text-sm mt-1">Bahir Dar, Amhara Region, Ethiopia</p></div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://facebook.com/desie29@21#" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all text-sm font-medium">
                  <FaFacebook className="text-lg" /> Facebook
                </a>
                <a href="https://twitter.com/Desiye280235" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-sky-50 text-sky-700 rounded-xl hover:bg-sky-100 transition-all text-sm font-medium">
                  <FaTwitter className="text-lg" /> Twitter
                </a>
                <a href="https://youtube.com/@Desalegn-e1n" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all text-sm font-medium">
                  <FaYoutube className="text-lg" /> YouTube
                </a>
                <a href="https://linkedin.com/in/dk-cs-3rd" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all text-sm font-medium">
                  <FaLinkedin className="text-lg" /> LinkedIn
                </a>
                <a href="https://github.com/desalegnkasayemuluyekasaye-tech" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium col-span-2">
                  <FaGithub className="text-lg" /> desalegnkasayemuluyekasaye-tech
                </a>
              </div>
            </div>

            {/* Support Options */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FaComments className="text-primary" /> Support Options</h3>
              <div className="space-y-3">
                <Link href="/faq" className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all text-sm font-medium text-gray-700">
                  <FaQuestionCircle className="text-primary" /> FAQ — Common Questions
                  <FaExternalLinkAlt className="text-xs text-gray-400 ml-auto" />
                </Link>
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-500">
                  <FaComments className="text-gray-400" /> Live Chat <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">Coming Soon</span>
                </div>
                <Link href="/vendors" className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all text-sm font-medium text-gray-700">
                  <FaStore className="text-primary" /> Vendor Support Portal
                  <FaExternalLinkAlt className="text-xs text-gray-400 ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <section className="mt-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaMapMarkerAlt className="text-primary" /> Our Location</h2>
              <p className="text-gray-500 text-sm mt-1">Bahir Dar, Amhara Region, Ethiopia — Lake Tana Shoreline</p>
            </div>
            <div className="relative w-full h-80 md:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126247.64397541005!2d37.31660537739929!3d11.585282374510693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164418b5c1c2f1a1%3A0x1837ab99c1c8d8f1!2sBahir%20Dar!5e0!3m2!1sen!2set!4v1710000000000"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bahir Dar - Lake Tana Area Map"
              />
            </div>
          </div>
        </section>

        {/* Eco Note */}
        <section className="mt-12 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-2xl shrink-0"><FaLeaf /></div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Eco-Friendly Communication</h3>
              <p className="text-gray-600">We minimize our environmental footprint by prioritizing digital communication over printed materials. Our response team is fully remote and powered by renewable energy. Every email inquiry plants a tree through our conservation partners.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer with quick links */}
      <footer className="bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 flex items-center"><FaLeaf className="text-emerald-400 mr-2" /> Lake Tana Eco-Tourism</h4>
              <p className="text-sm text-blue-100">Discover Ethiopia's largest lake — a UNESCO Biosphere Reserve with ancient monasteries, diverse wildlife, and unforgettable eco-adventures.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Explore Services</Link></li>
                <li><Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link></li>
                <li><Link href="/booking" className="hover:text-white transition-colors">Bookings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li><Link href="/eco-tourism" className="hover:text-white transition-colors">Eco-Tourism</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Lake Tana</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2"><FaMapMarkerAlt className="mt-0.5 shrink-0" /> Bahir Dar, Ethiopia</li>
                <li><a href="tel:+251908720092" className="hover:text-white transition-colors"><FaPhone className="inline mr-1" /> +251 908 720 092</a></li>
                <li><a href="mailto:desalegnky827@gmail.com" className="hover:text-white transition-colors"><FaEnvelope className="inline mr-1" /> desalegnky827@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-blue-200">
            <p>&copy; 2026 Lake Tana Eco-Tourism Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
