# Docker Architecture & Container Setup — LTTMS V1

This document explains the container architecture, multi-stage Docker build, and Docker Compose orchestration for LTTMS.

---

## 1. Container Architecture

```text
Host / Internet
      │
      ▼ (Port 80 / 443)
┌──────────────────────────────────────────────┐
│                  Nginx                       │
│             (Reverse Proxy)                  │
└──────────────────────┬───────────────────────┘
                       │ http://backend:5000 (Internal Network: lttms-net)
                       ▼
┌──────────────────────────────────────────────┐
│             lttms-backend                    │
│    (Node 20 Alpine, Non-Root User node)      │
│  ├── Express Modular Monolith                │
│  ├── Socket.IO WebSockets                    │
│  └── Uploads Volume (/app/uploads)           │
└──────────────────────┬───────────────────────┘
                       │ mongodb://mongodb:27017 (Internal Network: lttms-net)
                       ▼
┌──────────────────────────────────────────────┐
│              lttms-mongodb                   │
│               (Mongo 7.0)                    │
│         Persistent Volume: mongodb_data      │
└──────────────────────────────────────────────┘
```

---

## 2. Multi-Stage Dockerfile (`backend/Dockerfile`)

The backend container uses a 2-stage build:

1. **Stage 1 (`dependencies`)**:
   - Uses `node:20-alpine`.
   - Runs `npm ci --omit=dev --ignore-scripts` to install strictly production dependencies based on `package-lock.json`.
   - Strips dev dependencies (e.g. `jest`, `supertest`, `nodemon`).
2. **Stage 2 (`runner`)**:
   - Base: `node:20-alpine`.
   - Adds `tini` as init process (`/sbin/tini --`) for proper `SIGTERM` / `SIGINT` signal forwarding and graceful container shutdown.
   - Adds `curl` for container healthcheck execution.
   - Creates `/app/uploads` and chowns it to `node:node` (UID 1000).
   - Switches to unprivileged user: `USER node`.
   - Exposes port `5000`.
   - Healthcheck: runs `curl -f http://localhost:5000/api/v1/health` every 30 seconds.

---

## 3. Persistent Volumes

- **`lttms_mongodb_data`**: Bound to `/data/db` in the MongoDB container. Ensures database records, user profiles, bookings, payments, and audit logs persist across container restarts, image updates, and host reboots.
- **`lttms_backend_uploads`**: Bound to `/app/uploads` in the backend container. Prevents uploaded KYC documents, service photos, and avatars from disappearing during redeployments.

> [!CAUTION]
> Never run `docker compose down -v` against a production environment. The `-v` flag permanently removes named persistent volumes!

---

## 4. Docker Compose Configurations

| File | Purpose | Key Characteristics |
| :--- | :--- | :--- |
| `docker-compose.yml` | Base / Standard | Backend (5000) + MongoDB, healthchecks, persistent volumes |
| `docker-compose.dev.yml` | Development Override | Source code bind-mount, nodemon dev server, MongoDB loopback port (127.0.0.1:27017) |
| `docker-compose.prod.yml` | Production Override | Nginx reverse proxy, internal backend port (not published), resource limits, JSON log rotation |

---

## 5. Common Docker Commands

```bash
# Build the backend image manually
docker build -t lttms-backend:latest ./backend

# Validate compose configuration
docker compose config

# Check container health & status
docker compose ps

# View backend logs in real-time
docker compose logs -f backend

# View MongoDB logs
docker compose logs -f mongodb

# Enter backend container shell
docker compose exec backend sh

# Execute database backup inside container
docker compose exec -T mongodb mongodump --db=lttms --archive --gzip > backup.archive.gz
```
