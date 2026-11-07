import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  FaLeaf,
  FaHandshake,
  FaShieldAlt,
  FaGlobe,
  FaMapMarkerAlt,
  FaWater,
  FaChurch,
  FaTree,
  FaChevronRight,
} from 'react-icons/fa'

export default function AboutPage() {
  const { t } = useLanguage()

  const sections = [
    {
      id: 'geography',
      icon: <FaMapMarkerAlt className="text-primary-600 dark:text-primary-400 text-xl" />,
      title: t('about.geographyTitle', 'Geography & Location'),
      desc: t(
        'about.geographyDesc',
        'Lake Tana is the largest lake in Ethiopia, located in the Amhara Region in the north-western Ethiopian Highlands. Sitting at 1,788 meters elevation, its surface area spans between 3,200 and 3,673 km².'
      ),
      facts: [
        { label: 'Surface Area', value: '3,200–3,673 km²' },
        { label: 'Length', value: '84 km' },
        { label: 'Width', value: '66 km' },
        { label: 'Elevation', value: '1,788 m' },
      ],
    },
    {
      id: 'hydrology',
      icon: <FaWater className="text-primary-600 dark:text-primary-400 text-xl" />,
      title: t('about.hydrologyTitle', 'Hydrology & Source of the Nile'),
      desc: t(
        'about.hydrologyDesc',
        'Fed by the Gilgel Abay and surrounding highland rivers, Lake Tana is the proud headwater of the Blue Nile River (locally known as Abbay), which creates the majestic Tis Issat Falls downstream.'
      ),
      facts: [
        { label: 'Main Outflow', value: 'Blue Nile (Abbay)' },
        { label: 'Major Tributary', value: 'Gilgel Abay' },
        { label: 'Famous Falls', value: 'Tis Issat Falls' },
      ],
    },
    {
      id: 'monasteries',
      icon: <FaChurch className="text-primary-600 dark:text-primary-400 text-xl" />,
      title: t('about.monasteriesTitle', 'Island Monasteries & Heritage'),
      desc: t(
        'about.monasteriesDesc',
        'Historic home to over 20 active island monasteries dating from the 14th century, preserving priceless ecclesiastical treasures, ancient Ge’ez manuscripts, and wall murals.'
      ),
      facts: [
        { label: 'Islands', value: '20+ Islands' },
        { label: 'Monasteries', value: '14th–16th Century' },
        { label: 'Sacred Sites', value: 'Kebran Gabriel, Ura' },
      ],
    },
    {
      id: 'ecology',
      icon: <FaTree className="text-primary-600 dark:text-primary-400 text-xl" />,
      title: t('about.ecologyTitle', 'UNESCO Biosphere Reserve'),
      desc: t(
        'about.ecologyDesc',
        'Officially designated by UNESCO in 2015, the Lake Tana Biosphere Reserve is a biodiversity hotspot with 15+ endemic fish species, migratory birds, and indigenous forests.'
      ),
      facts: [
        { label: 'UNESCO Status', value: 'Designated 2015' },
        { label: 'Endemic Fish', value: '15+ Species' },
        { label: 'Bird Species', value: '300+ Recorded' },
      ],
    },
  ]

  const pillars = [
    {
      icon: <FaLeaf className="text-primary-700 dark:text-primary-300 text-2xl" />,
      title: t('nav.ecoTourism', 'Eco-Tourism'),
      desc: 'Protecting the lake ecosystem through zero-plastic policies, tree planting, and sustainable visitor guidelines.',
    },
    {
      icon: <FaHandshake className="text-gold-600 dark:text-gold-400 text-2xl" />,
      title: t('home.reason1Title', '100% Verified Local Operators'),
      desc: 'Empowering local boat associations, monastery guides, and eco-lodges with 90% direct revenue retention.',
    },
    {
      icon: <FaShieldAlt className="text-primary-700 dark:text-primary-300 text-2xl" />,
      title: t('home.reason4Title', 'Guaranteed Secure Booking'),
      desc: 'Safe and transparent reservations with Ethiopian and international payment integrations.',
    },
    {
      icon: <FaGlobe className="text-gold-600 dark:text-gold-400 text-2xl" />,
      title: t('about.mission', 'Our Mission'),
      desc: t('about.missionText'),
    },
  ]

  return (
    <PublicLayout>
      <Head>
        <title>{t('about.heroTitle', 'About Lake Tana')} | LTTMS</title>
        <meta
          name="description"
          content="Learn about Lake Tana UNESCO Biosphere Reserve, ancient island monasteries, geography, and sustainable eco-tourism."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-4">
                🌿 {t('nav.unescoBanner', 'UNESCO Biosphere Reserve • Lake Tana, Ethiopia')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading">
                {t('about.heroTitle', 'About Lake Tana')}{' '}
                <span className="text-gold-400">&amp; Heritage</span>
              </h1>
              <p className="mt-4 text-base sm:text-lg text-primary-100/90 leading-relaxed max-w-2xl">
                {t(
                  'about.heroSubtitle',
                  "Cultural, historical, and ecological sanctuary of Ethiopia's largest freshwater treasure."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Mission and Vision Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 mb-4">
                <FaLeaf className="text-primary-700 dark:text-primary-300 text-xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-3">
                {t('about.mission', 'Our Mission')}
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                {t('about.missionText')}
              </p>
            </div>

            <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-950/60 border border-gold-200 dark:border-gold-800 mb-4">
                <FaTree className="text-gold-700 dark:text-gold-300 text-xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-3">
                {t('about.vision', 'Our Vision')}
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                {t('about.visionText')}
              </p>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
              {t('home.whyChooseUsTitle', 'Why Travel Lake Tana With Us')}
            </h2>
            <p className="text-text-secondary text-sm sm:text-base mt-2">
              {t(
                'home.whyChooseUsSubtitle',
                'Designed specifically for sustainable travel, safety, community benefit, and cultural preservation.'
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="bg-surface border border-surface-border rounded-xl p-6 hover:border-primary-600 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-muted flex items-center justify-center mb-4">
                  {pillar.icon}
                </div>
                <h3 className="font-bold text-base font-heading text-text-primary mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Geographical and Ecological Deep Dives */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">
          <div className="border-t border-surface-border pt-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary text-center mb-10">
              Key Geographic &amp; Ecological Characteristics
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
                      {sec.icon}
                    </div>
                    <h3 className="text-xl font-bold font-heading text-text-primary">
                      {sec.title}
                    </h3>
                  </div>
                  <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-6">
                    {sec.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-surface-border">
                  {sec.facts.map((fact, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-surface-muted p-3 rounded-lg border border-surface-border text-center"
                    >
                      <div className="text-xs text-text-secondary font-medium">
                        {fact.label}
                      </div>
                      <div className="text-sm font-bold font-heading text-text-primary mt-1">
                        {fact.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Timeline */}
        <div className="bg-primary-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-primary-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                {t('history.heroTitle', 'History of Lake Tana')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
                {t('history.timelineTitle', 'Historical Timeline & Sacred Heritage')}
              </h2>
              <p className="text-primary-200 text-sm mt-2">
                {t(
                  'history.heroSubtitle',
                  'A journey through millennia of monastic sanctuary, ancient civilizations, and UNESCO natural heritage.'
                )}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  period: '~5 Million Years',
                  title: 'Volcanic Origin',
                  desc: 'Volcanic lava flow blocked the northern river basin, forming Ethiopia’s highest freshwater reservoir.',
                },
                {
                  period: '14th–16th Century',
                  title: 'Golden Age of Monasteries',
                  desc: 'Saintly scholars founded island monasteries safeguarding Ge’ez manuscripts and church relics.',
                },
                {
                  period: '1770 CE',
                  title: 'James Bruce Expedition',
                  desc: 'Explorer documented Lake Tana as the historic headwaters of the Blue Nile River.',
                },
                {
                  period: '2015 CE',
                  title: 'UNESCO Recognition',
                  desc: 'Officially declared a UNESCO Biosphere Reserve for unique bird species, fisheries, and culture.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-primary-900/60 border border-primary-800 rounded-xl p-5"
                >
                  <div className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-1">
                    {item.period}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-primary-200 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-surface border border-surface-border rounded-3xl p-8 sm:p-12 text-center shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mb-3">
              {t('home.ctaTitle', 'Ready to Experience Lake Tana?')}
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mb-8">
              {t(
                'home.ctaSubtitle',
                "Join thousands of eco-conscious travelers exploring Ethiopia's greatest natural and historic treasure."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-primary-700 hover:bg-primary-800 transition-colors shadow-sm text-sm"
              >
                <span>{t('home.ctaButton', 'Start Exploring Today')}</span>
                <FaChevronRight className="text-xs" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-text-primary bg-surface-muted hover:bg-surface-border border border-surface-border transition-colors text-sm"
              >
                <span>{t('nav.contactUs', 'Contact Us')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
