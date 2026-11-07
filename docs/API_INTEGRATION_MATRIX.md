# LTTMS V1 — API Integration Matrix

**Project**: Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS)  
**Specification Version**: OpenAPI 3.0.3 / Express Modular Monolith  
**Status**: COMPLETE  

This matrix details the mapping between frontend application routes, user interactions, and authoritative backend Express REST API endpoints across all three marketplace portals.

---

## 1. Public & Tourist Portal Integration

| Portal | Feature | Frontend Route | Backend Endpoint | Method | Authentication | Permission | Integration Status |
|---|---|---|---|---|---|---|---|
| Tourist | User Registration | `/register` | `/api/v1/auth/register` | `POST` | Public | None | **Complete** |
| Tourist | User Login | `/login` | `/api/v1/auth/login` | `POST` | Public | None | **Complete** |
| Tourist | User Logout | Public Nav / Layout | `/api/v1/auth/logout` | `POST` | Required | Any authenticated | **Complete** |
| Tourist | Current Profile | `/tourist/profile` | `/api/v1/auth/me` | `GET` | Required | `tourist`, `vendor`, `admin` | **Complete** |
| Tourist | Update Profile | `/tourist/profile` | `/api/v1/auth/profile` | `PUT` | Required | Current User | **Complete** |
| Tourist | Password Reset Request | `/forgot-password` | `/api/v1/auth/forgot-password` | `POST` | Public | None | **Complete** |
| Tourist | Password Reset Confirm | `/reset-password/[token]` | `/api/v1/auth/reset-password/:token` | `POST` | Public | None | **Complete** |
| Tourist | Browse Destinations | `/destinations` | `/api/v1/destinations` | `GET` | Public | None | **Complete** |
| Tourist | Destination Details | `/destinations/[slug]` | `/api/v1/destinations/:id` | `GET` | Public | None | **Complete** |
| Tourist | Explore Services | `/services` | `/api/v1/services` | `GET` | Public | None | **Complete** |
| Tourist | Service Details | `/services/[slug]` | `/api/v1/services/:id` | `GET` | Public | None | **Complete** |
| Tourist | Service Availability | `/services/[slug]` | `/api/v1/services/:id/availability` | `GET` | Public | None | **Complete** |
| Tourist | Create Booking | `/booking/[id]` | `/api/v1/bookings` | `POST` | Required | `tourist` | **Complete** |
| Tourist | Booking Details | `/tourist/bookings/[id]` | `/api/v1/bookings/:id` | `GET` | Required | Booking Owner / Admin | **Complete** |
| Tourist | Booking History | `/tourist/bookings` | `/api/v1/bookings` | `GET` | Required | `tourist` | **Complete** |
| Tourist | Cancel Booking | `/tourist/bookings/[id]` | `/api/v1/bookings/:id/cancel` | `POST` | Required | Booking Owner | **Complete** |
| Tourist | Initialize Payment | `/checkout/[id]` | `/api/v1/payments/initialize` | `POST` | Required | Booking Owner | **Complete** |
| Tourist | Verify Payment Status | `/booking/payment-status` | `/api/v1/payments/verify/:reference` | `GET` | Required | Booking Owner | **Complete** |
| Tourist | Submit Review | `/tourist/reviews` | `/api/v1/reviews` | `POST` | Required | Verified Guest | **Complete** |
| Tourist | List Notifications | `/tourist/notifications` | `/api/v1/notifications` | `GET` | Required | Current User | **Complete** |
| Tourist | Mark Notification Read | `/tourist/notifications` | `/api/v1/notifications/:id/read` | `PATCH` | Required | Notification Recipient | **Complete** |

---

## 2. Vendor Partner Portal Integration

| Portal | Feature | Frontend Route | Backend Endpoint | Method | Authentication | Permission | Integration Status |
|---|---|---|---|---|---|---|---|
| Vendor | Vendor Registration | `/vendor/register` | `/api/v1/auth/register` (role: vendor) | `POST` | Public | None | **Complete** |
| Vendor | Vendor Login | `/vendor/login` | `/api/v1/auth/login` | `POST` | Public | None | **Complete** |
| Vendor | Dashboard Metrics | `/vendor/dashboard` | `/api/v1/vendor/bookings/statistics` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Business Profile | `/vendor/profile` | `/api/v1/vendors/profile/me` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Update Profile | `/vendor/profile` | `/api/v1/vendors/profile/me` | `PATCH` | Required | `vendor` | **Complete** |
| Vendor | Upload KYC Document | `/vendor/verification` | `/api/v1/vendors/verification/documents` | `POST` | Required | `vendor` | **Complete** |
| Vendor | Verification Status | `/vendor/verification` | `/api/v1/vendors/verification/status` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Submit Verification | `/vendor/verification` | `/api/v1/vendors/verification/submit` | `POST` | Required | `vendor` | **Complete** |
| Vendor | Service Directory | `/vendor/services` | `/api/v1/services?vendor=me` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Create Service | `/vendor/services/new` | `/api/v1/services` | `POST` | Required | Approved `vendor` | **Complete** |
| Vendor | Edit Service | `/vendor/services/[id]/edit` | `/api/v1/services/:id` | `PATCH` | Required | Service Owner (`vendor`) | **Complete** |
| Vendor | Configure Pricing | `/vendor/pricing` | `/api/v1/services/:id/pricing` | `PUT` | Required | Service Owner (`vendor`) | **Complete** |
| Vendor | Manage Availability | `/vendor/availability` | `/api/v1/services/:id/availability` | `PUT` | Required | Service Owner (`vendor`) | **Complete** |
| Vendor | List Reservations | `/vendor/bookings` | `/api/v1/vendor/bookings` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Reservation Details | `/vendor/bookings/[id]` | `/api/v1/vendor/bookings/:id` | `GET` | Required | Service Vendor | **Complete** |
| Vendor | Confirm Reservation | `/vendor/bookings/[id]` | `/api/v1/vendor/bookings/:id/confirm` | `PATCH` | Required | Service Vendor | **Complete** |
| Vendor | Reject Reservation | `/vendor/bookings/[id]` | `/api/v1/vendor/bookings/:id/reject` | `PATCH` | Required | Service Vendor | **Complete** |
| Vendor | Financial Overview | `/vendor/revenue` | `/api/v1/vendor/finance/overview` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Transaction History | `/vendor/revenue` | `/api/v1/vendor/finance/transactions` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Customer Reviews | `/vendor/reviews` | `/api/v1/reviews?vendorId=me` | `GET` | Required | `vendor` | **Complete** |
| Vendor | Reply to Review | `/vendor/reviews` | `/api/v1/reviews/:id/respond` | `POST` | Required | Service Vendor | **Complete** |
| Vendor | Apply Eco-Badge | `/vendor/eco-badge` | `/api/v1/eco-badges/applications` | `POST` | Required | `vendor` | **Complete** |
| Vendor | Support Tickets | `/vendor/support` | `/api/v1/support/tickets` | `GET` | Required | `vendor` | **Complete** |

---

## 3. Administration & Platform Portal Integration

| Portal | Feature | Frontend Route | Backend Endpoint | Method | Authentication | Permission | Integration Status |
|---|---|---|---|---|---|---|---|
| Admin | Admin Overview | `/admin/dashboard` | `/api/v1/admin/dashboard/overview` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Platform Statistics | `/admin/analytics` | `/api/v1/admin/stats` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Tourist Directory | `/admin/tourists` | `/api/v1/admin/users?role=tourist` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Tourist Details | `/admin/tourists/[id]` | `/api/v1/admin/users/:id` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Vendor Directory | `/admin/vendors` | `/api/v1/admin/vendors` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Vendor KYC Approval | `/admin/vendors/verification` | `/api/v1/vendors/:id/approve` | `PATCH` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Vendor Suspension | `/admin/vendors/[id]` | `/api/v1/vendors/:id/suspend` | `PATCH` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Service Moderation | `/admin/services/moderation` | `/api/v1/services?status=pending` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Service Approval | `/admin/services/[id]` | `/api/v1/services/:id/approve` | `PATCH` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Booking Monitoring | `/admin/bookings` | `/api/v1/admin/bookings` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Booking Details | `/admin/bookings/[id]` | `/api/v1/admin/bookings/:id` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Payment Monitoring | `/admin/payments` | `/api/v1/admin/finance/payments` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Refund Review | `/admin/refunds/[id]` | `/api/v1/admin/refunds/:id` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Refund Processing | `/admin/refunds/[id]` | `/api/v1/admin/finance/refunds/:id/process` | `POST` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Commission Rules | `/admin/commissions/configuration` | `/api/v1/admin/finance/commission-rules` | `GET` / `POST` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Review Moderation | `/admin/reviews` | `/api/v1/admin/reviews` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Support Ticket Management | `/admin/support` | `/api/v1/admin/support/tickets` | `GET` | Required | `admin`, `support` | **Complete** |
| Admin | Audit Logs | `/admin/audit-logs` | `/api/v1/admin/audit-logs` | `GET` | Required | `admin`, `super_admin` | **Complete** |
| Admin | Roles & Permissions | `/admin/roles` | `/api/v1/admin/users/:id/role` | `PATCH` | Required | `super_admin` only | **Complete** |
| Admin | Data Exports (CSV/JSON) | `/admin/reports` | `/api/v1/admin/exports/:entity` | `GET` | Required | `admin`, `super_admin` | **Complete** |
