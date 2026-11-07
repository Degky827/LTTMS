import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { useLanguage } from '@/contexts/LanguageContext'

export const PublicFooter: React.FC = () => {
  const { language } = useLanguage()

  return (
    <footer className="bg-primary-950 text-white border-t border-primary-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & About (Span 2 cols on lg) */}
          <div className="lg:col-span-2">
            <Logo variant="full" theme="dark" className="mb-4" />
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm mb-6">
              {language === 'am'
                ? 'የጣና ሐይቅ የተቀናጀ የኢኮ-ቱሪዝም እና የቦታ ማስያዣ የገበያ መድረክ። የአካባቢውን አስጎብኚዎች የሚያስተሳስር፣ ጥንታዊ የደሴት ገዳማትን የሚጠብቅ እና ዘላቂ ጉዞን የሚያረጋግጥ ስርዓት።'
                : 'Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS). Connecting verified local operators, safeguarding 14th-century island monasteries, and promoting sustainable community travel in Bahir Dar, Ethiopia.'}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>UNESCO Biosphere Reserve • Lake Tana</span>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 font-heading">
              {language === 'am' ? 'የጣና ሐይቅ ጉብኝቶች' : 'Explore Lake Tana'}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link href="/services?category=boat" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የጀልባ ጉዞዎች እና ክሩዝ' : 'Boat Tours & Cruises'}
                </Link>
              </li>
              <li>
                <Link href="/services?category=monastery" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የደሴት ገዳማት ጉብኝት' : 'Island Monastery Tours'}
                </Link>
              </li>
              <li>
                <Link href="/services?category=hotel" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የሐይቅ ዳርቻ ኢኮ-ሎጆች' : 'Lakeside Eco-Lodges'}
                </Link>
              </li>
              <li>
                <Link href="/destinations/blue-nile-falls" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የጢስ አባይ ፏፏቴ' : 'Blue Nile Falls (Tis Issat)'}
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-white transition-colors">
                  {language === 'am' ? 'ሁሉም መዳረሻዎች' : 'All Lake Destinations'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tourism Partners */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 font-heading">
              {language === 'am' ? 'የቱሪዝም አጋሮች' : 'Tourism Partners'}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link href="/vendor/register" className="hover:text-white font-semibold text-emerald-300 transition-colors">
                  {language === 'am' ? 'አቅራቢ ሆነው ይመዝገቡ' : 'Become a Partner'}
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የአቅራቢ ፖርታል መግቢያ' : 'Vendor Portal Login'}
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የተረጋገጡ አቅራቢዎች ማውጫ' : 'Verified Vendor Directory'}
                </Link>
              </li>
              <li>
                <Link href="/eco-tourism" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የኢኮ-ባጅ ማረጋገጫ' : 'Eco-Badge Certification'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የተጓዦች ፖርታል' : 'Tourist Sign In'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 font-heading">
              {language === 'am' ? 'ድጋፍ እና አድራሻ' : 'Support & Legal'}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {language === 'am' ? 'ስለ ጣና ሐይቅ ፕሮጀክት' : 'About Lake Tana'}
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white transition-colors">
                  {language === 'am' ? 'ታሪክ እና ቅርስ' : 'Monasteries & History'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {language === 'am' ? 'የባሕር ዳር ቢሮ ያነጋግሩ' : 'Contact Bahir Dar Desk'}
                </Link>
              </li>
              <li>
                <span className="block text-gray-400 text-[11px] mt-1">
                  Bahir Dar, Amhara Region, Ethiopia
                </span>
                <span className="block text-gray-400 text-[11px]">
                  support@laketana-tourism.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} Lake Tana Eco-Tourism & Booking Marketplace (LTTMS). All rights reserved.
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-gray-400">Supported:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white tracking-wider">Telebirr</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white tracking-wider">CBE Birr</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white tracking-wider">Chapa</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white tracking-wider">Cards</span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  )
}
