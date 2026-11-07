import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { vendorService } from '@/features/vendors/services/vendorService'
import { Vendor } from '@/features/vendors/types'

export default function VendorOnboardingPage() {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await vendorService.getMyProfile()
        if (res.success) {
          setVendor(res.data)
        }
      } catch (err) {
        // Not yet created
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [])

  const steps = [
    {
      id: 1,
      title: 'Complete Business Profile',
      desc: 'Add your business logo, description, operating hours, and location on Lake Tana.',
      href: '/vendor/profile',
      status: vendor?.location && vendor?.businessName ? 'completed' : 'pending',
    },
    {
      id: 2,
      title: 'Upload KYC Verification Documents',
      desc: 'Submit your valid trade license, boat permit, or official identification for compliance review.',
      href: '/vendor/verification',
      status:
        vendor?.verificationStatus === 'approved'
          ? 'completed'
          : vendor?.verificationStatus === 'submitted' || vendor?.verificationStatus === 'under_review'
          ? 'in_progress'
          : 'pending',
    },
    {
      id: 3,
      title: 'Publish Tourism Services',
      desc: 'Create and list your boat trips, monastery excursions, cultural workshops, or accommodation.',
      href: '/vendor/services/new',
      status: (vendor?.services && vendor.services.length > 0) ? 'completed' : 'pending',
    },
    {
      id: 4,
      title: 'Configure Payout Account',
      desc: 'Link your Ethiopian Commercial Bank (CBE), Telebirr, or CBE Birr account for seamless payouts.',
      href: '/vendor/settings',
      status: vendor?.payoutDetails?.accountNumber ? 'completed' : 'pending',
    },
  ]

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['vendor']}>
        <VendorLayout title="Business Onboarding & Setup">
          <div className="py-20 text-center text-text-secondary">
            <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading onboarding steps...</p>
          </div>
        </VendorLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Business Onboarding & Setup">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-secondary-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block py-1 px-2.5 rounded-full bg-secondary-500/20 text-secondary-300 text-xs font-semibold mb-2">
                  Enterprise Activation
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome, {vendor?.businessName || 'Partner'}!
                </h1>
                <p className="mt-2 text-primary-200 text-sm max-w-xl">
                  Complete these four simple steps to get your tourism offerings verified, approved, and listed on the Lake Tana Eco-Tourism Marketplace.
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => router.push('/vendor/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Stepper Checklist */}
          <div className="space-y-4">
            {steps.map((s, idx) => (
              <Card key={s.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        s.status === 'completed'
                          ? 'bg-success-100 text-success-700'
                          : s.status === 'in_progress'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-primary-50 text-primary-800'
                      }`}
                    >
                      {s.status === 'completed' ? (
                        <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-text-primary">{s.title}</h2>
                        {s.status === 'completed' && <Badge variant="success">Completed</Badge>}
                        {s.status === 'in_progress' && <Badge variant="warning">Under Review</Badge>}
                        {s.status === 'pending' && <Badge variant="default">Action Required</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{s.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Link href={s.href}>
                      <Button variant={s.status === 'completed' ? 'outline' : 'primary'} size="sm">
                        {s.status === 'completed' ? 'Review Details' : 'Complete Step'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Eco-Certification Callout */}
          <Card className="p-6 bg-secondary-50/50 border-secondary-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary-100 text-secondary-800 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-primary-950">
                  Qualify for Official Lake Tana Eco-Tourism Badges
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Once your business is verified, you can apply for Bronze, Silver, Gold, or Platinum Eco-Tourism certifications by demonstrating sustainable operations, lake conservation practices, and local community benefits.
                </p>
                <div className="mt-3">
                  <Link href="/vendor/eco-badge">
                    <Button variant="outline" size="sm">
                      Learn About Eco-Badges
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
