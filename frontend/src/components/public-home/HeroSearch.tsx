import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useLanguage } from '@/contexts/LanguageContext'

export const HeroSearch: React.FC = () => {
  const router = useRouter()
  const { t, language } = useLanguage()

  const [destination, setDestination] = useState('all')
  const [category, setCategory] = useState('all')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')

  const destinationOptions = [
    { value: 'all', label: language === 'am' ? 'ሁሉም መዳረሻዎች' : 'All Destinations' },
    { value: 'zege-peninsula', label: language === 'am' ? 'ዝጌ ባሕረ ገብ መሬት' : 'Zege Peninsula' },
    { value: 'ura-kidane-mehret', label: language === 'am' ? 'ኡራ ኪዳነ ምሕረት' : 'Ura Kidane Mehret' },
    { value: 'kibran-gebriel', label: language === 'am' ? 'ክብራን ገብርኤል' : 'Kibran Gebriel' },
    { value: 'tana-qirqos', label: language === 'am' ? 'ጣና ቂርቆስ' : 'Tana Qirqos' },
    { value: 'blue-nile-falls', label: language === 'am' ? 'ዓባይ ፏፏቴ (ጢስ አባይ)' : 'Blue Nile Falls' },
    { value: 'bahir-dar', label: language === 'am' ? 'ባሕር ዳር የሐይቅ ዳርቻ' : 'Bahir Dar Waterfront' },
  ]

  const categoryOptions = [
    { value: 'all', label: language === 'am' ? 'ሁሉም አገልግሎቶች' : 'All Experience Types' },
    { value: 'boat', label: language === 'am' ? 'የጀልባ ጉዞ እና ክሩዝ' : 'Boat Tours & Cruises' },
    { value: 'monastery', label: language === 'am' ? 'የደሴት ገዳማት' : 'Island Monasteries' },
    { value: 'tour', label: language === 'am' ? 'የተመሩ ጉብኝቶች' : 'Guided Excursions' },
    { value: 'hotel', label: language === 'am' ? 'ኢኮ-ሎጆች እና ሆቴሎች' : 'Eco-Lodges & Stays' },
    { value: 'food', label: language === 'am' ? 'ባህላዊ ምግብ እና ሙዚቃ' : 'Cultural & Culinary' },
    { value: 'wildlife', label: language === 'am' ? 'አእዋፋት እና የተፈጥሮ ጥበቃ' : 'Bird Watching & Nature' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination && destination !== 'all') params.append('destination', destination)
    if (category && category !== 'all') params.append('category', category)
    if (date) params.append('date', date)
    if (guests) params.append('guests', guests)
    router.push(`/services?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="w-full max-w-5xl mx-auto bg-surface dark:bg-surface-dark rounded-2xl shadow-2xl p-4 sm:p-6 border border-surface-border text-left">
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Destination */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{t('home.destination', 'Destination')}</span>
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full h-12 px-3.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface dark:bg-surface-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-colors cursor-pointer font-medium"
          >
            {destinationOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface dark:bg-surface-dark text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Experience Type */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{t('home.experienceType', 'Experience Type')}</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 px-3.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface dark:bg-surface-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-colors cursor-pointer font-medium"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface dark:bg-surface-dark text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{t('home.preferredDate', 'Date')}</span>
          </label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-3.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface dark:bg-surface-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-colors font-medium"
          />
        </div>

        {/* Guests & Action Button */}
        <div className="flex items-center gap-2">
          <div className="w-2/5">
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{t('home.guests', 'Guests')}</span>
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full h-12 px-2.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface dark:bg-surface-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-colors cursor-pointer font-medium"
            >
              <option value="1" className="bg-surface dark:bg-surface-dark text-text-primary">1 {language === 'am' ? 'ሰው' : 'Guest'}</option>
              <option value="2" className="bg-surface dark:bg-surface-dark text-text-primary">2 {language === 'am' ? 'ሰዎች' : 'Guests'}</option>
              <option value="4" className="bg-surface dark:bg-surface-dark text-text-primary">4 {language === 'am' ? 'ሰዎች' : 'Guests'}</option>
              <option value="6" className="bg-surface dark:bg-surface-dark text-text-primary">6+ {language === 'am' ? 'ቡድን' : 'Group'}</option>
            </select>
          </div>

          <div className="w-3/5">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-950/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>{t('home.findTours', 'Find Experiences')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
