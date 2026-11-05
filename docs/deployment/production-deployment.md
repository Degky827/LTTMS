# Production Deployment Guide — LTTMS V1

This guide details the procedure for deploying the redesigned LTTMS backend to staging and production environments.

---

## 1. Prerequisites & Infrastructure Setup

1. **Host Environment**: Linux VM (Ubuntu 22.04 LTS recommended) or cloud PaaS (e.g. Render, AWS ECS, DigitalOcean App Platform).
2. **Docker Engine**: Docker 24.0+ and Docker Compose v2.20+.
3. **Domain & DNS**: Valid domain with DNS records pointing to the server (e.g., `api.laketana.com`).
4. **TLS / HTTPS**:
   - Platform edge termination (Cloudflare / AWS ALB / Render SSL), OR
   - Host Certbot / Let's Encrypt certificates mapped to Nginx.

---

## 2. Environment Variables & Secret Configuration

1. In the deployment directory, create `.env` based on `.env.example`.
2. Generate secure production secrets:
   ```bash
   # Generate 64-character JWT secrets
   openssl rand -base64 48
   ```
3. Populate required values:
   ```env
   NODE_ENV=production
   PORT=5000
   TRUST_PROXY=1
   MONGODB_URI=mongodb://mongodb:27017/lttms
   JWT_SECRET=<64-char-random-key>
   JWT_REFRESH_SECRET=<64-char-random-key>
   FRONTEND_ORIGIN=https://laketana.com,https://admin.laketana.com
   CHAPA_SECRET_KEY=CHASECK-live_secret_key_here
   CHAPA_WEBHOOK_SECRET=your_chapa_webhook_secret_here
   CHAPA_CALLBACK_URL=https://api.laketana.com/api/v1/payments/verify
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=<sendgrid_api_key>
   LOG_LEVEL=info
   ```

---

## 3. Staging Deployment Workflow

Before updating production, deploy to an isolated staging environment:

```bash
# 1. Pull latest code on staging server
git pull origin dev

# 2. Build and start staging containers
docker compose -f docker-compose.yml up -d --build

# 3. Verify health status
docker compose ps
curl -f http://localhost:5000/api/v1/health
curl -f http://localhost:5000/api/v1/ready

# 4. Run database upgrade migration in dry-run mode
docker compose exec backend npm run migrate:dry-run

# 5. Execute live non-destructive migration
docker compose exec backend npm run migrate
```

---

## 4. Production Deployment Workflow (Zero-Downtime)

### Step 1: Pre-Deployment Backup
Before making any changes, generate and verify a fresh production backup:
```bash
./scripts/backup-mongodb.sh
# Verify backup integrity
./scripts/verify-backup.sh ./backups/lttms_backup_<timestamp>.archive.gz
```

### Step 2: Build & Start Production Containers
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Step 3: Verify Startup & Readiness
```bash
# Check running containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Confirm application readiness
curl -I http://localhost/ready
# Expected: HTTP/1.1 200 OK
```

### Step 4: Run Safe Database Upgrade Migration
```bash
docker compose exec backend npm run migrate
```

### Step 5: Post-Deployment Smoke Tests
Execute automated deployment verification with a single command:
```bash
npm run verify:deployment
# Or targeting a specific remote deployment:
node scripts/verify-deployment.js https://api.laketana.com
```

The script automatically verifies:
1. `GET /health` -> Liveness probe and dependencies.
2. `GET /ready` -> Database connection and application readiness.
3. `GET /api-docs.json` -> Complete OpenAPI 3.0.3 specification with all 153 paths.
4. `GET /api/health` -> Backward-compatible legacy frontend API alias.
5. `GET /api/v1/services` -> Tourism marketplace catalog.
6. `GET /api/v1/bookings/check-availability` -> Booking engine authorization guards.
