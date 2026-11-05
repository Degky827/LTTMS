# Monitoring, Health Checks & Observability — LTTMS V1

Guide to monitoring, telemetry, log inspection, and health probes for the LTTMS backend.

---

## 1. Health & Readiness Probes

The backend exposes separate liveness and readiness endpoints:

| Endpoint | Probe Type | Purpose | Status Code |
| :--- | :--- | :--- | :---: |
| `GET /health` | Liveness | Verifies Express process is alive and responsive. | `200 OK` |
| `GET /ready` | Readiness | Verifies MongoDB connectivity and application readiness. | `200` (Ready) / `503` (Degraded) |
| `GET /metrics` | Telemetry | Returns process uptime, memory usage, heap, and MongoDB readyState. | `200 OK` |

*Note: All three endpoints are also available under `/api/v1/health`, `/api/v1/ready`, and `/api/v1/metrics`.*

### Example Liveness Probe Response (`/health`):
```json
{
  "success": true,
  "status": "ok",
  "dependencies": {
    "mongodb": "up",
    "socketio": "up"
  },
  "uptime": 142.34,
  "timestamp": "2026-11-04T23:15:00.000Z"
}
```

### Example Readiness Probe Response (`/ready`):
```json
{
  "success": true,
  "status": "ready",
  "dependencies": {
    "database": {
      "status": "up",
      "readyState": 1,
      "stateLabel": "connected",
      "database": "lttms",
      "host": "mongodb"
    }
  },
  "uptime": 142.34,
  "timestamp": "2026-11-04T23:15:00.000Z"
}
```

---

## 2. Structured JSON Logging (Pino)

All HTTP requests and system events are logged in structured JSON format via Pino.

### Log Format
```json
{
  "level": "info",
  "time": "2026-11-04T23:15:02.123Z",
  "pid": 1,
  "hostname": "lttms-backend-prod",
  "req": {
    "id": "e3b0c442-98fc-1c14-9afb-4c7fa15d0823",
    "method": "POST",
    "url": "/api/v1/bookings",
    "remoteAddress": "198.51.100.4"
  },
  "route": "/api/v1/bookings",
  "method": "POST",
  "requestId": "e3b0c442-98fc-1c14-9afb-4c7fa15d0823",
  "res": {
    "statusCode": 201
  },
  "responseTime": 32,
  "msg": "request completed"
}
```

### Sensitive Data Redaction
The logging middleware automatically redacts sensitive headers and payloads:
- `req.headers.authorization`: replaced with `[REDACTED]`.
- `req.headers.cookie`: redacted.
- Sensitive body fields (`password`, `chapa_secret`, `twoFactorSecret`) are never logged.

---

## 3. Log Inspection Commands

```bash
# View live backend logs in Docker Compose
docker compose logs -f backend

# Pretty-print JSON logs using pino-pretty (if installed)
docker compose logs -f backend | npx pino-pretty

# Filter logs for errors and fatal events only
docker compose logs backend | grep '"level":"error"\|"level":"fatal"'

# View Nginx access & error logs
docker compose logs -f nginx
```
