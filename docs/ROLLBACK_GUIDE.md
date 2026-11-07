# LTTMS V1 — Production Rollback & Disaster Recovery Guide

**Project**: Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS)  
**Date**: November 2026  
**Status**: ACTIVE  

---

## 1. Rollback Scenarios & Procedures

### Scenario 1: Unstable Application Release (Frontend or Backend Bug)

If a newly deployed release introduces unexpected runtime errors:

#### A. Cloud / Render Rollback
1. Navigate to the Render Dashboard -> Select `lttms-frontend` or `lttms-backend`.
2. Open the **Deploys** tab.
3. Locate the previous stable deploy commit.
4. Click **Rollback to this deploy**.

#### B. Docker Compose / Git Rollback
1. Checkout the previous release tag or stable commit:
   ```bash
   git checkout <previous-stable-tag-or-commit>
   ```
2. Re-build and restart containers:
   ```bash
   docker compose -f docker-compose.prod.yml build
   docker compose -f docker-compose.prod.yml up -d --remove-orphans
   ```
3. Confirm health probes return HTTP 200:
   ```bash
   curl -f http://localhost:5000/api/v1/health || exit 1
   ```

---

## 2. Database Disaster Recovery (Restore Procedure)

If data corruption or accidental deletion occurs:

### Step 1: Identify Target Backup
List available backups in the `backups/` directory:
```bash
ls -lh backups/
```

### Step 2: Execute Restore Script
Use the verified restore utility in `scripts/restore-mongodb.sh`:
```bash
bash scripts/restore-mongodb.sh backups/lttms-backup-YYYY-MM-DD.tar.gz
```

### Step 3: Verify Data Integrity
Run database verification:
```bash
node scripts/verify-deployment.js
```

---

## 3. Emergency Contacts & Escalation Protocol

1. **Platform Administrator**: Inspect `/api/v1/admin/audit-logs` for unauthorized mutations.
2. **Database Lead**: Check replica set lag and storage capacity.
3. **Payment Coordinator**: If transactions are disrupted, toggle payment provider to sandbox mode or display maintenance banner.
