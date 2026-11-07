import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useLanguage } from '@/contexts/LanguageContext'

export const HeroSearch: React.FC = () => {
  const router = useRouter()
  const { language } = useLanguage()

  const [query, setQuery] = useState('')
  const [destination, setDestination] = useState('all')
  const [date, setDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.append('q', query.trim())
    if (destination && destination !== 'all') params.append('destination', destination)
    if (date) params.append('date', date)
    router.push(`/services?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl bg-white rounded-3xl md:rounded-full shadow-2xl border border-neutral-200/90 p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center gap-2 text-left"
    >
      {/* 1. Search Query */}
      <div className="flex items-center flex-1 px-4 py-2">
        <svg
          className="w-5 h-5 text-neutral-500 mr-3 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === 'am' ? 'የት መሄድ ይፈልጋሉ?' : 'Where do you want to go?'}
          className="w-full text-sm text-neutral-800 placeholder-neutral-500 font-medium bg-transparent outline-none"
        />
      </div>

      {/* Divider */}
      <div className="hidden md:block h-7 w-[1px] bg-neutral-200" aria-hidden="true" />

      {/* 2. Destination */}
      <div className="flex items-center px-4 py-2 flex-shrink-0">
        <svg
          className="w-4 h-4 text-[#244B3A] mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="text-xs sm:text-sm text-neutral-800 font-semibold bg-transparent outline-none cursor-pointer pr-4 appearance-none"
        >
          <option value="all">{language === 'am' ? 'ሁሉም መዳረሻዎች' : 'All Destinations'}</option>
          <option value="zege-peninsula">Zege Peninsula</option>
          <option value="ura-kidane-mehret">Ura Kidane Mehret</option>
          <option value="kibran-gebriel">Kibran Gebriel</option>
          <option value="tana-qirqos">Tana Qirqos</option>
          <option value="blue-nile-falls">Blue Nile Falls</option>
          <option value="bahir-dar">Bahir Dar Waterfront</option>
        </select>
        <svg
          className="w-4 h-4 text-neutral-500 pointer-events-none -ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Divider */}
      <div className="hidden md:block h-7 w-[1px] bg-neutral-200" aria-hidden="true" />

      {/* 3. Date */}
      <div className="flex items-center px-4 py-2 flex-shrink-0">
        <svg
          className="w-4 h-4 text-neutral-600 mr-2 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-xs sm:text-sm text-neutral-800 font-semibold bg-transparent outline-none cursor-pointer"
        />
      </div>

      {/* 4. Explore Button */}
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#173829] hover:bg-[#10271c] text-white font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95 whitespace-nowrap"
      >
        <span>{language === 'am' ? 'ጣናን ያስሱ' : 'Explore Lake Tana'}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </form>
  )
}
