import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export const FinalCallToAction: React.FC = () => {
  const { language } = useLanguage()

  const trustBadges = [
    {
      labelEn: 'Telebirr, CBE & Cards',
      labelAm: 'ቴሌብር፣ ሲቢኢ እና ካርዶች',
    },
    {
      labelEn: 'Flexible Free Cancellation',
      labelAm: 'ነጻ የመሰረዝ ዕድል',
    },
    {
      labelEn: 'Verified Bahir Dar Guides',
      labelAm: 'የተረጋገጡ የባሕር ዳር አስጎብኚዎች',
    },
    {
      labelEn: 'UNESCO Biosphere Support',
      labelAm: 'የዩኔስኮ ባዮስፌር ድጋፍ',
    },
  ]

  return (
    <section className="py-24 bg-surface dark:bg-surface-dark transition-colors relative overflow-hidden border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/80 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-300 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            <span>{language === 'am' ? 'የጣና ሐይቅ የተሟላ የቱሪዝም መድረክ' : 'Complete Lake Tana Marketplace'}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-text-primary tracking-tight leading-tight">
            {language === 'am' ? (
              <>የማይረሳው የጣና ሐይቅ ጉዞዎ <span className="text-primary-700 dark:text-primary-400">ዛሬውኑ ይጀምራል</span></>
            ) : (
              <>Your Lake Tana Experience <span className="text-primary-700 dark:text-primary-400">Starts Here</span></>
            )}
          </h2>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed">
            {language === 'am'
              ? 'የጀልባ ጉዞዎችን፣ የደሴት ገዳማት ጉብኝቶችን ወይም የሐይቅ ዳርቻ ማረፊያዎችን በደቂቃዎች ውስጥ ከተረጋገጡ የአካባቢው አቅራቢዎች ጋር ይያዙ።'
              : 'Book your boat tour, island monastery excursion, or lakeside stay in minutes directly with verified local operators.'}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-extrabold text-sm shadow-xl shadow-primary-950/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{language === 'am' ? 'ሁሉንም ጉብኝቶች ያስሱ' : 'Browse All Experiences'}</span>
              <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-surface-border bg-surface dark:bg-surface-dark hover:bg-surface-muted text-text-primary font-bold text-sm shadow-sm transition-all"
            >
              <span>{language === 'am' ? 'ነጻ አካውንት ይክፈቱ' : 'Create Free Account'}</span>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-14 pt-10 border-t border-surface-border flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-text-secondary">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{language === 'am' ? badge.labelAm : badge.labelEn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
