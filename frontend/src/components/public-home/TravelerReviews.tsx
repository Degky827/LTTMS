import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ReviewItem {
  name: string
  location: string
  trip: string
  avatar: string
  rating: number
  date: string
  quoteEn: string
  quoteAm: string
}

export const TravelerReviews: React.FC = () => {
  const { language } = useLanguage()

  const reviews: ReviewItem[] = [
    {
      name: 'Elena Rostova',
      location: 'Paris, France',
      trip: 'Full-Day Island Monasteries Boat Tour',
      avatar: 'ER',
      rating: 5,
      date: 'October 2026',
      quoteEn: 'Visiting Ura Kidane Mehret was the highlight of our entire Ethiopian journey. Our boat captain Dawit was so respectful of the lake, zero plastic on board, and his knowledge was world-class.',
      quoteAm: 'የኡራ ኪዳነ ምሕረት ጉብኝት በኢትዮጵያ ቆይታችን እጅግ አስደናቂው ጊዜ ነበር። የጀልባ ካፒቴናችን ዳዊት ለሐይቁ ንጽህና ያለው ክብርና እውቀት በጣም የሚደነቅ ነው።',
    },
    {
      name: 'Tewodros Assefa',
      location: 'Washington DC, USA',
      trip: 'Sunset Pelican Cruise & Lakeside Stay',
      avatar: 'TA',
      rating: 5,
      date: 'September 2026',
      quoteEn: 'Booking through LTTMS made our family vacation in Bahir Dar completely seamless. Transparent pricing in ETB, certified life vests for my children, and no aggressive middleman hustling.',
      quoteAm: 'በኤልቲቲኤምኤስ በኩል ቦታ መያዛችን ለቤተሰባችን እረፍት ትልቅ እፎይታ ፈጠረልን። ግልጽ ዋጋ፣ ለልጆቼ አስተማማኝ የሕይወት አድን ጃኬቶች እና ያለምንም ደላላ ጣልቃ ገብነት።',
    },
    {
      name: 'Marcus Lindqvist',
      location: 'Stockholm, Sweden',
      trip: 'UNESCO Wetland Bird Watching Expedition',
      avatar: 'ML',
      rating: 5,
      date: 'August 2026',
      quoteEn: 'Lake Tana’s biosphere is an ornithological marvel. We spotted over 45 bird species in a single morning, including great white pelicans and African fish eagles. The guide knew every call.',
      quoteAm: 'የጣና ሐይቅ የዩኔስኮ ባዮስፌር ለአእዋፋት ወዳጆች ገነት ነው። በአንድ ጥዋት ብቻ ከ45 በላይ የአእዋፋት ዝርያዎችን ተመልክተናል። አስጎብኚያችን ድንቅ ባለሙያ ነው።',
    },
  ]

  return (
    <section className="py-20 bg-surface dark:bg-surface-dark transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold mb-3">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>4.9 / 5.0 • 450+ {language === 'am' ? 'የተረጋገጡ ግምገማዎች' : 'Verified Reviews'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-text-primary">
            {language === 'am'
              ? 'ተጓዦች ስለ ጣና ሐይቅ ጉብኝታቸው ምን አሉ?'
              : 'Stories from Lake Tana Travelers'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {language === 'am'
              ? 'ከተረጋገጡ የሀገር ውስጥ እና የውጭ ሀገር ጎብኚዎች የተገኙ እውነተኛ አስተያየቶች።'
              : 'Genuine feedback from travelers who booked excursions with verified local operators.'}
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-surface-muted dark:bg-surface-dark/70 border border-surface-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                {/* Star Row & Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-gold-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[11px] text-text-secondary font-medium">{rev.date}</span>
                </div>

                {/* Excursion Tag */}
                <span className="inline-block text-[11px] font-bold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/80 px-2.5 py-1 rounded-md mb-3">
                  {rev.trip}
                </span>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed italic mb-6">
                  &ldquo;{language === 'am' ? rev.quoteAm : rev.quoteEn}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-700 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-heading text-text-primary">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    {rev.location} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Traveler</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
