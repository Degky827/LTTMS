process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';

const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
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

const destinationController = require('../controllers/destinationController');
const categoryController = require('../controllers/categoryController');
const vendorController = require('../controllers/vendorController');
const serviceController = require('../controllers/serviceController');
const ecoBadgeController = require('../controllers/ecoBadgeController');

// Helper to create mock response
const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
};

// ============================================================================
// SECTION 1: DESTINATION MANAGEMENT
// ============================================================================

test('DESTINATION: 1. Model validates required fields, types, and defaults', async () => {
  const dest = new Destination({
    name: 'Ura Kidane Mehret',
    slug: 'ura-kidane-mehret',
    description: '14th-century circular monastery renowned for vibrant historical frescoes.',
    destinationType: 'monastery',
    status: 'published'
  });
  const err = await dest.validate().catch(e => e);
  assert.ok(!(err instanceof Error), `Expected valid destination, got: ${err?.message}`);
  assert.equal(dest.destinationType, 'monastery');
  assert.equal(dest.isFeatured, false);
});

test('DESTINATION: 2. Model rejects invalid destinationType', async () => {
  const invalid = new Destination({
    name: 'Invalid Dest',
    slug: 'invalid-dest',
    description: 'Desc',
    destinationType: 'space_station'
  });
  const err = await invalid.validate().catch(e => e);
  assert.ok(err instanceof Error);
  assert.ok(err.errors.destinationType);
});

test('DESTINATION: 3. Public getDestinations only queries published items for anonymous tourists', async () => {
  const originalFind = Destination.find;
  const originalCount = Destination.countDocuments;
  let capturedFilter = null;

  Destination.countDocuments = async (filter) => {
    capturedFilter = filter;
    return 1;
  };
  Destination.find = (filter) => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => [{ name: 'Lake Tana', status: 'published' }]
        })
      })
    })
  });

  const req = { query: {}, user: null };
  const res = createMockRes();
  await destinationController.getDestinations(req, res);

  Destination.find = originalFind;
  Destination.countDocuments = originalCount;

  assert.equal(res.statusCode, 200);
  assert.equal(capturedFilter.status, 'published', 'Anonymous tourist query MUST be constrained to status: published');
});

test('DESTINATION: 4. Admin getDestinations allows querying draft/archived destinations', async () => {
  const originalFind = Destination.find;
  const originalCount = Destination.countDocuments;
  let capturedFilter = null;

  Destination.countDocuments = async (filter) => {
    capturedFilter = filter;
    return 1;
  };
  Destination.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => [{ name: 'Draft Destination', status: 'draft' }]
        })
      })
    })
  });

  const req = { query: { status: 'draft' }, user: { role: 'admin', _id: '654321000000000000000002' } };
  const res = createMockRes();
  await destinationController.getDestinations(req, res);

  Destination.find = originalFind;
  Destination.countDocuments = originalCount;

  assert.equal(res.statusCode, 200);
  assert.equal(capturedFilter.status, 'draft', 'Admin query should respect requested status filter');
});

test('DESTINATION: 5. Safe deletion check blocks deleting destination referenced by active services', async () => {
  const dummyDestId = new mongoose.Types.ObjectId();
  const originalFindDest = Destination.findById;
  const originalCountServices = Service.countDocuments;

  Destination.findById = async () => ({ _id: dummyDestId, name: 'Tis Abay' });
  Service.countDocuments = async () => 3; // 3 active services reference it

  const req = {
    params: { id: dummyDestId.toString() },
    user: { _id: '654321000000000000000002', role: 'admin' }
  };
  const res = createMockRes();
  await destinationController.deleteDestination(req, res);

  Destination.findById = originalFindDest;
  Service.countDocuments = originalCountServices;

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'DESTINATION_IN_USE');
});

// ============================================================================
// SECTION 2: CATEGORY & SUBCATEGORY MANAGEMENT
// ============================================================================

test('CATEGORY: 1. Model validates slug, name, and parentCategory reference', async () => {
  const parent = new mongoose.Types.ObjectId();
  const subcat = new Category({
    name: 'Private Boat Tours',
    slug: 'private-boat-tours',
    description: 'Private charter boats for island monastery exploration',
    parentCategory: parent,
    displayOrder: 1
  });
  const err = await subcat.validate().catch(e => e);
  assert.ok(!(err instanceof Error));
  assert.equal(subcat.parentCategory.toString(), parent.toString());
  assert.equal(subcat.isActive, true);
});

test('CATEGORY: 2. Circular reference prevention blocks category being its own parent', async () => {
  const catId = new mongoose.Types.ObjectId();
  const originalFind = Category.findById;
  Category.findById = async () => ({ _id: catId, name: 'Self Cat' });

  const req = {
    params: { id: catId.toString() },
    body: { parentCategory: catId.toString() },
    user: { _id: '654321000000000000000002', role: 'admin' }
  };
  const res = createMockRes();
  await categoryController.updateCategory(req, res);

  Category.findById = originalFind;

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'CIRCULAR_CATEGORY_RELATIONSHIP');
});

test('CATEGORY: 3. Circular reference prevention blocks indirect circular loops (A -> B -> A)', async () => {
  const catAId = new mongoose.Types.ObjectId();
  const catBId = new mongoose.Types.ObjectId();

  const originalFind = Category.findById;
  Category.findById = async (id) => {
    if (id.toString() === catAId.toString()) return { _id: catAId, name: 'Category A', parentCategory: null };
    if (id.toString() === catBId.toString()) return { _id: catBId, name: 'Category B', parentCategory: catAId };
    return null;
  };

  // Attempt to update A with parent B (while B already has parent A)
  const req = {
    params: { id: catAId.toString() },
    body: { parentCategory: catBId.toString() },
    user: { _id: '654321000000000000000002', role: 'admin' }
  };
  const res = createMockRes();
  await categoryController.updateCategory(req, res);

  Category.findById = originalFind;

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'CIRCULAR_CATEGORY_RELATIONSHIP');
});

test('CATEGORY: 4. Deletion blocked if category has existing subcategories', async () => {
  const catId = new mongoose.Types.ObjectId();
  const originalFindCat = Category.findById;
  const originalCountCat = Category.countDocuments;

  Category.findById = async () => ({ _id: catId, name: 'Parent Category' });
  Category.countDocuments = async () => 2; // 2 child subcategories

  const req = {
    params: { id: catId.toString() },
    user: { _id: '654321000000000000000002', role: 'admin' }
  };
  const res = createMockRes();
  await categoryController.deleteCategory(req, res);

  Category.findById = originalFindCat;
  Category.countDocuments = originalCountCat;

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'CATEGORY_HAS_CHILDREN');
});

test('CATEGORY: 5. Deletion blocked if category is referenced by active services', async () => {
  const catId = new mongoose.Types.ObjectId();
  const originalFindCat = Category.findById;
  const originalCountCat = Category.countDocuments;
  const originalCountSvc = Service.countDocuments;

  Category.findById = async () => ({ _id: catId, name: 'Boat Tours', slug: 'boat-tours' });
  Category.countDocuments = async () => 0; // 0 child subcategories
  Service.countDocuments = async () => 5; // 5 services reference it

  const req = {
    params: { id: catId.toString() },
    user: { _id: '654321000000000000000002', role: 'admin' }
  };
  const res = createMockRes();
  await categoryController.deleteCategory(req, res);

  Category.findById = originalFindCat;
  Category.countDocuments = originalCountCat;
  Service.countDocuments = originalCountSvc;

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, 'CATEGORY_IN_USE');
});

// ============================================================================
// SECTION 3: VENDOR PROFILE & VERIFICATION WORKFLOW
// ============================================================================

test('VENDOR: 1. Registration initializes pending status and draft verification', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const originalFindOne = Vendor.findOne;
  const originalCreate = Vendor.create;
  const originalHistory = VendorVerificationHistory.create;

  Vendor.findOne = async () => null; // No existing profile
  let capturedPayload = null;
  Vendor.create = async (payload) => {
    capturedPayload = payload;
    return { ...payload, _id: new mongoose.Types.ObjectId() };
  };
  VendorVerificationHistory.create = async () => ({});

  const req = {
    user: { _id: dummyUserId },
    body: {
      businessName: 'Tana Sunset Charters',
      businessType: 'boat_operator',
      location: 'Bahir Dar Pier 2',
      phone: '+251918112233',
      // Attacking with elevated privilege fields
      status: 'approved',
      verificationStatus: 'approved',
      ecoCertification: true
    }
  };
  const res = createMockRes();
  await vendorController.registerVendor(req, res);

  Vendor.findOne = originalFindOne;
  Vendor.create = originalCreate;
  VendorVerificationHistory.create = originalHistory;

  assert.equal(res.statusCode, 201);
  assert.equal(capturedPayload.status, 'pending', 'Public registration MUST force status: pending');
  assert.equal(capturedPayload.verificationStatus, 'draft', 'Public registration MUST force verificationStatus: draft');
  assert.equal(capturedPayload.ecoCertification, undefined, 'Client-supplied ecoCertification must be deleted');
});

test('VENDOR: 2. Profile updates prevent mass-assignment privilege escalation', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();

  const originalFindOne = Vendor.findOne;
  const originalFindByIdAndUpdate = Vendor.findByIdAndUpdate;

  Vendor.findOne = async () => ({ _id: dummyVendorId, user: dummyUserId });
  let capturedUpdate = null;
  Vendor.findByIdAndUpdate = (id, update) => {
    capturedUpdate = update;
    return {
      populate: async () => ({ _id: dummyVendorId, ...update })
    };
  };

  const req = {
    user: { _id: dummyUserId },
    body: {
      description: 'Updated description',
      phone: '+251918999999',
      // Attacking with admin-only fields
      status: 'approved',
      verificationStatus: 'approved',
      adminNotes: 'Self approved',
      ecoCertification: true
    }
  };
  const res = createMockRes();
  await vendorController.updateMyVendorProfile(req, res);

  Vendor.findOne = originalFindOne;
  Vendor.findByIdAndUpdate = originalFindByIdAndUpdate;

  assert.equal(res.statusCode, 200);
  assert.equal(capturedUpdate.status, undefined, 'Vendor cannot alter status via profile update');
  assert.equal(capturedUpdate.verificationStatus, undefined, 'Vendor cannot alter verificationStatus via profile update');
  assert.equal(capturedUpdate.adminNotes, undefined, 'Vendor cannot alter adminNotes via profile update');
  assert.equal(capturedUpdate.ecoCertification, undefined, 'Vendor cannot self-award ecoCertification');
});

test('VENDOR: 3. KYC document submission records in VendorDocument and history', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();

  const originalFindOne = Vendor.findOne;
  const originalDocCreate = VendorDocument.create;
  const originalHistCreate = VendorVerificationHistory.create;

  Vendor.findOne = async () => ({ _id: dummyVendorId, verificationStatus: 'draft' });
  let docPayload = null;
  VendorDocument.create = async (p) => { docPayload = p; return { ...p, _id: new mongoose.Types.ObjectId() }; };
  VendorVerificationHistory.create = async () => ({});

  const req = {
    user: { _id: dummyUserId },
    body: {
      documentType: 'business_license',
      fileUrl: '/uploads/licenses/license-123.pdf',
      originalFilename: 'trade_license_2026.pdf',
      mimeType: 'application/pdf',
      fileSize: 1048576
    }
  };
  const res = createMockRes();
  await vendorController.uploadVerificationDocument(req, res);

  Vendor.findOne = originalFindOne;
  VendorDocument.create = originalDocCreate;
  VendorVerificationHistory.create = originalHistCreate;

  assert.equal(res.statusCode, 201);
  assert.equal(docPayload.documentType, 'business_license');
  assert.equal(docPayload.status, 'submitted');
  assert.equal(docPayload.vendor.toString(), dummyVendorId.toString());
});

test('VENDOR: 4. Verification submit requires at least one uploaded document', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const originalFindOne = Vendor.findOne;
  const originalCountDoc = VendorDocument.countDocuments;

  Vendor.findOne = async () => ({ _id: new mongoose.Types.ObjectId() });
  VendorDocument.countDocuments = async () => 0; // 0 documents uploaded

  const req = { user: { _id: dummyUserId } };
  const res = createMockRes();
  await vendorController.submitVerification(req, res);

  Vendor.findOne = originalFindOne;
  VendorDocument.countDocuments = originalCountDoc;

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /upload at least one verification document/i);
});

test('VENDOR: 5. Admin approve promotes user role to vendor and updates statuses', async () => {
  const dummyAdminId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();

  const originalFindVendor = Vendor.findById;
  const originalUpdateUser = User.findByIdAndUpdate;
  const originalUpdateDocs = VendorDocument.updateMany;
  const originalHistory = VendorVerificationHistory.create;

  let savedVendor = null;
  Vendor.findById = () => ({
    populate: async () => ({
      _id: dummyVendorId,
      user: { _id: dummyUserId, email: 'vendor@test.com', name: 'Vendor Owner' },
      businessName: 'Tana Eco Boat',
      status: 'pending',
      save: async function () { savedVendor = this; }
    })
  });

  let promotedUserRole = null;
  User.findByIdAndUpdate = async (id, update) => { promotedUserRole = update.role; };
  VendorDocument.updateMany = async () => ({});
  VendorVerificationHistory.create = async () => ({});

  const req = {
    params: { id: dummyVendorId.toString() },
    user: { _id: dummyAdminId, role: 'admin' },
    body: { notes: 'Verified license with trade bureau' }
  };
  const res = createMockRes();
  await vendorController.approveVendor(req, res);

  Vendor.findById = originalFindVendor;
  User.findByIdAndUpdate = originalUpdateUser;
  VendorDocument.updateMany = originalUpdateDocs;
  VendorVerificationHistory.create = originalHistory;

  assert.equal(res.statusCode, 200);
  assert.equal(savedVendor.status, 'approved');
  assert.equal(savedVendor.verificationStatus, 'approved');
  assert.equal(promotedUserRole, 'vendor', 'User role must be upgraded to vendor on approval');
});

test('VENDOR: 6. Admin suspend deactivates all services belonging to the vendor', async () => {
  const dummyAdminId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();

  const originalFindVendor = Vendor.findById;
  const originalUpdateServices = Service.updateMany;
  const originalHistory = VendorVerificationHistory.create;

  let savedVendor = null;
  Vendor.findById = () => ({
    populate: async () => ({
      _id: dummyVendorId,
      status: 'approved',
      save: async function () { savedVendor = this; }
    })
  });

  let serviceQuery = null;
  let serviceUpdate = null;
  Service.updateMany = async (q, u) => {
    serviceQuery = q;
    serviceUpdate = u;
  };
  VendorVerificationHistory.create = async () => ({});

  const req = {
    params: { id: dummyVendorId.toString() },
    user: { _id: dummyAdminId, role: 'admin' },
    body: { reason: 'Violated safety standards on Lake Tana' }
  };
  const res = createMockRes();
  await vendorController.suspendVendor(req, res);

  Vendor.findById = originalFindVendor;
  Service.updateMany = originalUpdateServices;
  VendorVerificationHistory.create = originalHistory;

  assert.equal(res.statusCode, 200);
  assert.equal(savedVendor.status, 'suspended');
  assert.equal(serviceQuery.vendor.toString(), dummyVendorId.toString());
  assert.equal(serviceUpdate.availability, false, 'Suspension must set all vendor service availability to false');
});

// ============================================================================
// SECTION 4: TOURISM SERVICE MANAGEMENT & MARKETPLACE SEARCH
// ============================================================================

test('SERVICE: 1. Unapproved vendor cannot create services', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();

  const originalFindVendor = Vendor.findOne;
  Vendor.findOne = async () => ({
    _id: dummyVendorId,
    user: dummyUserId,
    status: 'pending' // Vendor is pending, not approved yet
  });

  const req = {
    user: { _id: dummyUserId, role: 'vendor' },
    body: {
      title: 'Island Tour',
      price: 500,
      category: 'tour',
      description: 'Scenic island tour'
    }
  };
  const res = createMockRes();
  await serviceController.createService(req, res);

  Vendor.findOne = originalFindVendor;

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.code, 'VENDOR_NOT_APPROVED');
});

test('SERVICE: 2. Approved vendor creates service with initial draft status', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();

  const originalFindVendor = Vendor.findOne;
  const originalCreateService = Service.create;

  Vendor.findOne = async () => ({
    _id: dummyVendorId,
    user: dummyUserId,
    status: 'approved'
  });

  let capturedService = null;
  Service.create = async (payload) => {
    capturedService = payload;
    return { ...payload, _id: new mongoose.Types.ObjectId() };
  };

  const req = {
    user: { _id: dummyUserId, role: 'vendor' },
    body: {
      title: 'Zege Monastery Half-Day Tour',
      price: 850,
      currency: 'ETB',
      category: 'monastery',
      description: 'Historical tour of 14th century churches with certified guide.',
      dailyCapacity: 15
    }
  };
  const res = createMockRes();
  await serviceController.createService(req, res);

  Vendor.findOne = originalFindVendor;
  Service.create = originalCreateService;

  assert.equal(res.statusCode, 201);
  assert.equal(capturedService.status, 'draft', 'Vendor service creation should start as draft');
  assert.ok(capturedService.slug.startsWith('zege-monastery-half-day-tour'));
});

test('SERVICE: 3. Public marketplace query hides services from unapproved or suspended vendors', async () => {
  const originalFindVendors = Vendor.find;
  const originalFindServices = Service.find;
  const originalCountServices = Service.countDocuments;

  const approvedVendor1 = new mongoose.Types.ObjectId();
  const approvedVendor2 = new mongoose.Types.ObjectId();

  Vendor.find = () => ({
    select: async () => [{ _id: approvedVendor1 }, { _id: approvedVendor2 }]
  });

  let capturedFilter = null;
  Service.countDocuments = async (filter) => { capturedFilter = filter; return 2; };
  Service.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: () => ({
            populate: () => ({
              populate: () => ({
                populate: async () => [{ title: 'Approved Tour' }]
              })
            })
          })
        })
      })
    })
  });

  const req = { query: {}, user: null };
  const res = createMockRes();
  await serviceController.getServices(req, res);

  Vendor.find = originalFindVendors;
  Service.find = originalFindServices;
  Service.countDocuments = originalCountServices;

  assert.equal(res.statusCode, 200);
  assert.equal(capturedFilter.status, 'published');
  assert.ok(capturedFilter.vendor.$in.includes(approvedVendor1));
  assert.ok(capturedFilter.vendor.$in.includes(approvedVendor2));
});

test('SERVICE: 4. Admin approval sets status to published and clears moderation feedback', async () => {
  const dummyAdminId = new mongoose.Types.ObjectId();
  const dummyServiceId = new mongoose.Types.ObjectId();

  const originalFind = Service.findById;
  let savedService = null;
  Service.findById = () => ({
    populate: async () => ({
      _id: dummyServiceId,
      status: 'pending_review',
      vendor: { status: 'approved' },
      moderationFeedback: 'Previously rejected for low resolution images',
      save: async function () { savedService = this; }
    })
  });

  const req = {
    params: { id: dummyServiceId.toString() },
    user: { _id: dummyAdminId, role: 'admin' }
  };
  const res = createMockRes();
  await serviceController.approveService(req, res);

  Service.findById = originalFind;

  assert.equal(res.statusCode, 200);
  assert.equal(savedService.status, 'published');
  assert.equal(savedService.availability, true);
  assert.equal(savedService.moderationFeedback, null);
});

// ============================================================================
// SECTION 5: SERVICE MEDIA, PRICING & AVAILABILITY
// ============================================================================

test('MEDIA: 1. Add image to gallery updates coverImage when isCover is true', async () => {
  const dummyVendorId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyServiceId = new mongoose.Types.ObjectId();

  const originalFindService = Service.findById;
  const originalFindVendor = Vendor.findOne;

  let savedService = null;
  Service.findById = async () => ({
    _id: dummyServiceId,
    vendor: dummyVendorId,
    coverImage: null,
    images: [],
    gallery: [],
    save: async function () { savedService = this; }
  });
  Vendor.findOne = async () => ({ _id: dummyVendorId, user: dummyUserId });

  const req = {
    params: { id: dummyServiceId.toString() },
    user: { _id: dummyUserId, role: 'vendor' },
    body: {
      url: '/uploads/services/boat-expedition-cover.jpg',
      caption: 'Main boat vessel on Lake Tana',
      isCover: true,
      displayOrder: 0
    }
  };
  const res = createMockRes();
  await serviceController.addServiceImage(req, res);

  Service.findById = originalFindService;
  Vendor.findOne = originalFindVendor;

  assert.equal(res.statusCode, 201);
  assert.equal(savedService.coverImage, '/uploads/services/boat-expedition-cover.jpg');
  assert.equal(savedService.gallery.length, 1);
  assert.equal(savedService.gallery[0].isCover, true);
});

test('PRICING: 2. Service pricing update configures adult, child, and group pricing', async () => {
  const dummyVendorId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyServiceId = new mongoose.Types.ObjectId();

  const originalFindService = Service.findById;
  const originalFindVendor = Vendor.findOne;

  let savedService = null;
  Service.findById = async () => ({
    _id: dummyServiceId,
    vendor: dummyVendorId,
    price: 500,
    save: async function () { savedService = this; }
  });
  Vendor.findOne = async () => ({ _id: dummyVendorId, user: dummyUserId });

  const req = {
    params: { id: dummyServiceId.toString() },
    user: { _id: dummyUserId, role: 'vendor' },
    body: {
      price: 1000,
      pricingUnit: 'per_person',
      adultPrice: 1000,
      childPrice: 500,
      groupPricing: [{ minGroupSize: 5, maxGroupSize: 10, pricePerGroup: 4000 }],
      extraCharges: [{ name: 'Monastery Entrance Fee', amount: 200 }]
    }
  };
  const res = createMockRes();
  await serviceController.updateServicePricing(req, res);

  Service.findById = originalFindService;
  Vendor.findOne = originalFindVendor;

  assert.equal(res.statusCode, 200);
  assert.equal(savedService.price, 1000);
  assert.equal(savedService.childPrice, 500);
  assert.equal(savedService.groupPricing.length, 1);
  assert.equal(savedService.extraCharges.length, 1);
});

test('AVAILABILITY: 3. Service availability configuration sets capacity, days, and time slots', async () => {
  const dummyVendorId = new mongoose.Types.ObjectId();
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyServiceId = new mongoose.Types.ObjectId();

  const originalFindService = Service.findById;
  const originalFindVendor = Vendor.findOne;

  let savedService = null;
  Service.findById = async () => ({
    _id: dummyServiceId,
    vendor: dummyVendorId,
    save: async function () { savedService = this; }
  });
  Vendor.findOne = async () => ({ _id: dummyVendorId, user: dummyUserId });

  const req = {
    params: { id: dummyServiceId.toString() },
    user: { _id: dummyUserId, role: 'vendor' },
    body: {
      dailyCapacity: 25,
      minBookingCapacity: 2,
      maxBookingCapacity: 12,
      operatingDays: ['monday', 'wednesday', 'friday', 'saturday'],
      timeSlots: [
        { startTime: '08:30', endTime: '12:30', maxCapacity: 12 },
        { startTime: '13:30', endTime: '17:30', maxCapacity: 12 }
      ]
    }
  };
  const res = createMockRes();
  await serviceController.updateServiceAvailability(req, res);

  Service.findById = originalFindService;
  Vendor.findOne = originalFindVendor;

  assert.equal(res.statusCode, 200);
  assert.equal(savedService.dailyCapacity, 25);
  assert.equal(savedService.minBookingCapacity, 2);
  assert.equal(savedService.operatingDays.length, 4);
  assert.equal(savedService.timeSlots.length, 2);
});

// ============================================================================
// SECTION 6: ECO-TOURISM & ECO-BADGES
// ============================================================================

test('ECO-BADGE: 1. Model validates badge tiers, slug, and criteria', async () => {
  const badge = new EcoBadge({
    name: 'Sustainable Tourism Partner',
    slug: 'sustainable-tourism-partner',
    tier: 'gold',
    description: 'Awarded to operators maintaining 100% renewable energy and community profit-sharing.',
    criteria: [
      'Solar-powered or electric propulsion vessels',
      'At least 75% local guide employment',
      'Zero single-use plastics on tour'
    ]
  });
  const err = await badge.validate().catch(e => e);
  assert.ok(!(err instanceof Error));
  assert.equal(badge.tier, 'gold');
  assert.equal(badge.isActive, true);
});

test('ECO-BADGE: 2. Vendor applyForEcoBadge requires evidence documents and records history', async () => {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();
  const dummyBadgeId = new mongoose.Types.ObjectId();

  const originalFindVendor = Vendor.findOne;
  const originalFindBadge = EcoBadge.findById;
  const originalFindApp = EcoBadgeApplication.findOne;
  const originalCreateApp = EcoBadgeApplication.create;
  const originalCreateHist = EcoBadgeHistory.create;

  Vendor.findOne = async () => ({ _id: dummyVendorId, user: dummyUserId });
  EcoBadge.findById = async () => ({ _id: dummyBadgeId, name: 'Eco-Friendly', isActive: true });
  EcoBadgeApplication.findOne = async () => null; // No pending app

  let appPayload = null;
  EcoBadgeApplication.create = async (p) => { appPayload = p; return { ...p, _id: new mongoose.Types.ObjectId() }; };
  EcoBadgeHistory.create = async () => ({});

  const req = {
    user: { _id: dummyUserId, role: 'vendor' },
    body: {
      badgeId: dummyBadgeId.toString(),
      sustainabilityPractices: {
        wasteManagement: 'All trash collected and sorted at marine dock recycling center',
        waterConservation: 'Greywater filtration installed on passenger boats'
      },
      evidenceDocuments: [
        { title: 'Waste Management Contract', fileUrl: '/uploads/docs/waste-contract.pdf' }
      ]
    }
  };
  const res = createMockRes();
  await ecoBadgeController.applyForEcoBadge(req, res);

  Vendor.findOne = originalFindVendor;
  EcoBadge.findById = originalFindBadge;
  EcoBadgeApplication.findOne = originalFindApp;
  EcoBadgeApplication.create = originalCreateApp;
  EcoBadgeHistory.create = originalCreateHist;

  assert.equal(res.statusCode, 201);
  assert.equal(appPayload.status, 'submitted');
  assert.equal(appPayload.evidenceDocuments.length, 1);
});

test('ECO-BADGE: 3. Admin approval awards badge to vendor and sets ecoBadgeTier', async () => {
  const dummyAdminId = new mongoose.Types.ObjectId();
  const dummyVendorId = new mongoose.Types.ObjectId();
  const dummyBadgeId = new mongoose.Types.ObjectId();
  const dummyAppId = new mongoose.Types.ObjectId();

  const originalFindApp = EcoBadgeApplication.findById;
  const originalFindVendor = Vendor.findById;
  const originalHistory = EcoBadgeHistory.create;

  let savedApp = null;
  EcoBadgeApplication.findById = () => ({
    populate: () => ({
      populate: async () => ({
        _id: dummyAppId,
        vendor: { _id: dummyVendorId },
        badge: { _id: dummyBadgeId, tier: 'gold' },
        status: 'submitted',
        save: async function () { savedApp = this; }
      })
    })
  });

  let savedVendor = null;
  Vendor.findById = async () => ({
    _id: dummyVendorId,
    ecoCertification: false,
    ecoBadgeTier: 'none',
    ecoBadges: [],
    save: async function () { savedVendor = this; }
  });
  EcoBadgeHistory.create = async () => ({});

  const req = {
    params: { id: dummyAppId.toString() },
    user: { _id: dummyAdminId, role: 'admin' },
    body: { validUntilMonths: 12, notes: 'Solar boat audit verified on site' }
  };
  const res = createMockRes();
  await ecoBadgeController.approveBadgeApplication(req, res);

  EcoBadgeApplication.findById = originalFindApp;
  Vendor.findById = originalFindVendor;
  EcoBadgeHistory.create = originalHistory;

  assert.equal(res.statusCode, 200);
  assert.equal(savedApp.status, 'approved');
  assert.ok(savedApp.validUntil instanceof Date);
  assert.equal(savedVendor.ecoCertification, true);
  assert.equal(savedVendor.ecoBadgeTier, 'gold');
  assert.ok(savedVendor.ecoBadges.includes(dummyBadgeId));
});

// ============================================================================
// SECTION 7: END-TO-END HTTP INTEGRATION & SWAGGER VERIFICATION
// ============================================================================

test('HTTP: GET /api/v1/destinations returns 200 with structured pagination', async () => {
  const origCount = Destination.countDocuments;
  const origFind = Destination.find;
  Destination.countDocuments = async () => 1;
  Destination.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: async () => [{ _id: '654321000000000000000001', name: 'Lake Tana', status: 'published' }]
        })
      })
    })
  });

  const res = await request(app).get('/api/v1/destinations');
  Destination.countDocuments = origCount;
  Destination.find = origFind;

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.pagination);
});

test('HTTP: GET /api/v1/categories returns 200 with category list', async () => {
  const origFind = Category.find;
  Category.find = () => ({
    sort: () => ({
      populate: async () => [{ _id: '654321000000000000000002', name: 'Boat Tours', isActive: true }]
    })
  });

  const res = await request(app).get('/api/v1/categories');
  Category.find = origFind;

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('HTTP: GET /api/v1/eco-badges returns 200 with eco-badge list', async () => {
  const origFind = EcoBadge.find;
  EcoBadge.find = () => ({
    sort: async () => [{ _id: '654321000000000000000003', name: 'Eco-Aware', tier: 'bronze', isActive: true }]
  });

  const res = await request(app).get('/api/v1/eco-badges');
  EcoBadge.find = origFind;

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
});

test('HTTP: GET /api/v1/services returns 200 with paginated marketplace search', async () => {
  const origVendorFind = Vendor.find;
  const origCount = Service.countDocuments;
  const origFind = Service.find;

  Vendor.find = () => ({ select: async () => [{ _id: '654321000000000000000004' }] });
  Service.countDocuments = async () => 1;
  Service.find = () => ({
    sort: () => ({
      skip: () => ({
        limit: () => ({
          populate: () => ({
            populate: () => ({
              populate: () => ({
                populate: async () => [{ _id: '654321000000000000000005', title: 'Sunset Boat Tour', price: 500 }]
              })
            })
          })
        })
      })
    })
  });

  const res = await request(app).get('/api/v1/services?limit=4');
  Vendor.find = origVendorFind;
  Service.countDocuments = origCount;
  Service.find = origFind;

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.pagination);
});

test('SWAGGER: OpenAPI 3.0 spec includes new destination, category, vendor, service, and eco-badge paths', async () => {
  const res = await request(app).get('/api-docs.json');
  assert.equal(res.status, 200);
  assert.equal(res.body.openapi, '3.0.3');
  const paths = Object.keys(res.body.paths);

  assert.ok(paths.some(p => p.includes('/destinations')), 'OpenAPI spec must document /destinations');
  assert.ok(paths.some(p => p.includes('/categories')), 'OpenAPI spec must document /categories');
  assert.ok(paths.some(p => p.includes('/vendors')), 'OpenAPI spec must document /vendors');
  assert.ok(paths.some(p => p.includes('/services')), 'OpenAPI spec must document /services');
  assert.ok(paths.some(p => p.includes('/eco-badges')), 'OpenAPI spec must document /eco-badges');
});
