#!/usr/bin/env bash
# ==============================================================================
# LTTMS V1 — MongoDB Safe Backup Utility
# Creates timestamped, gzip-compressed MongoDB archive with SHA-256 checksum
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/lttms_backup_${TIMESTAMP}.archive.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
DB_NAME="${DB_NAME:-lttms}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "======================================================================"
echo " LTTMS V1 — Safe MongoDB Backup Process"
echo " Timestamp:   ${TIMESTAMP}"
echo " Database:    ${DB_NAME}"
echo " Destination: ${BACKUP_FILE}"
echo "======================================================================"

# Determine execution strategy (Docker container vs local mongodump)
if docker compose ps mongodb 2>/dev/null | grep -q "Up\|running"; then
    echo "[INFO] Using Docker Compose MongoDB container..."
    docker compose exec -T mongodb mongodump \
        --db="${DB_NAME}" \
        --archive \
        --gzip > "${BACKUP_FILE}"
elif command -v mongodump &>/dev/null; then
    echo "[INFO] Using host mongodump utility..."
    MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/${DB_NAME}}"
    # Execute mongodump without leaking credentials in logs
    mongodump --uri="${MONGO_URI}" --archive="${BACKUP_FILE}" --gzip
else
    echo "[ERROR] Neither Docker container nor host 'mongodump' command found." >&2
    exit 1
fi

# Verify file exists and is not empty
if [ ! -s "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup failed: generated archive is empty." >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

FILE_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "[OK] Backup created successfully (${FILE_SIZE})."

# Generate SHA-256 Checksum for integrity verification
if command -v sha256sum &>/dev/null; then
    sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
    echo "[OK] SHA-256 Checksum generated: ${CHECKSUM_FILE}"
elif command -v shasum &>/dev/null; then
    shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
    echo "[OK] SHA-256 Checksum generated: ${CHECKSUM_FILE}"
fi

# Clean up backups older than RETENTION_DAYS
echo "[INFO] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "lttms_backup_*.archive.gz*" -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true

echo "======================================================================"
echo " Backup Completed Successfully!"
echo " File: ${BACKUP_FILE}"
echo "======================================================================"
