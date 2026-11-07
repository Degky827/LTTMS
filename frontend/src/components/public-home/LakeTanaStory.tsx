import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export const LakeTanaStory: React.FC = () => {
  const { language } = useLanguage()

  const STATS = [
    { value: '37+', label: language === 'am' ? 'የተጠበቁ ገዳማት' : 'Protected Sanctuaries' },
    { value: '90%+', label: language === 'am' ? 'ቀጥተኛ የአካባቢ ገቢ' : 'Direct Local Revenue' },
    { value: '217+', label: language === 'am' ? 'የአእዋፋት ዝርያዎች' : 'Protected Bird Species' },
    { value: '100%', label: language === 'am' ? 'የተረጋገጡ አቅራቢዎች' : 'Verified Operators' },
  ]

  const WHY_US = [
    {
      title: language === 'am' ? 'የተረጋገጡ አቅራቢዎች' : '100% Verified Local Operators',
      desc: language === 'am' ? 'የጀልባ ካፒቴኖችና አስጎብኚዎች የፈቃድና የደህንነት ማረጋገጫ ያላቸው ናቸው።' : 'Licensed boatmen cooperatives, resident monastic guides, and certified eco-lodges.',
    },
    {
      title: language === 'am' ? 'ግልጽ የኢትዮጵያ ብር ዋጋ' : 'Transparent Pricing in ETB',
      desc: language === 'am' ? 'ያለ ደላላ ኮሚሽን በቀጥታ በአገር ውስጥ ገንዘብ የሚከፈል ፍትሃዊ ዋጋ።' : 'No foreign middlemen or hidden markups. Clear local pricing paid in Ethiopian Birr.',
    },
    {
      title: language === 'am' ? 'የማህበረሰብ ቀጥተኛ ተጠቃሚነት' : 'Community Direct Benefit',
      desc: language === 'am' ? 'ከ90% በላይ የሚሆነው ገቢ በቀጥታ ለአካባቢው ቤተሰቦችና ለገዳማት ጥበቃ ይውላል።' : 'Over 90% of revenue stays in Bahir Dar for family livelihoods and monastery roofs.',
    },
    {
      title: language === 'am' ? 'የተረጋገጠ የደህንነት መስፈርት' : 'Mandatory Safety Protocols',
      desc: language === 'am' ? 'የሕይወት አድን ጃኬቶች እና ዝቅተኛ የድምፅ ብክለት ያላቸው ጀልባዎች።' : 'Certified marine life jackets, inspected hulls, and low-emission motor standards.',
    },
  ]

  return (
    <section className="py-24 bg-surface dark:bg-surface-dark transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Lead */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#244B3A] dark:text-emerald-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{language === 'am' ? 'የጣና ሐይቅ ታሪክ እና ቅርስ' : 'Heritage & Sacred Geography'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-text-primary tracking-tight">
            {language === 'am' ? (
              <>ስለ ኤልቲቲኤምኤስ እና ጣና ሐይቅ</>
            ) : (
              <>About LTTMS &amp; Lake Tana</>
            )}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-text-secondary leading-relaxed">
            {language === 'am'
              ? 'ጣና ሐይቅ የኢትዮጵያ ትልቁ ሐይቅ ብቻ ሳይሆን የጥንታዊ ሥልጣኔዎች፣ የደሴት ገዳማት እና የታላቁ ዓባይ ወንዝ መፍለቂያ ነው። ኤልቲቲኤምኤስ ተጓዦችን ከአካባቢው ማህበረሰብ ጋር በቀጥታ የሚያገናኝ ዲጂታል መድረክ ነው።'
              : 'Lake Tana is more than Ethiopia’s largest freshwater lake — it is the ancient cradle of the Blue Nile and a UNESCO Biosphere Reserve sheltering 14th-century island monasteries. LTTMS connects you directly with the local cooperatives who care for it.'}
          </p>
        </div>

        {/* Verified Platform Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface-muted dark:bg-[#132620] rounded-2xl border border-surface-border mb-20 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="py-2">
              <div className="text-2xl sm:text-4xl font-extrabold font-heading text-[#173829] dark:text-emerald-400">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-text-primary mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Narrative Chapter 1: Monastic Heritage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold mb-4">
              <span>01</span>
              <span>•</span>
              <span>{language === 'am' ? 'የደሴት ገዳማት ጥበቃ' : 'Island Sanctuaries & Manuscripts'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mb-4 leading-tight">
              {language === 'am'
                ? 'የ14ኛው ክፍለ ዘመን ደሴት ገዳማትና የብራና ቅርሶች'
                : '14th-Century Sanctuaries Hidden Within Sacred Canopies'}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {language === 'am'
                ? 'በጣና ሐይቅ ላይ የሚገኙ ከ37 በላይ ደሴቶች እና የባሕረ ገብ መሬት ገዳማት እንደ ኡራ ኪዳነ ምሕረት፣ አዝዋ ማርያም፣ እና ክብራን ገብርኤል ያሉትን ጥንታዊ ቅርሶች ይዘዋል። በእነዚህ ቅዱሳን ቦታዎች ውስጥ ለዘመናት የተጠበቁ ባለቀለም የቤተክርስቲያን ሥዕሎች እና ንጉሣዊ ዘውዶች ይገኛሉ።'
                : 'Scattered across Lake Tana’s waters lie over thirty island monasteries. Founded by medieval monks who sought seclusion, sanctuaries such as Ura Kidane Mehret and Azwa Maryam feature circular timber architecture adorned with vibrant biblical frescoes painted on parchment and wood.'}
            </p>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {language === 'am'
                ? 'እያንዳንዱ ጉብኝት የአካባቢውን ገዳማውያን እና የአስተዳደር ማህበራት ተጠቃሚ በማድረግ ቅርሶቹ ለትውልድ እንዲተላለፉ ያግዛል።'
                : 'Visiting these sacred sanctuaries directly supports preservation efforts, helping clergy safeguard ancient illuminated Ge’ez texts, crown relics, and hand-carved processional crosses.'}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#244B3A] dark:text-emerald-400 hover:underline"
            >
              <span>{language === 'am' ? 'ስለ ገዳማት ሙሉ ዝርዝር' : 'Read full history & mission'}</span>
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Zege Peninsula</span>
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Tis Abay</span>
              <h4 className="text-base font-bold font-heading">Tis Issat — Smoke of Fire</h4>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-bold mb-4">
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
              className="inline-flex items-center gap-2 text-xs font-bold text-[#244B3A] dark:text-emerald-400 hover:underline"
            >
              <span>{language === 'am' ? 'ስለ ጢስ አባይ ጉብኝቶች' : 'Explore Blue Nile Falls trips'}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Why Use LTTMS Grid */}
        <div className="bg-slate-50 dark:bg-[#132620] rounded-3xl p-8 sm:p-12 border border-surface-border">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
              {language === 'am' ? 'ለምን በኤልቲቲኤምኤስ ይጎበኛሉ?' : 'Why Use the LTTMS Platform?'}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-2">
              {language === 'am'
                ? 'ለተጓዦች አስተማማኝ ደህንነት፣ ለአካባቢው ህብረተሰብ ፍትሃዊ ተጠቃሚነት።'
                : 'Built directly with local boat associations, monastic trusts, and tourism authorities in Bahir Dar.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item, idx) => (
              <div key={idx} className="bg-surface dark:bg-[#0E1D19] rounded-2xl p-5 border border-surface-border">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#244B3A] dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3">
                  0{idx + 1}
                </div>
                <h4 className="text-sm font-bold font-heading text-text-primary mb-1.5">
                  {item.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
