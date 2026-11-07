import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaUndo,
  FaCheckCircle,
  FaStore,
  FaExternalLinkAlt,
  FaLeaf,
} from 'react-icons/fa'

export default function ContactPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    if (!validate()) return

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    }, 600)
  }

  const handleReset = () => {
    setForm({ name: '', email: '', subject: 'General Inquiry', message: '' })
    setErrors({})
    setSubmitted(false)
  }

  return (
    <PublicLayout>
      <Head>
        <title>{t('contact.heroTitle', 'Get in Touch With Us')} | LTTMS</title>
        <meta
          name="description"
          content="Contact Lake Tana Tourism management for tour bookings, vendor partnerships, and visitor support in Bahir Dar, Ethiopia."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-3">
                📍 {t('footer.address', 'Bahir Dar, Amhara Region, Ethiopia')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                {t('contact.heroTitle', 'Get in Touch With Us')}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-primary-100/90 leading-relaxed">
                {t(
                  'contact.heroSubtitle',
                  'We are here to assist with tour reservations, local vendor partnerships, and eco-tourism inquiries.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left Column: Form */}
            <div className="lg:col-span-3">
              <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-10 shadow-sm">
                <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">
                  {t('contact.sendMessage', 'Send Us a Message')}
                </h2>
                <p className="text-sm text-text-secondary mb-8">
                  {t(
                    'contact.sendMessageSubtitle',
                    'Fill out the inquiry form below and our team in Bahir Dar will respond within 24 hours.'
                  )}
                </p>

                {submitted ? (
                  <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center text-primary-700 dark:text-primary-300">
                      <FaCheckCircle className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-text-primary mb-2">
                      {t('contact.successTitle', 'Message Sent Successfully!')}
                    </h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
                      {t(
                        'contact.successSubtitle',
                        'Thank you for reaching out. A Lake Tana tourism specialist will contact you shortly.'
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors"
                    >
                      {t('contact.sendAnother', 'Send Another Message')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1.5">
                          {t('contact.name', 'Full Name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Abebe Bikila"
                          className={`w-full border rounded-xl px-4 py-3 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.name ? 'border-red-400' : 'border-surface-border'
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-text-primary mb-1.5">
                          {t('contact.email', 'Email Address')}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="abebe@example.com"
                          className={`w-full border rounded-xl px-4 py-3 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.email ? 'border-red-400' : 'border-surface-border'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        {t('contact.subject', 'Subject')}
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="General Inquiry">General Tourism Inquiry</option>
                        <option value="Booking Support">Tour / Booking Reservation</option>
                        <option value="Vendor Partnership">Become a Certified Vendor</option>
                        <option value="Eco Tourism">Eco-Tourism & Conservation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1.5">
                        {t('contact.message', 'Your Message')}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us about your upcoming travel plans or question..."
                        className={`w-full border rounded-xl p-4 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                          errors.message ? 'border-red-400' : 'border-surface-border'
                        }`}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm disabled:opacity-50"
                      >
                        <FaPaperPlane className="text-xs" />
                        <span>
                          {submitting
                            ? t('common.loading', 'Loading...')
                            : t('contact.sendBtn', 'Submit Message')}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-5 py-3.5 border border-surface-border rounded-xl font-semibold text-sm text-text-secondary hover:bg-surface-muted transition-colors flex items-center gap-1.5"
                      >
                        <FaUndo className="text-xs" />
                        <span>{t('common.cancel', 'Reset')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Contact Details */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold font-heading text-text-primary">
                {t('contact.office', 'Bahir Dar Central Office')}
              </h2>

              <div className="bg-surface border border-surface-border rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 shrink-0">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    {t('common.location', 'Location')}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                    {t('contact.address', 'Kebele 03, Shore Road, Bahir Dar, Ethiopia')}
                  </p>
                </div>
              </div>

              <div className="bg-surface border border-surface-border rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 shrink-0">
                  <FaPhone className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    {t('auth.phone', 'Phone Number')}
                  </h3>
                  <a
                    href="tel:+251582200000"
                    className="text-xs sm:text-sm text-primary-700 dark:text-primary-400 font-semibold mt-1 block hover:underline"
                  >
                    {t('contact.phone', '+251 58 220 0000')}
                  </a>
                </div>
              </div>

              <div className="bg-surface border border-surface-border rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 shrink-0">
                  <FaEnvelope className="text-lg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">
                    {t('auth.email', 'Email Address')}
                  </h3>
                  <a
                    href="mailto:support@laketana-tourism.com"
                    className="text-xs sm:text-sm text-primary-700 dark:text-primary-400 font-semibold mt-1 block hover:underline"
                  >
                    {t('contact.emailAddress', 'support@laketana-tourism.com')}
                  </a>
                </div>
              </div>

              {/* Quick Portals Links */}
              <div className="bg-surface border border-surface-border rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-text-primary mb-2">
                  {t('footer.portalsTitle', 'Marketplace Portals')}
                </h3>
                <Link
                  href="/services"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-surface-border text-xs font-semibold text-text-primary hover:border-primary-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FaLeaf className="text-primary-700 dark:text-primary-400" />
                    {t('footer.touristPortal', 'Tourist Booking Portal')}
                  </span>
                  <FaExternalLinkAlt className="text-[10px] text-text-secondary" />
                </Link>
                <Link
                  href="/vendor/login"
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-surface-border text-xs font-semibold text-text-primary hover:border-primary-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FaStore className="text-gold-600 dark:text-gold-400" />
                    {t('footer.vendorPortal', 'Vendor Partner Portal')}
                  </span>
                  <FaExternalLinkAlt className="text-[10px] text-text-secondary" />
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Location Map */}
          <div className="mt-12 bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-surface-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-heading text-text-primary flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary-700 dark:text-primary-400" />
                  {t('common.location', 'Location')} — Lake Tana &amp; Bahir Dar Shoreline
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('footer.address', 'Bahir Dar, Amhara Region, Ethiopia')}
                </p>
              </div>
            </div>
            <div className="relative w-full h-72 sm:h-96">
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
      </div>
    </PublicLayout>
  )
}
