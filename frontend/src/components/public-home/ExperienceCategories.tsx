import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

interface CategoryItem {
  id: string
  titleEn: string
  titleAm: string
  descEn: string
  descAm: string
  icon: (props: { className?: string }) => JSX.Element
  color: string
}

export const ExperienceCategories: React.FC = () => {
  const { language } = useLanguage()

  const categories: CategoryItem[] = [
    {
      id: 'boat',
      titleEn: 'Boat Tours & Cruises',
      titleAm: 'የጀልባ ጉዞዎች እና ክሩዝ',
      descEn: 'Private boat charters, island transfers, and sunset lake cruises.',
      descAm: 'የግል ጀልባ ኪራይ፣ የደሴት ማመላለሻዎች እና የጀንበር መጥለቂያ ክሩዞች።',
      color: 'from-blue-600/10 to-teal-600/10 text-teal-600 dark:text-teal-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'monastery',
      titleEn: 'Island Monasteries',
      titleAm: 'የደሴት ገዳማት',
      descEn: 'Ancient 14th-century round churches housing priceless murals.',
      descAm: 'የ14ኛው ክፍለ ዘመን ቅርሶች እና ታሪካዊ ደሴት ገዳማት ጉብኝት።',
      color: 'from-amber-600/10 to-gold-600/10 text-gold-600 dark:text-gold-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'hotel',
      titleEn: 'Eco-Lodges & Stays',
      titleAm: 'ኢኮ-ሎጆች እና ማረፊያዎች',
      descEn: 'Waterfront eco-resorts committed to conservation and green practices.',
      descAm: 'የሐይቅ ዳርቻ ለአካባቢ ተስማሚ የሆኑ ሎጆች እና ዘና የሚያሰኙ ሆቴሎች።',
      color: 'from-emerald-600/10 to-primary-600/10 text-primary-700 dark:text-primary-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'tour',
      titleEn: 'Guided Heritage Excursions',
      titleAm: 'የተመሩ ታሪካዊ ጉብኝቶች',
      descEn: 'Certified local Bahir Dar guides with deep indigenous knowledge.',
      descAm: 'ከተረጋገጡ የአካባቢው አስጎብኚዎች ጋር ጥልቅ ታሪካዊ ማብራሪያ።',
      color: 'from-indigo-600/10 to-blue-600/10 text-indigo-600 dark:text-indigo-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      id: 'nature',
      titleEn: 'Blue Nile Falls Treks',
      titleAm: 'የዓባይ ፏፏቴ የእግር ጉዞ',
      descEn: 'Scenic hikes to "Tis Issat" smoke of fire and Portuguese bridge.',
      descAm: 'ወደ ጢስ ዓባይ ፏፏቴ እና ጥንታዊ የፖርቹጋል ድልድይ የሚደረግ አስደናቂ ጉዞ።',
      color: 'from-cyan-600/10 to-teal-600/10 text-cyan-600 dark:text-cyan-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
    },
    {
      id: 'wildlife',
      titleEn: 'Bird Watching & Wetlands',
      titleAm: 'የአእዋፋት እና የረግረጋማ ቦታዎች ምልከታ',
      descEn: 'Over 217 bird species including great white pelicans and fish eagles.',
      descAm: 'ከ217 በላይ የአዕዋፋት ዝርያዎች እና የጣና ሐይቅ የተፈጥሮ አራዊት።',
      color: 'from-emerald-600/10 to-green-600/10 text-emerald-600 dark:text-emerald-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      id: 'food',
      titleEn: 'Cultural Dining & Coffee',
      titleAm: 'ባህላዊ ምግብ እና የቡና ሥነ-ሥርዓት',
      descEn: 'Authentic Amhara cuisine, lake fish, and traditional Buna ceremonies.',
      descAm: 'የጣና ትኩስ አሳ፣ የባሕር ዳር ባህላዊ ምግቦች እና እውነተኛ የቡና ቁርስ።',
      color: 'from-orange-600/10 to-amber-600/10 text-amber-700 dark:text-amber-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'craft',
      titleEn: 'Artisan Crafts & Tankwa',
      titleAm: 'የእጅ ጥበቦች እና የታንኳ ጀልባ ባህል',
      descEn: 'Ancient papyrus reed boats, handwoven textiles, and local art.',
      descAm: 'የባህላዊ የሳር ታንኳ አሰራር፣ የሸማ ስራዎች እና የአካባቢው ቅርሶች።',
      color: 'from-rose-600/10 to-pink-600/10 text-rose-600 dark:text-rose-400',
      icon: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 bg-surface-muted dark:bg-surface-dark/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-widest block mb-2">
            {language === 'am' ? 'የጉዞ አማራጮች' : 'Experience Categories'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-text-primary">
            {language === 'am'
              ? 'የጣና ሐይቅን በጉብኝት ዓይነት ያስሱ'
              : 'Explore Lake Tana by Experience'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {language === 'am'
              ? 'ለእያንዳንዱ ተጓዥ የተዘጋጁ የተፈጥሮ፣ የባህል፣ የታሪክ እና የደሴት ጉብኝቶች።'
              : 'Curated eco-adventures, historical pilgrimages, and lakeside stays designed for every traveler.'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const title = language === 'am' ? cat.titleAm : cat.titleEn
            const desc = language === 'am' ? cat.descAm : cat.descEn
            return (
              <Link
                key={cat.id}
                href={`/services?category=${cat.id}`}
                className="group relative bg-surface dark:bg-surface-dark border border-surface-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-500/50 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold font-heading text-text-primary group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-border flex items-center justify-between text-xs font-bold text-primary-700 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{language === 'am' ? 'ዝርዝሩን ይመልከቱ' : 'Explore Category'}</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
