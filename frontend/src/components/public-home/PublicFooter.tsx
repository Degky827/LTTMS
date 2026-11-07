import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'

export const PublicFooter: React.FC = () => {
  const { language } = useLanguage()

  return (
    <footer className="bg-[#0e2219] text-white border-t border-emerald-950 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & About (Span 2 cols on lg) */}
          <div className="lg:col-span-2">
            <Logo variant="full" theme="dark" className="mb-4" />
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mb-6 font-normal">
              {language === 'am'
                ? 'የጣና ሐይቅ የተቀናጀ የኢኮ-ቱሪዝም እና የቦታ ማስያዣ የገበያ መድረክ። የአካባቢውን አስጎብኚዎች የሚያስተሳስር፣ ጥንታዊ የደሴት ገዳማትን የሚጠብቅ እና ዘላቂ ጉዞን የሚያረጋግጥ ስርዓት።'
                : 'Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS). Connecting verified local operators, safeguarding 14th-century island monasteries, and promoting sustainable community travel in Bahir Dar, Ethiopia.'}
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-xs text-emerald-300 font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>UNESCO Biosphere Reserve • Lake Tana</span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 font-heading">
              {language === 'am' ? 'የጣና ሐይቅ ጉብኝቶች' : 'Explore Lake Tana'}
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/services?category=boat"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የጀልባ ጉዞዎች እና ክሩዝ' : 'Boat Tours & Cruises'}
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=monastery"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የደሴት ገዳማት ጉብኝት' : 'Island Monastery Tours'}
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=hotel"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የሐይቅ ዳርቻ ኢኮ-ሎጆች' : 'Lakeside Eco-Lodges'}
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/blue-nile-falls"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የጢስ አባይ ፏፏቴ' : 'Blue Nile Falls (Tis Issat)'}
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'ሁሉም መዳረሻዎች' : 'All Lake Destinations'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tourism Partners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 font-heading">
              {language === 'am' ? 'የቱሪዝም አጋሮች' : 'Tourism Partners'}
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/register?role=vendor"
                  className="text-emerald-300 hover:text-emerald-200 hover:underline font-semibold transition-colors inline-block"
                >
                  {language === 'am' ? 'አቅራቢ ሆነው ይመዝገቡ' : 'Become a Partner'}
                </Link>
              </li>
              <li>
                <Link
                  href="/vendor/login"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የአቅራቢ ፖርታል መግቢያ' : 'Vendor Portal Login'}
                </Link>
              </li>
              <li>
                <Link
                  href="/vendors"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የተረጋገጡ አቅራቢዎች ማውጫ' : 'Verified Vendor Directory'}
                </Link>
              </li>
              <li>
                <Link
                  href="/eco-tourism"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የኢኮ-ባጅ ማረጋገጫ' : 'Eco-Badge Certification'}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የተጓዦች ፖርታል' : 'Tourist Sign In'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 font-heading">
              {language === 'am' ? 'ድጋፍ እና አድራሻ' : 'Support & Legal'}
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/about"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'ስለ ጣና ሐይቅ ፕሮጀክት' : 'About Lake Tana & LTTMS'}
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'ታሪክ እና ቅርስ' : 'Monasteries & History'}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-300 hover:text-emerald-300 hover:underline transition-colors font-medium inline-block"
                >
                  {language === 'am' ? 'የባሕር ዳር ቢሮ ያነጋግሩ' : 'Contact Bahir Dar Desk'}
                </Link>
              </li>
              <li className="pt-2 border-t border-emerald-900/60">
                <span className="block text-slate-300 text-[11px]">
                  Shore Road, Bahir Dar, Ethiopia
                </span>
                <a
                  href="mailto:support@laketana-tourism.com"
                  className="block text-emerald-300 hover:text-emerald-200 hover:underline text-[11px] mt-1 font-semibold"
                >
                  support@laketana-tourism.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-emerald-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div>
            © {new Date().getFullYear()} Lake Tana Eco-Tourism &amp; Booking Marketplace (LTTMS). All rights reserved.
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400">Supported:</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-[11px] font-bold text-white tracking-wider">
              telebirr
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-[11px] font-bold text-white tracking-wider">
              CBE Birr
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-[11px] font-bold text-white tracking-wider">
              Chapa
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-[11px] font-bold text-white tracking-wider">
              Cards
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
