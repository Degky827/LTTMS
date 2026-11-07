import Head from 'next/head'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { FaEnvelope, FaLeaf, FaPaperPlane, FaCheckCircle, FaArrowLeft } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const API = (await import('../utils/api')).default
      await API.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please check the email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <Head>
        <title>{t('auth.forgotPassword', 'Forgot password?')} | LTTMS</title>
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              {t('auth.forgotPassword', 'Forgot password?')}
            </h1>
            <p className="mt-2 text-sm text-primary-100/90">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300">
                  <FaCheckCircle className="text-2xl" />
                </div>
                <h2 className="text-xl font-bold font-heading text-text-primary mb-2">
                  Check Your Email
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
                  If an account exists for <strong className="text-text-primary">{email}</strong>, a password reset link has been dispatched.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-400 hover:underline"
                >
                  <FaArrowLeft className="text-xs" />
                  <span>{t('auth.signIn', 'Sign In')}</span>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-6 text-primary-700 dark:text-primary-300">
                  <FaLeaf className="text-xl" />
                  <span className="font-bold text-base font-heading text-text-primary">
                    Reset Account Access
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm disabled:opacity-50"
                  >
                    <FaPaperPlane className="text-xs" />
                    <span>{loading ? t('common.loading', 'Loading...') : 'Send Reset Link'}</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-surface-border text-center text-xs text-text-secondary">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-bold text-primary-700 dark:text-primary-400 hover:underline"
                  >
                    <FaArrowLeft className="text-xs" />
                    <span>Back to {t('auth.signIn', 'Sign In')}</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
