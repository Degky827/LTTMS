# Rollback & Disaster Recovery Procedures — LTTMS V1

Instructions for rolling back a deployment safely without causing data corruption or unintended database regressions.

---

## 1. Principles of Safe Rollbacks

1. **Code Rollback vs. Data Rollback**:
   - Rolling back the application code (Docker image) is fast, safe, and routine.
   - Restoring a database backup is an **exceptional disaster recovery action** and should NOT be done automatically. A database restore will erase all transactions, bookings, and payments created between the backup and the rollback time!
2. **Additive Schema Migrations**:
   - All LTTMS database changes are designed to be backwards-compatible (additive fields, safe indexes). The previous backend version can run against the updated database schema without errors.

---

## 2. Immediate Application Rollback (Image Revert)

If the new backend release encounters unexpected runtime errors:

### Step 1: Revert Docker Image to Previous Tag
```bash
# If using versioned image tags:
docker compose stop backend
sed -i 's/lttms-backend:latest/lttms-backend:previous/g' docker-compose.yml
docker compose up -d backend
```

### Step 2: Or Roll Back Git Commit
```bash
# Checkout the previous stable release commit or tag
git checkout <previous_stable_commit>

# Rebuild and restart backend container
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build backend
```

### Step 3: Verify Health
```bash
curl -f http://localhost:5000/api/v1/health
curl -f http://localhost:5000/api/v1/ready
```

---

## 3. Database Migration Rollback

If a migration introduced an unwanted index or behavior:

1. **Indexes**: In MongoDB, indexes can be dropped cleanly without data loss:
   ```bash
   docker compose exec mongodb mongosh lttms --eval 'db.users.dropIndex("unwanted_index_name")'
   ```
2. **Data Fields**: Do not drop entire collections. Additive fields (such as `ecoScore` or `commissionSnapshot`) will simply be ignored by older application code.

---

## 4. Emergency Database Restoration (Catastrophic Scenario Only)

Only execute a full database restore if data corruption occurred or irrecoverable data loss took place:

```bash
# 1. Stop backend to halt incoming traffic
docker compose stop backend

# 2. Restore verified pre-deployment backup archive
./scripts/restore-mongodb.sh ./backups/pre-deployment-backup.archive.gz --target-db=lttms --drop

# 3. Restart backend
docker compose up -d backend

# 4. Confirm system status
curl -f http://localhost:5000/api/v1/ready
```
