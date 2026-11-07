import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaStore,
  FaChevronRight,
  FaUpload,
  FaCheckCircle,
} from 'react-icons/fa'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { redirect } = router.query

  const [role, setRole] = useState<'tourist' | 'vendor'>('tourist')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessDesc: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const passwordStrength = (
    pw: string
  ): { score: number; label: string; color: string } => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-primary-500',
      'bg-primary-700',
    ]
    return {
      score,
      label: labels[score] || 'Weak',
      color: colors[score] || colors[1],
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
      })
      setSuccess(true)
      setTimeout(() => {
        if (redirect) router.push(redirect as string)
        else if (role === 'vendor') router.push('/vendor/dashboard')
        else router.push('/tourist')
      }, 1800)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <PublicLayout>
        <Head>
          <title>{`${t('auth.accountCreated', 'Account Created!')} | LTTMS`}</title>
        </Head>
        <div className="bg-surface-muted/40 min-h-screen flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300">
              <FaCheckCircle className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">
              {t('auth.accountCreated', 'Account Created!')}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {t(
                'auth.accountCreatedDesc',
                'Check your email to verify your account before your first booking.'
              )}
            </p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Head>
        <title>{`${t('auth.createAccount', 'Create Your Account')} | LTTMS`}</title>
        <meta
          name="description"
          content="Create a tourist or verified vendor account on the Lake Tana Tourism platform."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-3">
              🌿 {t('common.lakeTana', 'Lake Tana')} {t('common.ecoTourism', 'Eco-Tourism')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t('auth.createAccount', 'Create Your Account')}
            </h1>
            <p className="mt-2 text-sm text-primary-100/90">
              {t(
                'auth.createAccountSubtitle',
                'Start your eco-adventure journey today'
              )}
            </p>
          </div>
        </div>

        {/* Register Card */}
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-muted border border-surface-border rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole('tourist')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  role === 'tourist'
                    ? 'bg-surface text-text-primary shadow-sm border border-surface-border'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <FaUser className="text-xs" />
                <span>{t('auth.tourist', 'Tourist')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  role === 'vendor'
                    ? 'bg-surface text-text-primary shadow-sm border border-surface-border'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <FaStore className="text-xs" />
                <span>{t('auth.vendor', 'Vendor')}</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-2.5 text-xs mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    {t('auth.fullName', 'Full Name')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Abebe Bikila"
                      required
                      className="w-full border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    {t('auth.email', 'Email Address')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="abebe@example.com"
                      required
                      className="w-full border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('auth.phone', 'Phone Number')}
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+251 9X XXX XXXX"
                    className="w-full border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {role === 'vendor' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      {t('auth.businessName', 'Business Name')}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaStore className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                      <input
                        type="text"
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        placeholder="Lake Tana Boat Tours Cooperative"
                        required
                        className="w-full border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      {t('auth.businessDesc', 'Business Description')}
                    </label>
                    <textarea
                      rows={2}
                      value={form.businessDesc}
                      onChange={(e) => setForm({ ...form, businessDesc: e.target.value })}
                      placeholder="Tell us about your tourism services..."
                      className="w-full border border-surface-border rounded-xl p-3 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      {t('auth.businessLicense', 'Business License')}
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-surface-border rounded-xl cursor-pointer hover:border-primary-500 bg-surface-muted text-xs text-text-secondary">
                      <FaUpload className="text-primary-700 dark:text-primary-400" />
                      <span>
                        {licenseFile
                          ? licenseFile.name
                          : t('auth.uploadLicense', 'Upload license document (optional)')}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    {t('auth.password', 'Password')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full border border-surface-border rounded-xl pl-9 pr-10 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-xs" />
                      ) : (
                        <FaEye className="text-xs" />
                      )}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i <= passwordStrength(form.password).score
                                ? passwordStrength(form.password).color
                                : 'bg-surface-border'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-text-secondary">
                        Strength: {passwordStrength(form.password).label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    {t('auth.confirmPassword', 'Confirm Password')}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      placeholder={t('auth.repeatPassword', 'Repeat password')}
                      required
                      className="w-full border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm disabled:opacity-50"
              >
                <span>
                  {loading
                    ? t('auth.creatingAccount', 'Creating Account...')
                    : role === 'vendor'
                    ? 'Create Vendor Account'
                    : 'Create Tourist Account'}
                </span>
                <FaChevronRight className="text-xs" />
              </button>

              <p className="text-[11px] text-text-secondary text-center leading-normal">
                {t(
                  'auth.agreeTerms',
                  'By registering, you agree to our Terms of Service and Privacy Policy.'
                )}
              </p>
            </form>

            <div className="mt-6 pt-5 border-t border-surface-border text-center text-xs text-text-secondary">
              <p>
                {t('auth.haveAccount', 'Already have an account?')}{' '}
                <Link
                  href="/login"
                  className="text-primary-700 dark:text-primary-400 font-bold hover:underline"
                >
                  {t('auth.signIn', 'Sign In')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
