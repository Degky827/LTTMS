import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  FaLeaf,
  FaTree,
  FaHandHoldingHeart,
  FaAward,
  FaSolarPanel,
  FaWater,
  FaGlobeAfrica,
  FaCalculator,
  FaDonate,
  FaBookOpen,
  FaShieldAlt,
  FaCheckCircle,
  FaUsers,
  FaArrowRight,
  FaLightbulb,
  FaTrash,
  FaCamera,
  FaTrophy,
  FaMedal,
} from 'react-icons/fa'

const tips = [
  {
    icon: <FaLeaf className="text-primary-700 dark:text-primary-400" />,
    title: 'Travel Responsibly',
    desc: 'Respect local customs, dress modestly at religious sites, and always ask permission before taking photos.',
  },
  {
    icon: <FaWater className="text-primary-700 dark:text-primary-400" />,
    title: 'Protect Lake Tana',
    desc: 'Never dispose of waste in the lake. Minimize single-use plastics and support clean-up drives.',
  },
  {
    icon: <FaTrash className="text-primary-700 dark:text-primary-400" />,
    title: 'Zero Plastic Use',
    desc: 'Carry a reusable water bottle. Certified partner eco-lodges provide filtered refill stations.',
  },
  {
    icon: <FaTree className="text-primary-700 dark:text-primary-400" />,
    title: 'Preserve Forest Trails',
    desc: 'Stick to designated paths in the Zege peninsula forests to protect fragile ecosystems.',
  },
  {
    icon: <FaHandHoldingHeart className="text-primary-700 dark:text-primary-400" />,
    title: 'Direct Local Benefit',
    desc: 'Purchase handicrafts directly from women artisans and hire certified local guides.',
  },
  {
    icon: <FaCamera className="text-primary-700 dark:text-primary-400" />,
    title: 'Respect Monastic Heritage',
    desc: 'Never touch ancient mural paintings or church relics. Follow monastery photography guidelines.',
  },
]

const badgeTiers = [
  {
    tier: 'Bronze',
    icon: <FaMedal className="text-amber-700 dark:text-amber-400 text-2xl" />,
    req: '3+ criteria met',
    desc: 'Verified commitment to sustainable tourism basics.',
  },
  {
    tier: 'Silver',
    icon: <FaShieldAlt className="text-slate-500 dark:text-slate-300 text-2xl" />,
    req: '5+ criteria met',
    desc: 'Demonstrated waste reduction and fair local employment.',
  },
  {
    tier: 'Gold',
    icon: <FaAward className="text-gold-500 dark:text-gold-400 text-2xl" />,
    req: '7+ criteria met',
    desc: 'Solar powered, community revenue sharing, zero plastic.',
  },
  {
    tier: 'Platinum',
    icon: <FaTrophy className="text-primary-700 dark:text-primary-300 text-2xl" />,
    req: 'All criteria met',
    desc: 'Exemplary UNESCO biosphere eco-tourism leadership.',
  },
]

const projects = [
  {
    title: 'Lake Tana Shoreline Reforestation',
    icon: <FaTree />,
    goal: 'Plant 50,000 indigenous trees by 2027',
    progress: 68,
    donors: 340,
    raised: 12800,
  },
  {
    title: 'Monastery Manuscript Preservation',
    icon: <FaBookOpen />,
    goal: 'Safeguard ancient Ge’ez scrolls and murals',
    progress: 42,
    donors: 185,
    raised: 6700,
  },
  {
    title: 'Community Clean Water Initiative',
    icon: <FaWater />,
    goal: 'Install biological sand water filters',
    progress: 55,
    donors: 220,
    raised: 9200,
  },
]

export default function EcoTourismPage() {
  const { t } = useLanguage()
  const [activeSection, setActiveSection] = useState('overview')
  const [donationAmount, setDonationAmount] = useState(25)
  const [volForm, setVolForm] = useState({ name: '', email: '', interest: 'reforestation' })
  const [carbonActivity, setCarbonActivity] = useState('boat')
  const [volSubmitted, setVolSubmitted] = useState(false)
  const [donSubmitted, setDonSubmitted] = useState(false)

  const carbonFootprints: Record<string, { label: string; kg: number; tip: string }> = {
    boat: { label: 'Boat Tour (2hr)', kg: 12, tip: 'Offset by planting 1 indigenous tree (~15kg CO₂)' },
    walk: { label: 'Zege Forest Walk (2hr)', kg: 2, tip: 'Already low-impact! Perfect eco-friendly travel.' },
    drive: { label: 'Transfer from Airport (15km)', kg: 6, tip: 'Shared electric or hybrid taxi recommended.' },
    lodge: { label: 'Solar Eco-Lodge Stay (1 night)', kg: 4, tip: 'Solar installations cut lodge emissions by 75%.' },
  }

  const sectionNav = [
    { id: 'overview', label: 'Overview', icon: <FaGlobeAfrica /> },
    { id: 'badges', label: 'Eco-Badges', icon: <FaAward /> },
    { id: 'carbon', label: 'Carbon Calculator', icon: <FaCalculator /> },
    { id: 'community', label: 'Community & Projects', icon: <FaUsers /> },
    { id: 'tips', label: 'Sustainability Tips', icon: <FaLightbulb /> },
    { id: 'volunteer', label: 'Volunteer & Donate', icon: <FaDonate /> },
  ]

  return (
    <PublicLayout>
      <Head>
        <title>{t('eco.title', 'Eco-Tourism & Conservation Hub')} | LTTMS</title>
        <meta
          name="description"
          content="Learn about Lake Tana UNESCO Biosphere Reserve conservation, eco-badge certified vendors, carbon tracking, and community initiatives."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-3">
                🌿 {t('eco.badge', 'UNESCO Biosphere Reserve')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                {t('eco.title', 'Eco-Tourism & Conservation Hub')}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-primary-100/90 leading-relaxed">
                {t(
                  'eco.subtitle',
                  'Travel responsibly, preserve ancient heritage, and protect the Lake Tana ecosystem for generations to come.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Secondary Nav */}
        <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto gap-2 py-3 scrollbar-none">
              {sectionNav.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                    activeSection === s.id
                      ? 'bg-primary-700 text-white shadow-sm'
                      : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 1. OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-12">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                  Sustainable Tourism with Tangible Impact
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  Every booking directly funds Lake Tana wetland protection, tree planting, and fair income for local communities.
                </p>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { value: '5,200+', label: 'Trees Planted', icon: <FaTree /> },
                  { value: '100%', label: 'Verified Operators', icon: <FaAward /> },
                  { value: '12.5T', label: 'CO₂ Emissions Offset', icon: <FaGlobeAfrica /> },
                  { value: '90%', label: 'Local Community Revenue', icon: <FaUsers /> },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-surface-border rounded-2xl p-6 text-center shadow-sm"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xl">
                      {s.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                      {s.value}
                    </div>
                    <div className="text-xs font-semibold text-text-secondary mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Certification Tiers Overview */}
              <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold font-heading text-text-primary text-center mb-6">
                  {t('eco.badgesTitle', 'Lake Tana Eco-Certification')}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {badgeTiers.map((b, i) => (
                    <div
                      key={i}
                      className="bg-surface-muted border border-surface-border rounded-xl p-5 text-center"
                    >
                      <div className="mb-2 flex justify-center">{b.icon}</div>
                      <h4 className="font-bold text-text-primary text-base">{b.tier}</h4>
                      <p className="text-xs text-text-secondary mt-1">{b.req}</p>
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. ECO-BADGES */}
          {activeSection === 'badges' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                  {t('eco.badgesTitle', 'Lake Tana Eco-Certification')}
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  {t(
                    'eco.badgesSubtitle',
                    'Recognizing operators committed to environmental stewardship, zero plastic, and fair wages.'
                  )}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {badgeTiers.map((b, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm text-center"
                  >
                    <div className="mb-3 flex justify-center">{b.icon}</div>
                    <h3 className="text-lg font-bold font-heading text-text-primary">{b.tier}</h3>
                    <div className="text-xs font-semibold text-primary-700 dark:text-primary-400 mt-1 mb-2">
                      {b.req}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold font-heading text-text-primary mb-5">
                  Core Evaluation Criteria
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: <FaSolarPanel />, label: 'Renewable Solar Energy', desc: 'Solar electrical systems for boats and lodges' },
                    { icon: <FaTrash />, label: 'Zero Single-Use Plastic', desc: 'Filtered water stations & compostable packaging' },
                    { icon: <FaUsers />, label: 'Local Fair Employment', desc: '80%+ staff hired from Bahir Dar communities' },
                    { icon: <FaWater />, label: 'Freshwater Conservation', desc: 'Rainwater collection & wastewater treatment' },
                    { icon: <FaTree />, label: 'Carbon Neutrality', desc: 'Contributions to native tree reforestation' },
                    { icon: <FaHandHoldingHeart />, label: 'Heritage Preservation', desc: 'Direct support to island monastery maintenance' },
                  ].map((c, i) => (
                    <div key={i} className="bg-surface-muted border border-surface-border rounded-xl p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 shrink-0">
                        {c.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-text-primary">{c.label}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. CARBON CALCULATOR */}
          {activeSection === 'carbon' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                  {t('eco.carbonTitle', 'Carbon & Eco-Impact Calculator')}
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  {t(
                    'eco.carbonSubtitle',
                    'Estimate the ecological footprint of your Lake Tana journey and support verified local tree-planting.'
                  )}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h3 className="font-bold text-base font-heading text-text-primary mb-4">
                    Select Your Activity
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(carbonFootprints).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setCarbonActivity(key)}
                        className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${
                          carbonActivity === key
                            ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-600 text-text-primary font-bold shadow-sm'
                            : 'bg-surface border-surface-border text-text-secondary hover:bg-surface-muted'
                        }`}
                      >
                        <div>
                          <div className="text-text-primary">{val.label}</div>
                          <div className="text-xs text-text-secondary mt-0.5">{val.tip}</div>
                        </div>
                        <span className="text-xs font-mono font-bold text-primary-700 dark:text-primary-400 bg-surface px-2.5 py-1 rounded-lg border border-surface-border shrink-0 ml-3">
                          {val.kg} kg CO₂
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base font-heading text-text-primary mb-2">
                      Estimated Carbon Impact
                    </h3>
                    <div className="p-6 bg-surface-muted border border-surface-border rounded-xl text-center my-4">
                      <div className="text-4xl sm:text-5xl font-extrabold font-heading text-primary-700 dark:text-primary-400">
                        {carbonFootprints[carbonActivity].kg}
                      </div>
                      <div className="text-xs font-semibold text-text-secondary mt-1">
                        kg CO₂ Equivalent
                      </div>
                    </div>
                    <div className="p-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-xl text-xs text-text-primary leading-relaxed">
                      💡 <strong>Recommended Offset:</strong> {carbonFootprints[carbonActivity].tip}
                    </div>
                  </div>

                  <Link
                    href="/services"
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm"
                  >
                    <span>Browse Eco-Certified Tours</span>
                    <FaArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 4. COMMUNITY & PROJECTS */}
          {activeSection === 'community' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                  {t('eco.communityTitle', 'Community Conservation Projects')}
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  {t(
                    'eco.communitySubtitle',
                    'Direct community initiatives funded by sustainable tourism in Bahir Dar and Lake Tana.'
                  )}
                </p>
              </div>

              <div className="space-y-5">
                {projects.map((p, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xl shrink-0">
                      {p.icon}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-bold text-base text-text-primary">{p.title}</h4>
                        <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                          ${p.raised.toLocaleString()} raised
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{p.goal}</p>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                          <span>{p.progress}% completed</span>
                          <span>{p.donors} active donors</span>
                        </div>
                        <div className="h-2 bg-surface-muted border border-surface-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-700"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SUSTAINABILITY TIPS */}
          {activeSection === 'tips' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                  {t('eco.tipsTitle', 'Responsible Travel Principles')}
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  {t(
                    'eco.tipsSubtitle',
                    'Simple ways you can support local communities and protect sacred natural sites.'
                  )}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tips.map((tip, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm hover:border-primary-600 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-xl mb-4">
                      {tip.icon}
                    </div>
                    <h3 className="font-bold text-base font-heading text-text-primary mb-2">
                      {tip.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. VOLUNTEER & DONATE */}
          {activeSection === 'volunteer' && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
                  Support Conservation &amp; Community
                </h2>
                <p className="text-sm text-text-secondary mt-2">
                  100% of proceeds go directly to Lake Tana wetland reforestation and monastery preservation.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Direct Donation Card */}
                <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h3 className="font-bold text-base font-heading text-text-primary mb-2">
                    Direct Conservation Donation
                  </h3>
                  <p className="text-xs text-text-secondary mb-5">
                    Select an amount to fund indigenous seedling planting and clean water projects.
                  </p>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[10, 25, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setDonationAmount(amt)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                          donationAmount === amt
                            ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                            : 'bg-surface border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setDonSubmitted(true)
                      setTimeout(() => setDonSubmitted(false), 2500)
                    }}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm"
                  >
                    {donSubmitted ? '✓ Thank You for Supporting Lake Tana!' : `Donate $${donationAmount}`}
                  </button>
                  <p className="text-[11px] text-text-secondary text-center mt-3">
                    Supports Telebirr, CBE Birr, Chapa, and international cards.
                  </p>
                </div>

                {/* Volunteer Signup Card */}
                <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
                  <h3 className="font-bold text-base font-heading text-text-primary mb-2">
                    Volunteer in Bahir Dar
                  </h3>
                  <p className="text-xs text-text-secondary mb-5">
                    Participate in guided weekend shoreline clean-ups or seedling planting.
                  </p>

                  {volSubmitted ? (
                    <div className="p-6 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-xl text-center">
                      <FaCheckCircle className="text-3xl text-primary-700 dark:text-primary-300 mx-auto mb-2" />
                      <h4 className="font-bold text-text-primary text-sm">Thank You for Registering!</h4>
                      <p className="text-xs text-text-secondary mt-1">Our coordinator in Bahir Dar will reach out to you.</p>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        setVolSubmitted(true)
                      }}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={volForm.name}
                        onChange={(e) => setVolForm({ ...volForm, name: e.target.value })}
                        required
                        className="w-full border border-surface-border rounded-xl px-4 py-2.5 text-xs sm:text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={volForm.email}
                        onChange={(e) => setVolForm({ ...volForm, email: e.target.value })}
                        required
                        className="w-full border border-surface-border rounded-xl px-4 py-2.5 text-xs sm:text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={volForm.interest}
                        onChange={(e) => setVolForm({ ...volForm, interest: e.target.value })}
                        className="w-full border border-surface-border rounded-xl px-4 py-2.5 text-xs sm:text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="reforestation">Indigenous Tree Planting</option>
                        <option value="cleanup">Lake Shoreline Clean-Up</option>
                        <option value="monastery">Monastery Preservation Support</option>
                        <option value="education">Community Youth Education</option>
                      </select>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm"
                      >
                        Sign Up as Volunteer
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
