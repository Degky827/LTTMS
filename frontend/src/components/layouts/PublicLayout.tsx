import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useTheme } from '@/components/shared/ThemeProvider'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

export interface PublicLayoutProps {
  children: React.ReactNode
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/services', label: t('nav.services', 'Explore Services') },
    { href: '/vendors', label: t('nav.vendors', 'Vendors') },
    { href: '/eco-tourism', label: t('nav.ecoTourism', 'Eco-Tourism') },
    { href: '/history', label: t('nav.monasteries', 'Monasteries & History') },
    { href: '/about', label: t('nav.aboutLakeTana', 'About Lake Tana') },
    { href: '/contact', label: t('nav.contactUs', 'Contact Us') },
  ]

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'support') {
      return '/admin/dashboard'
    }
    if (user.role === 'vendor') {
      return '/vendor/dashboard'
    }
    return '/tourist'
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted text-text-primary">
      {/* Top Utility Bar */}
      <div className="bg-primary-900 text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-primary-800 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              UNESCO Biosphere Reserve • Lake Tana, Ethiopia
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">Sustainable Travel & Preservation</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="text-gray-300 hover:text-white p-1 rounded transition-colors"
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-border shadow-lake-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
          <Logo variant="full" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-xs font-semibold tracking-wide transition-colors hover:text-primary-600',
                    isActive ? 'text-primary-600 font-bold border-b-2 border-primary-500 py-1' : 'text-text-secondary'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link href={getDashboardLink()}>
                  <Button variant="primary" size="sm">
                    {t('nav.dashboard', 'My Portal')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  {t('nav.logout', 'Sign Out')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.login', 'Sign In')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="accent" size="sm">
                    {t('nav.register', 'Register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-surface-border p-4 shadow-lake-lg animate-slide-down">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'p-2.5 rounded-lg text-sm font-medium transition-colors',
                    router.pathname === link.href
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-text-primary hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-4 mt-3 border-t border-surface-border flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>
                      {t('nav.dashboard', 'My Portal')}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="md" fullWidth onClick={() => logout()}>
                    {t('nav.logout', 'Sign Out')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="md" fullWidth>
                      {t('nav.login', 'Sign In')}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="accent" size="md" fullWidth>
                      {t('nav.register', 'Register')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="bg-primary-950 text-white mt-auto border-t border-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Logo variant="full" theme="dark" />
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Integrated Lake Tana Eco-Tourism & Booking Marketplace. Promoting sustainable community tourism, cultural heritage preservation, and seamless visitor experiences in Bahir Dar, Ethiopia.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Explore Lake Tana
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/services" className="hover:text-gold-300 transition-colors">
                  Monastery Boat Tours
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-gold-300 transition-colors">
                  Blue Nile Falls Excursions
                </Link>
              </li>
              <li>
                <Link href="/eco-tourism" className="hover:text-gold-300 transition-colors">
                  Eco-Badge Certification
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-gold-300 transition-colors">
                  Biosphere Reserve History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Marketplace Portals
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/tourist" className="hover:text-gold-300 transition-colors">
                  Tourist Booking Portal
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="hover:text-gold-300 transition-colors">
                  Become a Certified Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="hover:text-gold-300 transition-colors">
                  Vendor Partner Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-gold-300 transition-colors">
                  Administration Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4">
              Support & Inquiries
            </h4>
            <p className="text-xs text-gray-400 mb-2">
              Bahir Dar, Amhara Region, Ethiopia
            </p>
            <p className="text-xs text-gray-400 mb-4">
              support@laketana-tourism.com
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified Eco-Tourism Platform
            </div>
          </div>
        </div>

        <div className="border-t border-primary-900 py-6 px-4 text-center text-[11px] text-gray-500">
          © {new Date().getFullYear()} Lake Tana Tourism Management System (LTTMS). All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
