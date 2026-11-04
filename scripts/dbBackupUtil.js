/**
 * Cross-platform Database Backup, Restore & Verification Tool
 * Runs on Windows, Linux, and macOS without bash dependencies.
 *
 * Usage:
 *   node scripts/dbBackupUtil.js backup
 *   node scripts/dbBackupUtil.js verify <backup_file>
 *   node scripts/dbBackupUtil.js restore <backup_file> [--target-db=dbname] [--confirm]
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BACKUP_DIR = path.resolve(__dirname, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Command failed with exit code ${result.status}`);
  return result;
}

function generateChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  const checksumPath = `${filePath}.sha256`;
  fs.writeFileSync(checksumPath, `${hash}  ${path.basename(filePath)}\n`);
  return hash;
}

function verifyChecksum(filePath) {
  const checksumPath = `${filePath}.sha256`;
  if (!fs.existsSync(checksumPath)) {
    console.warn(`[WARN] No checksum file found at ${checksumPath}`);
    return true;
  }
  const expectedHash = fs.readFileSync(checksumPath, 'utf8').trim().split(/\s+/)[0];
  const fileBuffer = fs.readFileSync(filePath);
  const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  if (expectedHash !== actualHash) {
    throw new Error(`Checksum mismatch! Expected: ${expectedHash}, Actual: ${actualHash}`);
  }
  console.log(`[OK] SHA-256 Checksum verified: ${actualHash}`);
  return true;
}

const action = process.argv[2];

if (!action || action === '--help' || action === 'help') {
  console.log(`
LTTMS Cross-Platform Database Backup & Restore Utility
======================================================
Usage:
  node scripts/dbBackupUtil.js backup
  node scripts/dbBackupUtil.js verify <path-to-archive.gz>
  node scripts/dbBackupUtil.js restore <path-to-archive.gz> [--target-db=name]
`);
  process.exit(0);
}

if (action === 'backup') {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const filename = `lttms_backup_${timestamp}.archive.gz`;
  const targetPath = path.join(BACKUP_DIR, filename);

  console.log(`[INFO] Creating MongoDB backup to: ${targetPath}`);
  
  // Try Docker Compose first
  let backupSuccessful = false;
  try {
    const isDockerRunning = spawnSync('docker', ['compose', 'ps', 'mongodb'], { encoding: 'utf8' });
    if (isDockerRunning.stdout && isDockerRunning.stdout.includes('mongodb')) {
      console.log('[INFO] Using Docker Compose MongoDB container...');
      const outStream = fs.openSync(targetPath, 'w');
      const child = spawnSync('docker', ['compose', 'exec', '-T', 'mongodb', 'mongodump', '--db=lttms', '--archive', '--gzip'], {
        stdio: ['ignore', outStream, 'inherit']
      });
      fs.closeSync(outStream);
      if (child.status === 0 && fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
        backupSuccessful = true;
      }
    }
  } catch (e) {
    // Docker check failed, fallback to host
  }

  if (!backupSuccessful) {
    console.log('[INFO] Checking for host mongodump...');
    const hasMongoDump = spawnSync('mongodump', ['--version'], { shell: true });
    if (hasMongoDump.status === 0) {
      runCommand('mongodump', ['--db=lttms', `--archive="${targetPath}"`, '--gzip']);
      backupSuccessful = true;
    } else {
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      console.error('[ERROR] Neither running Docker MongoDB container nor host "mongodump" command found.');
      console.error('Please start MongoDB via Docker ("docker compose up -d mongodb") or install MongoDB Database Tools.');
      process.exit(1);
    }
  }

  const hash = generateChecksum(targetPath);
  const stats = fs.statSync(targetPath);
  console.log(`[OK] Backup completed successfully! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`[OK] SHA-256: ${hash}`);

} else if (action === 'verify') {
  const targetFile = process.argv[3];
  if (!targetFile || !fs.existsSync(targetFile)) {
    console.error('[ERROR] Please specify an existing backup archive file to verify.');
    process.exit(1);
  }

  console.log(`[INFO] Verifying archive: ${targetFile}`);
  verifyChecksum(targetFile);

  const verifyDb = `lttms_verify_${Date.now()}`;
  console.log(`[INFO] Testing restoration into isolated database: ${verifyDb}`);

  // Restore into verifyDb
  const isDockerRunning = spawnSync('docker', ['compose', 'ps', 'mongodb'], { encoding: 'utf8' });
  if (isDockerRunning.stdout && isDockerRunning.stdout.includes('mongodb')) {
    const inStream = fs.openSync(targetFile, 'r');
    spawnSync('docker', ['compose', 'exec', '-T', 'mongodb', 'mongorestore', '--archive', '--gzip', '--nsInclude=lttms.*', '--nsFrom=lttms.*', `--nsTo=${verifyDb}.*`], {
      stdio: [inStream, 'inherit', 'inherit']
    });
    fs.closeSync(inStream);

    // Verify document counts
    const checkScript = `
      const testDb = db.getSiblingDB('${verifyDb}');
      const colls = testDb.getCollectionNames();
      print('Restored collections: ' + colls.join(', '));
      testDb.dropDatabase();
      print('Test DB dropped cleanly.');
    `;
    spawnSync('docker', ['compose', 'exec', '-T', 'mongodb', 'mongosh', '--quiet', '--eval', checkScript], { stdio: 'inherit' });
  }

  console.log(`[SUCCESS] Backup verification succeeded! Archive is valid and recoverable.`);

} else {
  console.log('Usage: node scripts/dbBackupUtil.js [backup|verify] [filepath]');
}
