# MongoDB Backup, Restore & Disaster Recovery Guide — LTTMS V1

This guide covers the database backup strategy, restoration procedures, automated verification, and disaster recovery objectives for LTTMS.

---

## 1. Disaster Recovery Objectives

- **Recovery Point Objective (RPO)**: **1 hour**.
  - Automated daily full backups combined with rolling oplog backups or high-frequency snapshots ensure minimal data loss during disasters.
- **Recovery Time Objective (RTO)**: **< 15 minutes**.
  - Using compressed single-file archives (`--archive --gzip`), full restoration of typical production databases (< 10GB) takes under 10 minutes.

---

## 2. Backup Strategy & Scheduling

### Automated Backup Frequency
- **Full Database Dump**: Daily at 02:00 AM UTC.
- **Pre-Deployment Dump**: Executed immediately prior to any software deployment or schema migration.
- **Retention Policy**: Retain daily backups for 14 days; retain weekly snapshots for 90 days.
- **Storage Location**:
  - Local disk storage: `/backups/` directory (mounted on persistent storage).
  - Off-site replication: Encrypted sync to Amazon S3, Google Cloud Storage, or Backblaze B2 using rclone or AWS CLI.

---

## 3. Creating a Backup

### Using the Bash Script (Linux / Production)
```bash
./scripts/backup-mongodb.sh
```

### Using the Cross-Platform Node Tool
```bash
node scripts/dbBackupUtil.js backup
```

### Output Files
1. `backups/lttms_backup_<YYYYMMDD_HHMMSS>.archive.gz`: Compressed BSON archive containing all collections, indexes, and metadata.
2. `backups/lttms_backup_<YYYYMMDD_HHMMSS>.archive.gz.sha256`: SHA-256 cryptographic checksum.

---

## 4. Verifying Backup Integrity

> [!IMPORTANT]
> A backup is not reliable until a restore has been verified against an isolated environment.

Run the verification tool:
```bash
# Using Bash
./scripts/verify-backup.sh ./backups/lttms_backup_20261104_120000.archive.gz

# Or using Node
node scripts/dbBackupUtil.js verify ./backups/lttms_backup_20261104_120000.archive.gz
```

**Verification Process**:
1. Checks SHA-256 checksum against `.sha256` manifest.
2. Restores the archive into a temporary test database (e.g. `lttms_verify_1730761200`).
3. Queries collection names and verifies document counts.
4. Drops the temporary test database cleanly.

---

## 5. Safe Restoration Procedure

### Case 1: Restoring to an Isolated Test Database (Non-Destructive)
To test data or investigate historical records without affecting production:
```bash
./scripts/restore-mongodb.sh ./backups/lttms_backup_20261104_120000.archive.gz --target-db=lttms_sandbox --confirm
```

### Case 2: Emergency Production Restoration (Disaster Recovery)
If recovering from server hardware failure or accidental data deletion:

```bash
# WARNING: This replaces the contents of the 'lttms' database
./scripts/restore-mongodb.sh ./backups/lttms_backup_20261104_120000.archive.gz --target-db=lttms --drop
```
When targeting `lttms`, the script prompts for explicit safety confirmation (`YES-RESTORE-LTTMS`) before proceeding.
