import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const { redirect } = router.query

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [specificErrors, setSpecificErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2FA state
  const [twoFactor, setTwoFactor] = useState<{ token: string } | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  const validate = () => {
    const e: { email?: string; password?: string } = {}
    const issues: string[] = []

    if (!form.email.trim()) {
      e.email = 'Email address is required'
      issues.push('Email: Email address is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Please enter a valid email address (e.g. name@example.com)'
      issues.push('Email: Invalid email format')
    }
    if (!form.password) {
      e.password = 'Password is required'
      issues.push('Password: Password cannot be blank')
    }
    setErrors(e)
    setSpecificErrors(issues)
    return Object.keys(e).length === 0
  }

  const handleRoleRedirect = (userRole: string) => {
    if (redirect && typeof redirect === 'string') {
      router.push(redirect)
      return
    }
    if (userRole === 'vendor') {
      router.push('/vendor/dashboard')
    } else if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'support') {
      router.push('/admin/dashboard')
    } else {
      router.push('/tourist')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSpecificErrors([])

    if (!validate()) {
      setError('Please resolve the specific validation issues highlighted below.')
      return
    }

    setLoading(true)
    try {
      const result = await login(form.email.trim().toLowerCase(), form.password, form.rememberMe)
      if (result.requiresTwoFactor) {
        setTwoFactor({ token: result.twoFactorToken || '' })
      } else {
        const user = result.user
        if (user) {
          handleRoleRedirect(user.role)
        }
      }
    } catch (err: any) {
      if (!err.response && (err.code === 'ERR_NETWORK' || err.message?.includes('Network') || !err.response)) {
        setError('Cannot connect to the LTTMS backend server (http://localhost:5000). Please start the backend server.')
        setSpecificErrors(['Network: Backend API on port 5000 is offline or connection was refused.'])
        return
      }

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
        setErrors(newFieldErrors)
        setSpecificErrors(issues)
        setError(data.message || 'Validation failed. Please correct the highlighted errors.')
      } else {
        setError(data?.message || 'Invalid email or password. Please try again.')
        setSpecificErrors([data?.message || 'Authentication credentials do not match our records.'])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError('Google Sign-In is redirecting to OAuth verification. Please use your email credentials or contact support if OAuth is in staging mode.')
  }

  const handleTwoFactorVerify = async () => {
    setError('')
    setLoading(true)
    try {
      const API = (await import('../utils/api')).default
      const res = await API.post('/auth/verify-2fa', {
        twoFactorToken: twoFactor!.token,
        code: twoFactorCode,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const user = res.data.user
      handleRoleRedirect(user.role)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <Head>
        <title>Sign In — LTTMS Lake Tana Tourism</title>
        <meta
          name="description"
          content="Sign in to your Lake Tana Tourism Management System account for tourists, certified boat operators, and administrators."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors py-12 sm:py-20 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md">
          {/* Card Box */}
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
              <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {language === 'am' ? 'እንኳን ደህና መጡ' : 'Welcome Back'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {language === 'am'
                  ? 'ወደ መለያዎ ይግቡ'
                  : 'Sign in to access your bookings, vendor desk, or admin portal'}
              </p>
            </div>

            {/* Error Message & Specific Issues */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 text-red-800 dark:text-red-200 text-xs shadow-sm">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
                {specificErrors.length > 0 && (
                  <ul className="mt-2 pl-5 space-y-1 text-[11px] list-disc text-red-700 dark:text-red-300 font-medium">
                    {specificErrors.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Two-Factor Step */}
            {twoFactor ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
                  Enter the 6-digit verification code sent to your registered device.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl bg-slate-50 dark:bg-[#0E1D19] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#244B3A]"
                />
                <button
                  type="button"
                  onClick={handleTwoFactorVerify}
                  disabled={twoFactorCode.length !== 6 || loading}
                  className="w-full py-3 rounded-full bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            ) : (
              <>
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full mb-5 py-3 px-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1D19] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-6">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-[#132620] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
                    or with email
                  </span>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value })
                        setErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                        errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                      } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-[#244B3A] dark:text-emerald-400 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value })
                          setErrors((prev) => ({ ...prev, password: undefined }))
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-4 pr-11 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#0E1D19] border ${
                          errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700/70 focus:ring-[#244B3A]'
                        } text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-[11px] font-semibold mt-1 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors.password}</span>
                      </p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={form.rememberMe}
                        onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                        className="rounded border-slate-300 dark:border-slate-700 text-[#244B3A] focus:ring-[#244B3A]"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#244B3A] hover:bg-[#1a382b] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>

                {/* Role Redirection Information Note */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Direct access automatically routes tourists, verified vendors, and portal admins.
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Don’t have an account yet?{' '}
                    <Link
                      href="/register"
                      className="text-[#244B3A] dark:text-emerald-400 font-bold hover:underline"
                    >
                      Get Started
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
