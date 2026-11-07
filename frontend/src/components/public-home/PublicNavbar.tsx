import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  id: string
  labelEn: string
  labelAm: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelEn: 'Home', labelAm: 'መነሻ' },
  { id: 'explore', labelEn: 'Explore', labelAm: 'አስስ' },
  { id: 'destinations', labelEn: 'Destinations', labelAm: 'መዳረሻዎች' },
  { id: 'experiences', labelEn: 'Experiences', labelAm: 'ተሞክሮዎች' },
  { id: 'eco-tourism', labelEn: 'Eco-Tourism', labelAm: 'ኢኮ-ቱሪዝም' },
  { id: 'about', labelEn: 'About', labelAm: 'ስለ እኛ' },
  { id: 'contact', labelEn: 'Contact', labelAm: 'አድራሻ' },
]

export const PublicNavbar: React.FC = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const { language } = useLanguage()

  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track active section and scroll state
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 15)

      // Only perform single-page section spy when on the homepage
      if (router.pathname !== '/') return

      // Near bottom of the page -> activate 'contact'
      if (window.innerHeight + Math.ceil(scrollY) >= document.documentElement.scrollHeight - 60) {
        setActiveSection('contact')
        return
      }

      // At top of page -> activate 'home'
      if (scrollY < 120) {
        setActiveSection('home')
        return
      }

      const navHeight = 76
      let current = 'home'

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= navHeight + 80) {
            current = item.id
          }
        }
      }

      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [router.pathname])

  // Handle hash on initial load or route transition
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace('#', '')
    if (hash && NAV_ITEMS.some((item) => item.id === hash)) {
      setTimeout(() => {
        const target = document.getElementById(hash)
        if (target) {
          const navHeight = 72
          const elementPosition = target.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = Math.max(0, elementPosition - navHeight)
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
          setActiveSection(hash)
        }
      }, 150)
    }
  }, [router.asPath])

  // Smooth scroll handler with sticky navbar offset
  const handleNavClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    if (router.pathname !== '/') {
      router.push(`/#${sectionId}`)
      return
    }

    const targetElement = document.getElementById(sectionId)
    if (targetElement) {
      const navHeight = 72
      const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = Math.max(0, elementPosition - navHeight)

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      setActiveSection(sectionId)
      window.history.pushState(null, '', `#${sectionId}`)
    }
  }

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
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300 select-none bg-white',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200/80 py-2.5'
          : 'bg-white border-b border-neutral-200/60 py-3.5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Professional LTTMS Logo */}
        <Link
          href="/#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className="inline-flex items-center gap-3 group focus:outline-none"
        >
          {/* Logo Badge Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
            <svg
              className="w-full h-full"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Golden circular sun in background */}
              <circle cx="27" cy="19" r="11" fill="#F59E0B" opacity="0.95" />

              {/* Evergreen pine forest on the left */}
              <path d="M12 15L15 21H9L12 15Z" fill="#1B4332" />
              <path d="M12 19L16 26H8L12 19Z" fill="#1B4332" />

              <path d="M19 11L23 18H15L19 11Z" fill="#244B3A" />
              <path d="M19 16L24 24H14L19 16Z" fill="#244B3A" />
              <path d="M19 22L25 31H13L19 22Z" fill="#244B3A" />

              <path d="M7 20L10 25H4L7 20Z" fill="#2D5A43" />
              <path d="M7 23L11 30H3L7 23Z" fill="#2D5A43" />

              {/* Traditional Lake Tana Boat & Mast */}
              <line x1="33" y1="11" x2="33" y2="28" stroke="#78350F" strokeWidth="1.75" strokeLinecap="round" />
              {/* Main triangular sail */}
              <path d="M33 13L42 26H33V13Z" fill="#D97706" />
              {/* Jib front sail */}
              <path d="M31 16L25 26H31V16Z" fill="#B45309" opacity="0.85" />
              {/* Boat hull */}
              <path
                d="M22 28C25 31 38 31 43 28L40 31.5C35 33 27 33 24 31.5L22 28Z"
                fill="#78350F"
              />

              {/* Cyan / Blue Lake Waves */}
              <path
                d="M2 33C7 31 12 34 17 33C22 32 27 34 32 33C37 32 42 34 46 33"
                stroke="#0284C7"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M5 37.5C10 36 15 38.5 20 37.5C25 36.5 30 38.5 35 37.5C40 36.5 44 38 46 37.5"
                stroke="#38BDF8"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 42C13 40.5 18 43 23 42C28 41 33 43 38 42C42 41 45 42 46 42"
                stroke="#0284C7"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Logo Typography */}
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 leading-none font-heading">
              LTTMS
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-neutral-600 tracking-normal mt-0.5">
              Lake Tana Tourism
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id
            const label = language === 'am' ? item.labelAm : item.labelEn
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleNavClick(e, item.id)}
                className={cn(
                  'relative py-1 text-sm font-medium transition-colors duration-200 focus:outline-none',
                  isActive
                    ? 'text-[#244B3A] font-semibold'
                    : 'text-neutral-700 hover:text-[#244B3A]'
                )}
              >
                <span>{label}</span>
                {/* Active Underline Indicator Bar */}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#244B3A] rounded-full transition-all duration-200" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sign In */}
          {isAuthenticated ? (
            <Link
              href={getDashboardLink()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-[#244B3A] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">{getDashboardLabel()}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-[#244B3A] transition-colors"
            >
              {/* User Silhouette Icon */}
              <svg
                className="w-4 h-4 text-neutral-700"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{language === 'am' ? 'ግባ' : 'Sign In'}</span>
            </Link>
          )}

          {/* Divider */}
          <div className="h-4 w-[1px] bg-neutral-300" aria-hidden="true" />

          {/* Get Started Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-red-600 rounded-full hover:bg-neutral-100 transition-colors"
            >
              {language === 'am' ? 'ውጣ' : 'Sign Out'}
            </button>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full bg-[#244B3A] hover:bg-[#1b392c] text-white text-sm font-semibold transition-all duration-200 shadow-sm active:scale-95"
            >
              {language === 'am' ? 'ጀምር' : 'Get Started'}
            </Link>
          )}

          {/* Mobile Hamburger Menu Toggle (Only on mobile devices < lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-neutral-800 hover:text-[#244B3A] hover:bg-neutral-100 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200/80 shadow-2xl px-5 py-6 animate-in slide-in-from-top-3 duration-200">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mb-5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              const label = language === 'am' ? item.labelAm : item.labelEn
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left',
                    isActive
                      ? 'bg-neutral-100 text-[#244B3A] font-bold'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'
                  )}
                >
                  <span>{label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#244B3A]" />}
                </button>
              )
            })}
          </nav>

          {/* Action Buttons in Mobile Drawer */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-medium text-neutral-500">Language:</span>
              <LanguageSwitcher />
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold rounded-xl bg-[#244B3A] text-white shadow-sm"
                >
                  {getDashboardLabel()}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logout()
                  }}
                  className="w-full text-center py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  {language === 'am' ? 'ውጣ' : 'Sign Out'}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold rounded-xl border border-neutral-200 text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  {language === 'am' ? 'ግባ' : 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold rounded-xl bg-[#244B3A] text-white shadow-sm hover:bg-[#1b392c] transition-colors"
                >
                  {language === 'am' ? 'ጀምር' : 'Get Started'}
                </Link>
              </div>
            )}

            <Link
              href="/vendor/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-xs font-semibold text-neutral-600 hover:text-[#244B3A] transition-colors"
            >
              {language === 'am' ? 'የቱሪዝም አቅራቢ ይሁኑ →' : 'Become a Tourism Partner →'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
