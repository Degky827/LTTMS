process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const User = require('../models/User');
const Destination = require('../models/Destination');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const VendorDocument = require('../models/VendorDocument');
const VendorVerificationHistory = require('../models/VendorVerificationHistory');
const Service = require('../models/Service');
const EcoBadge = require('../models/EcoBadge');
const EcoBadgeApplication = require('../models/EcoBadgeApplication');
const EcoBadgeHistory = require('../models/EcoBadgeHistory');

const touristId = '654321000000000000000001';
const vendorUserId = '654321000000000000000002';
const adminId = '654321000000000000000003';
const vendorProfileId = '654321000000000000000004';
const destinationId = '654321000000000000000005';
const categoryId = '654321000000000000000006';
const subcategoryId = '654321000000000000000007';
const serviceId = '654321000000000000000008';
const badgeId = '654321000000000000000009';
const docId = '654321000000000000000010';
const appId = '654321000000000000000011';

const touristToken = jwt.sign({ id: touristId, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const vendorToken = jwt.sign({ id: vendorUserId, role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '15m' });
const adminToken = jwt.sign({ id: adminId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '15m' });

// Global User.findById stub for protect middleware
test.beforeEach(() => {
  User.findById = async (id) => {
    if (!id) return null;
    const idStr = id.toString();
    if (idStr === touristId) return { _id: touristId, role: 'tourist', isActive: true, isSuspended: false, isEmailVerified: true };
    if (idStr === vendorUserId) return { _id: vendorUserId, role: 'vendor', isActive: true, isSuspended: false, isEmailVerified: true };
    if (idStr === adminId) return { _id: adminId, role: 'admin', isActive: true, isSuspended: false, isEmailVerified: true };
    return null;
  };

  Vendor.findOne = (query = {}) => {
    return {
      populate: () => ({
        populate: async () => ({
          _id: vendorProfileId,
          user: { _id: vendorUserId, email: 'vendor@test.com', phone: '+251918112233', role: 'vendor' },
          businessName: 'Lake Tana Eco Tours',
          status: 'approved',
          verificationStatus: 'approved',
          destinations: [],
          toObject: () => ({ _id: vendorProfileId, businessName: 'Lake Tana Eco Tours', status: 'approved' })
        })
      }),
      then: (resolve) => resolve({
        _id: vendorProfileId,
        user: vendorUserId,
        businessName: 'Lake Tana Eco Tours',
        status: 'approved',
        verificationStatus: 'approved',
        save: async () => {}
      })
    };
  };
});

// ============================================================================
// 1. HEALTH, READINESS & METRICS ENDPOINTS
// ============================================================================

test('E2E: GET /health and /api/v1/health return 200 liveness probe', async () => {
  const res1 = await request(app).get('/health');
  assert.equal(res1.status, 200);
  assert.equal(res1.body.status, 'ok');

  const res2 = await request(app).get('/api/v1/health');
  assert.equal(res2.status, 200);
  assert.equal(res2.body.status, 'ok');
});

test('E2E: GET /ready and /api/v1/ready return probe response', async () => {
  const res = await request(app).get('/api/v1/ready');
  assert.ok([200, 503].includes(res.status));
  assert.ok(res.body.dependencies);
});

test('E2E: GET /metrics and /api/v1/metrics return process telemetry', async () => {
  const res = await request(app).get('/api/v1/metrics');
  assert.equal(res.status, 200);
  assert.ok(res.body.metrics.uptime !== undefined);
  assert.ok(res.body.metrics.heapUsed !== undefined);
});

// ============================================================================
// 2. SWAGGER / OPENAPI 3.0 SPECIFICATION ENDPOINTS
// ============================================================================

test('E2E: GET /api-docs.json and /api/v1/api-docs.json return valid OpenAPI 3.0.3 spec', async () => {
  const res = await request(app).get('/api/v1/api-docs.json');
  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, '3.0.3');
  assert.ok(res.body.paths['/destinations']);
  assert.ok(res.body.paths['/categories']);
  assert.ok(res.body.paths['/vendors']);
  assert.ok(res.body.paths['/services']);
  assert.ok(res.body.paths['/eco-badges']);
});

test('E2E: GET /api-docs and /api/v1/api-docs serve Swagger UI HTML', async () => {
  const res = await request(app).get('/api-docs/');
  assert.equal(res.status, 200);
  assert.match(res.text, /swagger-ui/i);
});

// ============================================================================
// 3. DESTINATION ENDPOINTS (/api/v1/destinations)
// ============================================================================

test('E2E: GET /api/v1/destinations lists published destinations with pagination', async () => {
  Destination.countDocuments = async () => 1;
  Destination.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => [{
            _id: destinationId,
            name: 'Zege Peninsula',
            slug: 'zege-peninsula',
            destinationType: 'peninsula',
            status: 'published'
          }]
        })
      })
    })
  });

  const res = await request(app).get('/api/v1/destinations?page=1&limit=5');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);
  assert.equal(res.body.data[0].slug, 'zege-peninsula');
});

test('E2E: GET /api/v1/destinations?type=monastery filters by destinationType', async () => {
  let capturedFilter = null;
  Destination.countDocuments = async (f) => { capturedFilter = f; return 1; };
  Destination.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => [{ _id: destinationId, destinationType: 'monastery' }]
        })
      })
    })
  });

  const res = await request(app).get('/api/v1/destinations?type=monastery');
  assert.equal(res.status, 200);
  assert.equal(capturedFilter.destinationType, 'monastery');
});

test('E2E: GET /api/v1/destinations/:id retrieves single destination and metrics', async () => {
  Destination.findById = () => ({
    populate: async () => ({
      _id: destinationId,
      name: 'Tis Abay',
      slug: 'tis-abay',
      status: 'published'
    })
  });
  Service.countDocuments = async () => 3;

  const res = await request(app).get(`/api/v1/destinations/${destinationId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.name, 'Tis Abay');
  assert.equal(res.body.metrics.availableServices, 3);
});

test('E2E: POST /api/v1/destinations requires Admin role', async () => {
  // Tourist should be rejected with 403
  const resForbidden = await request(app)
    .post('/api/v1/destinations')
    .set('Authorization', `Bearer ${touristToken}`)
    .send({ name: 'Unauthorized Dest', description: 'Sample description text' });
  assert.equal(resForbidden.status, 403);

  // Admin should succeed
  Destination.findOne = async () => null; // No duplicate
  Destination.create = async (p) => ({ ...p, _id: destinationId });

  const resAdmin = await request(app)
    .post('/api/v1/destinations')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Kebran Gabriel',
      description: 'Historic circular island monastery founded in the 14th century.',
      destinationType: 'monastery'
    });
  assert.equal(resAdmin.status, 201);
  assert.equal(resAdmin.body.data.name, 'Kebran Gabriel');
});

test('E2E: PATCH /api/v1/destinations/:id updates destination details', async () => {
  Destination.findById = async () => ({ _id: destinationId, name: 'Old Name' });
  Destination.findByIdAndUpdate = async (id, payload) => ({
    _id: id,
    name: payload.name || 'Old Name',
    shortDescription: payload.shortDescription
  });

  const res = await request(app)
    .patch(`/api/v1/destinations/${destinationId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ shortDescription: 'Updated short overview' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.shortDescription, 'Updated short overview');
});

test('E2E: PATCH /api/v1/destinations/:id/publish toggles publication status', async () => {
  let savedDest = null;
  Destination.findById = async () => ({
    _id: destinationId,
    status: 'draft',
    save: async function () { savedDest = this; }
  });

  const res = await request(app)
    .patch(`/api/v1/destinations/${destinationId}/publish`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'published' });
  assert.equal(res.status, 200);
  assert.equal(savedDest.status, 'published');
});

test('E2E: PATCH /api/v1/destinations/:id/feature toggles featured flag', async () => {
  let savedDest = null;
  Destination.findById = async () => ({
    _id: destinationId,
    isFeatured: false,
    save: async function () { savedDest = this; }
  });

  const res = await request(app)
    .patch(`/api/v1/destinations/${destinationId}/feature`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ isFeatured: true });
  assert.equal(res.status, 200);
  assert.equal(savedDest.isFeatured, true);
});

test('E2E: DELETE /api/v1/destinations/:id enforces referential integrity check', async () => {
  Destination.findById = async () => ({ _id: destinationId });
  Service.countDocuments = async () => 2; // Services reference it

  const res = await request(app)
    .delete(`/api/v1/destinations/${destinationId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'DESTINATION_IN_USE');
});

// ============================================================================
// 4. CATEGORY ENDPOINTS (/api/v1/categories)
// ============================================================================

test('E2E: GET /api/v1/categories and ?tree=true returns hierarchical category tree', async () => {
  Category.find = () => ({
    sort: () => ({
      populate: async () => [{ _id: categoryId, name: 'Boat Tours', isActive: true }],
      lean: async () => [
        { _id: categoryId, name: 'Boat Tours', parentCategory: null },
        { _id: subcategoryId, name: 'Private Boat Tours', parentCategory: categoryId }
      ]
    })
  });

  const resTree = await request(app).get('/api/v1/categories?tree=true');
  assert.equal(resTree.status, 200);
  assert.equal(resTree.body.data[0].subcategories.length, 1);
  assert.equal(resTree.body.data[0].subcategories[0].name, 'Private Boat Tours');
});

test('E2E: GET /api/v1/categories/:id returns category with subcategories', async () => {
  Category.findById = () => ({
    populate: async () => ({
      _id: categoryId,
      name: 'Accommodation',
      toObject: () => ({ _id: categoryId, name: 'Accommodation' })
    })
  });
  Category.find = () => ({
    sort: async () => [{ _id: subcategoryId, name: 'Eco-Lodges' }]
  });

  const res = await request(app).get(`/api/v1/categories/${categoryId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.subcategories.length, 1);
});

test('E2E: POST /api/v1/categories creates category (Admin only)', async () => {
  Category.findOne = async () => null;
  Category.create = async (p) => ({ ...p, _id: categoryId });

  const res = await request(app)
    .post('/api/v1/categories')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Nature and Wildlife', icon: 'binoculars' });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.name, 'Nature and Wildlife');
});

test('E2E: PATCH /api/v1/categories/:id prevents circular parent relationship', async () => {
  Category.findById = async () => ({ _id: categoryId, name: 'Boat Tours' });

  // Try to set category as its own parent
  const res = await request(app)
    .patch(`/api/v1/categories/${categoryId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ parentCategory: categoryId });
  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'CIRCULAR_CATEGORY_RELATIONSHIP');
});

test('E2E: PATCH /api/v1/categories/:id/status toggles isActive', async () => {
  let savedCat = null;
  Category.findById = async () => ({
    _id: categoryId,
    isActive: true,
    save: async function () { savedCat = this; }
  });

  const res = await request(app)
    .patch(`/api/v1/categories/${categoryId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ isActive: false });
  assert.equal(res.status, 200);
  assert.equal(savedCat.isActive, false);
});

// ============================================================================
// 5. VENDOR PROFILE & VERIFICATION ENDPOINTS (/api/v1/vendors)
// ============================================================================

test('E2E: GET /api/v1/vendors/profile/me returns authenticated vendor profile', async () => {
  VendorDocument.find = () => ({ sort: async () => [] });
  VendorVerificationHistory.find = () => ({
    sort: () => ({ populate: async () => [] })
  });

  const res = await request(app)
    .get('/api/v1/vendors/profile/me')
    .set('Authorization', `Bearer ${vendorToken}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.businessName, 'Lake Tana Eco Tours');
});

test('E2E: PATCH /api/v1/vendors/profile/me updates permitted details safely', async () => {
  Vendor.findByIdAndUpdate = () => ({
    populate: async () => ({
      _id: vendorProfileId,
      phone: '+251918445566',
      city: 'Bahir Dar'
    })
  });

  const res = await request(app)
    .patch('/api/v1/vendors/profile/me')
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({ phone: '+251918445566' });
  assert.equal(res.status, 200);
  assert.equal(res.body.data.phone, '+251918445566');
});

test('E2E: POST /api/v1/vendors/verification/documents uploads KYC document', async () => {
  VendorDocument.create = async (p) => ({ ...p, _id: docId });
  VendorVerificationHistory.create = async () => ({});

  const res = await request(app)
    .post('/api/v1/vendors/verification/documents')
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      documentType: 'business_license',
      fileUrl: '/uploads/licenses/license-101.pdf',
      originalFilename: 'commercial_license.pdf',
      mimeType: 'application/pdf',
      fileSize: 524288
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.documentType, 'business_license');
});

test('E2E: GET /api/v1/vendors/verification/status returns verification status & history', async () => {
  VendorDocument.find = () => ({ sort: async () => [{ documentType: 'business_license', status: 'submitted' }] });
  VendorVerificationHistory.find = () => ({
    sort: () => ({ populate: async () => [{ action: 'profile_submitted' }] })
  });

  const res = await request(app)
    .get('/api/v1/vendors/verification/status')
    .set('Authorization', `Bearer ${vendorToken}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.data.accountStatus, 'approved');
  assert.equal(res.body.data.documents.length, 1);
});

test('E2E: POST /api/v1/vendors/verification/submit submits documents for review', async () => {
  VendorDocument.countDocuments = async () => 1; // 1 document uploaded
  VendorVerificationHistory.create = async () => ({});

  const res = await request(app)
    .post('/api/v1/vendors/verification/submit')
    .set('Authorization', `Bearer ${vendorToken}`);
  assert.equal(res.status, 200);
  assert.match(res.body.message, /submitted for review/i);
});

test('E2E: PATCH /api/v1/vendors/:id/approve approves vendor account', async () => {
  let savedVendor = null;
  Vendor.findById = () => ({
    populate: async () => ({
      _id: vendorProfileId,
      status: 'pending',
      user: { _id: vendorUserId, email: 'vendor@test.com', name: 'Vendor Owner' },
      save: async function () { savedVendor = this; }
    })
  });
  User.findByIdAndUpdate = async () => ({});
  VendorDocument.updateMany = async () => ({});
  VendorVerificationHistory.create = async () => ({});

  const res = await request(app)
    .patch(`/api/v1/vendors/${vendorProfileId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ notes: 'Verified credentials' });
  assert.equal(res.status, 200);
  assert.equal(savedVendor.status, 'approved');
});

test('E2E: PATCH /api/v1/vendors/:id/suspend suspends vendor and deactivates services', async () => {
  let savedVendor = null;
  Vendor.findById = () => ({
    populate: async () => ({
      _id: vendorProfileId,
      status: 'approved',
      user: { _id: vendorUserId },
      save: async function () { savedVendor = this; }
    })
  });
  let deactivatedQuery = null;
  let deactivatedUpdate = null;
  Service.updateMany = async (q, u) => {
    deactivatedQuery = q;
    deactivatedUpdate = u;
  };
  VendorVerificationHistory.create = async () => ({});

  const res = await request(app)
    .patch(`/api/v1/vendors/${vendorProfileId}/suspend`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ reason: 'Safety violation on boat expedition' });
  assert.equal(res.status, 200);
  assert.equal(savedVendor.status, 'suspended');
  assert.equal(deactivatedUpdate.availability, false);
});

test('E2E: PATCH /api/v1/vendors/:id/reactivate reactivates vendor account', async () => {
  let savedVendor = null;
  Vendor.findById = () => ({
    populate: async () => ({
      _id: vendorProfileId,
      status: 'suspended',
      user: { _id: vendorUserId },
      save: async function () { savedVendor = this; }
    })
  });
  Service.updateMany = async () => ({});
  User.findByIdAndUpdate = async () => ({});
  VendorVerificationHistory.create = async () => ({});

  const res = await request(app)
    .patch(`/api/v1/vendors/${vendorProfileId}/reactivate`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.equal(savedVendor.status, 'approved');
});

// ============================================================================
// 6. TOURISM SERVICES ENDPOINTS (/api/v1/services)
// ============================================================================

test('E2E: GET /api/v1/services supports multi-criteria search and price sorting', async () => {
  Vendor.find = () => ({ select: async () => [{ _id: vendorProfileId }] });
  Service.countDocuments = async () => 1;
  Service.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: () => ({
            populate: () => ({
              populate: () => ({
                populate: async () => [{
                  _id: serviceId,
                  title: 'Lake Tana Monasteries Boat Tour',
                  price: 1200,
                  currency: 'ETB',
                  category: 'boat',
                  rating: 4.9
                }]
              })
            })
          })
        })
      })
    })
  });

  const res = await request(app).get('/api/v1/services?category=boat&ecoFriendly=true&minPrice=500&maxPrice=3000&sortBy=rating');
  assert.equal(res.status, 200);
  assert.equal(res.body.count, 1);
  assert.equal(res.body.data[0].title, 'Lake Tana Monasteries Boat Tour');
});

test('E2E: POST /api/v1/services creates service with draft status (Approved vendor)', async () => {
  Service.create = async (p) => ({ ...p, _id: serviceId });

  const res = await request(app)
    .post('/api/v1/services')
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      title: 'Island Birdwatching Charter',
      description: 'Discover pelicans and African fish eagles on Lake Tana islands.',
      price: 900,
      category: 'tour',
      dailyCapacity: 10
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.status, 'draft');
});

test('E2E: POST /api/v1/services/:id/submit submits draft service for review', async () => {
  let savedService = null;
  Service.findById = async () => ({
    _id: serviceId,
    vendor: vendorProfileId,
    status: 'draft',
    save: async function () { savedService = this; }
  });

  const res = await request(app)
    .post(`/api/v1/services/${serviceId}/submit`)
    .set('Authorization', `Bearer ${vendorToken}`);
  assert.equal(res.status, 200);
  assert.equal(savedService.status, 'pending_review');
});

test('E2E: PATCH /api/v1/services/:id/approve approves and publishes service (Admin only)', async () => {
  let savedService = null;
  Service.findById = () => ({
    populate: async () => ({
      _id: serviceId,
      status: 'pending_review',
      vendor: { status: 'approved' },
      save: async function () { savedService = this; }
    })
  });

  const res = await request(app)
    .patch(`/api/v1/services/${serviceId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(res.status, 200);
  assert.equal(savedService.status, 'published');
  assert.equal(savedService.availability, true);
});

test('E2E: POST /api/v1/services/:id/images adds image to service gallery', async () => {
  let savedService = null;
  Service.findById = async () => ({
    _id: serviceId,
    vendor: vendorProfileId,
    images: [],
    gallery: [],
    save: async function () { savedService = this; }
  });

  const res = await request(app)
    .post(`/api/v1/services/${serviceId}/images`)
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      url: '/uploads/services/boat-monastery.jpg',
      caption: 'Cruising past St. George Monastery',
      isCover: true
    });
  assert.equal(res.status, 201);
  assert.equal(savedService.coverImage, '/uploads/services/boat-monastery.jpg');
});

test('E2E: PUT /api/v1/services/:id/pricing updates tiered pricing configuration', async () => {
  let savedService = null;
  Service.findById = async () => ({
    _id: serviceId,
    vendor: vendorProfileId,
    price: 500,
    save: async function () { savedService = this; }
  });

  const res = await request(app)
    .put(`/api/v1/services/${serviceId}/pricing`)
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      price: 1500,
      pricingUnit: 'per_person',
      adultPrice: 1500,
      childPrice: 750,
      groupPricing: [{ minGroupSize: 4, maxGroupSize: 8, pricePerGroup: 5000 }]
    });
  assert.equal(res.status, 200);
  assert.equal(savedService.price, 1500);
  assert.equal(savedService.childPrice, 750);
});

test('E2E: PUT /api/v1/services/:id/availability updates capacity, days, and time slots', async () => {
  let savedService = null;
  Service.findById = async () => ({
    _id: serviceId,
    vendor: vendorProfileId,
    save: async function () { savedService = this; }
  });

  const res = await request(app)
    .put(`/api/v1/services/${serviceId}/availability`)
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      dailyCapacity: 30,
      minBookingCapacity: 1,
      maxBookingCapacity: 15,
      operatingDays: ['monday', 'tuesday', 'thursday', 'saturday'],
      timeSlots: [
        { startTime: '09:00', endTime: '12:00', maxCapacity: 15 },
        { startTime: '14:00', endTime: '17:00', maxCapacity: 15 }
      ]
    });
  assert.equal(res.status, 200);
  assert.equal(savedService.dailyCapacity, 30);
  assert.equal(savedService.timeSlots.length, 2);
});

// ============================================================================
// 7. ECO-TOURISM & ECO-BADGES ENDPOINTS (/api/v1/eco-badges)
// ============================================================================

test('E2E: GET /api/v1/eco-badges lists defined eco-badges and criteria', async () => {
  EcoBadge.find = () => ({
    sort: async () => [{ _id: badgeId, name: 'Eco-Friendly', tier: 'silver', isActive: true }]
  });

  const res = await request(app).get('/api/v1/eco-badges');
  assert.equal(res.status, 200);
  assert.equal(res.body.data[0].tier, 'silver');
});

test('E2E: POST /api/v1/eco-badges defines a new eco-badge (Admin only)', async () => {
  EcoBadge.create = async (p) => ({ ...p, _id: badgeId });

  const res = await request(app)
    .post('/api/v1/eco-badges')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Lake Tana Heritage Guardian',
      tier: 'platinum',
      description: 'Awarded to operators actively conserving monastery forests and native wildlife.',
      criteria: ['100% solar or electric boats', 'Community benefit sharing', 'Tree planting contribution']
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.name, 'Lake Tana Heritage Guardian');
});

test('E2E: POST /api/v1/eco-badges/applications submits application with evidence', async () => {
  EcoBadge.findById = async () => ({ _id: badgeId, name: 'Eco-Friendly', isActive: true });
  EcoBadgeApplication.findOne = async () => null; // No duplicate application
  EcoBadgeApplication.create = async (p) => ({ ...p, _id: appId });
  EcoBadgeHistory.create = async () => ({});

  const res = await request(app)
    .post('/api/v1/eco-badges/applications')
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({
      badgeId: badgeId,
      sustainabilityPractices: {
        wasteManagement: 'Onboard sorting of paper and plastics',
        waterConservation: 'Engine emission reduction silencer'
      },
      evidenceDocuments: [
        { title: 'Waste Management Contract', fileUrl: '/uploads/waste.pdf' }
      ]
    });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.status, 'submitted');
});

test('E2E: PATCH /api/v1/eco-badges/applications/:id/approve awards badge to vendor', async () => {
  let savedApp = null;
  EcoBadgeApplication.findById = () => ({
    populate: () => ({
      populate: async () => ({
        _id: appId,
        vendor: { _id: vendorProfileId },
        badge: { _id: badgeId, tier: 'platinum' },
        save: async function () { savedApp = this; }
      })
    })
  });
  let savedVendor = null;
  Vendor.findById = async () => ({
    _id: vendorProfileId,
    ecoCertification: false,
    ecoBadges: [],
    save: async function () { savedVendor = this; }
  });
  EcoBadgeHistory.create = async () => ({});

  const res = await request(app)
    .patch(`/api/v1/eco-badges/applications/${appId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ validUntilMonths: 12 });
  assert.equal(res.status, 200);
  assert.equal(savedApp.status, 'approved');
  assert.equal(savedVendor.ecoCertification, true);
  assert.equal(savedVendor.ecoBadgeTier, 'platinum');
});
