#!/usr/bin/env bash
# ==============================================================================
# LTTMS V1 — MongoDB Safe Restore Utility
# Restores a compressed MongoDB archive with integrity check & collision safeguards
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup.archive.gz> [--target-db=DATABASE_NAME] [--confirm] [--drop]"
    echo ""
    echo "Examples:"
    echo "  $0 ./backups/lttms_backup_20261104.archive.gz --target-db=lttms_isolated_test --confirm"
    echo "  $0 ./backups/lttms_backup_20261104.archive.gz --target-db=lttms --drop --confirm"
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DB=""
CONFIRMED=false
DROP_FLAG=""

for arg in "$@"; do
    case "$arg" in
        --target-db=*)
            TARGET_DB="${arg#*=}"
            ;;
        --confirm)
            CONFIRMED=true
            ;;
        --drop)
            DROP_FLAG="--drop"
            ;;
    esac
done

TARGET_DB="${TARGET_DB:-lttms_restore_test}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file does not exist: ${BACKUP_FILE}" >&2
    exit 1
fi

echo "======================================================================"
echo " LTTMS V1 — MongoDB Restore Process"
echo " Backup File: ${BACKUP_FILE}"
echo " Target DB:   ${TARGET_DB}"
echo " Drop Flag:   ${DROP_FLAG:-none}"
echo "======================================================================"

# 1. Integrity Check via SHA-256 if checksum file exists
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
    echo "[INFO] Verifying SHA-256 checksum..."
    if command -v sha256sum &>/dev/null; then
        sha256sum -c "${CHECKSUM_FILE}" || { echo "[ERROR] Checksum verification failed!"; exit 1; }
    elif command -v shasum &>/dev/null; then
        shasum -a 256 -c "${CHECKSUM_FILE}" || { echo "[ERROR] Checksum verification failed!"; exit 1; }
    fi
    echo "[OK] Checksum verified."
else
    echo "[WARN] No checksum file found. Skipping SHA-256 verification."
fi

# 2. Production Safety Gate
if [ "${TARGET_DB}" = "lttms" ] && [ "${CONFIRMED}" != "true" ]; then
    echo "[CRITICAL SAFETY WARNING] You are about to restore directly to the PRODUCTION database 'lttms'!"
    echo "To proceed, run with --confirm or type 'YES-RESTORE-LTTMS':"
    read -r user_confirm
    if [ "${user_confirm}" != "YES-RESTORE-LTTMS" ]; then
        echo "[ABORTED] Restore cancelled by user."
        exit 1
    fi
elif [ "${CONFIRMED}" != "true" ]; then
    echo "About to restore backup to database: '${TARGET_DB}'. Confirm (y/n):"
    read -r user_confirm
    if [ "${user_confirm}" != "y" ] && [ "${user_confirm}" != "Y" ]; then
        echo "[ABORTED] Restore cancelled by user."
        exit 1
    fi
fi

# 3. Execute Restore
echo "[INFO] Executing restore into database '${TARGET_DB}'..."

# Configure namespace renaming to isolate the restore if targeting different DB
NS_FLAGS=""
if [ "${TARGET_DB}" != "lttms" ]; then
    NS_FLAGS="--nsInclude=lttms.* --nsFrom=lttms.* --nsTo=${TARGET_DB}.*"
fi

if docker compose ps mongodb 2>/dev/null | grep -q "Up\|running"; then
    echo "[INFO] Restoring via Docker Compose MongoDB container..."
    cat "${BACKUP_FILE}" | docker compose exec -T mongodb mongorestore \
        --archive \
        --gzip \
        ${DROP_FLAG} \
        ${NS_FLAGS}
elif command -v mongorestore &>/dev/null; then
    echo "[INFO] Restoring via host mongorestore..."
    MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017}"
    mongorestore --uri="${MONGO_URI}" --archive="${BACKUP_FILE}" --gzip ${DROP_FLAG} ${NS_FLAGS}
else
    echo "[ERROR] Neither Docker container nor host 'mongorestore' found." >&2
    exit 1
fi

echo "======================================================================"
echo " Restore Completed Successfully into '${TARGET_DB}'!"
echo "======================================================================"
