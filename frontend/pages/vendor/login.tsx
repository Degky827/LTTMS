import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'

export default function VendorLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.')
      return
    }

    setLoading(true)
    try {
      const res = await login(email, password, rememberMe)
      if (res.requiresTwoFactor) {
        router.push(`/login?twoFactor=true&token=${res.twoFactorToken}`)
        return
      }

      toast.success('Signed in successfully!')
      router.push('/vendor/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please verify your email and password.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Logo variant="compact" />
        </div>
        <h2 className="text-3xl font-extrabold text-primary-950 tracking-tight">
          Vendor Business Portal
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in to manage your Lake Tana tourism tours, reservations, and earnings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-elevated py-8 px-6 shadow-sm rounded-xl sm:px-10 border border-border">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Business Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@laketana.et"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-secondary-600 focus:ring-secondary-500 border-border"
                />
                <span className="text-text-secondary text-xs">Keep me signed in</span>
              </label>

              <Link href="/forgot-password" className="text-xs font-medium text-secondary-600 hover:text-secondary-700">
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={loading} className="w-full justify-center">
                Sign In to Business Portal
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-sm text-text-secondary">
              Don’t have a vendor account yet?{' '}
              <Link href="/vendor/register" className="font-semibold text-secondary-600 hover:text-secondary-700">
                Register Tourism Business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
