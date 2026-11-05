# Environment Variables Reference — LTTMS V1

Complete reference of all environment variables supported by the LTTMS backend.

---

## 1. Core Server Configuration

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `NODE_ENV` | String | `development` | Yes | Runtime environment: `development`, `production`, or `test`. |
| `PORT` | Integer | `5000` | No | HTTP port Express listens on. |
| `TRUST_PROXY` | Integer/Boolean | `false` | Yes (behind proxy) | Number of upstream proxy hops to trust (set `1` for Nginx, Render, or Cloudflare). Ensures accurate client IP for rate limiters. |

---

## 2. Database (MongoDB)

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `MONGODB_URI` | String | `mongodb://localhost:27017/lttms` | Yes | MongoDB connection URI. Supports standalone, Docker (`mongodb://mongodb:27017/lttms`), and authenticated replica sets. |

---

## 3. Authentication & JWT

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `JWT_SECRET` | String | - | **Yes** (>= 32 chars) | Primary secret used to sign access tokens. In production, startup fails if less than 32 characters or default string. |
| `JWT_REFRESH_SECRET` | String | Same as `JWT_SECRET` | Recommended | Secret used to sign long-lived refresh tokens. |
| `JWT_EXPIRES_IN` | String | `15m` | No | Access token expiration duration (e.g. `15m`, `1h`). |
| `JWT_REFRESH_EXPIRES_IN`| String | `30d` | No | Refresh token expiration duration (e.g. `7d`, `30d`). |
| `JWT_ISSUER` | String | `lttms-api` | No | JWT issuer claim (`iss`). |
| `JWT_AUDIENCE` | String | `lttms-client` | No | JWT audience claim (`aud`). |

---

## 4. CORS & Client Origins

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `FRONTEND_ORIGIN` | String | `http://localhost:3000,http://localhost:8080` | Yes | Comma-separated list of allowed browser origins for CORS. Aliases accepted: `FRONTEND_URL`, `CORS_ORIGINS`, `APP_ORIGIN`. |

---

## 5. Chapa Payment Gateway

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `CHAPA_SECRET_KEY` | String | - | Yes | Secret key from Chapa dashboard (`CHASECK_TEST-...` or `CHASECK-...`). |
| `CHAPA_API_URL` | String | `https://api.chapa.co/v1` | No | Chapa API base URL. Alias: `CHAPA_BASE_URL`. |
| `CHAPA_CALLBACK_URL`| String | `http://localhost:5000/api/v1/payments/verify` | Yes | Return URL user browser is redirected to after Chapa checkout. Alias: `CHAPA_RETURN_URL`. |
| `CHAPA_WEBHOOK_SECRET` | String | - | Yes | Secret hash used to verify HMAC-SHA256 signature on incoming webhooks (`x-chapa-signature`). |

---

## 6. SMTP Email Transport

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `SMTP_HOST` | String | `smtp.ethereal.email` | Yes | SMTP server hostname (e.g. `smtp.gmail.com`, `smtp.sendgrid.net`). |
| `SMTP_PORT` | Integer | `587` | No | SMTP port (typically `587` for TLS, `465` for SSL). |
| `SMTP_SECURE` | Boolean | `false` | No | Whether to use SSL/TLS directly (`true` for port 465). |
| `SMTP_USER` | String | - | Yes | SMTP username / API key identifier. |
| `SMTP_PASS` | String | - | Yes | SMTP password / API secret. Alias: `SMTP_PASSWORD`. |
| `SMTP_FROM` | String | `"Lake Tana Eco-Tourism" <noreply@laketana.com>` | No | Default `From:` email address header. |

---

## 7. Logging & Observability

| Variable | Type | Default | Required in Production | Description |
| :--- | :---: | :---: | :---: | :--- |
| `LOG_LEVEL` | String | `info` | No | Minimum logging level: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. In production, `info` or `warn` is recommended. |
