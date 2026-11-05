import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import PublicLayout from '@/components/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function UnauthorizedPage() {
  return (
    <PublicLayout>
      <Head>
        <title>401 - Unauthorized | LTTMS</title>
      </Head>
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
        <Card className="max-w-md w-full text-center border-surface-border shadow-lake-lg">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-status-warning flex items-center justify-center mb-5 shadow-lake-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-status-warning mb-1">
              Error 401
            </span>
            <h1 className="text-2xl font-bold text-text-primary font-heading mb-2">
              Authentication Required
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed mb-8">
              You must be logged in to view this protected marketplace page. Please sign in with your verified credentials or create an account.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link href="/login" className="w-full">
                <Button variant="primary" size="md" fullWidth>
                  Sign In
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" size="md" fullWidth>
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
