import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export default function BookingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/tourist/bookings')
      } else {
        router.replace('/services')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <>
      <Head>
        <title>Bookings | Lake Tana Eco-Tourism</title>
      </Head>
      <LoadingScreen fullScreen message="Loading bookings..." />
    </>
  )
}
