import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'

export default function TouristPortalDashboard() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>Tourist Portal | LTTMS</title>
      </Head>
      <TouristLayout title="Tourist Portal">
        <PageHeader
          title={`Welcome back, ${user?.name || 'Explorer'}!`}
          subtitle="Manage your Lake Tana tour reservations, eco-adventures, reviews, and travel itinerary."
          breadcrumbs={[
            { label: 'Marketplace', href: '/' },
            { label: 'Tourist Portal' },
          ]}
          actions={
            <Link href="/services">
              <Button variant="primary" size="sm">
                Explore More Tours
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card bordered>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-primary-600 font-heading">0</span>
                <Badge variant="primary" size="sm">Upcoming</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                No upcoming boat tours or eco-excursions scheduled yet.
              </p>
            </CardContent>
          </Card>

          <Card bordered>
            <CardHeader>
              <CardTitle>Eco-Impact Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-teal-600 font-heading">100%</span>
                <Badge variant="secondary" size="sm">Biosphere</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Your bookings directly fund UNESCO Lake Tana conservation.
              </p>
            </CardContent>
          </Card>

          <Card bordered>
            <CardHeader>
              <CardTitle>My Verified Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-gold-600 font-heading">0</span>
                <Badge variant="accent" size="sm">Feedback</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Share your journey to help fellow travelers explore sustainably.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Navigation Foundation */}
        <Card bordered>
          <CardHeader>
            <CardTitle>Start Your Lake Tana Adventure</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">
                Discover Ancient Monasteries & Wildlife Tours
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                Browse certified local boat captains, cultural guides, and lakeside lodges.
              </p>
            </div>
            <Link href="/services">
              <Button variant="accent" size="md">
                Browse Services Catalog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </TouristLayout>
    </ProtectedRoute>
  )
}
