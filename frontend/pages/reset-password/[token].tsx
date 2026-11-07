import Head from 'next/head'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { FaLock, FaEye, FaEyeSlash, FaLeaf, FaCheckCircle } from 'react-icons/fa'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const API = (await import('../../utils/api')).default
      await API.put(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <Head>
        <title>Reset Password | Lake Tana Eco-Tourism</title>
      </Head>
      <section className="relative h-48 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/bgservice&about.avif" alt="Reset password" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Reset <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Password</span></h1>
            <p className="text-lg text-gray-200">Choose a new password for your account</p>
          </div>
        </div>
      </section>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center"><FaCheckCircle className="text-white text-4xl" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Password Reset!</h2>
              <p className="text-gray-500 mb-6">Your password has been updated successfully.</p>
              <Link href="/login" className="inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">Sign In</Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-6"><FaLeaf className="text-emerald-500 text-2xl" /><span className="text-lg font-bold text-gray-900">New Password</span></div>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
