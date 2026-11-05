import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'en' | 'am' | 'fr'

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
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
]

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

let cachedTranslations: Record<Language, any> = {
  en: {},
  am: {},
  fr: {},
}

async function loadTranslations(lang: Language) {
  if (Object.keys(cachedTranslations[lang]).length > 0) {
    return cachedTranslations[lang]
  }

  try {
    const data = await import(`../../locales/${lang}.json`).then((m) => m.default || m)
    cachedTranslations[lang] = data
    return data
  } catch (err) {
    console.warn(`[i18n] Failed to load translations for ${lang}`, err)
    return {}
  }
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
    const initialLang: Language = saved && ['en', 'am', 'fr'].includes(saved) ? saved : 'en'

    setLanguageState(initialLang)
    document.documentElement.lang = initialLang

    if (initialLang === 'am') {
      document.body.classList.add('font-ethiopic')
    } else {
      document.body.classList.remove('font-ethiopic')
    }

    Promise.all([
      loadTranslations('en'),
      loadTranslations(initialLang),
    ])
  }, [])

  const setLanguage = async (newLang: Language) => {
    await loadTranslations(newLang)
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
    // Try current language
    const currentTranslation = getNestedTranslation(cachedTranslations[language], key)
    if (currentTranslation) return currentTranslation

    // Fallback to English
    const englishTranslation = getNestedTranslation(cachedTranslations.en, key)
    if (englishTranslation) return englishTranslation

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
