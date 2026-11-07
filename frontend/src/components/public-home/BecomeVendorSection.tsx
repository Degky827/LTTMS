import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export const BecomeVendorSection: React.FC = () => {
  const { language } = useLanguage()

  const perks = [
    {
      titleEn: 'Zero Upfront Fees',
      titleAm: 'ምንም የቅድመ ምዝገባ ክፍያ የለም',
      descEn: 'List your boat, lodge, or tour experience completely free.',
      descAm: 'የእርስዎን ጀልባ፣ ሎጅ ወይም አስጎብኚ አገልግሎት በነጻ ያስመዝግቡ።',
    },
    {
      titleEn: 'Direct Telebirr & CBE Payouts',
      titleAm: 'በቴሌብር እና በሲቢኢ ቀጥተኛ ክፍያ',
      descEn: 'Receive tourist booking revenues directly into your bank or mobile wallet without delay.',
      descAm: 'የተጓዦች ክፍያ በቀጥታ ወደ ባንክ ሂሳብዎ ወይም የቴሌብር ቁጥርዎ ገቢ ይሆናል።',
    },
    {
      titleEn: 'Reach Global & Domestic Tourists',
      titleAm: 'ዓለም አቀፍ እና የሀገር ውስጥ ጎብኚዎችን ያግኙ',
      descEn: 'Connect with thousands of verified travelers searching specifically for Lake Tana experiences.',
      descAm: 'የጣና ሐይቅን ለመጎብኘት የሚፈልጉ በሺዎች የሚቆጠሩ ጎብኚዎችን በቀጥታ ያግኙ።',
    },
    {
      titleEn: 'Free Eco-Certification Training',
      titleAm: 'ነጻ የኢኮ-ቱሪዝም ስልጠና እና ባጅ',
      descEn: 'Get audited and certified with our Lake Tana Eco-Badge to win high-value eco-travelers.',
      descAm: 'የጣና ሐይቅ የኢኮ-ባጅ ማረጋገጫ በመውሰድ ብዙ ተጓዦችን ይስቡ።',
    },
  ]

  return (
    <section className="py-20 bg-surface-muted dark:bg-surface-dark/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 text-white overflow-hidden shadow-2xl p-8 sm:p-12 lg:p-16 border border-primary-800">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-400/20 text-gold-400 text-xs font-bold mb-4">
                <span className="w-2 h-2 rounded-full bg-gold-400" />
                <span>{language === 'am' ? 'የቱሪዝም ንግድዎን ያሳድጉ' : 'Partner With Us'}</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white leading-tight">
                {language === 'am' ? (
                  <>በጣና ሐይቅ የቱሪዝም ንግድዎን <span className="text-gold-400">ከእኛ ጋር ያሳድጉ</span></>
                ) : (
                  <>Grow Your Tourism Business on <span className="text-gold-400">Lake Tana</span></>
                )}
              </h2>

              <p className="mt-4 text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                {language === 'am'
                  ? 'የጀልባ ባለንብረት፣ አስጎብኚ፣ የሆቴል ወይም የባህል ምግብ አቅራቢ ነዎት? በኤልቲቲኤምኤስ ይመዝገቡና በቀጥታ ከተጓዦች ጋር ይገናኙ።'
                  : 'Are you a licensed boat captain, registered tour guide, eco-lodge owner, or cultural dining host in Bahir Dar? Join our verified marketplace to accept guaranteed reservations.'}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/vendor/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-extrabold text-sm shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{language === 'am' ? 'አሁን አቅራቢ ሆነው ይመዝገቡ' : 'Register as a Vendor'}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <Link
                  href="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
                >
                  <span>{language === 'am' ? 'የአሰራር መመሪያውን ይመልከቱ' : 'Learn How It Works'}</span>
                </Link>
              </div>
            </div>

            {/* Right Perks Grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {perks.map((perk, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-sm flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-heading text-white">
                      {language === 'am' ? perk.titleAm : perk.titleEn}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5 font-normal">
                      {language === 'am' ? perk.descAm : perk.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
