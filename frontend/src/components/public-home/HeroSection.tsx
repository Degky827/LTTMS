import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { HeroSearch } from './HeroSearch'

export const HeroSection: React.FC = () => {
  const { t, language } = useLanguage()

  return (
    <section className="relative bg-primary-950 text-white overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 lg:pb-36">
      {/* Background Image & Dual Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fixedbgforhomepage.jpg"
          alt="Lake Tana Landscape, Ethiopia"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transform motion-safe:animate-fade-in"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/LakeTana.jpg'
          }}
        />
        {/* Multilayer gradient ensuring razor-sharp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/80 via-primary-950/70 to-surface dark:to-surface-dark" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* UNESCO Biosphere Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t('home.heroBadge', 'UNESCO Biosphere Reserve • Lake Tana, Ethiopia')}</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-sm">
          {language === 'am' ? (
            <>
              የጣና ሐይቅን ዘመን የማይሽረው <span className="text-gold-400">ድንቅ እና ውበት</span> ያግኙ
            </>
          ) : (
            <>
              Discover the Beauty of <span className="text-gold-400">Lake Tana</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed font-normal">
          {t(
            'home.heroSubtitle',
            'Explore 14th-century island monasteries, unforgettable boat excursions, abundant wildlife, and authentic Ethiopian hospitality with verified local operators.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-bold text-sm shadow-xl shadow-primary-950/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{language === 'am' ? 'ጉብኝቶችን ያስሱ' : 'Explore Experiences'}</span>
            <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/destinations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition-all"
          >
            <span>{language === 'am' ? 'ቅዱሳን መዳረሻዎች' : 'Sacred Destinations'}</span>
            <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </Link>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-2">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-gold-400">37+</div>
            <div className="text-xs text-gray-300 font-medium mt-0.5">
              {language === 'am' ? 'ደሴቶች እና ገዳማት' : 'Island Monasteries'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-gold-400">217+</div>
            <div className="text-xs text-gray-300 font-medium mt-0.5">
              {language === 'am' ? 'የአዕዋፋት ዝርያዎች' : 'Bird Species'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-gold-400">100%</div>
            <div className="text-xs text-gray-300 font-medium mt-0.5">
              {language === 'am' ? 'የተረጋገጡ አስጎብኚዎች' : 'Verified Local Guides'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-gold-400">0%</div>
            <div className="text-xs text-gray-300 font-medium mt-0.5">
              {language === 'am' ? 'ያለ ደላላ ኮሚሽን' : 'Middleman Markup'}
            </div>
          </div>
        </div>

        {/* Docked Search Box */}
        <div className="mt-10 -mb-16 sm:-mb-24 lg:-mb-28 relative z-20">
          <HeroSearch />
        </div>
      </div>
    </section>
  )
}
