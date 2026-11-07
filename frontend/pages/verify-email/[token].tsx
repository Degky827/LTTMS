import Head from 'next/head'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { FaCheckCircle, FaTimesCircle, FaLeaf } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

export default function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    const verify = async () => {
      try {
        const API = (await import('../../utils/api')).default
        const res = await API.get(`/auth/verify-email/${token}`)
        setStatus('success')
        setMessage(res.data.message)
      } catch (err: any) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired.')
      }
    }
    verify()
  }, [token])

  return (
    <PublicLayout>
      <Head>
        <title>Verify Email | Lake Tana Eco-Tourism</title>
      </Head>
      <section className="relative h-48 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/bgservice&about.avif" alt="Verify email" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Email <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Verification</span></h1>
          </div>
        </div>
      </section>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center animate-pulse"><FaLeaf className="text-white text-4xl" /></div>
              <p className="text-gray-500">Verifying your email...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center"><FaCheckCircle className="text-white text-4xl" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link href="/login" className="inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">Sign In</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center"><FaTimesCircle className="text-white text-4xl" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h2>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
