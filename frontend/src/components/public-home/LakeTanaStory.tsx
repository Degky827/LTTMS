import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export const LakeTanaStory: React.FC = () => {
  const { language } = useLanguage()

  return (
    <section className="py-24 bg-surface dark:bg-surface-dark transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Lead */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-gold-600 dark:text-gold-400 text-xs font-bold uppercase tracking-widest block mb-2">
            {language === 'am' ? 'የጣና ሐይቅ ታሪክ እና ቅርስ' : 'Heritage & Sacred Geography'}
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-text-primary tracking-tight">
            {language === 'am' ? (
              <>የተፈጥሮ፣ የታሪክ እና የመንፈሳዊነት መገኛ</>
            ) : (
              <>Where Ancient Faith Meets Primal Nature</>
            )}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-text-secondary leading-relaxed">
            {language === 'am'
              ? 'ጣና ሐይቅ የኢትዮጵያ ትልቁ ሐይቅ ብቻ ሳይሆን የጥንታዊ ሥልጣኔዎች፣ የደሴት ገዳማት እና የታላቁ ዓባይ ወንዝ መፍለቂያ ነው።'
              : 'Lake Tana is more than Ethiopia’s largest body of water — it is the sacred cradle of the Blue Nile and a timeless sanctuary where fourteenth-century manuscripts and living monastic traditions endure.'}
          </p>
        </div>

        {/* Narrative Chapter 1: Monastic Heritage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-4">
              <span>01</span>
              <span>•</span>
              <span>{language === 'am' ? 'የደሴት ገዳማት ጥበቃ' : 'Island Sanctuaries'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mb-4 leading-tight">
              {language === 'am'
                ? 'የ14ኛው ክፍለ ዘመን ደሴት ገዳማትና የብራና ቅርሶች'
                : '14th-Century Sanctuaries Hidden Within Forest Canopy'}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {language === 'am'
                ? 'በጣና ሐይቅ ላይ የሚገኙ ከ37 በላይ ደሴቶች እና የባሕረ ገብ መሬት ገዳማት እንደ ኡራ ኪዳነ ምሕረት፣ አዝዋ ማርያም፣ እና ክብራን ገብርኤል ያሉትን ጥንታዊ ቅርሶች ይዘዋል። በእነዚህ ቅዱሳን ቦታዎች ውስጥ ለዘመናት የተጠበቁ ባለቀለም የቤተክርስቲያን ሥዕሎች እና ንጉሣዊ ዘውዶች ይገኛሉ።'
                : 'Scattered across Lake Tana’s waters lie over thirty island monasteries. Founded by medieval monks who sought seclusion, sanctuaries such as Ura Kidane Mehret and Azwa Maryam feature circular architecture adorned with vibrant biblical murals painted on parchment and wood.'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {language === 'am'
                ? 'እያንዳንዱ ጉብኝት የአካባቢውን ገዳማውያን እና የአስተዳደር ማህበራት ተጠቃሚ በማድረግ ቅርሶቹ ለትውልድ እንዲተላለፉ ያግዛል።'
                : 'Visiting these sacred sanctuaries directly supports preservation efforts, helping clergy safeguard ancient illuminated Ge’ez texts, crown relics, and hand-carved processional crosses.'}
            </p>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-700 dark:text-primary-400 hover:underline"
            >
              <span>{language === 'am' ? 'የገዳማትን ታሪክ ያንብቡ' : 'Read monastery history'}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          <div className="order-1 lg:order-2 relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
            <img
              src="/images/monastery.jpg"
              alt="Ura Kidane Mehret Monastery on Lake Tana"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Zege Peninsula</span>
              <h4 className="text-base font-bold font-heading">Ura Kidane Mehret</h4>
            </div>
          </div>
        </div>

        {/* Narrative Chapter 2: The Blue Nile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
            <img
              src="/images/waterfall.jpg"
              alt="Blue Nile Falls Tis Issat"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">Tis Abay</span>
              <h4 className="text-base font-bold font-heading">Tis Issat — Smoke of Fire</h4>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-4">
              <span>02</span>
              <span>•</span>
              <span>{language === 'am' ? 'የዓባይ መፍለቂያ' : 'Source of the Blue Nile'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mb-4 leading-tight">
              {language === 'am'
                ? 'የታላቁ ዓባይ ወንዝ መነሻ እና የጢስ አባይ ፏፏቴ'
                : 'The Roaring Beginnings of Northeast Africa’s Lifeline'}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {language === 'am'
                ? 'ጣና ሐይቅ 85% የሚሆነውን የናይል ወንዝ ውሃ የሚያበረክተው የታላቁ ዓባይ ወንዝ መነሻ ነው። ከሐይቁ በ30 ኪሎ ሜትር ርቀት ላይ የሚገኘው አስደናቂው የጢስ አባይ ፏፏቴ እስከ 45 ሜትር ከፍታ ድረስ በመውረድ ጭጋግና ቀስተ ደመናን ይፈጥራል።'
                : 'Just thirty kilometers downstream from Lake Tana, the waters plunge into a dramatic chasm at Tis Issat (“The Smoke of Fire”). The falls generate an ethereal mist visible from kilometers away, nurturing a perennial microclimate of hanging ferns and tropical birds.'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {language === 'am'
                ? 'በ17ኛው ክፍለ ዘመን በንጉሥ ሱስንዮስ ዘመን የተገነባውን ጥንታዊ የፖርቹጋል የድንጋይ ድልድይ በመሻገር የአካባቢው መንደሮችን ማሰስ ይቻላል።'
                : 'Crossing the nearby seventeenth-century Portuguese stone bridge, hikers experience timeless agricultural plateaus where local farmers cultivate teff, honey, and coffee using methods passed through generations.'}
            </p>
            <Link
              href="/destinations/blue-nile-falls"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-700 dark:text-primary-400 hover:underline"
            >
              <span>{language === 'am' ? 'ስለ ጢስ አባይ ዝርዝር' : 'Explore Blue Nile Falls trips'}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Narrative Chapter 3: UNESCO Biosphere */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-4">
              <span>03</span>
              <span>•</span>
              <span>{language === 'am' ? 'የዩኔስኮ ባዮስፌር ሪዘርቭ' : 'UNESCO Biosphere Reserve'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mb-4 leading-tight">
              {language === 'am'
                ? 'ዓለም አቀፍ የብዝሃ-ሕይወት እና የተፈጥሮ ጥበቃ ማዕከል'
                : 'An Internationally Celebrated Haven for Rare Wildlife'}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {language === 'am'
                ? 'በ2015 በዩኔስኮ ባዮስፌር ሪዘርቭ ተብሎ የተመዘገበው ጣና ሐይቅ ከ217 በላይ የአዕዋፋት ዝርያዎች፣ ብርቅዬ የዓሣ ዝርያዎች እና የሐይቅ ዳርቻ ረግረጋማ እፅዋት መኖሪያ ነው።'
                : 'Designated by UNESCO in 2015, the Lake Tana Biosphere Reserve encompasses over 695,000 hectares. It serves as an essential stopover along the Palearctic migratory flyway, hosting thousands of great white pelicans, African fish eagles, and glossy ibises.'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {language === 'am'
                ? 'የኤልቲቲኤምኤስ መድረክ ዓላማ ቱሪዝምን ከተፈጥሮ ጥበቃ ጋር በማስተሳሰር ፕላስቲክ አልባ ጉብኝትን እና የማህበረሰብ ተጠቃሚነትን ማረጋገጥ ነው።'
                : 'LTTMS operates with strict ecological criteria. We partner with boat operators utilizing cleaner engines, eliminate single-use plastics, and channel reservation fees directly into wetland rehabilitation.'}
            </p>
            <Link
              href="/eco-tourism"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-700 dark:text-primary-400 hover:underline"
            >
              <span>{language === 'am' ? 'የኢኮ-ቱሪዝም መመሪያዎችን ይመልከቱ' : 'Learn about our eco-charter'}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] group">
            <img
              src="/images/LakeTana.jpg"
              alt="Lake Tana Wildlife & Water, Ethiopia"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">UNESCO Biosphere</span>
              <h4 className="text-base font-bold font-heading">Pristine Waters & Wetland Habitats</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
