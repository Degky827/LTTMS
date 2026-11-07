# LTTMS V1 — Production Deployment Guide

**Project**: Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS)  
**Date**: November 2026  
**Status**: PRODUCTION READY  

---

## 1. Architecture Overview

LTTMS is deployed as a modular monolith stack consisting of:
1. **Next.js Frontend Container** (Port 3000)
2. **Node.js/Express Backend Container** (Port 5000)
3. **MongoDB Database** (MongoDB Atlas or persistent Docker volume)
4. **Nginx Reverse Proxy / Cloud Edge** (SSL termination, HTTP/2, caching)

---

## 2. Deployment Methods

### Option A: Cloud Platform Deployment (Render, Railway, Heroku)

The repository includes a ready-to-use `render.yaml` blueprint defining the complete stack:
1. Connect the GitHub repository to the platform.
2. Select **Blueprint** deployment.
3. Configure secret environment variables in the dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CHAPA_SECRET_KEY`
   - `FRONTEND_ORIGIN`
4. The platform automatically:
   - Builds the backend (`npm ci --omit=dev`)
   - Verifies health check on `/api/v1/health`
   - Builds the Next.js frontend (`npm run build`)
   - Starts both services and maps public HTTPS endpoints.

### Option B: Production Docker Compose Deployment (Single Server / VPS)

Ensure Docker and Docker Compose are installed on the host machine.

#### Step 1: Clone Repository
```bash
git clone https://github.com/abrham-tech/LTTMS.git
cd LTTMS
```

#### Step 2: Configure Environment
Copy and customize the production environment files:
```bash
cp .env.example .env
nano .env
```

#### Step 3: Build and Start Containers
```bash
# Build multi-stage images
docker compose -f docker-compose.prod.yml build

# Start services in detached mode
docker compose -f docker-compose.prod.yml up -d
```

#### Step 4: Verify Container Health
```bash
docker compose -f docker-compose.prod.yml ps
```
Both `lttms-frontend` and `lttms-backend` should report `healthy`.

#### Step 5: Test Health Probes
```bash
# Backend Liveness Probe
curl http://localhost:5000/api/v1/health

# Backend Readiness Probe
curl http://localhost:5000/api/v1/ready

# Frontend
curl -I http://localhost:3000
```

---

## 3. Database Persistence & Automated Backups

When using Dockerized MongoDB:
- The persistent volume `mongodb_data` is mounted to `/data/db`.
- Run backup utility:
```bash
bash scripts/backup-mongodb.sh
```
- Backups are stored in `backups/` with automated timestamping and checksum verification.

---

## 4. Maintenance & Monitoring

- **Container Logs**:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f --tail=100 backend
  docker compose -f docker-compose.prod.yml logs -f --tail=100 frontend
  ```
- **Process Telemetry**:
  Visit `/api/v1/metrics` for process uptime, memory usage RSS, heap utilization, and database ready states.
