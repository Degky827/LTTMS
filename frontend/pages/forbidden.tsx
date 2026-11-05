import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import PublicLayout from '@/components/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'

export default function ForbiddenPage() {
  const { user } = useAuth()

  const getPortalHome = () => {
    if (!user) return '/'
    if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'support') {
      return '/admin/dashboard'
    }
    if (user.role === 'vendor') {
      return '/vendor/dashboard'
    }
    return '/tourist'
  }

  return (
    <PublicLayout>
      <Head>
        <title>403 - Access Forbidden | LTTMS</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
        <Card className="max-w-md w-full text-center border-surface-border shadow-lake-lg">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-status-danger flex items-center justify-center mb-5 shadow-lake-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-status-danger mb-1">
              Error 403
            </span>
            <h1 className="text-2xl font-bold text-text-primary font-heading mb-2">
              Access Forbidden
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Your account role ({user?.role || 'anonymous'}) does not possess the required RBAC permissions to access this specific portal section.
            </p>
            <p className="text-[11px] text-text-muted mb-8">
              If you believe this is in error, please contact the Lake Tana Tourism platform administration.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link href={getPortalHome()} className="w-full">
                <Button variant="primary" size="md" fullWidth>
                  Return to Your Portal
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" size="md" fullWidth>
                  Public Marketplace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
