import { Service } from '@/features/services/types'

const STORAGE_KEY = 'lttms_tourist_saved_experiences'

export const wishlistStorage = {
  getSaved(): Service[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  isSaved(id: string): boolean {
    if (typeof window === 'undefined') return false
    const list = this.getSaved()
    return list.some((item) => item._id === id || (item as any).id === id)
  },

  toggle(service: Service): boolean {
    if (typeof window === 'undefined') return false
    const current = this.getSaved()
    const targetId = service._id || (service as any).id
    const index = current.findIndex((item) => item._id === targetId || (item as any).id === targetId)

    let updated: Service[]
    let nowSaved: boolean
    if (index >= 0) {
      updated = current.filter((_, i) => i !== index)
      nowSaved = false
    } else {
      updated = [service, ...current]
      nowSaved = true
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('lttms_saved_updated'))
    } catch (e) {
      console.warn('Failed to persist wishlist:', e)
    }

    return nowSaved
  },

  remove(id: string): void {
    if (typeof window === 'undefined') return
    const current = this.getSaved()
    const updated = current.filter((item) => item._id !== id && (item as any).id !== id)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      window.dispatchEvent(new Event('lttms_saved_updated'))
    } catch (e) {
      console.warn('Failed to remove from wishlist:', e)
    }
  },
}
