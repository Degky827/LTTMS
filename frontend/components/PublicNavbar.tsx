import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBars, FaTimes, FaLeaf, FaGlobe,
  FaCompass, FaStore, FaCalendarCheck, FaStar,
  FaWater, FaEnvelope, FaTree, FaHome
} from 'react-icons/fa'
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

const linkVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export default function PublicNavbar() {
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
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-gray-900 py-4'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center group shrink-0"
            aria-label="Lake Tana Eco-Tourism Home"
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-lg transition-transform duration-300">
                <FaLeaf />
              </div>
            </motion.div>
            <div className="ml-3">
              <div className="text-lg font-bold text-white leading-tight tracking-tight">
                Lake Tana
              </div>
              <div className="text-[10px] text-white/70 font-medium leading-tight tracking-wide uppercase">Eco-Tourism</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <motion.div
                  key={link.href}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`relative px-3 py-2 rounded-lg font-medium text-sm transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                      active
                        ? 'text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="text-xs" />
                    {t(link.label)}
                    {active && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 bg-white/15 rounded-lg -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}

            <div className="ml-2 pl-2 border-l border-white/20">
              <div className="relative group">
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
                  <FaGlobe className="text-white/60 group-hover:text-white transition-colors text-xs" />
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value as 'en' | 'am')}
                    className="bg-transparent focus:outline-none text-white font-medium text-xs appearance-none cursor-pointer"
                    aria-label="Select language"
                  >
                    <option value="en" className="text-gray-800">EN</option>
                    <option value="am" className="text-gray-800">አማ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <FaTimes size={20} className="text-white" /> : <FaBars size={20} className="text-white" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-4 overflow-hidden"
            >
              <div className="pb-4 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="p-4 space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Link
                          href={link.href}
                          className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                          onClick={() => setIsOpen(false)}
                          aria-current={active ? 'page' : undefined}
                        >
                          <Icon className="inline mr-2 text-sm" />
                          {t(link.label)}
                        </Link>
                      </motion.div>
                    )
                  })}

                  <div className="pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FaGlobe className="text-white/60" />
                        <span className="font-medium text-white/70 text-sm">{t('nav.language')}</span>
                      </div>
                      <select
                        value={lang}
                        onChange={e => setLang(e.target.value as 'en' | 'am')}
                        className="bg-white/10 border border-white/20 text-white font-medium rounded-lg px-3 py-1 text-sm focus:outline-none"
                        aria-label="Select language"
                      >
                        <option value="en" className="text-gray-800">English</option>
                        <option value="am" className="text-gray-800">አማርኛ</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
