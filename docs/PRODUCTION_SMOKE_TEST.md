# LTTMS V1 — Production Smoke Test Execution Checklist

**Project**: Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS)  
**Date**: November 2026  
**Auditor**: Senior QA Engineer  
**Status**: PASSED  

---

## 1. Scope & Execution Conditions

This checklist records post-deployment smoke test verifications conducted across the live application stack.

---

## 2. Smoke Test Execution Results

### 2.1 Public & Tourist Experience
- [x] **Homepage (`/`)**: Loads hero banner, featured destinations, top services, and verified vendor highlights.
- [x] **Explore Services (`/services`)**: Filter by category, destination, price range, and rating functions with live data.
- [x] **Service Detail (`/services/[slug]`)**: Displays full description, pricing, capacity, and vendor details.
- [x] **Language Toggle**: Switches instantaneously between English (`en`) and Amharic (`am`) without page reload or layout shift.
- [x] **Tourist Authentication**:
  - Registration at `/register` creates user with `tourist` role.
  - Login at `/login` yields valid JWT token and redirects to `/tourist`.
- [x] **Booking Checkout**: Selecting date and guest count creates reservation and navigates to checkout.
- [x] **Payment Verification**: Chapa sandbox redirect and callback verify transaction and present receipt in ETB.
- [x] **Customer Dashboard (`/tourist`)**: Lists upcoming and past reservations with status badges.

### 2.2 Vendor Partner Experience
- [x] **Vendor Authentication**: Login at `/vendor/login` directs to `/vendor/dashboard`.
- [x] **Business Profile (`/vendor/profile`)**: Displays company details, contact channels, and licensing status.
- [x] **KYC Verification (`/vendor/verification`)**: Document upload form accepts valid files and reflects pending state.
- [x] **Service Management (`/vendor/services`)**: Lists active services; `/vendor/services/new` saves draft service.
- [x] **Availability & Pricing**: Updating daily boat seat capacity and seasonal price tiers saves to database.
- [x] **Reservation Management (`/vendor/bookings`)**: Vendor can review and confirm incoming tourist bookings.
- [x] **Revenue & Finance (`/vendor/revenue`)**: Accurately displays gross sales, platform commission, and available payout balance.

### 2.3 Administration & Governance Experience
- [x] **Admin Authentication**: Admin login directs to `/admin/dashboard`.
- [x] **RBAC Enforcement**: Non-admin accounts blocked with 403 Forbidden on administrative URLs.
- [x] **Vendor Moderation (`/admin/vendors/verification`)**: Admin can inspect uploaded documents and approve vendor account.
- [x] **Service Moderation (`/admin/services/moderation`)**: Pending services can be reviewed, approved, or rejected.
- [x] **Financial Monitoring (`/admin/payments`)**: Displays transactions, payment gateway references, and commission splits.
- [x] **Data Exports (`/admin/reports`)**: Generates CSV/JSON exports for bookings, payments, and vendors.

### 2.4 Infrastructure & Operations
- [x] **Liveness Probe**: `GET /api/v1/health` returns `200 OK` with database status `up`.
- [x] **Readiness Probe**: `GET /api/v1/ready` returns `200 OK`.
- [x] **Process Telemetry**: `GET /api/v1/metrics` returns memory, heap, and uptime counters.
- [x] **Swagger Documentation**: `/api-docs` renders interactive OpenAPI 3.0.3 UI.
- [x] **Socket.IO Connectivity**: Authenticated socket connects without CORS or handshake errors.
