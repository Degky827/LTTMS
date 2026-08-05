import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaStore, FaLeaf, FaChevronRight, FaUpload, FaCheckCircle } from 'react-icons/fa'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Image from 'next/image'

export default function Register() {
  const { register } = useAuth()
  const router = useRouter()
  const { redirect } = router.query
  const [role, setRole] = useState<'tourist' | 'vendor'>('tourist')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', businessName: '', businessDesc: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const passwordStrength = (pw: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pw.length >= 6) score++
    if (pw.length >= 10) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-green-500']
    return { score, label: labels[score] || 'Weak', color: colors[score] || colors[1] }
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
        role
      })
      setSuccess(true)
      setTimeout(() => {
        if (redirect) router.push(redirect as string)
        else if (role === 'vendor') router.push('/vendor/dashboard')
        else router.push('/booking')
      }, 2000)
    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response)
      console.error('Error response data:', err.response?.data)
      console.error('Error message:', err.response?.data?.message)
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center"><FaCheckCircle className="text-white text-4xl" /></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500">Check your email to verify your account before your first booking.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-56 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/LakeTana.jpg" alt="Register" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div>
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
              <FaLeaf className="mr-2 text-emerald-300" />
              <span className="text-white text-sm font-medium">Join Lake Tana Eco-Tourism</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Account</span></h1>
            <p className="text-lg text-gray-200">Start your eco-adventure journey today</p>
          </div>
        </div>
      </section>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Role Toggle */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-6">
            <div className="grid grid-cols-2 gap-3 mb-8 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setRole('tourist')} className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${role === 'tourist' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <FaUser /> Tourist
              </button>
              <button onClick={() => setRole('vendor')} className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${role === 'vendor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <FaStore /> Vendor
              </button>
            </div>

            {role === 'vendor' && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                <p className="font-semibold mb-1">Vendor Registration</p>
                <p>You'll need to verify your business license after registration. Our team will review and approve your vendor account within 48 hours.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your Name" required className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+251 9X XXX XXXX" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                </div>
              </div>

              {role === 'vendor' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name *</label>
                    <div className="relative">
                      <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} placeholder="Your Business Name" required className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
                    <textarea value={form.businessDesc} onChange={e => setForm({ ...form, businessDesc: e.target.value })} rows={3} placeholder="Tell us about your eco-tourism business..." className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50 resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business License</label>
                    <label className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary/50 bg-gray-50/50 text-sm text-gray-500">
                      <FaUpload className="text-primary" />
                      {licenseFile ? licenseFile.name : 'Upload license document (optional)'}
                      <input type="file" accept=".pdf,.jpg,.png" onChange={e => setLicenseFile(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  </div>
                </>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= passwordStrength(form.password).score ? passwordStrength(form.password).color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Strength: {passwordStrength(form.password).label} {passwordStrength(form.password).score >= 4 && '✓'}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" required className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50/50" />
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-red-500 text-xs mt-1.5">Passwords do not match</p>}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Creating Account...' : <><FaLeaf /> Create {role === 'vendor' ? 'Vendor' : 'Tourist'} Account <FaChevronRight className="text-sm" /></>}
              </button>

              <p className="text-xs text-gray-400 text-center">By registering, you agree to our Terms of Service and Privacy Policy.</p>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">Already have an account? <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
