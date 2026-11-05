import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaLeaf, FaChevronRight, FaShieldAlt } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Image from 'next/image'

export default function Login() {
  const { login } = useAuth()
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
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) e.email = 'Please enter a valid email'
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
        const user = result.user; if (!user) return;
        if (user.role === 'vendor') router.push('/vendor/dashboard')
        else if (user.role === 'admin') router.push('/admin/dashboard')
        else router.push('/booking')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactor = async () => {
    setError('')
    setLoading(true)
    try {
      const API = (await import('../utils/api')).default
      const res = await API.post('/auth/verify-2fa', { twoFactorToken: twoFactor!.token, code: twoFactorCode })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const user = res.data.user
      if (user.role === 'vendor') router.push('/vendor/dashboard')
      else if (user.role === 'admin') router.push('/admin/dashboard')
      else router.push('/booking')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code')
    } finally {
      setLoading(false)
    }
  }

  if (twoFactor) {
    return (
      <div>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl"><FaShieldAlt /></div>
              <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-gray-500 mt-2">Enter the 6-digit code sent to your email/phone</p>
            </div>
            {error && <p className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</p>}
            <input
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.5em] border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50 mb-6"
            />
            <button onClick={handleTwoFactor} disabled={twoFactorCode.length !== 6 || loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/LakeTana.jpg" alt="Login" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Back</span></h1>
            <p className="text-lg text-gray-200">Sign in to manage your bookings and eco-adventures</p>
          </div>
        </div>
      </section>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="flex items-center justify-center gap-2 mb-8">
              <FaLeaf className="text-emerald-500 text-2xl" />
              <span className="text-lg font-bold text-gray-900">Lake Tana Eco-Tourism</span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); setErrors(prev => ({ ...prev, email: undefined })) }}
                    placeholder="you@example.com"
                    className={`w-full border ${errors.email ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => { setForm({ ...form, password: e.target.value }); setErrors(prev => ({ ...prev, password: undefined })) }}
                    placeholder="Enter your password"
                    className={`w-full border ${errors.password ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.rememberMe} onChange={e => setForm({ ...form, rememberMe: e.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-semibold">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : <>Sign In <FaChevronRight className="text-sm" /></>}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary/80 font-semibold">Create one</Link>
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
              <Link href="/" className="hover:text-gray-600">Home</Link>
              <span>·</span>
              <Link href="/services" className="hover:text-gray-600">Services</Link>
              <span>·</span>
              <Link href="/contact" className="hover:text-gray-600">Contact</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}


