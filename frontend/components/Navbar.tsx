import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import {
  FaBars, FaTimes, FaLeaf, FaGlobe,
  FaCompass, FaStore, FaCalendarCheck, FaStar,
  FaWater, FaEnvelope, FaTree, FaTachometerAlt,
  FaSignInAlt, FaUserPlus, FaUser, FaHome
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const navLinks = [
  { href: '/', label: 'nav.home', icon: FaHome },
  { href: '/services', label: 'nav.services', icon: FaCompass },
  { href: '/vendors', label: 'nav.vendors', icon: FaStore },
  { href: '/booking', label: 'nav.bookings', icon: FaCalendarCheck },
  { href: '/eco-tourism', label: 'nav.ecoTourism', icon: FaTree },
  { href: '/reviews', label: 'nav.reviews', icon: FaStar },
  { href: '/about', label: 'nav.aboutLakeTana', icon: FaWater },
  { href: '/contact', label: 'nav.contactUs', icon: FaEnvelope },
]

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = useCallback((href: string) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }, [router.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-gray-900/95 backdrop-blur-md shadow-2xl py-2'
        : 'bg-gray-900 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaLeaf />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-3">
              <div className="text-lg font-bold text-white leading-tight">
                Lake Tana
              </div>
              <div className="text-[10px] text-white/70 font-medium leading-tight">Eco-Tourism</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                    active
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="inline mr-1.5" />
                  {t(link.label)}
                </Link>
              )
            })}

            <div className="ml-3 flex items-center space-x-2">
              {!user ? (
                <>
                  {!loading && (
                    <>
                      <Link href="/register" className="px-4 py-2.5 rounded-lg font-medium text-sm text-white/90 hover:text-white hover:bg-white/15 transition-all duration-300 whitespace-nowrap border border-white/30">{t('nav.register')}</Link>
                      <Link href="/login" className="bg-white text-gray-900 px-4 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center whitespace-nowrap"><FaSignInAlt className="mr-1.5" />{t('nav.login')}</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 border border-white/20 text-sm">
                    <FaUser className="text-white/80 text-xs" />
                    <span className="font-medium text-white max-w-[100px] truncate">{user.name}</span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      user.role === 'admin' ? 'bg-purple-500/30 text-purple-200' :
                      user.role === 'vendor' ? 'bg-amber-500/30 text-amber-200' :
                      'bg-emerald-500/30 text-emerald-200'
                    }`}>{user.role}</span>
                  </div>
                  {(user.role === 'admin' || user.role === 'vendor') && (
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard'} className="px-3 py-2.5 rounded-lg font-medium text-sm bg-white/15 text-white hover:bg-white/25 transition-all duration-300 whitespace-nowrap flex items-center"><FaTachometerAlt className="mr-1.5" />{t('nav.dashboard')}</Link>
                  )}
                  <button onClick={handleLogout} className="text-white/70 hover:text-red-300 transition font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/10 whitespace-nowrap">{t('nav.logout')}</button>
                </>
              )}

              {/* Language Selector */}
              <div className="relative group ml-1">
                <div className="flex items-center space-x-1 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 cursor-pointer group-hover:bg-white/20 transition-colors">
                  <FaGlobe className="text-white/70 group-hover:text-white transition-colors text-sm" />
                  <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'am')} className="bg-transparent focus:outline-none text-white font-medium text-sm appearance-none cursor-pointer">
                    <option value="en" className="text-gray-800">EN</option>
                    <option value="am" className="text-gray-800">አማ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
            {isOpen ? <FaTimes size={20} className="text-white" /> : <FaBars size={20} className="text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-6 rounded-2xl bg-gray-900 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="p-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="inline mr-2" />{t(link.label)}
                  </Link>
                )
              })}

              {!user ? (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <Link href="/login" className="block w-full text-center bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300" onClick={() => setIsOpen(false)}><FaSignInAlt className="inline mr-2" />{t('nav.login')}</Link>
                  <Link href="/register" className="block w-full text-center border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300" onClick={() => setIsOpen(false)}><FaUserPlus className="inline mr-2" />{t('nav.register')}</Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <div className="px-4 py-2 flex items-center gap-2 text-sm text-white/80"><FaUser className="text-white/60" /> {user.name} <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    user.role === 'admin' ? 'bg-purple-500/30 text-purple-200' :
                    user.role === 'vendor' ? 'bg-amber-500/30 text-amber-200' :
                    'bg-emerald-500/30 text-emerald-200'
                  }`}>{user.role}</span></div>
                  {(user.role === 'admin' || user.role === 'vendor') && (
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard'} className="block px-4 py-3 rounded-xl font-medium text-white bg-white/15 hover:bg-white/25 transition-all duration-300" onClick={() => setIsOpen(false)}><FaTachometerAlt className="inline mr-2" />{t('nav.dashboard')}</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl font-medium text-red-200 hover:bg-white/10 transition-colors">{t('nav.logout')}</button>
                </div>
              )}

              {/* Mobile Language Selector */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center"><FaGlobe className="text-white/60 mr-3" /><span className="font-medium text-white/80">{t('nav.language')}</span></div>
                  <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'am')} className="bg-white/10 border border-white/20 text-white font-medium rounded-lg px-3 py-1 text-sm focus:outline-none">
                    <option value="en" className="text-gray-800">English</option>
                    <option value="am" className="text-gray-800">አማርኛ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
