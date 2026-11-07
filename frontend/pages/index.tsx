import React from 'react'
import Head from 'next/head'
import { PublicNavbar } from '@/components/public-home/PublicNavbar'
import { HeroSection } from '@/components/public-home/HeroSection'
import { ExperienceCategories } from '@/components/public-home/ExperienceCategories'
import { DestinationShowcase } from '@/components/public-home/DestinationShowcase'
import { FeaturedExperiences } from '@/components/public-home/FeaturedExperiences'
import { LakeTanaStory } from '@/components/public-home/LakeTanaStory'
import { EcoTourismSection } from '@/components/public-home/EcoTourismSection'
import { TrustedVendors } from '@/components/public-home/TrustedVendors'
import { HowItWorks } from '@/components/public-home/HowItWorks'
import { TravelerReviews } from '@/components/public-home/TravelerReviews'
import { BecomeVendorSection } from '@/components/public-home/BecomeVendorSection'
import { FinalCallToAction } from '@/components/public-home/FinalCallToAction'
import { PublicFooter } from '@/components/public-home/PublicFooter'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary selection:bg-primary-500 selection:text-white transition-colors duration-200">
      <Head>
        <title>Lake Tana Eco-Tourism & Booking Marketplace | LTTMS</title>
        <meta
          name="description"
          content="Discover Ethiopia's largest lake and UNESCO Biosphere Reserve. Book verified island monastery tours, boat cruises, lakeside eco-lodges, and birdwatching excursions in Bahir Dar."
        />
        <meta name="keywords" content="Lake Tana, Bahir Dar, Ethiopia, Eco-Tourism, Monasteries, Boat Tours, Blue Nile Falls, UNESCO Biosphere" />
        <meta property="og:title" content="Lake Tana Eco-Tourism & Booking Marketplace | LTTMS" />
        <meta
          property="og:description"
          content="Explore 14th-century island monasteries, unforgettable boat excursions, and verified local tourism operators on Lake Tana."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/fixedbgforhomepage.jpg" />
        <link rel="canonical" href="https://laketana-tourism.com" />
      </Head>

      {/* 1. Integrated Premium Sticky Navigation */}
      <PublicNavbar />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 2 & 3. Hero Section & Overlapping Search Box */}
        <HeroSection />

        {/* 4. Explore by Experience Category */}
        <ExperienceCategories />

        {/* 5. Discover Lake Tana Sacred & Natural Destinations */}
        <DestinationShowcase />

        {/* 6. Featured Tourism Experiences */}
        <FeaturedExperiences />

        {/* 7. Experience Lake Tana (Editorial Heritage & Nature Storytelling) */}
        <LakeTanaStory />

        {/* 8. Eco-Tourism & Sustainable Travel (Badges & Carbon Impact) */}
        <EcoTourismSection />

        {/* 9. Trusted Local Tourism Providers & Cooperatives */}
        <TrustedVendors />

        {/* 10. How LTTMS Works (4-Step Seamless Flow) */}
        <HowItWorks />

        {/* 11. Traveler Reviews & Genuine Ratings */}
        <TravelerReviews />

        {/* 12. Become a Tourism Partner (Vendor Acquisition) */}
        <BecomeVendorSection />

        {/* 13. Final Call to Action */}
        <FinalCallToAction />
      </main>

      {/* 14. Professional Comprehensive Footer */}
      <PublicFooter />
    </div>
  )
}
