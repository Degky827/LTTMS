import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'en' | 'am'

interface LanguageContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

let translations: Record<string, any> = { en: {}, am: {} }

async function loadTranslations() {
  const [en, am] = await Promise.all([
    import('../locales/en.json').then(m => m.default || m),
    import('../locales/am.json').then(m => m.default || m),
  ])
  translations = { en, am }
}

function getNested(obj: any, path: string): string {
  const keys = path.split('.')
  let current = obj
  for (const key of keys) {
    if (current == null) return path
    current = current[key]
  }
  return typeof current === 'string' ? current : path
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    loadTranslations().then(() => setLoaded(true))
  }, [])

  const t = (key: string) => {
    if (!loaded) return key
    return getNested(translations[lang], key)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
