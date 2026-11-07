import Head from 'next/head'
import Link from 'next/link'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import { FaBookOpen, FaChevronRight, FaLandmark, FaExternalLinkAlt } from 'react-icons/fa'
import { lakeTanaHistorySources, lakeTanaHistoryTimeline } from '../data/lakeTanaHistory'

export default function HistoryPage() {
  const { t } = useLanguage()

  return (
    <PublicLayout>
      <Head>
        <title>{t('history.heroTitle', 'History of Lake Tana')} | LTTMS</title>
        <meta
          name="description"
          content="Explore the rich chronological history of Lake Tana, ancient island monasteries, royal treasures, and UNESCO biosphere sanctuary."
        />
      </Head>

      <div className="bg-surface-muted/40 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary-700/50">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-800/80 text-gold-300 border border-gold-500/30 mb-3">
                <FaLandmark className="text-gold-400" />
                {t('history.timelineTitle', 'Historical Timeline & Sacred Heritage')}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                {t('history.heroTitle', 'History of Lake Tana')}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-primary-100/90 leading-relaxed max-w-2xl">
                {t(
                  'history.heroSubtitle',
                  'A journey through millennia of monastic sanctuary, ancient civilizations, and UNESCO natural heritage.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            {lakeTanaHistoryTimeline.map((item, idx) => (
              <div
                key={idx}
                className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:border-primary-600 transition-colors"
              >
                <div>
                  <div className="inline-block text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-2">
                    {item.period}
                  </div>
                  <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
                    {item.title}
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Research Sources & Further Reading */}
          <div className="mt-12 bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold font-heading text-text-primary mb-4 flex items-center gap-2">
              <FaBookOpen className="text-primary-700 dark:text-primary-400" />
              {t('history.sourcesTitle', 'Historical References & Research')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {lakeTanaHistorySources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted border border-surface-border text-xs sm:text-sm font-semibold text-text-primary hover:border-primary-600 transition-colors"
                >
                  <span>{source.label}</span>
                  <FaExternalLinkAlt className="text-xs text-text-secondary shrink-0" />
                </a>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-text-secondary">
                Experience these centuries of Ethiopian monastic heritage in person.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-sm shrink-0"
              >
                <span>{t('home.viewAllServices', 'Browse All Services')}</span>
                <FaChevronRight className="text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
