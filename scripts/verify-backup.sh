#!/usr/bin/env bash
# ==============================================================================
# LTTMS V1 — MongoDB Backup Verification Utility
# Tests restoration against an isolated database to prove backup validity
# ==============================================================================

set -euo pipefail

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup.archive.gz>"
    exit 1
fi

BACKUP_FILE="$1"
VERIFY_DB="lttms_verify_test_$(date +%s)"

echo "======================================================================"
echo " LTTMS V1 — Backup Verification & Disaster Recovery Test"
echo " Archive:   ${BACKUP_FILE}"
echo " Isolated Test DB: ${VERIFY_DB}"
echo "======================================================================"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "[ERROR] Backup file not found: ${BACKUP_FILE}" >&2
    exit 1
fi

# Step 1: Restore to isolated test database
echo "[1/3] Restoring backup to temporary test database '${VERIFY_DB}'..."
if docker compose ps mongodb 2>/dev/null | grep -q "Up\|running"; then
    cat "${BACKUP_FILE}" | docker compose exec -T mongodb mongorestore \
        --archive \
        --gzip \
        --nsInclude="lttms.*" \
        --nsFrom="lttms.*" \
        --nsTo="${VERIFY_DB}.*"
elif command -v mongorestore &>/dev/null; then
    MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017}"
    mongorestore --uri="${MONGO_URI}" --archive="${BACKUP_FILE}" --gzip \
        --nsInclude="lttms.*" \
        --nsFrom="lttms.*" \
        --nsTo="${VERIFY_DB}.*"
else
    echo "[ERROR] MongoDB restore client not available." >&2
    exit 1
fi

# Step 2: Validate restored collections
echo "[2/3] Querying restored collections in '${VERIFY_DB}'..."
VERIFY_SCRIPT="
const dbTest = db.getSiblingDB('${VERIFY_DB}');
const collections = dbTest.getCollectionNames();
print('Restored Collections Count: ' + collections.length);
collections.forEach(c => {
    print('  - ' + c + ': ' + dbTest.getCollection(c).countDocuments() + ' records');
});
if (collections.length === 0) {
    quit(1);
}
"

if docker compose ps mongodb 2>/dev/null | grep -q "Up\|running"; then
    docker compose exec -T mongodb mongosh --quiet --eval "${VERIFY_SCRIPT}"
elif command -v mongosh &>/dev/null; then
    mongosh --quiet "${MONGODB_URI:-mongodb://localhost:27017}" --eval "${VERIFY_SCRIPT}"
fi

# Step 3: Clean up temporary test database
echo "[3/3] Dropping temporary test database '${VERIFY_DB}'..."
DROP_SCRIPT="db.getSiblingDB('${VERIFY_DB}').dropDatabase();"
if docker compose ps mongodb 2>/dev/null | grep -q "Up\|running"; then
    docker compose exec -T mongodb mongosh --quiet --eval "${DROP_SCRIPT}"
elif command -v mongosh &>/dev/null; then
    mongosh --quiet "${MONGODB_URI:-mongodb://localhost:27017}" --eval "${DROP_SCRIPT}"
fi

echo "======================================================================"
echo "[SUCCESS] Backup verification PASSED! Archive is valid and recoverable."
echo "======================================================================"
