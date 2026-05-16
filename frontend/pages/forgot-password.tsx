import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaEnvelope, FaLeaf, FaPaperPlane, FaCheckCircle } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPassword() {
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
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <section className="relative h-48 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/bgservice&about.avif" alt="Reset password" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Forgot <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Password</span></h1>
            <p className="text-lg text-gray-200">We'll send you a reset link</p>
          </div>
        </div>
      </section>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center"><FaCheckCircle className="text-white text-4xl" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
              <p className="text-gray-500 mb-6">If an account exists for <strong>{email}</strong>, we've sent a password reset link.</p>
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-6"><FaLeaf className="text-emerald-500 text-2xl" /><span className="text-lg font-bold text-gray-900">Reset Password</span></div>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">⚠ {error}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Sending...' : <><FaPaperPlane /> Send Reset Link</>}
                </button>
              </form>
              <div className="mt-6 text-center"><Link href="/login" className="text-sm text-primary hover:text-primary/80 font-semibold">← Back to Login</Link></div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
