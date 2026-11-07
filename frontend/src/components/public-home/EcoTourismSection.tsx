import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export const EcoTourismSection: React.FC = () => {
  const { language } = useLanguage()

  const ecoTiers = [
    {
      level: 'Bronze',
      nameEn: 'Bronze Certified',
      nameAm: 'ነሐስ ደረጃ',
      color: 'border-amber-700/40 bg-amber-900/10 text-amber-500',
      badgeBg: 'bg-amber-700',
      descEn: 'Strict zero single-use plastic policy, certified passenger life jackets, and baseline waste sorting.',
      descAm: 'የፕላስቲክ እቃዎችን ማስወገድ፣ የሕይወት አድን ጃኬቶች እና መሠረታዊ የቆሻሻ አያያዝ ማሟላት።',
    },
    {
      level: 'Silver',
      nameEn: 'Silver Certified',
      nameAm: 'ብር ደረጃ',
      color: 'border-slate-400/40 bg-slate-500/10 text-slate-300',
      badgeBg: 'bg-slate-400 text-slate-950',
      descEn: 'Fair living wages for boat crew & guides, low-noise engines, and locally sourced food ingredients.',
      descAm: 'ለአስጎብኚዎች ፍትሃዊ ክፍያ፣ የድምፅ ብክለት ቅነሳ እና የአካባቢውን ኦርጋኒክ ምግብ ማቅረብ።',
    },
    {
      level: 'Gold',
      nameEn: 'Gold Certified',
      nameAm: 'ወርቅ ደረጃ',
      color: 'border-gold-500/40 bg-gold-500/10 text-gold-400',
      badgeBg: 'bg-gold-500 text-slate-950',
      descEn: 'Solar-assisted boats or eco-lodges with 100% renewable power, composting, and greywater recycling.',
      descAm: 'በፀሐይ ኃይል የሚሰሩ ጀልባዎች ወይም ሎጆች፣ የታደሰ ውሃ አጠቃቀም እና የተሟላ የተፈጥሮ ኃይል።',
    },
    {
      level: 'Platinum',
      nameEn: 'Platinum Vanguard',
      nameAm: 'ፕላቲነም ከፍተኛ ደረጃ',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
      badgeBg: 'bg-emerald-500 text-slate-950',
      descEn: 'Community co-operative ownership, active wetland restoration sponsorship, and verifiable net-zero footprint.',
      descAm: 'የማህበረሰብ የጋራ ባለቤትነት፣ የረግረጋማ መሬት መልሶ ማልማት ስፖንሰር እና ዜሮ ካርቦን አሻራ።',
    },
  ]

  const pillars = [
    {
      titleEn: '90%+ Direct Local Revenue',
      titleAm: 'ከ90% በላይ ቀጥተኛ የአካባቢ ገቢ',
      descEn: 'No foreign intermediaries siphon profits. Funds go straight to local Bahir Dar families, boat captains, and youth guides.',
      descAm: 'ያለ የውጭ ደላላ ኮሚሽን፤ ክፍያው በቀጥታ ለባሕር ዳር ጀልባ ነጂዎች፣ አስጎብኚ ወጣቶች እና ቤተሰቦች ይደርሳል።',
      icon: (
        <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      titleEn: 'Monastery & Cultural Preservation',
      titleAm: 'የገዳማትና የቅርስ ጥበቃ ፈንድ',
      descEn: 'Every reservation contributes an automatic heritage levy to repair monastery roofs and conserve 14th-century church murals.',
      descAm: 'ከእያንዳንዱ ጉብኝት የተወሰነ ክፍያ ለጥንታዊ የደሴት ቤተክርስቲያናት ጣሪያ ጥገናና ለሥዕሎች ጥበቃ ይውላል።',
      icon: (
        <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
    },
    {
      titleEn: 'Zero Single-Use Plastic',
      titleAm: 'ፕላስቲክ አልባ የሐይቅ እንቅስቃሴ',
      descEn: 'All certified boats provide reusable glass or stainless steel water containers and enforce a strict leave-no-trace protocol.',
      descAm: 'ሁሉም የተረጋገጡ ጀልባዎች ዳግም ጥቅም ላይ የሚውሉ የውሃ ጠርሙሶችን ያቀርባሉ፤ ምንም ቆሻሻ በሐይቁ ላይ አይጣልም።',
      icon: (
        <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      titleEn: 'Native Tree Planting & Wetlands',
      titleAm: 'የሀገር በቀል ዛፎች ተከላ እና ረግረግ ጥበቃ',
      descEn: 'Support our reforestation buffer around the Zege Peninsula coffee forests to prevent soil erosion into Lake Tana.',
      descAm: 'የጣና ሐይቅን ደለል ለመከላከል በዝጌ ባሕረ ገብ መሬት የሀገር በቀል ዋንዛ እና ኮሶ ዛፎችን የመትከል ድጋፍ።',
      icon: (
        <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-24 bg-primary-950 text-white transition-colors relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(27,138,131,0.25),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{language === 'am' ? 'ዘላቂ እና ኃላፊነት የተሞላበት ጉዞ' : 'Sustainable & Ethical Travel'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white">
            {language === 'am'
              ? 'የጣና ሐይቅ ኢኮ-ቱሪዝም እና የደረጃ ማረጋገጫ'
              : 'Our Commitment to Lake Tana & Its Communities'}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            {language === 'am'
              ? 'ኤልቲቲኤምኤስ የተፈጠረው የሐይቁን የተፈጥሮ ሀብት ለመጠበቅ እና የአካባቢውን ማህበረሰብ በቀጥታ ተጠቃሚ ለማድረግ ነው።'
              : 'Every excursion booked on LTTMS adheres to our verified Lake Tana Eco-Tourism Charter. We measure real ecological and community impact, not empty promises.'}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-gold-500/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-800/80 border border-primary-700 flex items-center justify-center mb-4">
                {pillar.icon}
              </div>
              <h3 className="text-base font-bold font-heading text-white mb-2">
                {language === 'am' ? pillar.titleAm : pillar.titleEn}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                {language === 'am' ? pillar.descAm : pillar.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Eco-Certification Tiers */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-md">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-gold-400 text-xs font-bold uppercase tracking-widest block mb-1">
              {language === 'am' ? 'የደረጃ መለያ' : 'Verification System'}
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold font-heading text-white">
              {language === 'am' ? 'የአቅራቢዎች ኢኮ-ባጅ ደረጃዎች' : 'Lake Tana Eco-Badge Certification Levels'}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-300">
              {language === 'am'
                ? 'ጀልባዎች፣ አስጎብኚዎች እና ሆቴሎች በገለልተኛ አካል ተፈትሸው የተሰጣቸው ደረጃ።'
                : 'All vendors are audited against environmental standards before receiving certification.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ecoTiers.map((tier) => (
              <div
                key={tier.level}
                className={`border rounded-2xl p-5 flex flex-col justify-between ${tier.color} transition-transform hover:-translate-y-1`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md ${tier.badgeBg}`}>
                      {tier.level}
                    </span>
                    <span className="text-xs font-bold opacity-80">LTTMS Verified</span>
                  </div>
                  <h4 className="text-sm font-bold font-heading text-white mb-2">
                    {language === 'am' ? tier.nameAm : tier.nameEn}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-normal">
                    {language === 'am' ? tier.descAm : tier.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/eco-tourism"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <span>{language === 'am' ? 'ስለ ኢኮ-ቱሪዝም ማዕቀፍ የበለጠ ይወቁ' : 'Explore Eco-Tourism Charter & Guidelines'}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
