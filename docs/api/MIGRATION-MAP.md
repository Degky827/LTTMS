/**
 * LTTMS v2 — Frontend API Path Mapping
 *
 * The API Gateway routes requests as follows:
 *
 * OLD PATH (v1 monolith)          →  NEW PATH (v2 gateway)           →  TARGET SERVICE
 * ─────────────────────────────────────────────────────────────────────────────────────
 * POST /api/auth/register          →  POST /api/v1/auth/register      →  auth-service
 * POST /api/auth/login             →  POST /api/v1/auth/login         →  auth-service
 * GET  /api/auth/me                →  GET  /api/v1/auth/me            →  auth-service
 * POST /api/auth/refresh           →  POST /api/v1/auth/refresh       →  auth-service
 * POST /api/auth/logout            →  POST /api/v1/auth/logout        →  auth-service
 * POST /api/auth/forgot-password   →  POST /api/v1/auth/forgot-password → auth-service
 * POST /api/auth/reset-password    →  POST /api/v1/auth/reset-password → auth-service
 * GET  /api/auth/verify-email/:t   →  GET  /api/v1/auth/verify-email/:t → auth-service
 * POST /api/auth/enable-2fa        →  POST /api/v1/auth/enable-2fa    →  auth-service
 * POST /api/auth/verify-2fa        →  POST /api/v1/auth/verify-2fa    →  auth-service
 * POST /api/auth/disable-2fa       →  POST /api/v1/auth/disable-2fa   →  auth-service
 * POST /api/auth/change-password   →  POST /api/v1/auth/change-password → auth-service
 *
 * GET  /api/services               →  GET  /api/v1/tourism/services   →  tourism-service
 * GET  /api/services/:id           →  GET  /api/v1/tourism/services/:id → tourism-service
 * POST /api/services               →  POST /api/v1/tourism/services   →  tourism-service
 * PUT  /api/services/:id           →  PUT  /api/v1/tourism/services/:id → tourism-service
 * DELETE /api/services/:id         →  DELETE /api/v1/tourism/services/:id → tourism-service
 *
 * GET  /api/vendors                →  GET  /api/v1/tourism/vendors    →  tourism-service
 * GET  /api/vendors/:id            →  GET  /api/v1/tourism/vendors/:id → tourism-service
 * POST /api/vendors                →  POST /api/v1/tourism/vendors    →  tourism-service
 * PUT  /api/vendors/:id            →  PUT  /api/v1/tourism/vendors/:id → tourism-service
 *
 * GET  /api/reviews                →  GET  /api/v1/tourism/reviews    →  tourism-service
 * POST /api/reviews                →  POST /api/v1/tourism/reviews    →  tourism-service
 * DELETE /api/reviews/:id          →  DELETE /api/v1/tourism/reviews/:id → tourism-service
 *
 * GET  /api/bookings               →  GET  /api/v1/bookings           →  booking-payment-service
 * GET  /api/bookings/user          →  GET  /api/v1/bookings/user      →  booking-payment-service
 * POST /api/bookings               →  POST /api/v1/bookings           →  booking-payment-service
 * PUT  /api/bookings/:id           →  PUT  /api/v1/bookings/:id       →  booking-payment-service
 *
 * POST /api/payments/checkout      →  POST /api/v1/payments/checkout  →  booking-payment-service
 * GET  /api/payments/verify        →  GET  /api/v1/payments/verify    →  booking-payment-service
 * POST /api/payments/webhook       →  POST /api/v1/payments/webhook   →  booking-payment-service
 * GET  /api/payments/status/:id    →  GET  /api/v1/payments/status/:id → booking-payment-service
 *
 * GET  /api/admin/*                →  GET  /api/v1/admin/*            →  (aggregated)
 * PUT  /api/admin/*                →  PUT  /api/v1/admin/*            →  (aggregated)
 *
 * GET  /api/messages               →  GET  /api/v1/notifications      →  notification-service
 * POST /api/messages               →  POST /api/v1/notifications      →  notification-service
 */
