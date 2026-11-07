import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { FaLeaf, FaHome } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Custom404() {
  const { t } = useLanguage()

  return (
    <PublicLayout>
      <Head>
        <title>Page Not Found (404) | LTTMS</title>
      </Head>
      <div className="bg-surface-muted/40 min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md bg-surface border border-surface-border rounded-2xl p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-300">
            <FaLeaf className="text-2xl" />
          </div>
          <h1 className="text-6xl font-black font-heading text-text-primary mb-2">404</h1>
          <h2 className="text-xl font-bold font-heading text-text-primary mb-2">Page Not Found</h2>
          <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
            The page you are looking for does not exist or has been relocated within the Lake Tana marketplace.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <FaHome className="text-sm" />
            <span>{t('common.backToHome', 'Back to Home')}</span>
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}
