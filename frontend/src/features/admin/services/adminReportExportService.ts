import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { apiClient } from '@/lib/api/client'

export const adminReportExportService = {
  getExportUrl: (type: string) => {
    const base = apiClient.getBaseURL()
    switch (type) {
      case 'bookings':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_BOOKINGS}`
      case 'payments':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_PAYMENTS}`
      case 'commissions':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_COMMISSIONS}`
      case 'refunds':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_REFUNDS}`
      case 'settlements':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_SETTLEMENTS}`
      case 'vendors':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_VENDORS}`
      case 'reviews':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_REVIEWS}`
      case 'support':
        return `${base}${API_ENDPOINTS.ADMIN.EXPORTS_SUPPORT}`
      default:
        return `${base}${API_ENDPOINTS.ADMIN.BOOKING_REPORTS}`
    }
  },

  downloadCsv: async (type: string, filename?: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const url = adminReportExportService.getExportUrl(type)
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) throw new Error(`Export failed with status ${res.status}`)

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename || `lttms_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  },
}
