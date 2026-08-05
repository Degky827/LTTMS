import { useRouter } from 'next/router'
import { useEffect, ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import PublicNavbar from './PublicNavbar'
import Footer from './Footer'
import PageTransition from './PageTransition'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/vendors', '/services']

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const path = router.pathname

  const isPublicRoute = PUBLIC_ROUTES.some(r => path.startsWith(r))
  const isDashboardRoute = path.startsWith('/admin') || path.startsWith('/vendor')

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute && !isDashboardRoute) {
      router.replace('/register')
    }
  }, [loading, isAuthenticated, isPublicRoute, isDashboardRoute, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (isDashboardRoute) {
    if (!isAuthenticated) return null
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={router.pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  )
}
