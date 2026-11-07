/**
 * Centralized API Endpoints Map for LTTMS v2
 * Direct mappings to the Express Modular Monolith REST API (/api/v1)
 */
export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
    VERIFY_EMAIL: (token: string) => `/auth/verify-email/${token}`,
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
    SESSIONS: '/auth/sessions',
    REVOKE_SESSION: (sessionId: string) => `/auth/sessions/${sessionId}`,
    TWO_FACTOR_ENABLE: '/auth/2fa/enable',
    TWO_FACTOR_VERIFY: '/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/auth/2fa/disable',
  },

  // Services & Tours
  SERVICES: {
    LIST: '/services',
    GET_BY_ID: (id: string) => `/services/${id}`,
    CREATE: '/services',
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
    AVAILABILITY: (id: string) => `/services/${id}/availability`,
    AVAILABILITY_CALENDAR: (id: string) => `/services/${id}/availability/calendar`,
    PRICING: (id: string) => `/services/${id}/pricing`,
    SUBMIT: (id: string) => `/services/${id}/submit`,
    PUBLISH: (id: string) => `/services/${id}/publish`,
    ARCHIVE: (id: string) => `/services/${id}/archive`,
    IMAGES: (id: string) => `/services/${id}/images`,
    IMAGE_REORDER: (id: string) => `/services/${id}/images/reorder`,
    IMAGE_BY_ID: (id: string, imageId: string) => `/services/${id}/images/${imageId}`,
  },

  // Destinations & Monasteries
  DESTINATIONS: {
    LIST: '/destinations',
    GET_BY_ID: (id: string) => `/destinations/${id}`,
    CREATE: '/destinations',
    UPDATE: (id: string) => `/destinations/${id}`,
    DELETE: (id: string) => `/destinations/${id}`,
  },

  // Categories & Eco-Badges
  CATEGORIES: {
    LIST: '/categories',
    GET_BY_ID: (id: string) => `/categories/${id}`,
  },
  ECO_BADGES: {
    LIST: '/eco-badges',
    GET_BY_ID: (id: string) => `/eco-badges/${id}`,
    VENDOR_BADGES: (vendorId: string) => `/eco-badges/vendor/${vendorId}`,
    APPLY: '/eco-badges/applications',
    APPLICATIONS_ME: '/eco-badges/applications/me',
  },

  // Bookings (Tourist)
  BOOKINGS: {
    LIST: '/bookings',
    GET_BY_ID: (id: string) => `/bookings/${id}`,
    CREATE: '/bookings',
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },

  // Vendor Portal Bookings
  VENDOR_BOOKINGS: {
    LIST: '/vendor/bookings',
    GET_BY_ID: (id: string) => `/vendor/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/vendor/bookings/${id}/status`,
    CONFIRM: (id: string) => `/vendor/bookings/${id}/confirm`,
    REJECT: (id: string) => `/vendor/bookings/${id}/reject`,
    STATISTICS: '/vendor/bookings/statistics',
  },

  // Refund Requests
  REFUNDS: {
    CREATE: '/refund-requests',
    LIST: '/refund-requests',
    VENDOR_LIST: '/vendor/refund-requests',
    REVIEW: (id: string) => `/refund-requests/${id}/review`,
  },

  // Vendors
  VENDORS: {
    LIST: '/vendors',
    GET_BY_ID: (id: string) => `/vendors/${id}`,
    PROFILE: '/vendors/profile',
    PROFILE_ME: '/vendors/profile/me',
    UPDATE_PROFILE: '/vendors/profile/me',
    VERIFICATION_DOCUMENTS: '/vendors/verification/documents',
    VERIFICATION_STATUS: '/vendors/verification/status',
    VERIFICATION_SUBMIT: '/vendors/verification/submit',
  },

  // Reviews & Ratings
  REVIEWS: {
    LIST: '/reviews',
    FOR_SERVICE: (serviceId: string) => `/reviews/service/${serviceId}`,
    GET_BY_ID: (id: string) => `/reviews/${id}`,
    CREATE: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
    RESPOND: (reviewId: string) => `/reviews/${reviewId}/respond`,
    REPORT: (reviewId: string) => `/reviews/${reviewId}/report`,
  },

  // Payments & Payouts (Chapa Integration)
  PAYMENTS: {
    INITIALIZE: '/payments/initialize',
    VERIFY: (reference: string) => `/payments/verify/${reference}`,
    HISTORY: '/payments/history',
  },

  // Finance & Commissions
  FINANCE: {
    VENDOR_OVERVIEW: '/vendor/finance/overview',
    VENDOR_TRANSACTIONS: '/vendor/finance/transactions',
    VENDOR_COMMISSIONS: '/vendor/finance/commissions',
    VENDOR_SETTLEMENTS: '/vendor/finance/settlements',
    VENDOR_PAYOUTS: '/vendor/finance/payouts',
    ADMIN_OVERVIEW: '/admin/finance/overview',
    ADMIN_COMMISSIONS: '/admin/finance/commissions',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    TICKET_BY_ID: (id: string) => `/support/tickets/${id}`,
    CREATE_TICKET: '/support/tickets',
    MESSAGES: (id: string) => `/support/tickets/${id}/messages`,
  },

  // Administration
  ADMIN: {
    USERS: '/admin/users',
    UPDATE_USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
    PENDING_VENDORS: '/admin/vendors/pending',
    APPROVE_VENDOR: (vendorId: string) => `/admin/vendors/${vendorId}/approve`,
    REJECT_VENDOR: (vendorId: string) => `/admin/vendors/${vendorId}/reject`,
    METRICS: '/admin/metrics',
  },

  // File Uploads
  UPLOADS: {
    BASE: '/uploads',
    IMAGE: '/uploads/image',
  },
} as const
