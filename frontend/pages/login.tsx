import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaLeaf,
  FaChevronRight,
  FaShieldAlt,
} from 'react-icons/fa'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [twoFactor, setTwoFactor] = useState<{ token: string } | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: { email?: string; password?: string } = {}
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email))
      e.email = 'Please enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const result = await login(form.email, form.password, form.rememberMe)
      if (result.requiresTwoFactor) {
        setTwoFactor({ token: result.twoFactorToken || '' })
      } else {
        const user = result.user
        if (!user) return
        if (user.role === 'vendor') router.push('/vendor/dashboard')
        else if (user.role === 'admin') router.push('/admin/dashboard')
        else router.push('/tourist')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactor = async () => {
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
      if (user.role === 'vendor') router.push('/vendor/dashboard')
      else if (user.role === 'admin') router.push('/admin/dashboard')
      else router.push('/tourist')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code')
    } finally {
      setLoading(false)
    }
  }

  if (twoFactor) {
    return (
      <PublicLayout>
        <Head>
          <title>{t('auth.twoFactorTitle', 'Two-Factor Authentication')} | LTTMS</title>
        </Head>
        <div className="bg-surface-muted/40 min-h-screen flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl">
                <FaShieldAlt />
              </div>
              <h2 className="text-xl font-bold font-heading text-text-primary">
                {t('auth.twoFactorTitle', 'Two-Factor Authentication')}
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                {t(
                  'auth.twoFactorSubtitle',
                  'Enter the 6-digit code sent to your email or phone'
                )}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-2.5 text-xs mb-4">
                {error}
              </div>
            )}

            <input
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] border border-surface-border rounded-xl px-4 py-3 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 mb-5 font-mono"
            />

            <button
              onClick={handleTwoFactor}
              disabled={twoFactorCode.length !== 6 || loading}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
            >
              {loading
                ? t('auth.verifying', 'Verifying...')
                : t('auth.verifyCode', 'Verify Code')}
            </button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Head>
        <title>{t('auth.signIn', 'Sign In')} | LTTMS</title>
        <meta
          name="description"
          content="Sign in to your Lake Tana Tourism account to manage bookings and vendor services."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t('auth.welcomeBack', 'Welcome Back')}
            </h1>
            <p className="mt-2 text-sm text-primary-100/90">
              {t(
                'auth.signInSubtitle',
                'Sign in to manage your bookings and eco-adventures'
              )}
            </p>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6 text-primary-700 dark:text-primary-300">
              <FaLeaf className="text-xl" />
              <span className="font-bold text-base font-heading text-text-primary">
                {t('common.lakeTana', 'Lake Tana')} {t('common.ecoTourism', 'Eco-Tourism')}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-2.5 text-xs mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('auth.email', 'Email Address')}
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value })
                      setErrors((prev) => ({ ...prev, email: undefined }))
                    }}
                    placeholder="you@example.com"
                    className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? 'border-red-400' : 'border-surface-border'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value })
                      setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.password ? 'border-red-400' : 'border-surface-border'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-text-secondary">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="rounded border-surface-border text-primary-700 focus:ring-primary-500"
                  />
                  <span>{t('auth.rememberMe', 'Remember me')}</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary-700 dark:text-primary-400 hover:underline font-semibold"
                >
                  {t('auth.forgotPassword', 'Forgot password?')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm disabled:opacity-50"
              >
                <span>
                  {loading
                    ? t('auth.signingIn', 'Signing in...')
                    : t('auth.signIn', 'Sign In')}
                </span>
                <FaChevronRight className="text-xs" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-surface-border text-center text-xs text-text-secondary">
              <p>
                {t('auth.noAccount', "Don't have an account?")}{' '}
                <Link
                  href="/register"
                  className="text-primary-700 dark:text-primary-400 font-bold hover:underline"
                >
                  {t('auth.createOne', 'Create one')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
