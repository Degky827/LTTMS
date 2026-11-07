import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const { redirect, role: queryRole } = router.query

  const [role, setRole] = useState<'tourist' | 'vendor'>('tourist')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'boat_operator',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [specificErrors, setSpecificErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Sync role query param
  useEffect(() => {
    if (queryRole === 'vendor') {
      setRole('vendor')
    }
  }, [queryRole])

  const calculatePasswordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++

    if (score <= 1) return { label: 'Weak (min 6 characters)', color: 'bg-red-500', width: '25%' }
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' }
    if (score === 3 || score === 4) return { label: 'Good', color: 'bg-emerald-500', width: '75%' }
    return { label: 'Strong', color: 'bg-emerald-600', width: '100%' }
  }

  const validateClientSide = () => {
    const errs: Record<string, string> = {}
    const issues: string[] = []

    if (!form.name.trim()) {
      errs.name = 'Full name is required'
      issues.push('Name: Full name is required')
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long'
      issues.push('Name: Must be at least 2 characters long')
    }

    if (!form.email.trim()) {
      errs.email = 'Email address is required'
      issues.push('Email: Email address is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com)'
      issues.push('Email: Invalid email format')
    }

    if (form.phone.trim() && !/^\+?[0-9\s-]{7,20}$/.test(form.phone.trim())) {
      errs.phone = 'Please enter a valid phone number (digits only)'
      issues.push('Phone: Invalid phone format')
    }

    if (!form.password) {
      errs.password = 'Password is required'
      issues.push('Password: Password is required')
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long'
      issues.push('Password: Must be at least 6 characters long')
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required'
      issues.push('Confirm Password: Field cannot be empty')
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
      issues.push('Confirm Password: Passwords do not match')
    }

    if (role === 'vendor') {
      if (!form.businessName.trim()) {
        errs.businessName = 'Business or cooperative name is required'
        issues.push('Business Name: Required for vendor registration')
      } else if (form.businessName.trim().length < 2) {
        errs.businessName = 'Business name must be at least 2 characters long'
        issues.push('Business Name: Must be at least 2 characters long')
      }
    }

    setFieldErrors(errs)
    setSpecificErrors(issues)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSpecificErrors([])

    if (!validateClientSide()) {
      setError('Please resolve the specific validation issues highlighted below.')
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
      }
      if (form.phone.trim()) {
        payload.phone = form.phone.trim()
      }
      if (role === 'vendor') {
        payload.businessName = form.businessName.trim()
        payload.businessType = form.businessType
      }

      await register(payload)
      setSuccess(true)
      setTimeout(() => {
        if (redirect && typeof redirect === 'string') {
          router.push(redirect)
        } else if (role === 'vendor') {
          router.push('/vendor/dashboard')
        } else {
          router.push('/tourist')
        }
      }, 1600)
    } catch (err: any) {
      // 1. Connection Refused / Network Error
      if (!err.response && (err.code === 'ERR_NETWORK' || err.message?.includes('Network') || !err.response)) {
        setError('Cannot connect to the LTTMS backend server (http://localhost:5000). Please start the backend server.')
        setSpecificErrors(['Network: Backend API on port 5000 is offline or connection was refused.'])
        return
      }

      // 2. Specific Backend Validation Issues (e.g. Zod validation or duplicate key)
      const data = err.response?.data
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const issues: string[] = []
        const newFieldErrors: Record<string, string> = {}

        data.errors.forEach((issue: any) => {
          const field = issue.field || 'general'
          const msg = issue.message || 'Validation error'
          newFieldErrors[field] = msg
          issues.push(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`)
        })

        setFieldErrors(newFieldErrors)
        setSpecificErrors(issues)
        setError(data.message || 'Validation failed. Please correct the highlighted errors.')
      } else if (data?.message) {
        // e.g. "User with this email already exists"
        setError(data.message)
        if (data.message.toLowerCase().includes('email')) {
          setFieldErrors({ email: data.message })
          setSpecificErrors([`Email: ${data.message}`])
        } else {
          setSpecificErrors([data.message])
        }
      } else {
        setError('Registration failed. Please check your information.')
        setSpecificErrors(['Unknown error occurred during registration. Please verify all fields.'])
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = calculatePasswordStrength(form.password)

  if (success) {
    return (
      <PublicLayout>
        <Head>
          <title>Account Created Successfully | LTTMS</title>
        </Head>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white dark:bg-[#132620] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-5">
              ✓
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white mb-2">
              Welcome to LTTMS!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Your account has been created. A verification link has been sent to <strong className="text-slate-900 dark:text-white">{form.email}</strong> to activate full booking privileges.
            </p>
            <div className="animate-pulse text-xs font-semibold text-[#244B3A] dark:text-emerald-400">
              Redirecting you to your {role === 'vendor' ? 'Vendor Portal' : 'Tourist Portal'}...
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Head>
        <title>Get Started — Register | Lake Tana Tourism (LTTMS)</title>
        <meta
          name="description"
          content="Create a tourist account or register your Lake Tana boat cooperative, guide business, or eco-lodge on LTTMS."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors py-12 sm:py-20 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-xl">
          {/* Main Card */}
          <div className="bg-white dark:bg-[#132620] rounded-3xl p-8 sm:p-10 border border-slate-200/90 dark:border-slate-800/90 shadow-xl transition-all">
            {/* Header / Brand */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#244B3A] dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                  </svg>
                </div>
                <span className="text-xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
                  LTTMS
                </span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">
                Get Started with LTTMS
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose your account type to explore authentic experiences or list your local tourism services.
              </p>
            </div>

            {/* Clear Role Selection Upfront */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-100 dark:bg-[#0E1D19] rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              {/* Tourist Card Toggle */}
              <button
                type="button"
                onClick={() => {
                  setRole('tourist')
                  setFieldErrors({})
                  setSpecificErrors([])
                  setError('')
                }}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl text-center transition-all ${
                  role === 'tourist'
                    ? 'bg-white dark:bg-[#132620] text-[#244B3A] dark:text-emerald-400 shadow-md font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <div className="text-2xl mb-1">🧳</div>
                <div className="text-sm font-heading">Tourist Account</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                  Discover &amp; book verified excursions
                </div>
              </button>

              {/* Vendor Card Toggle */}
              <button
                type="button"
                onClick={() => {
                  setRole('vendor')
                  setFieldErrors({})
                  setSpecificErrors([])
                  setError('')
                }}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl text-center transition-all ${
                  role === 'vendor'
                    ? 'bg-white dark:bg-[#132620] text-[#244B3A] dark:text-emerald-400 shadow-md font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <div className="text-2xl mb-1">⛵</div>
                <div className="text-sm font-heading">Vendor / Partner</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                  List boats, tours &amp; eco-lodges
                </div>
              </button>
            </div>

            {/* Error Message & Specific Validation Issues Summary Box */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-800 dark:text-red-200 text-xs shadow-sm">
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>

                {/* Specific issues bullet list */}
                {specificErrors.length > 0 && (
                  <ul className="mt-2 pl-5 space-y-1 text-[11px] list-disc text-red-700 dark:text-red-300 font-medium">
                    {specificErrors.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value })
                      setFieldErrors((prev) => ({ ...prev, name: '' }))
                    }}
                    placeholder="Abebe Bikila"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                      fieldErrors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{fieldErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value })
                      setFieldErrors((prev) => ({ ...prev, email: '' }))
                    }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                      fieldErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value })
                    setFieldErrors((prev) => ({ ...prev, phone: '' }))
                  }}
                  placeholder="+251 9X XXX XXXX"
                  className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                    fieldErrors.phone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                  } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <span>⚠</span>
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* Vendor-Specific Fields */}
              {role === 'vendor' && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    Vendor Business Details
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Business or Cooperative Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={(e) => {
                        setForm({ ...form, businessName: e.target.value })
                        setFieldErrors((prev) => ({ ...prev, businessName: '' }))
                      }}
                      placeholder="e.g. Lake Tana Boatmen Cooperative"
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-[#0E1D19] border ${
                        fieldErrors.businessName
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-[#244B3A]'
                      } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                    />
                    {fieldErrors.businessName && (
                      <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{fieldErrors.businessName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Primary Service Category
                    </label>
                    <select
                      value={form.businessType}
                      onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#244B3A] cursor-pointer"
                    >
                      <option value="boat_operator">Boat Transportation &amp; Island Charters</option>
                      <option value="guide">Certified Monastic &amp; Nature Guides</option>
                      <option value="lodge">Waterfront Eco-Lodges &amp; Chalets</option>
                      <option value="hotel">Lakeside Hotels &amp; Resorts</option>
                      <option value="restaurant">Cultural Fish Tasting &amp; Coffee Ceremonies</option>
                      <option value="tour_operator">Integrated Tour Operators</option>
                      <option value="other">Handicraft Weaving &amp; Papyrus Guilds</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value })
                        setFieldErrors((prev) => ({ ...prev, password: '' }))
                      }}
                      placeholder="At least 6 characters"
                      className={`w-full pl-4 pr-11 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                        fieldErrors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                      } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value })
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }))
                    }}
                    placeholder="Repeat password"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                      fieldErrors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                    } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{fieldErrors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Password Strength:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}

              {/* Account Verification & Privacy Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                By registering, you agree to LTTMS’s Lake Tana Eco-Tourism Charter and safety protocols. An activation email will be dispatched immediately.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>
                  {loading
                    ? 'Creating Account...'
                    : role === 'vendor'
                    ? 'Register as Tourism Partner'
                    : 'Create Tourist Account'}
                </span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Bottom Link to Sign In */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#244B3A] dark:text-emerald-400 font-bold hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
