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
    APPROVE: (id: string) => `/services/${id}/approve`,
    REJECT: (id: string) => `/services/${id}/reject`,
    FEATURE: (id: string) => `/services/${id}/feature`,
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
    // Dashboard & Stats
    OVERVIEW: '/admin/dashboard/overview',
    STATS: '/admin/stats',
    BOOKINGS_ANALYSIS: '/admin/dashboard/bookings',
    REVENUE_ANALYSIS: '/admin/dashboard/revenue',
    VENDORS_ANALYSIS: '/admin/dashboard/vendors',
    TOURISTS_ANALYSIS: '/admin/dashboard/tourists',
    SERVICES_ANALYSIS: '/admin/dashboard/services',
    REVIEWS_ANALYSIS: '/admin/dashboard/reviews',
    REFUNDS_ANALYSIS: '/admin/dashboard/refunds',
    SUPPORT_ANALYSIS: '/admin/dashboard/support',
    RECENT_ACTIVITY: '/admin/dashboard/recent-activity',

    // Users
    USERS: '/admin/users',
    USER_BY_ID: (id: string) => `/admin/users/${id}`,
    UPDATE_USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    UPDATE_USER_ROLE: (id: string) => `/admin/users/${id}/role`,

    // Vendors
    VENDORS: '/admin/vendors',
    VENDOR_BY_ID: (id: string) => `/admin/vendors/${id}`,
    UPDATE_VENDOR_STATUS: (id: string) => `/admin/vendors/${id}/status`,
    UPDATE_VENDOR_ECO_BADGE: (id: string) => `/admin/vendors/${id}/eco-badge`,

    // Bookings
    BOOKINGS: '/admin/bookings',
    BOOKING_BY_ID: (id: string) => `/admin/bookings/${id}`,
    BOOKING_CANCEL: (id: string) => `/admin/bookings/${id}/cancel`,
    BOOKING_STATUS: (id: string) => `/admin/bookings/${id}/status`,
    BOOKING_OVERRIDE: (id: string) => `/admin/bookings/${id}/override`,
    BOOKING_STATISTICS: '/admin/bookings/statistics',
    BOOKING_REPORTS: '/admin/reports/bookings',

    // Finance & Settlements
    FINANCE_OVERVIEW: '/admin/finance/overview',
    PAYMENTS: '/admin/finance/payments',
    COMMISSIONS: '/admin/finance/commissions',
    COMMISSION_RULES: '/admin/finance/commission-rules',
    COMMISSION_RULE_BY_ID: (id: string) => `/admin/finance/commission-rules/${id}`,
    SETTLEMENTS: '/admin/finance/settlements',
    SETTLEMENT_REVIEW: (id: string) => `/admin/finance/settlements/${id}/review`,
    SETTLEMENT_COMPLETE: (id: string) => `/admin/finance/settlements/${id}/complete`,

    // Refunds
    REFUNDS: '/admin/refunds',
    REFUND_BY_ID: (id: string) => `/admin/refunds/${id}`,
    REFUND_APPROVE: (id: string) => `/admin/refunds/${id}/approve`,
    REFUND_REJECT: (id: string) => `/admin/refunds/${id}/reject`,
    REFUND_RETRY: (id: string) => `/admin/refunds/${id}/retry`,
    REFUND_PROCESS: (id: string) => `/admin/finance/refunds/${id}/process`,

    // Reviews & Complaints
    REVIEWS: '/admin/reviews',
    REVIEW_MODERATE: (id: string) => `/admin/reviews/${id}/moderate`,
    REVIEW_REPORTS: (id: string) => `/admin/reviews/${id}/reports`,
    REVIEW_DELETE: (id: string) => `/admin/reviews/${id}`,

    // Support
    SUPPORT_TICKETS: '/admin/support/tickets',
    SUPPORT_TICKET_BY_ID: (id: string) => `/admin/support/tickets/${id}`,
    SUPPORT_ASSIGN: (id: string) => `/admin/support/tickets/${id}/assign`,
    SUPPORT_STATUS: (id: string) => `/admin/support/tickets/${id}/status`,
    SUPPORT_PRIORITY: (id: string) => `/admin/support/tickets/${id}/priority`,
    SUPPORT_REPLY: (id: string) => `/admin/support/tickets/${id}/reply`,
    SUPPORT_INTERNAL_NOTES: (id: string) => `/admin/support/tickets/${id}/internal-notes`,

    // Eco-Badges
    ECO_BADGE_APPLICATIONS: '/eco-badges/applications',
    ECO_BADGE_APPROVE: (id: string) => `/eco-badges/applications/${id}/approve`,
    ECO_BADGE_REJECT: (id: string) => `/eco-badges/applications/${id}/reject`,
    ECO_COMPLIANCE: '/admin/eco-compliance',

    // Exports
    EXPORTS_BOOKINGS: '/admin/exports/bookings',
    EXPORTS_PAYMENTS: '/admin/exports/payments',
    EXPORTS_COMMISSIONS: '/admin/exports/commissions',
    EXPORTS_REFUNDS: '/admin/exports/refunds',
    EXPORTS_SETTLEMENTS: '/admin/exports/settlements',
    EXPORTS_VENDORS: '/admin/exports/vendors',
    EXPORTS_REVIEWS: '/admin/exports/reviews',
    EXPORTS_SUPPORT: '/admin/exports/support-tickets',

    // Audit & Announcements
    AUDIT_LOGS: '/admin/audit-logs',
    ANNOUNCEMENTS: '/admin/announcements',
  },

  // File Uploads
  UPLOADS: {
    BASE: '/uploads',
    IMAGE: '/uploads/image',
  },
} as const
