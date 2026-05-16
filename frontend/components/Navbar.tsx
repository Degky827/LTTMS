import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  FaBars, FaTimes, FaLeaf, FaGlobe,
  FaCompass, FaStore, FaCalendarCheck, FaStar,
  FaWater, FaEnvelope, FaTree, FaTachometerAlt,
  FaSignInAlt, FaUserPlus, FaUser
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
        ? 'bg-white/90 backdrop-blur-md shadow-xl py-2'
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FaLeaf />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-3">
              <div className="text-lg font-bold bg-gradient-to-r from-primary to-emerald-500 text-transparent bg-clip-text leading-tight">
                Lake Tana
              </div>
              <div className="text-[10px] text-gray-600 font-medium leading-tight">Eco-Tourism</div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center">
            <Link href="/" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap">{t('nav.home')}</Link>
            <Link href="/services" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaCompass className="inline mr-1.5" />{t('nav.services')}</Link>
            <Link href={user?.role === 'vendor' ? '/vendor/dashboard' : '/vendors'} className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaStore className="inline mr-1.5" />{t('nav.vendors')}</Link>
            <Link href="/booking" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaCalendarCheck className="inline mr-1.5" />{t('nav.bookings')}</Link>
            <Link href="/eco-tourism" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaTree className="inline mr-1.5" />{t('nav.ecoTourism')}</Link>
            <Link href="/reviews" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaStar className="inline mr-1.5" />{t('nav.reviews')}</Link>
            <Link href="/about" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaWater className="inline mr-1.5" />{t('nav.aboutLakeTana')}</Link>
            <Link href="/contact" className="px-3 py-2.5 rounded-lg font-medium text-sm text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300 whitespace-nowrap"><FaEnvelope className="inline mr-1.5" />{t('nav.contactUs')}</Link>

            <div className="ml-3 flex items-center space-x-2">
              {!user ? (
                <>
                  {!loading && (
                    <>
                      <Link href="/register" className="px-4 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-all duration-300 whitespace-nowrap border border-gray-200">{t('nav.register')}</Link>
                      <Link href="/login" className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center whitespace-nowrap"><FaSignInAlt className="mr-1.5" />{t('nav.login')}</Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                    <FaUser className="text-primary text-xs" />
                    <span className="font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'vendor' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>{user.role}</span>
                  </div>
                  {(user.role === 'admin' || user.role === 'vendor') && (
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard'} className="px-3 py-2.5 rounded-lg font-medium text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 whitespace-nowrap flex items-center"><FaTachometerAlt className="mr-1.5" />{t('nav.dashboard')}</Link>
                  )}
                  <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 whitespace-nowrap">{t('nav.logout')}</button>
                </>
              )}

              {/* Language Selector */}
              <div className="relative group ml-1">
                <div className="flex items-center space-x-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-200 cursor-pointer group-hover:border-primary transition-colors">
                  <FaGlobe className="text-gray-500 group-hover:text-primary transition-colors text-sm" />
                  <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'am')} className="bg-transparent focus:outline-none text-gray-700 font-medium text-sm appearance-none cursor-pointer">
                    <option value="en">EN</option>
                    <option value="am">አማ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-primary transition-colors">
            {isOpen ? <FaTimes size={20} className="text-gray-700" /> : <FaBars size={20} className="text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-6 rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-xl">
            <div className="p-4 space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}>{t('nav.home')}</Link>
              <Link href="/services" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaCompass className="inline mr-2" />{t('nav.services')}</Link>
              <Link href={user?.role === 'vendor' ? '/vendor/dashboard' : '/vendors'} className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaStore className="inline mr-2" />{t('nav.vendors')}</Link>
              <Link href="/booking" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaCalendarCheck className="inline mr-2" />{t('nav.bookings')}</Link>
              <Link href="/eco-tourism" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaTree className="inline mr-2" />{t('nav.ecoTourism')}</Link>
              <Link href="/reviews" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaStar className="inline mr-2" />{t('nav.reviews')}</Link>
              <Link href="/about" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaWater className="inline mr-2" />{t('nav.aboutLakeTana')}</Link>
              <Link href="/contact" className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-emerald-500/5 transition-all duration-300" onClick={() => setIsOpen(false)}><FaEnvelope className="inline mr-2" />{t('nav.contactUs')}</Link>

              {!user ? (
                <div className="pt-4 border-t space-y-2">
                  <Link href="/login" className="block w-full text-center bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300" onClick={() => setIsOpen(false)}><FaSignInAlt className="inline mr-2" />{t('nav.login')}</Link>
                  <Link href="/register" className="block w-full text-center border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-primary hover:text-primary transition-all duration-300" onClick={() => setIsOpen(false)}><FaUserPlus className="inline mr-2" />{t('nav.register')}</Link>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-2">
                  <div className="px-4 py-2 flex items-center gap-2 text-sm text-gray-600"><FaUser className="text-primary" /> {user.name} <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'vendor' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>{user.role}</span></div>
                  {(user.role === 'admin' || user.role === 'vendor') && (
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard'} className="block px-4 py-3 rounded-xl font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-all duration-300" onClick={() => setIsOpen(false)}><FaTachometerAlt className="inline mr-2" />{t('nav.dashboard')}</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-colors">{t('nav.logout')}</button>
                </div>
              )}

              {/* Mobile Language Selector */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center"><FaGlobe className="text-gray-500 mr-3" /><span className="font-medium text-gray-700">{t('nav.language')}</span></div>
                  <select value={lang} onChange={e => setLang(e.target.value as 'en' | 'am')} className="bg-transparent focus:outline-none text-gray-700 font-medium border rounded-lg px-3 py-1 text-sm">
                    <option value="en">English</option>
                    <option value="am">አማርኛ</option>
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
