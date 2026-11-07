import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export const HowItWorks: React.FC = () => {
  const { language } = useLanguage()

  const steps = [
    {
      num: '01',
      titleEn: 'Discover & Compare',
      titleAm: 'ይፈልጉ እና ያነጻጽሩ',
      descEn: 'Filter authentic boat cruises, sacred monastery tours, and eco-lodges with 100% transparent pricing.',
      descAm: 'የጀልባ ጉዞዎችን፣ የገዳማት ጉብኝቶችን እና ኢኮ-ሎጆችን ግልጽ በሆነ የአገር ውስጥ ዋጋ ያወዳድሩ።',
      icon: (
        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      num: '02',
      titleEn: 'Choose Certified Operators',
      titleAm: 'የተረጋገጡ አቅራቢዎችን ይምረጡ',
      descEn: 'Select verified Bahir Dar captains and indigenous guides with proven safety and eco-certification badges.',
      descAm: 'ደህንነታቸውና የአካባቢ ጥበቃ ደረጃቸው የተረጋገጡ የባሕር ዳር ካፒቴኖችን እና አስጎብኚዎችን ይምረጡ።',
      icon: (
        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      num: '03',
      titleEn: 'Instant Secure Booking',
      titleAm: 'ቀጥተኛ አስተማማኝ ክፍያ',
      descEn: 'Pay effortlessly using Telebirr, CBE Birr, Chapa, or global cards with guaranteed booking protection.',
      descAm: 'በቴሌብር፣ በሲቢኢ ብር፣ በቻፓ ወይም በክሬዲት ካርድ በአስተማማኝ ሁኔታ ፈጣን ቦታ ማስያዝ ይፈጽሙ።',
      icon: (
        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      num: '04',
      titleEn: 'Experience Lake Tana',
      titleAm: 'የማይረሳ ጉብኝትዎን ይጀምሩ',
      descEn: 'Meet your boat captain at Bahir Dar harbor with your digital QR pass and embark on an eco-friendly journey.',
      descAm: 'በባሕር ዳር ወደብ ከጀልባ ካፒቴንዎ ጋር በዲጂታል ኩፖን ይገናኙ እና አስደናቂ ጉዞዎን ይጀምሩ።',
      icon: (
        <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 bg-surface-muted dark:bg-surface-dark/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-widest block mb-2">
            {language === 'am' ? 'ቀላል አሰራር' : 'Simple 4-Step Journey'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-text-primary">
            {language === 'am'
              ? 'ኤልቲቲኤምኤስ እንዴት ይሰራል?'
              : 'How LTTMS Works'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {language === 'am'
              ? 'ከመፈለግ ጀምሮ በሐይቁ ላይ እስከመንሸራሸር ድረስ ፈጣን እና አስተማማኝ አሰራር።'
              : 'From discovering excursions to boarding your boat in Bahir Dar, booking your journey is seamless.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-surface dark:bg-surface-dark border border-surface-border rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-extrabold font-heading text-gold-500/80 select-none">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold font-heading text-text-primary mb-2">
                  {language === 'am' ? step.titleAm : step.titleEn}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed font-normal">
                  {language === 'am' ? step.descAm : step.descEn}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-primary-300 dark:text-primary-700">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
