import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'

// 1. Conservation Initiatives
const CONSERVATION_INITIATIVES = [
  {
    id: 'reforestation',
    title: 'Shoreline & Sacred Forest Reforestation',
    category: 'Ecosystem Restoration',
    impact: '50,000 native trees by 2027',
    description: 'Restoring native Cordia africana and Acacia abyssinica trees along Lake Tana shores and Zege Peninsula buffer zones to halt agricultural soil erosion and preserve ancient monastery canopy habitats.',
    metric: '68% of 2026 Goal Reached',
    progress: 68,
    image: '/images/lake-tana-hero-bg.jpg',
  },
  {
    id: 'wetlands',
    title: 'Papyrus Bed & Wetland Sanctuary Protection',
    category: 'Water & Biodiversity',
    impact: '12km protected shoreline',
    description: 'Safeguarding natural papyrus reed beds that act as Lake Tana’s natural biological filtration sponge and nursery grounds for 28 endemic fish species and migrating pelicans.',
    metric: '14 Wetland Zones Protected',
    progress: 85,
    image: '/images/Boat.jpg',
  },
  {
    id: 'clean-water',
    title: 'Biological Sand Filters & Community Clean Water',
    category: 'Community Health',
    impact: '18 Island Villages Supported',
    description: 'Partnering with local cooperative communities to install slow sand water filtration units, ensuring clean drinking water without disposable single-use plastic bottles.',
    metric: '18 Units Installed',
    progress: 90,
    image: '/images/waterfall.jpg',
  },
  {
    id: 'manuscripts',
    title: 'Ancient Manuscript & Mural Preservation',
    category: 'Heritage Safeguard',
    impact: '37 Island Monasteries',
    description: 'Supporting non-invasive climate-controlled storage, parchment digitization, and traditional conservation of 14th-to-16th-century illuminated ecclesiastical manuscripts.',
    metric: '120+ Manuscripts Documented',
    progress: 58,
    image: '/images/monastery.jpg',
  },
]

// 2. Local Community Participation
const COMMUNITY_PROGRAMS = [
  {
    title: 'Lake Tana Boatmen Cooperatives',
    role: 'Transport & Safety',
    share: '90%+ Direct Income',
    desc: 'Local boat operators and youth captains co-own and operate licensed passenger boats, guaranteeing fair living wages, certified life jackets, and low-noise engine standards.',
    icon: '⛵',
  },
  {
    title: 'Certified Monastic & Forest Resident Guides',
    role: 'Heritage Storytelling',
    share: '100% Local Guides',
    desc: 'Youth from Zege and surrounding islands are trained in biosphere biodiversity, monastery history, and language skills, providing authentic, respectful visitor guidance.',
    icon: '🥾',
  },
  {
    title: 'Women Artisan & Tankwa Weaving Guilds',
    role: 'Handicrafts & Fair Trade',
    share: 'Direct Artisan Sales',
    desc: 'Preserving ancient papyrus reed boat building, hand-spun cotton textiles, and traditional culinary arts with fair-trade retail desks at monastery piers.',
    icon: '🧶',
  },
  {
    title: 'Organic Lakeside Coffee Farmers',
    role: 'Sustainable Agriculture',
    share: 'Shade-Grown Arabica',
    desc: 'Wild forest Arabica coffee grown without synthetic pesticides under the ancient monastery canopies, preventing deforestation and supporting rural farming families.',
    icon: '☕',
  },
]

// 3. Responsible Travel Guidelines
const RESPONSIBLE_GUIDELINES = [
  {
    number: '01',
    title: 'Respect Monastic Sanctuaries',
    instruction: 'Dress modestly when visiting monasteries (cover shoulders and knees). Always remove your shoes before stepping into the inner church dome, and respect sanctuary areas restricted to monks or nuns.',
    icon: '⛪',
  },
  {
    number: '02',
    title: 'Never Touch Ancient Murals & Relics',
    instruction: 'The 16th-century paintings on parchment and wood are vulnerable to skin oils and moisture. Please admire without touching, and strictly turn off camera flash inside churches.',
    icon: '🎨',
  },
  {
    number: '03',
    title: 'Enforce Zero Single-Use Plastic',
    instruction: 'Plastic pollution severely harms Lake Tana pelicans and freshwater fish. Carry a refillable water canteen. Certified eco-lodges and visitor centers provide free filtered water refills.',
    icon: '🚯',
  },
  {
    number: '04',
    title: 'Stay on Designated Forest Trails',
    instruction: 'Zege Peninsula’s forest floor is home to rare wild coffee saplings and endemic flora. Stick strictly to stone paths to prevent soil compaction and habitat destruction.',
    icon: '🌿',
  },
  {
    number: '05',
    title: 'Support Direct Local Commerce',
    instruction: 'Buy handicrafts, spices, and honey directly from local producers rather than middlemen. Tip boatmen, guides, and monastery caretakers directly to foster economic dignity.',
    icon: '🤝',
  },
  {
    number: '06',
    title: 'Leave Wildlife Undisturbed',
    instruction: 'Maintain a quiet distance from pelican nesting sites, hippopotamus pools at the Blue Nile outlet, and forest monkeys. Never feed wildlife or discard organic waste in the lake.',
    icon: '🦅',
  },
]

// 4. Sustainable Tourism Activities
const SUSTAINABLE_ACTIVITIES = [
  {
    title: 'Traditional Papyrus Tankwa Paddle',
    type: 'Zero-Emission Boating',
    duration: '2 Hours',
    co2: '0 kg CO₂',
    description: 'Gliding along the reed fringes in an ancient handmade papyrus boat, identical to those depicted in ancient Ethiopian manuscripts.',
    image: '/images/Boat.jpg',
    actionHref: '/services?category=boat',
  },
  {
    title: 'Zege Peninsula Shade-Coffee Nature Walk',
    type: 'Low-Impact Hiking',
    duration: '3.5 Hours',
    co2: '< 1 kg CO₂',
    description: 'A gentle shaded hike under giant fig trees to explore wild coffee harvesting, medicinal herbs, and circular timber monasteries.',
    image: '/images/monastery.jpg',
    actionHref: '/services?category=tour',
  },
  {
    title: 'Blue Nile Falls Gorge & Portuguese Bridge Trek',
    type: 'Community-Guided Hike',
    duration: '5 Hours',
    co2: '< 2 kg CO₂',
    description: 'Scenic countryside walking trail across the 1626 stone bridge to witness the dramatic 45-meter Tis Issat waterfall with local village guides.',
    image: '/images/waterfall.jpg',
    actionHref: '/services?category=tour',
  },
  {
    title: 'Pelican Sanctuary Sunset Rowing Excursion',
    type: 'Birdwatching & Wetlands',
    duration: '2.5 Hours',
    co2: '0 kg CO₂',
    description: 'Silent oar-powered rowing to the Blue Nile river outlet as hundreds of great white pelicans return to roost in acacia treetops.',
    image: '/images/lake-tana-hero-bg.jpg',
    actionHref: '/services?category=wildlife',
  },
]

export default function EcoTourismPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'conservation' | 'community' | 'guidelines' | 'activities'>('all')

  return (
    <PublicLayout>
      <Head>
        <title>Eco-Tourism & Responsible Travel | Lake Tana UNESCO Biosphere | LTTMS</title>
        <meta
          name="description"
          content="Discover Lake Tana UNESCO Biosphere Reserve eco-tourism: environmental conservation initiatives, local community cooperatives, responsible travel guidelines, and low-impact activities."
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 transition-colors pb-24">
        {/* 1. Eco-Tourism Hero Header */}
        <div className="relative bg-[#143224] text-white pt-16 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-emerald-950">
          <div className="absolute inset-0 z-0 opacity-30">
            <img
              src="/images/lake-tana-hero-bg.jpg"
              alt="Lake Tana UNESCO Biosphere Reserve"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#143224] via-[#143224]/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>UNESCO BIOSPHERE RESERVE • RECOGNIZED 2015</span>
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
                Eco-Tourism — Responsible Tourism
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
                Promote sustainable tourism around Lake Tana: protect fragile wetland ecosystems, safeguard 14th-century monastic treasures, and ensure every booking directly benefits indigenous host communities.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white dark:bg-[#132620] rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 transition-colors">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
              <div className="text-center pt-2 sm:pt-0">
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#173829] dark:text-emerald-400">
                  217+
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Bird Species Protected
                </div>
              </div>

              <div className="text-center pt-2 sm:pt-0 sm:pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#173829] dark:text-emerald-400">
                  90%+
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Direct Local Revenue
                </div>
              </div>

              <div className="text-center pt-2 sm:pt-0 sm:pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#173829] dark:text-emerald-400">
                  37
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Sacred Monastery Sanctuaries
                </div>
              </div>

              <div className="text-center pt-2 sm:pt-0 sm:pl-4">
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-[#173829] dark:text-emerald-400">
                  0%
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Single-Use Plastic Target
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Section Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-slate-800/80">
            {[
              { id: 'all', label: 'All Dimensions' },
              { id: 'conservation', label: 'Conservation Initiatives' },
              { id: 'community', label: 'Community Participation' },
              { id: 'guidelines', label: 'Responsible Travel Guidelines' },
              { id: 'activities', label: 'Sustainable Tourism Activities' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#244B3A] text-white shadow-sm'
                    : 'bg-white dark:bg-[#132620] text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Environmental Conservation Initiatives */}
        {(activeTab === 'all' || activeTab === 'conservation') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Ecological Stewardship
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Environmental Conservation Initiatives
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
              {CONSERVATION_INITIATIVES.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-[#173829] dark:text-emerald-400">
                        {item.impact}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Milestone Progress</span>
                      <span className="text-slate-800 dark:text-slate-200">{item.metric}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Local Community Participation */}
        {(activeTab === 'all' || activeTab === 'community') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Community Benefit
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Local Community Participation
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COMMUNITY_PROGRAMS.map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-2xl mb-4">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                      {item.role}
                    </span>
                    <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-[#173829] dark:text-emerald-400">
                    {item.share}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Responsible Travel Guidelines */}
        {(activeTab === 'all' || activeTab === 'guidelines') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Ethical Code
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Responsible Travel Guidelines
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESPONSIBLE_GUIDELINES.map((guide, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-300 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-[#244B3A] dark:text-emerald-400">
                      Rule {guide.number}
                    </span>
                    <span className="text-xl">{guide.icon}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2 leading-snug">
                    {guide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {guide.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Sustainable Tourism Activities */}
        {(activeTab === 'all' || activeTab === 'activities') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-1">
                  Low-Carbon Adventures
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  Sustainable Tourism Activities
                </h2>
              </div>
              <Link
                href="/services?ecoFriendly=true"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#244B3A] dark:text-emerald-400 hover:underline"
              >
                <span>Browse All Eco-Tours</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SUSTAINABLE_ACTIVITIES.map((act, i) => (
                <div
                  key={i}
                  className="group bg-white dark:bg-[#132620] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 dark:hover:border-emerald-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={act.image}
                      alt={act.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                        {act.co2}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                        {act.type} • {act.duration}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-[#244B3A] dark:group-hover:text-emerald-400 transition-colors">
                        {act.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <Link
                        href={act.actionHref}
                        className="w-full py-2 px-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#244B3A] dark:hover:bg-[#244B3A] text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white text-xs font-bold transition-all"
                      >
                        <span>Book Activity</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
