/**
 * Lake Tana Tourism Management System (LTTMS V1)
 * Database Migration Script: 001_v1_database_upgrade.js
 *
 * Safe, idempotent, non-destructive migration script that:
 * 1. Inspects and drops dangerous TTL index on User.lockUntil (ISS-01).
 * 2. Validates and backfills historical records with default fields and snapshots.
 * 3. Synchronizes and builds all schema indexes across collections.
 *
 * Usage:
 *   node backend/migrations/001_v1_database_upgrade.js [--dry-run]
 *
 * Pre-Migration Backup Strategy:
 *   Run before executing in production:
 *   mongodump --uri="mongodb://localhost:27017/lttms" --out="./backups/pre-migration-$(date +%Y%m%d%H%M%S)"
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import all models to ensure schemas are registered
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const CommissionTransaction = require('../models/CommissionTransaction');
const RefundRequest = require('../models/RefundRequest');
const Review = require('../models/Review');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

async function runMigration() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lttms';

  console.log('='.repeat(70));
  console.log(' LTTMS V1 — Database Migration 001: Schema Upgrade & Integrity Repair');
  console.log(` Mode: ${isDryRun ? 'DRY-RUN (Simulation only, no changes will be made)' : 'LIVE EXECUTION'}`);
  console.log(` Target URI: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
  console.log('='.repeat(70));

  try {
    await mongoose.connect(uri);
    console.log('[OK] Connected to MongoDB database successfully.');

    const db = mongoose.connection.db;

    // =========================================================================
    // STEP 1: Remediate Dangerous TTL Index on User.lockUntil (ISS-01)
    // =========================================================================
    console.log('\n--- Step 1: Checking for dangerous TTL index on User.lockUntil ---');
    const existingCollections = await db.listCollections({ name: 'users' }).toArray();
    let ttlDropped = false;

    if (existingCollections.length > 0) {
      const userCollection = db.collection('users');
      let userIndexes = [];
      try {
        userIndexes = await userCollection.indexes();
      } catch (err) {
        if (err.codeName === 'NamespaceNotFound' || err.code === 26 || (err.message && err.message.includes('ns does not exist'))) {
          userIndexes = [];
        } else {
          throw err;
        }
      }

      for (const idx of userIndexes) {
        if (idx.key && idx.key.lockUntil !== undefined && idx.expireAfterSeconds !== undefined) {
          console.warn(`[DETECTED] Dangerous TTL index found on lockUntil: "${idx.name}" (expireAfterSeconds: ${idx.expireAfterSeconds})`);
          if (isDryRun) {
            console.log(`[DRY-RUN] Would drop dangerous TTL index: ${idx.name}`);
          } else {
            await userCollection.dropIndex(idx.name);
            console.log(`[REPAIRED] Successfully dropped dangerous TTL index: ${idx.name}`);
            ttlDropped = true;
          }
        }
      }
      if (!ttlDropped && !isDryRun) {
        console.log('[OK] No dangerous TTL index on lockUntil detected.');
      }
    } else {
      console.log('[OK] Users collection does not exist yet. No TTL indexes to remediate.');
    }

    // =========================================================================
    // STEP 2: Non-Destructive Data Validation and Backfill
    // =========================================================================
    console.log('\n--- Step 2: Validating and normalizing existing data records ---');

    // 2A. Users: Ensure role and isActive exist
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    if (usersWithoutRole > 0) {
      console.log(`Found ${usersWithoutRole} users with missing role.`);
      if (isDryRun) {
        console.log(`[DRY-RUN] Would backfill ${usersWithoutRole} users with role='tourist'`);
      } else {
        const updateRes = await User.updateMany(
          { role: { $exists: false } },
          { $set: { role: 'tourist' } }
        );
        console.log(`[OK] Backfilled ${updateRes.modifiedCount} users with role='tourist'`);
      }
    } else {
      console.log('[OK] All User records have valid roles assigned.');
    }

    // 2B. Vendors: Ensure businessType and status exist
    const vendorsMissingFields = await Vendor.countDocuments({
      $or: [{ businessType: { $exists: false } }, { status: { $exists: false } }]
    });
    if (vendorsMissingFields > 0) {
      console.log(`Found ${vendorsMissingFields} vendors with missing businessType or status.`);
      if (isDryRun) {
        console.log(`[DRY-RUN] Would backfill ${vendorsMissingFields} vendors with defaults`);
      } else {
        const updateRes = await Vendor.updateMany(
          { $or: [{ businessType: { $exists: false } }, { status: { $exists: false } }] },
          { $set: { businessType: 'tour_operator', status: 'pending' } }
        );
        console.log(`[OK] Backfilled ${updateRes.modifiedCount} vendors with defaults.`);
      }
    } else {
      console.log('[OK] All Vendor records have valid status and business types.');
    }

    // 2C. Services: Ensure currency exists
    const servicesWithoutCurrency = await Service.countDocuments({ currency: { $exists: false } });
    if (servicesWithoutCurrency > 0) {
      console.log(`Found ${servicesWithoutCurrency} services missing currency.`);
      if (isDryRun) {
        console.log(`[DRY-RUN] Would backfill ${servicesWithoutCurrency} services with currency='ETB'`);
      } else {
        const updateRes = await Service.updateMany(
          { currency: { $exists: false } },
          { $set: { currency: 'ETB' } }
        );
        console.log(`[OK] Backfilled ${updateRes.modifiedCount} services with currency='ETB'.`);
      }
    } else {
      console.log('[OK] All Service records have currency specified.');
    }

    // 2D. Bookings: Ensure bookingReference and snapshots exist
    const bookingsWithoutRef = await Booking.find({
      $or: [
        { bookingReference: { $exists: false } },
        { bookingReference: null },
        { priceSnapshot: { $exists: false } },
        { currency: { $exists: false } }
      ]
    });

    if (bookingsWithoutRef.length > 0) {
      console.log(`Found ${bookingsWithoutRef.length} bookings missing reference or snapshot fields.`);
      if (isDryRun) {
        console.log(`[DRY-RUN] Would backfill reference and snapshots for ${bookingsWithoutRef.length} bookings`);
      } else {
        let backfilled = 0;
        for (const b of bookingsWithoutRef) {
          if (!b.bookingReference) {
            const dateStr = (b.createdAt || new Date()).toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
            b.bookingReference = `LTTMS-${dateStr}-${rand}`;
          }
          if (b.priceSnapshot === undefined || b.priceSnapshot === null) {
            b.priceSnapshot = b.totalPrice || 0;
          }
          if (!b.currency) {
            b.currency = 'ETB';
          }
          await b.save();
          backfilled++;
        }
        console.log(`[OK] Backfilled ${backfilled} bookings with references and price snapshots.`);
      }
    } else {
      console.log('[OK] All Booking records have valid booking references and snapshots.');
    }

    // =========================================================================
    // STEP 3: Synchronize and Build Indexes Across All Models
    // =========================================================================
    console.log('\n--- Step 3: Synchronizing schema indexes across all models ---');
    const models = [
      { name: 'User', model: User },
      { name: 'Vendor', model: Vendor },
      { name: 'Service', model: Service },
      { name: 'Category', model: Category },
      { name: 'Destination', model: Destination },
      { name: 'Booking', model: Booking },
      { name: 'Payment', model: Payment },
      { name: 'CommissionTransaction', model: CommissionTransaction },
      { name: 'RefundRequest', model: RefundRequest },
      { name: 'Review', model: Review },
      { name: 'Message', model: Message },
      { name: 'Notification', model: Notification },
      { name: 'SupportTicket', model: SupportTicket },
      { name: 'AuditLog', model: AuditLog }
    ];

    for (const { name, model } of models) {
      if (isDryRun) {
        try {
          const diff = await model.diffIndexes();
          const toCreate = diff.toCreate ? Object.keys(diff.toCreate).length : 0;
          const toDrop = diff.toDrop ? Object.keys(diff.toDrop).length : 0;
          console.log(`[DRY-RUN] ${name.padEnd(22)}: ${toCreate} index(es) to create, ${toDrop} index(es) to drop`);
        } catch (err) {
          if (err.codeName === 'NamespaceNotFound' || err.code === 26 || (err.message && err.message.includes('ns does not exist'))) {
            const schemaIndexes = model.schema.indexes().length;
            console.log(`[DRY-RUN] ${name.padEnd(22)}: ${schemaIndexes} index(es) defined in schema (collection empty/not initialized)`);
          } else {
            throw err;
          }
        }
      } else {
        await model.createIndexes();
        console.log(`[OK] ${name.padEnd(22)}: Schema indexes verified and synchronized.`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(` Migration 001 finished successfully ${isDryRun ? '(DRY RUN COMPLETE)' : '(CHANGES APPLIED)'}`);
    console.log('='.repeat(70));
  } catch (err) {
    console.error('\n[ERROR] Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('[OK] Disconnected from MongoDB cleanly.');
  }
}

// Execute migration when invoked directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
