import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { language } = useLanguage()

  // Verified Platform Statistics
  const VERIFIED_STATS = [
    {
      value: '37+',
      label: language === 'am' ? 'የተጠበቁ የደሴት ገዳማት' : 'Protected Island Sanctuaries',
      desc: language === 'am' ? 'የ14ኛው-16ኛው ክፍለ ዘመን የብራና ቅርሶች' : '14th–16th century Ge’ez manuscripts & murals',
    },
    {
      value: '90%+',
      label: language === 'am' ? 'ቀጥተኛ የአካባቢ ገቢ' : 'Direct Local Revenue Share',
      desc: language === 'am' ? 'ያለ የውጭ ደላላ በቀጥታ ለአካባቢው ቤተሰቦች' : 'Paid straight to local captains, guides & artisans',
    },
    {
      value: '217+',
      label: language === 'am' ? 'የአእዋፋት ዝርያዎች' : 'Protected Bird Species',
      desc: language === 'am' ? 'በዩኔስኮ ባዮስፌር ሪዘርቭ ውስጥ' : 'Thriving within UNESCO Biosphere wetlands',
    },
    {
      value: '100%',
      label: language === 'am' ? 'የተረጋገጡ አቅራቢዎች' : 'Verified Operators',
      desc: language === 'am' ? 'የህይወት አድን ጃኬት እና ፈቃድ ያላቸው' : 'Licensed boatmen, certified guides & eco-lodges',
    },
  ]

  // Key Geological & Ecological Pillars
  const LAKE_TANA_HERITAGE = [
    {
      number: '01',
      title: language === 'am' ? 'የታላቁ ዓባይ ወንዝ መፍለቂያ' : 'Source of the Blue Nile River',
      subtitle: language === 'am' ? 'የአባይ ወንዝ መነሻ እና የጢስ አባይ ፏፏቴ' : 'The Roaring Headwaters of Northeast Africa',
      desc:
        language === 'am'
          ? 'ጣና ሐይቅ 85% የሚሆነውን የናይል ወንዝ ውሃ የሚያበረክተው የታላቁ ዓባይ (አባይ) ወንዝ መነሻ ነው። ከሐይቁ በ30 ኪ.ሜ ርቀት ላይ የሚገኘው አስደናቂው የጢስ አባይ ፏፏቴ እስከ 45 ሜትር ድረስ ይወርዳል።'
          : 'Lake Tana is the proud historic cradle of the Blue Nile (locally known as Abbay), contributing over 80% of the Nile’s annual flow. Downstream, the river plunges into a 45-meter misty chasm at Tis Issat (“Smoke of Fire”), nurturing endemic rainforest microclimates.',
      image: '/images/waterfall.jpg',
      badge: 'Hydrology & Geography',
    },
    {
      number: '02',
      title: language === 'am' ? 'የ14ኛው ክፍለ ዘመን የደሴት ገዳማት' : 'Ancient Island Monasteries & Art',
      subtitle: language === 'am' ? 'የብራና መጻሕፍትና የጥንት ሥዕሎች' : 'Medieval Ecclesiastical Treasures & Murals',
      desc:
        language === 'am'
          ? 'በጣና ሐይቅ ላይ ከ30 በላይ ጥንታዊ የደሴትና የባሕረ ገብ መሬት ገዳማት ይገኛሉ። እንደ ኡራ ኪዳነ ምሕረት፣ አዝዋ ማርያም እና ክብራን ገብርኤል ያሉ ገዳማት የጥንት የብራና መጻሕፍትን እና ሥዕሎችን ይዘዋል።'
          : 'Scattered across 37 islands and peninsulas are medieval Orthodox monastic sanctuaries founded from the 14th century onward. Sanctuaries such as Ura Kidane Mehret preserve illuminated Ge’ez parchment manuscripts, royal crowns, and vibrant ecclesiastical frescoes.',
      image: '/images/monastery.jpg',
      badge: 'Living Sacred Heritage',
    },
    {
      number: '03',
      title: language === 'am' ? 'የዩኔስኮ ባዮስፌር ሪዘርቭ (2015)' : 'UNESCO Biosphere Reserve (2015)',
      subtitle: language === 'am' ? 'ዓለም አቀፍ የብዝሃ-ሕይወት ጥበቃ' : 'Global Hotspot for Endemic Biodiversity',
      desc:
        language === 'am'
          ? 'በ2015 ዓ.ም በዩኔስኮ የተመዘገበው ጣና ሐይቅ ከ217 በላይ የአእዋፋት ዝርያዎች፣ 28 የዓሣ ዝርያዎች (ከእነዚህ ውስጥ 70% የሚሆኑት በጣና ብቻ የሚገኙ) እና የተፈጥሮ ረግረጋማ እፅዋት መኖሪያ ነው።'
          : 'Encompassing over 695,000 hectares, the Lake Tana Biosphere Reserve is a critical staging point on the Palearctic bird migration flyway. It harbors endemic Labeobarbus fish flocks found nowhere else on Earth alongside great white pelicans and African fish eagles.',
      image: '/images/lake-tana-hero-bg.jpg',
      badge: 'UNESCO Biosphere Reserve',
    },
  ]

  // Why Use the Platform
  const WHY_USE_LTTMS = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#244B3A] dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: language === 'am' ? '100% የተረጋገጡ የአካባቢ አቅራቢዎች' : '100% Verified Local Operators',
      desc:
        language === 'am'
          ? 'እያንዳንዱ የጀልባ ካፒቴን፣ አስጎብኚ እና ሎጅ የተረጋገጠ የሥራ ፈቃድ እና የደህንነት መስፈርት ያሟላል።'
          : 'Every boat captain, monastery guide, and lodge undergoes strict background checks, marine licensing, and passenger safety verification.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#244B3A] dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: language === 'am' ? 'ግልጽ እና ፍትሃዊ የዋጋ አሰጣጥ' : 'Transparent Pricing in ETB',
      desc:
        language === 'am'
          ? 'ያለ ምንም የተደበቀ ክፍያ ወይም የደላላ ተጨማሪ ዋጋ፤ ዋጋው በቀጥታ በአገር ውስጥ ገንዘብ (ብር) ይገለጻል።'
          : 'Zero hidden surcharges or middleman markups. Direct prices are set by local cooperatives and settled securely in Ethiopian Birr (ETB).',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#244B3A] dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: language === 'am' ? 'ቀጥተኛ የዲጂታል ክፍያዎች' : 'Frictionless Local Payments',
      desc:
        language === 'am'
          ? 'በቴሌብር (telebirr)፣ በሲቢኢ ብር (CBE Birr) እና በአለም አቀፍ ካርዶች ፈጣን እና አስተማማኝ ክፍያ።'
          : 'Seamlessly pay with telebirr, CBE Birr, Chapa, Awash, or international credit/debit cards with instant confirmation receipts.',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#244B3A] dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: language === 'am' ? 'ኢኮ-ደረጃ እና የካርቦን ኃላፊነት' : 'Verified Eco-Tier Standards',
      desc:
        language === 'am'
          ? 'የፕላስቲክ እቃዎችን ማስወገድ፣ የድምፅ ብክለት ቅነሳ እና የአካባቢ ጥበቃ ደረጃዎች ማረጋገጫ።'
          : 'Every operator adheres to our zero single-use plastic mandate, life jacket protocol, and certified low-emission boat maintenance charter.',
    },
  ]

  // Community Benefits
  const COMMUNITY_BENEFITS = [
    {
      title: language === 'am' ? 'የጀልባ ነጂዎች የህብረት ስራ ማህበር' : 'Boatmen Cooperatives Dignity',
      desc:
        language === 'am'
          ? 'ወጣት ካፒቴኖች የጀልባ ባለቤት እንዲሆኑ እና ቤተሰቦቻቸውን በቋሚ ገቢ እንዲደግፉ ይረዳል።'
          : 'Captains and crews are organized into licensed cooperatives, earning dignified livable incomes without predatory brokerage deductions.',
      metric: '350+ Captains & Crew Supported',
    },
    {
      title: language === 'am' ? 'የገዳማት ጥበቃ እና እድሳት ፈንድ' : 'Monastery Restoration Heritage Fund',
      desc:
        language === 'am'
          ? 'ከእያንዳንዱ ትኬት የተወሰነ መቶኛ የጥንታዊ ቤተክርስቲያናትን ጣሪያ ለመጠገን እና ሥዕሎችን ለመጠበቅ ይውላል።'
          : 'A direct heritage contribution is routed from reservations to preserve 14th-century circular timber roofs and climate-controlled parchment vaults.',
      metric: '37 Monasteries Benefit',
    },
    {
      title: language === 'am' ? 'የሴቶች የእጅ ጥበብ እና የቡና ማህበራት' : 'Women Artisan & Coffee Guilds',
      desc:
        language === 'am'
          ? 'የባህላዊ የብራና ታንኳ ስራ፣ ጥጥ መፍተል እና የባህላዊ ቡና ዝግጅት ለሴቶች ቀጥተኛ ገቢ ያስገኛል።'
          : 'Women weavers, pottery masters, and organic wild coffee harvesters maintain fair-trade retail hubs at waterfront docks and monastery entry points.',
      metric: '180+ Women Artisans Empowered',
    },
    {
      title: language === 'am' ? 'የዝጌ ባሕረ ገብ መሬት የደን ጥበቃ' : 'Zege Peninsula Forest Reforestation',
      desc:
        language === 'am'
          ? 'የጣና ሐይቅን ደለል ለመከላከል የሀገር በቀል ዋንዛ እና ኮሶ ዛፎችን የመትከል የማህበረሰብ እንቅስቃሴ።'
          : 'Financing community-led planting of native Cordia africana saplings along buffer zones to halt erosion and save endemic bird habitats.',
      metric: '50,000+ Native Trees Target',
    },
  ]

  return (
    <PublicLayout>
      <Head>
        <title>About LTTMS & Lake Tana | UNESCO Biosphere Reserve, Ethiopia</title>
        <meta
          name="description"
          content="Learn about the Lake Tana Tourism Management System (LTTMS): our mission, vision, source of the Blue Nile, 14th-century island monasteries, and community eco-tourism benefits."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors pb-24">
        {/* 1. Header Hero */}
        <div className="relative bg-[#143224] text-white pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-emerald-950">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              src="/images/lake-tana-hero-bg.jpg"
              alt="Lake Tana Landscape, Ethiopia"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143224] via-[#143224]/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ETHIOPIA’S SACRED BLUE NILE CRADLE</span>
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight">
                About LTTMS &amp; Lake Tana
              </h1>
              <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl">
                The Lake Tana Tourism Management System (LTTMS) is Ethiopia’s community-first digital gateway — connecting travelers directly with licensed local boat operators, certified resident guides, and sacred island monasteries.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Verified Platform Statistics Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#132620] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 p-6 transition-colors">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
              {VERIFIED_STATS.map((stat, i) => (
                <div key={i} className={`text-center ${i > 0 ? 'pt-4 sm:pt-0 sm:pl-4' : ''}`}>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-[#173829] dark:text-emerald-400">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {stat.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. LTTMS Mission & Vision */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white dark:bg-[#132620] rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#244B3A] dark:text-emerald-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Our Purpose
                </span>
                <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                  The LTTMS Mission
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  To empower Bahir Dar’s indigenous boat cooperatives, monastic caretakers, and licensed local guides with direct digital tools — eliminating exploitative commission middlemen, safeguarding 14th-century sacred heritage, and ensuring tourists experience authentic Ethiopian hospitality with guaranteed safety and fair local pricing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-bold text-[#244B3A] dark:text-emerald-400">
                <span>Fair Trade • Verified Safety • Community Driven</span>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white dark:bg-[#132620] rounded-3xl p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#244B3A] dark:text-emerald-400 mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Our Future
                </span>
                <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white mb-3">
                  The LTTMS Vision
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  To position Lake Tana as Africa’s premier model for sustainable, community-owned eco-tourism — where tourism directly finances wetland restoration, zero single-use plastic policies, solar electric boat conversions, and parchment manuscript conservation for centuries to come.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-bold text-[#244B3A] dark:text-emerald-400">
                <span>Net-Zero Footprint • Living Monastic Culture</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. About Lake Tana — Heritage & Geography */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
              Geological &amp; Sacred Wonder
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              About Lake Tana
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Formed millions of years ago by volcanic lava blocking the northern highlands, Lake Tana sits at 1,788 meters above sea level and spans over 3,200 km² — serving as Ethiopia’s largest freshwater sanctuary.
            </p>
          </div>

          <div className="space-y-12">
            {LAKE_TANA_HERITAGE.map((item, idx) => (
              <div
                key={item.number}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-[#132620] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 shadow-sm`}
              >
                <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold mb-3">
                    <span>{item.number}</span>
                    <span>•</span>
                    <span>{item.badge}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                    {item.subtitle}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative aspect-[16/11] rounded-2xl overflow-hidden shadow-lg group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Why Use LTTMS? */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
              Ethical Travel Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Why Use the Platform?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Designed specifically to guarantee fair local wages, transparent booking, and verified passenger safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_USE_LTTMS.map((pillar, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#132620] rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center mb-5">
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Tourism Benefits for Local Communities */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="bg-[#143224] text-white rounded-3xl p-8 sm:p-12 border border-emerald-950 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                Direct Social &amp; Economic Impact
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
                Tourism Benefits for Local Communities
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                Unlike mass tourism agencies that export profits, LTTMS guarantees that more than 90% of every birr paid stays directly in the hands of the people who steward Lake Tana.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {COMMUNITY_BENEFITS.map((b, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold font-heading text-white mb-2 leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed mb-4">
                      {b.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 text-xs font-bold text-emerald-300">
                    {b.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7. CTA / Get Started */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center">
          <div className="bg-white dark:bg-[#132620] rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800/90 shadow-sm max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white mb-3">
              Join the Lake Tana Community
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6">
              Book a verified excursion with local boatmen cooperatives, or register your registered tourism business with LTTMS.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/services"
                className="px-6 py-3 rounded-full bg-[#244B3A] hover:bg-[#1b392c] text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
              >
                Explore Activities
              </Link>
              <Link
                href="/register?role=vendor"
                className="px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all"
              >
                Become a Tourism Partner
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
