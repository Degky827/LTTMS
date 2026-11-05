import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import Navbar from './Navbar'
import PublicNavbar from './PublicNavbar'
import Footer from './Footer'
import PageTransition from './PageTransition'

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/eco-tourism',
  '/history',
  '/services',
  '/vendors',
  '/reviews',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/unauthorized',
  '/forbidden',
]

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const path = router.pathname

  const isPublicRoute = PUBLIC_ROUTES.some((r) => r === path || path.startsWith(`${r}/`))
  const isDashboardRoute =
    path.startsWith('/admin') || path.startsWith('/vendor') || path.startsWith('/tourist')

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute && !isDashboardRoute) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, isPublicRoute, isDashboardRoute, router])

  if (isLoading) {
    return <LoadingScreen fullScreen message="Loading Lake Tana Experiences..." />
  }

  // Dashboard routes handle their own layouts (TouristLayout, VendorLayout, AdminLayout)
  if (isDashboardRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white text-text-primary">
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={router.pathname}>{children}</PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
