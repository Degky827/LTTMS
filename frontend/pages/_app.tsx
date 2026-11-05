import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AppProviders } from '@/providers/AppProviders'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Lake Tana Eco-Tourism — Explore Ethiopia's largest lake, a UNESCO Biosphere Reserve with ancient island monasteries, diverse wildlife, and certified eco-adventures."
        />
        <meta name="keywords" content="Lake Tana, Ethiopia, eco-tourism, monasteries, travel, biosphere reserve, Bahir Dar" />
        <meta property="og:title" content="Lake Tana Eco-Tourism & Booking Marketplace (LTTMS)" />
        <meta property="og:description" content="Discover Ethiopia's largest lake — a UNESCO Biosphere Reserve" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#145B46" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lake Tana" />
      </Head>
      <AppProviders>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppProviders>
    </>
  )
}
