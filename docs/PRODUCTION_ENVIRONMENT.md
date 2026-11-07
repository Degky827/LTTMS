# LTTMS V1 — Production Environment Configuration Guide

**Project**: Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS)  
**Date**: November 2026  
**Auditor**: Senior DevOps & Infrastructure Engineer  
**Status**: COMPLETE / VERIFIED  

---

## 1. Executive Summary

This document specifies all environment variables required to run the LTTMS application across development, staging, Docker Compose, and production environments (Render, AWS, DigitalOcean, or Bare-Metal Linux).

**Security Notice**: Real production credentials, secret keys, and database passwords must NEVER be committed to Git. Store them in secure platform environment secret stores (e.g. Render Dashboard, AWS Secrets Manager, GitHub Secrets).

---

## 2. Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `NODE_ENV` | **Yes** | `production` | Set to `production` in live environments to disable verbose stack traces and enable production optimizations. |
| `PORT` | **Yes** | `5000` | HTTP listening port for the Express application. |
| `TRUST_PROXY` | Optional | `1` | Number of reverse proxy hops (Nginx, Render, Cloudflare). Set to `1` when deployed behind a proxy. |
| `MONGODB_URI` | **Yes** | `mongodb://...` | Full MongoDB connection string (e.g. MongoDB Atlas replica set or Docker container `mongodb://mongodb:27017/lttms`). |
| `JWT_SECRET` | **Yes** | 64-char random hex string | Cryptographic secret used to sign and verify HMAC-SHA256 access tokens. |
| `JWT_REFRESH_SECRET` | **Yes** | 64-char random hex string | Cryptographic secret used to sign and verify refresh tokens. |
| `JWT_EXPIRES_IN` | Optional | `15m` | Lifespan of access tokens. Recommended: `15m` or `1h`. |
| `JWT_REFRESH_EXPIRES_IN` | Optional | `30d` | Lifespan of refresh tokens. Recommended: `7d` to `30d`. |
| `ALLOWED_ORIGINS` / `FRONTEND_ORIGIN` | **Yes** | `https://lttms.onrender.com,https://yourdomain.com` | Comma-separated list of permitted web origins for CORS and Socket.IO handshakes. |
| `CHAPA_SECRET_KEY` | **Yes** | `CHASECK_TEST-...` (dev) / `CHASECK_LIVE-...` (prod) | Chapa payment gateway secret API key for checkout initialization and transaction verification. |
| `CHAPA_API_URL` | Optional | `https://api.chapa.co/v1` | Base URL for Chapa REST API. |
| `CHAPA_CALLBACK_URL` | **Yes** | `https://api.yourdomain.com/api/v1/payments/verify` | URL where Chapa redirects user after checkout completion. |
| `CHAPA_WEBHOOK_SECRET` | Optional | Secret string | Secret used to verify Chapa asynchronous webhook signature headers. |
| `SMTP_HOST` | Optional | `smtp.gmail.com` / `smtp.sendgrid.net` | Outgoing SMTP email host for password reset and notifications. |
| `SMTP_PORT` | Optional | `587` | Outgoing SMTP port (587 for TLS, 465 for SSL). |
| `SMTP_SECURE` | Optional | `false` | `true` if port 465; `false` if port 587 with STARTTLS. |
| `SMTP_USER` | Optional | `username@domain.com` | SMTP authentication username. |
| `SMTP_PASS` | Optional | Application password | SMTP authentication password. |
| `SMTP_FROM` | Optional | `"Lake Tana Tourism" <noreply@laketana.com>` | Default "From" address on outgoing notification emails. |
| `LOG_LEVEL` | Optional | `info` | Pino logging level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`). |

---

## 3. Frontend Environment Variables (`frontend/.env.local`)

| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://api.yourdomain.com/api/v1` | Publicly reachable base URL for the backend Express REST API. Exposed to client browser. |
| `NEXT_PUBLIC_SOCKET_URL` | **Yes** | `https://api.yourdomain.com` | Publicly reachable root URL for the backend Socket.IO connection. Exposed to client browser. |
| `NEXT_STANDALONE` | Optional | `1` | When set to `1`, generates an optimized standalone Node server bundle inside `.next/standalone`. |

---

## 4. Production Checklist

1. Verify `NODE_ENV=production` on both frontend and backend.
2. Confirm `JWT_SECRET` is generated via a cryptographically secure random source (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. Ensure `ALLOWED_ORIGINS` matches the exact frontend domain(s) including protocol (`https://`).
4. Ensure `CHAPA_CALLBACK_URL` is accessible by external users over public HTTPS.
5. Verify MongoDB is configured with replica set clustering and automated persistent backups.
