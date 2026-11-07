import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useTheme } from '@/components/shared/ThemeProvider'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils/cn'

export const PublicNavbar: React.FC = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { t, language } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [router.asPath])

  const navLinks = [
    { href: '/', label: t('nav.home', 'Home') },
    { href: '/services', label: t('nav.services', 'Explore Services') },
    { href: '/destinations', label: language === 'am' ? 'መዳረሻዎች' : 'Destinations' },
    { href: '/eco-tourism', label: t('nav.ecoTourism', 'Eco-Tourism') },
    { href: '/history', label: t('nav.monasteries', 'Monasteries & History') },
    { href: '/about', label: t('nav.aboutLakeTana', 'About Lake Tana') },
    { href: '/contact', label: t('nav.contactUs', 'Contact') },
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

  const getDashboardLabel = () => {
    if (user?.role === 'admin' || user?.role === 'super_admin') return language === 'am' ? 'አድሚን ፖርታል' : 'Admin Portal'
    if (user?.role === 'vendor') return language === 'am' ? 'የአቅራቢ ፖርታል' : 'Vendor Portal'
    return language === 'am' ? 'የእኔ ቦታ ማስያዣዎች' : 'My Bookings'
  }

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Utility Announcement Bar */}
      <div className="bg-primary-950 text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-primary-900/60 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t('nav.unescoBanner', 'UNESCO Biosphere Reserve • Lake Tana, Ethiopia')}
            </span>
            <span className="text-primary-700 hidden md:inline">|</span>
            <span className="text-gray-300 hidden md:inline">
              {language === 'am'
                ? 'በቀጥታ ከተረጋገጡ የአካባቢው አስጎብኚዎች ጋር ይያዙ'
                : 'Direct bookings with verified local operators'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="text-gray-300 hover:text-white p-1 rounded transition-colors flex items-center gap-1.5 text-xs"
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="hidden sm:inline text-[11px]">{language === 'am' ? 'ብርሃን' : 'Light'}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="hidden sm:inline text-[11px]">{language === 'am' ? 'ጨለማ' : 'Dark'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div
        className={cn(
          'w-full transition-all duration-300 border-b',
          scrolled
            ? 'bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-md border-surface-border py-2.5'
            : 'bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-sm border-surface-border/50 py-3.5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Logo variant="full" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 font-bold'
                      : 'text-text-secondary hover:text-primary-700 dark:hover:text-primary-300 hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Action Area */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{getDashboardLabel()}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-text-secondary hover:text-red-600 dark:hover:text-red-400 px-2 py-1 transition-colors"
                >
                  {t('nav.logout', 'Sign Out')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-text-primary hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                >
                  {t('nav.login', 'Sign In')}
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-surface-border text-text-primary hover:bg-surface-muted transition-colors shadow-sm"
                >
                  {t('nav.register', 'Register')}
                </Link>

                <Link
                  href="/vendor/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary-700 hover:bg-primary-800 text-white shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-3.5 h-3.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{language === 'am' ? 'አቅራቢ ይሁኑ' : 'Become a Partner'}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-text-primary hover:bg-surface-muted transition-colors border border-surface-border"
              aria-label="Toggle navigation menu"
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
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface dark:bg-surface-dark border-b border-surface-border shadow-2xl px-4 py-5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1.5 mb-5">
            {navLinks.map((link) => {
              const isActive = router.pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="pt-4 border-t border-surface-border flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="w-full text-center py-2.5 text-sm font-bold rounded-xl bg-primary-700 text-white shadow-sm"
                >
                  {getDashboardLabel()}
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-center py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                >
                  {t('nav.logout', 'Sign Out')}
                </button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="w-full text-center py-2.5 text-xs font-bold rounded-xl border border-surface-border text-text-primary hover:bg-surface-muted transition-colors"
                  >
                    {t('nav.login', 'Sign In')}
                  </Link>
                  <Link
                    href="/register"
                    className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-surface-muted text-text-primary hover:bg-surface-border transition-colors"
                  >
                    {t('nav.register', 'Register')}
                  </Link>
                </div>

                <Link
                  href="/vendor/register"
                  className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-primary-700 text-white shadow-sm hover:bg-primary-800 transition-colors"
                >
                  {language === 'am' ? 'የቱሪዝም አቅራቢ ይሁኑ' : 'Become a Tourism Partner'}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
