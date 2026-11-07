import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'

export default function VendorRegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'boat_operator',
    location: 'Bahir Dar Harbor / Lake Shore',
    agreedToTerms: false,
  })

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please provide your full name or representative name.')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid business or contact email.')
      return
    }
    if (!formData.phone.trim()) {
      setError('Please enter a reachable contact phone number.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.businessName.trim()) {
      setError('Please provide your business or enterprise name.')
      return
    }
    if (!formData.agreedToTerms) {
      setError('You must accept the Lake Tana Tourism Code of Conduct & Marketplace Terms.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'vendor',
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location,
      })

      toast.success('Vendor account registered successfully! Welcome to Lake Tana Marketplace.')
      router.push('/vendor/onboarding')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your information.'
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
          Register Tourism Enterprise
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Join Lake Tana’s official digital marketplace for boat operators, eco-lodges, guides, and cultural experiences.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-surface-elevated py-8 px-6 shadow-sm rounded-xl sm:px-10 border border-border">
          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-secondary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </span>
                <span className="text-xs font-semibold text-text-primary">Business Owner Account</span>
              </div>
              <div className="w-16 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-secondary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </span>
                <span className="text-xs font-semibold text-text-primary">Enterprise Profile</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <Input
                label="Full Name / Representative"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Abebe Kebede"
              />

              <Input
                label="Official Business Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vendor@laketana.et"
              />

              <Input
                label="Direct Mobile Phone Number"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251 91 123 4567"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repeat password"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" className="w-full justify-center">
                  Continue to Enterprise Profile
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Business / Enterprise Name"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Tana Island Boat Excursions"
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Primary Tourism Business Category <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary-500 text-sm"
                >
                  <option value="boat_operator">Boat Tour Operator</option>
                  <option value="eco_lodge">Eco-Lodge / Sustainable Accommodation</option>
                  <option value="hotel">Hotel / Guest House</option>
                  <option value="guide">Licensed Tour Guide / Escort</option>
                  <option value="tour_operator">Integrated Tour Operator</option>
                  <option value="handicraft">Traditional Handicraft & Cultural Center</option>
                  <option value="restaurant">Traditional Restaurant / Dining</option>
                  <option value="other">Other Tourism Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Primary Operating Hub <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary-500 text-sm"
                >
                  <option value="Bahir Dar Harbor / Lake Shore">Bahir Dar Harbor / Lake Shore</option>
                  <option value="Zege Peninsula">Zege Peninsula</option>
                  <option value="Dek Island">Dek Island</option>
                  <option value="Gorgora Harbor (North Shore)">Gorgora Harbor (North Shore)</option>
                  <option value="Blue Nile Falls / Tis Abay">Blue Nile Falls / Tis Abay</option>
                  <option value="Tana Qirqos Island">Tana Qirqos Island</option>
                  <option value="Other Lake Tana Region">Other Lake Tana Region</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded text-secondary-600 focus:ring-secondary-500 border-border"
                  />
                  <span className="text-xs text-text-secondary leading-relaxed">
                    I agree to the Lake Tana Tourism Code of Conduct, fair pricing guarantees, sustainable waste management principles, and the marketplace commission terms.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-1/3 justify-center"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-2/3 justify-center"
                >
                  Submit Enterprise Registration
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-sm text-text-secondary">
              Already have an enterprise account?{' '}
              <Link href="/vendor/login" className="font-semibold text-secondary-600 hover:text-secondary-700">
                Sign in to Vendor Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
