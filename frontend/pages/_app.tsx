import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '../context/AuthContext'
import { LanguageProvider } from '../context/LanguageContext'
import { ToastProvider } from '../context/ToastContext'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Lake Tana Eco-Tourism - Explore Ethiopia's largest lake, a UNESCO Biosphere Reserve with ancient monasteries, diverse wildlife, and unforgettable eco-adventures." />
        <meta name="keywords" content="Lake Tana, Ethiopia, eco-tourism, travel, monastery, nature" />
        <meta property="og:title" content="Lake Tana Eco-Tourism" />
        <meta property="og:description" content="Discover Ethiopia's largest lake — a UNESCO Biosphere Reserve" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0EA5E9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lake Tana" />
      </Head>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </>
  )
}
