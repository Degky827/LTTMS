import React, { useState } from 'react'
import Head from 'next/head'
import { PublicLayout } from '@/components/layouts/PublicLayout'

export default function ContactPage() {

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Tourism Inquiry',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)

  const FAQS = [
    {
      q: 'How do I book a certified boat excursion to island monasteries?',
      a: 'Browse our Explore or Experiences page, select your desired boat or monastery tour package, choose your date and group size, and click "Book Now". You can checkout instantly using telebirr, CBE Birr, Chapa, or international cards.',
    },
    {
      q: 'What payment methods does LTTMS support?',
      a: 'We accept local Ethiopian mobile money (telebirr, CBE Birr, Awash Birr), Ethiopian domestic bank transfers via Chapa, as well as international Visa, MasterCard, and American Express. All prices are transparently displayed in Ethiopian Birr (ETB).',
    },
    {
      q: 'What is the dress code and protocol for visiting Orthodox monasteries?',
      a: 'Monasteries are active sacred places. Modest attire covering shoulders and knees is mandatory. Women are traditionally requested to wear long skirts and head coverings; men should wear trousers. Shoes must be removed before entering church doors. Flash photography is prohibited inside painted sanctuaries.',
    },
    {
      q: 'How can local boat captains, tour guides, and eco-lodges register as vendors?',
      a: 'Click "Get Started" in the navbar and select "Vendor". Submit your cooperative membership or business license, vessel marine safety inspection certificate, and guide ID. Our verification desk in Bahir Dar approves verified accounts within 24–48 hours.',
    },
    {
      q: 'What happens if a boat tour is cancelled due to adverse weather or lake waves?',
      a: 'Passenger safety is our top priority. If the Lake Tana Port Authority issues a weather warning or heavy storm alert, your trip will be rescheduled at no extra charge, or you will receive a 100% full refund through our automated financial rollback system.',
    },
    {
      q: 'Are certified life jackets and marine safety equipment provided?',
      a: 'Yes, mandatory. Every passenger boat registered on LTTMS is legally required to carry certified marine life vests for every adult and child on board before clearance is granted by dock marshals.',
    },
  ]

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email address required'
    if (!form.message.trim()) errs.message = 'Please enter your message'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setForm({ name: '', email: '', subject: 'General Tourism Inquiry', message: '' })
    }, 600)
  }

  return (
    <PublicLayout>
      <Head>
        <title>Contact Us — Get in Touch | Lake Tana Tourism (LTTMS)</title>
        <meta
          name="description"
          content="Contact Lake Tana Tourism Management System: tourist reservations, vendor partnerships, Bahir Dar office location, FAQs, and 24/7 visitor assistance."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors pb-24">
        {/* 1. Hero Header */}
        <div className="relative bg-[#143224] text-white pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-emerald-950">
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="/images/lake-tana-hero-bg.jpg"
              alt="Bahir Dar Waterfront"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143224] via-[#143224]/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>BAHIR DAR HEADQUARTERS &amp; VISITOR DESK</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Contact — Get in Touch
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                Have questions about booking boat tours, visiting sacred island monasteries, or partnering with LTTMS? Our local team in Bahir Dar is here to assist you every day.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Three Dedicated Support Channels */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Tourist Helpdesk */}
            <div className="bg-white dark:bg-[#132620] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center text-2xl mb-4">
                  🛟
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-1">
                  24/7 Tourist Assistance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Immediate help with existing reservations, emergency lake boat dispatch, and pier check-in directions.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href="tel:+251918000000"
                  className="text-xs font-bold text-[#244B3A] dark:text-emerald-400 hover:underline"
                >
                  Hotline: +251 91 800 0000
                </a>
              </div>
            </div>

            {/* 2. Vendor Desk */}
            <div className="bg-white dark:bg-[#132620] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center text-2xl mb-4">
                  💼
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-1">
                  Vendor &amp; Operator Desk
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  For boat cooperatives, licensed monastic guides, and eco-lodges registering or requesting payout support.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href="mailto:vendors@laketana-tourism.com"
                  className="text-xs font-bold text-[#244B3A] dark:text-emerald-400 hover:underline"
                >
                  vendors@laketana-tourism.com
                </a>
              </div>
            </div>

            {/* 3. Eco-Tourism & Research */}
            <div className="bg-white dark:bg-[#132620] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center text-2xl mb-4">
                  🌿
                </div>
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-1">
                  Eco-Charter &amp; Research
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Collaborate on Lake Tana Biosphere Reserve research, reforestation projects, and zero-plastic compliance.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href="mailto:conservation@laketana-tourism.com"
                  className="text-xs font-bold text-[#244B3A] dark:text-emerald-400 hover:underline"
                >
                  conservation@laketana-tourism.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Contact Form & Official Contact Details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-white dark:bg-[#132620] rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
                Fill out the form below. A member of our Bahir Dar team will reply within 24 hours.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-4">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
                    Thank you for reaching out. We have received your inquiry and will contact you promptly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2.5 rounded-full bg-[#244B3A] text-white text-xs font-bold transition-all hover:bg-[#1a382b]"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value })
                          setErrors((prev) => ({ ...prev, name: '' }))
                        }}
                        placeholder="Abebe Bikila"
                        className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                          errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/70'
                        } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#244B3A] transition-colors`}
                      />
                      {errors.name && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value })
                          setErrors((prev) => ({ ...prev, email: '' }))
                        }}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                          errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/70'
                        } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#244B3A] transition-colors`}
                      />
                      {errors.email && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700/70 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#244B3A] transition-colors cursor-pointer"
                    >
                      <option value="General Tourism Inquiry">General Tourism Inquiry</option>
                      <option value="Boat Tour Reservation">Boat Tour &amp; Excursion Booking</option>
                      <option value="Monastery Guide Services">Monastery Guided Tour Inquiry</option>
                      <option value="Vendor Registration">Vendor Partnership &amp; Cooperative Desk</option>
                      <option value="Eco-Tourism & Conservation">Eco-Tourism &amp; Conservation Program</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => {
                        setForm({ ...form, message: e.target.value })
                        setErrors((prev) => ({ ...prev, message: '' }))
                      }}
                      placeholder="Please tell us about your travel dates, group size, or partner question..."
                      className={`w-full p-4 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                        errors.message ? 'border-red-500' : 'border-slate-200 dark:border-slate-700/70'
                      } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-[#244B3A] transition-colors resize-none`}
                    />
                    {errors.message && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-full bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              )}
            </div>

            {/* Official Contact Info Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#132620] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-6">
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  Official Contact Information
                </h3>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                    📍
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Physical Office
                    </h4>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      Shore Road, Waterfront Promenade, Kebele 03
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Bahir Dar, Amhara Region, Ethiopia
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                    📞
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Telephone
                    </h4>
                    <a
                      href="tel:+251582200000"
                      className="text-sm font-bold text-[#244B3A] dark:text-emerald-400 hover:underline block mt-0.5"
                    >
                      +251 58 220 0000
                    </a>
                    <a
                      href="tel:+251918000000"
                      className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline block"
                    >
                      Mobile / WhatsApp: +251 91 800 0000
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                    ✉️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email Address
                    </h4>
                    <a
                      href="mailto:support@laketana-tourism.com"
                      className="text-sm font-bold text-[#244B3A] dark:text-emerald-400 hover:underline block mt-0.5"
                    >
                      support@laketana-tourism.com
                    </a>
                    <a
                      href="mailto:info@laketana-tourism.com"
                      className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline block"
                    >
                      info@laketana-tourism.com
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                    🕒
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Operating Hours
                    </h4>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      Monday – Sunday: 7:00 AM – 8:00 PM (EAT)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Boats operate daily between 6:30 AM and 6:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Direction Card */}
              <div className="bg-[#143224] text-white rounded-3xl p-6 border border-emerald-950 shadow-md">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">
                  Visitor Information
                </span>
                <h4 className="text-base font-bold font-heading text-white mb-2">
                  Arriving at Bahir Dar Airport (BJR)
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Ginbot 20 Airport is located just 8 km (15 minutes) from the Bahir Dar Waterfront boat pier. Registered taxis and airport transfer shuttles operate for all scheduled Ethiopian Airlines flights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Interactive Location / Map */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-white dark:bg-[#132620] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Location &amp; Waterfront Departure Pier
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bahir Dar Harbor, Lake Tana Waterfront Promenade, Ethiopia
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-[#244B3A] dark:text-emerald-400">
                <span>Coordinates: 11.5853° N, 37.3166° E</span>
              </span>
            </div>

            <div className="relative w-full h-80 sm:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126247.64397541005!2d37.31660537739929!3d11.585282374510693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164418b5c1c2f1a1%3A0x1837ab99c1c8d8f1!2sBahir%20Dar!5e0!3m2!1sen!2set!4v1710000000000"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Bahir Dar - Lake Tana Area Map"
              />
            </div>
          </div>
        </div>

        {/* 5. Frequently Asked Questions (FAQ) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
              Help &amp; Answers
            </span>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Find quick answers to common questions about booking excursions, monastery protocols, and vendor partnerships.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
