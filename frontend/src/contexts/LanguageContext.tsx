import React, { createContext, useContext, useState, useEffect } from 'react'
import enTranslations from '../../locales/en.json'
import amTranslations from '../../locales/am.json'

export type Language = 'en' | 'am'

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, fallback?: string) => string
  languages: { code: Language; name: string; nativeName: string; flag: string }[]
}

const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
]

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const cachedTranslations: Record<Language, any> = {
  en: enTranslations,
  am: amTranslations,
}

function getNestedTranslation(obj: any, path: string): string | null {
  if (!obj) return null
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null) return null
    current = current[key]
  }
  return typeof current === 'string' ? current : null
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lttms_lang') as Language | null
    const initialLang: Language = saved && ['en', 'am'].includes(saved) ? saved : 'en'

    setLanguageState(initialLang)
    document.documentElement.lang = initialLang

    if (initialLang === 'am') {
      document.body.classList.add('font-ethiopic')
    } else {
      document.body.classList.remove('font-ethiopic')
    }
  }, [])

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang)
    localStorage.setItem('lttms_lang', newLang)
    document.documentElement.lang = newLang

    if (newLang === 'am') {
      document.body.classList.add('font-ethiopic')
    } else {
      document.body.classList.remove('font-ethiopic')
    }
  }

  const t = (key: string, fallback?: string): string => {
    // 1. Try currently selected language
    const currentTranslation = getNestedTranslation(cachedTranslations[language], key)
    if (currentTranslation) return currentTranslation

    // 2. Fallback to English dictionary
    const englishTranslation = getNestedTranslation(cachedTranslations.en, key)
    if (englishTranslation) return englishTranslation

    // 3. Fallback to provided string or key
    return fallback || key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        lang: language,
        setLang: setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
