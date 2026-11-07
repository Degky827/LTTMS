import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { HeroSearch } from './HeroSearch'

export const HeroSection: React.FC = () => {
  const { language } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-slate-50 transition-colors">
      {/* Daylight Lake Tana Landscape Background */}
      <div className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex items-center">
        {/* Landscape Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/lake-tana-hero-bg.jpg"
            alt="Lake Tana Landscape, Ethiopia"
            className="w-full h-full object-cover object-right lg:object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/fixedbgforhomepage.jpg'
            }}
          />
          {/* Subtle natural daylight gradient overlay for text contrast on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content - Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-36">
          <div className="max-w-2xl text-left">
            {/* 1. Pill Badge */}
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#d7ecdf] text-[#173829] text-xs font-bold tracking-wider mb-5 shadow-sm">
              <span>{language === 'am' ? 'የኢትዮጵያን ውበት ያግኙ' : 'DISCOVER THE BEAUTY OF ETHIOPIA'}</span>
            </div>

            {/* 2. Headline with Italic Serif Accent */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold font-heading text-[#173829] tracking-tight leading-[1.08] mb-5">
              <span>Experience</span>
              <br />
              <span>Lake Tana,</span>
              <br />
              <span className="italic font-normal font-serif text-[#173829]">beyond imagination.</span>
            </h1>

            {/* 3. Subtitle */}
            <p className="text-base sm:text-lg text-[#2D3748] max-w-xl leading-relaxed mb-8 font-normal">
              {language === 'am'
                ? 'ልዩ መዳረሻዎችን ያግኙ፣ ባህላዊ ቅርሶችን ያስሱ እና እውነተኛ ተሞክሮዎችን ያግኙ።'
                : 'Discover extraordinary destinations, explore cultural heritage, and book authentic experiences.'}
            </p>

            {/* 4. Floating Horizontal Search Bar */}
            <div className="relative z-20">
              <HeroSearch />
            </div>
          </div>
        </div>

        {/* Bottom Organic Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            className="relative block w-full h-12 sm:h-20 lg:h-28 text-white"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32 C320,120 480,20 800,70 C1120,120 1280,40 1440,60 L1440,120 L0,120 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Intro transition below wave: "Discover Remarkable Places" */}
      <div className="bg-white text-center pt-8 pb-4 sm:pt-10 sm:pb-6">
        <div className="inline-flex items-center justify-center gap-3 mb-3">
          <span className="w-10 h-[1.5px] bg-[#244B3A]/30 rounded-full" />
          {/* Leaf Icon */}
          <svg
            className="w-5 h-5 text-[#244B3A]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
          <span className="w-10 h-[1.5px] bg-[#244B3A]/30 rounded-full" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-heading text-[#173829] tracking-tight">
          {language === 'am' ? 'ድንቅ ቦታዎችን ያግኙ' : 'Discover Remarkable Places'}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 font-normal">
          {language === 'am'
            ? 'የጣና ሐይቅን ተፈጥሮአዊ እና ባህላዊ ሀብቶች ያስሱ'
            : 'Explore the natural and cultural treasures of Lake Tana'}
        </p>
      </div>
    </section>
  )
}
