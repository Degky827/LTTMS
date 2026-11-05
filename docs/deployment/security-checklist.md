# Production Security Checklist — LTTMS V1

Comprehensive security verification matrix for production deployments of the LTTMS backend.

---

## 1. Network & Container Security

- [x] **No Public Database Exposure**: MongoDB port `27017` is NOT exposed to public interfaces (`0.0.0.0`). It is accessible only over the internal Docker network (`lttms-net`).
- [x] **Non-Root Execution**: Backend container runs as unprivileged user `node` (`USER node`, UID 1000).
- [x] **Clean Build Context**: `.dockerignore` excludes `.env`, `.git`, `tests`, and credentials from Docker images.
- [x] **Process Signal Handling**: Tini (`/sbin/tini --`) runs as PID 1, handling `SIGTERM` and `SIGINT` signals for graceful shutdown.
- [x] **Resource Limits**: Docker Compose production profile configures CPU and memory limits to prevent "noisy neighbor" starvation and denial of service.

---

## 2. HTTP & API Gateway Security

- [x] **Secure Headers (Helmet)**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - Strict Content-Security-Policy (CSP) with tailored exceptions for Swagger UI assets.
  - Removal of `X-Powered-By` Express identification header.
- [x] **Reverse Proxy Trust (`trust proxy`)**:
  - Express is configured with `app.set('trust proxy', 1)` to accurately extract client IP addresses through Nginx or Cloudflare for rate limiting.
- [x] **CORS Configuration**:
  - Explicit allowed origins whitelist via `FRONTEND_ORIGIN`. Wildcard `*` with credentials is strictly disallowed.
- [x] **Rate Limiting**:
  - `publicLimiter`: 120 requests/minute per IP across general API routes.
  - `authLimiter`: 20 requests/15 minutes per IP on authentication routes (`/auth/login`, `/auth/register`, `/auth/forgot-password`).
  - Webhooks and health checks bypass rate limiters to avoid service disruptions.

---

## 3. Data Protection & Application Defense

- [x] **NoSQL Injection Defense**: Strict Mongoose schema typing and sanitized query utilities reject arbitrary object injection in query filters.
- [x] **CSV Formula Injection (DDE)**: Cell values exported to spreadsheets are sanitized in [csvExportUtil.js](file:///c:/Users/abrha/OneDrive/Documents/GitHub/LTTMS/backend/utils/csvExportUtil.js) by prefixing leading `=`, `+`, `-`, `@`, `\t`, `\r` with single quotes `'`.
- [x] **IDOR Defenses**: Resource ownership is validated on bookings, tickets, and reviews (`booking.user.toString() === req.user.id || isAdmin`).
- [x] **Sensitive Auth Fields Omission**: Responses from `/auth/me` and `/users/profile` sanitize `password`, `passwordHash`, `twoFactorSecret`, and `resetPasswordToken`.
- [x] **Support Ticket Privacy**: Internal staff notes (`internalNotes`) are strictly excluded from non-staff client responses.
- [x] **Payload Size Limits**: JSON request bodies are capped at 100KB; image uploads are capped at 5MB via Multer.

---

## 4. Payment Security (Chapa Gateway)

- [x] **Server-to-Server Verification**: Payments are verified directly with Chapa API (`GET https://api.chapa.co/v1/transaction/verify/{txRef}`) rather than trusting frontend callback parameters.
- [x] **HMAC-SHA256 Webhook Signatures**: Incoming webhooks are validated using `crypto.createHmac('sha256', secret)` against `x-chapa-signature`.
- [x] **Idempotency**: Duplicate payment notifications and callbacks are deduplicated to prevent double-crediting bookings.
- [x] **Zero Secret Leakage**: `CHAPA_SECRET_KEY` and `CHAPA_WEBHOOK_SECRET` are never returned in API responses or logged in console logs.
