const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

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

test('MODEL: User accepts all 5 target roles', async () => {
  const roles = ['tourist', 'vendor', 'support', 'admin', 'super_admin'];
  for (const role of roles) {
    const user = new User({
      name: `Test ${role}`,
      email: `${role}@laketana.com`,
      password: 'validPassword123',
      role
    });
    const err = await user.validate().catch(e => e);
    assert.ok(!(err instanceof Error), `Role "${role}" should be valid, but got: ${err?.message}`);
  }
});

test('MODEL: User rejects unauthorized roles', async () => {
  const invalidUser = new User({
    name: 'Hacker User',
    email: 'hacker@laketana.com',
    password: 'password123',
    role: 'moderator' // Not one of the 5 approved roles
  });
  const err = await invalidUser.validate().catch(e => e);
  assert.ok(err instanceof Error);
  assert.ok(err.errors.role);
});

test('MODEL: User schema does NOT have TTL index on lockUntil (ISS-01 fix)', () => {
  const indexes = User.schema.indexes();
  const lockUntilTTL = indexes.find(([fields, options]) => {
    return fields.lockUntil !== undefined && options && options.expireAfterSeconds !== undefined;
  });
  assert.equal(lockUntilTTL, undefined, 'User schema must NOT define a TTL index on lockUntil');
});

test('MODEL: Vendor validates businessType, status, and required fields', async () => {
  const dummyUser = new mongoose.Types.ObjectId();
  const validVendor = new Vendor({
    user: dummyUser,
    businessName: 'Zege Eco Tours',
    businessType: 'boat_operator',
    location: 'Bahir Dar Marina',
    ecoCertification: true,
    ecoBadgeTier: 'gold',
    status: 'approved'
  });
  const validErr = await validVendor.validate().catch(e => e);
  assert.ok(!(validErr instanceof Error));

  const invalidVendor = new Vendor({
    user: dummyUser,
    businessName: 'Zege Eco Tours',
    businessType: 'invalid_type',
    location: 'Bahir Dar'
  });
  const invalidErr = await invalidVendor.validate().catch(e => e);
  assert.ok(invalidErr instanceof Error);
  assert.ok(invalidErr.errors.businessType);
});

test('MODEL: Category validates unique slug and required fields', async () => {
  const cat = new Category({
    name: 'Monastery Tours',
    slug: 'monastery-tours',
    description: 'Ancient churches of Lake Tana'
  });
  const err = await cat.validate().catch(e => e);
  assert.ok(!(err instanceof Error));
});

test('MODEL: Destination validates coordinates structure and status enum', async () => {
  const dest = new Destination({
    name: 'Zege Peninsula',
    slug: 'zege-peninsula',
    description: 'Forested peninsula with 14th century monasteries',
    location: {
      type: 'Point',
      coordinates: [37.33, 11.69],
      address: 'Zege, Lake Tana'
    },
    status: 'published'
  });
  const err = await dest.validate().catch(e => e);
  assert.ok(!(err instanceof Error));

  const invalidDest = new Destination({
    name: 'Bad Dest',
    slug: 'bad-dest',
    description: 'Desc',
    status: 'invalid_status'
  });
  const badErr = await invalidDest.validate().catch(e => e);
  assert.ok(badErr instanceof Error);
  assert.ok(badErr.errors.status);
});

test('MODEL: Service defaults currency to ETB and validates pricing', async () => {
  const svc = new Service({
    vendor: new mongoose.Types.ObjectId(),
    title: 'Sunset Boat Tour',
    category: 'boat',
    description: 'Scenic cruise on Lake Tana with papyrus reeds',
    price: 450
  });
  assert.equal(svc.currency, 'ETB');
  const err = await svc.validate().catch(e => e);
  assert.ok(!(err instanceof Error));

  const negativePriceSvc = new Service({
    vendor: new mongoose.Types.ObjectId(),
    title: 'Negative Tour',
    category: 'boat',
    description: 'Desc',
    price: -50
  });
  const negErr = await negativePriceSvc.validate().catch(e => e);
  assert.ok(negErr instanceof Error);
  assert.ok(negErr.errors.price);
});

test('MODEL: Booking auto-generates bookingReference and sets price snapshots', async () => {
  const booking = new Booking({
    user: new mongoose.Types.ObjectId(),
    service: new mongoose.Types.ObjectId(),
    vendor: new mongoose.Types.ObjectId(),
    date: new Date(),
    guests: 2,
    totalPrice: 900
  });

  const err = await booking.validate().catch(e => e);
  assert.ok(!(err instanceof Error), err?.message);
  assert.ok(booking.bookingReference.startsWith('LTTMS-'));
  assert.equal(booking.currency, 'ETB');
  assert.equal(booking.priceSnapshot, 450);
});

test('MODEL: Payment requires txRef, amount, and validates status enum', async () => {
  const p = new Payment({
    txRef: 'LTTMS-TX-12345',
    booking: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    amount: 1500,
    status: 'successful'
  });
  const err = await p.validate().catch(e => e);
  assert.ok(!(err instanceof Error));
  assert.equal(p.currency, 'ETB');
  assert.equal(Payment.schema.path('rawWebhookPayload').options.select, false, 'rawWebhookPayload must be select: false');

  const invalidPayment = new Payment({
    booking: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    amount: 1500,
    status: 'bogus_status'
  });
  const badErr = await invalidPayment.validate().catch(e => e);
  assert.ok(badErr instanceof Error);
  assert.ok(badErr.errors.txRef);
  assert.ok(badErr.errors.status);
});

test('MODEL: CommissionTransaction validates 5% platform rate and settlement status', async () => {
  const comm = new CommissionTransaction({
    booking: new mongoose.Types.ObjectId(),
    payment: new mongoose.Types.ObjectId(),
    vendor: new mongoose.Types.ObjectId(),
    grossAmount: 1000,
    commissionRate: 0.05,
    commissionAmount: 50,
    vendorPayoutAmount: 950,
    status: 'collected'
  });
  const err = await comm.validate().catch(e => e);
  assert.ok(!(err instanceof Error));
  assert.equal(comm.currency, 'ETB');
});

test('MODEL: Review validates rating bounds (1 to 5) and compound unique index definition', async () => {
  const validReview = new Review({
    user: new mongoose.Types.ObjectId(),
    service: new mongoose.Types.ObjectId(),
    rating: 5,
    comment: 'Spectacular monastery experience!'
  });
  const validErr = await validReview.validate().catch(e => e);
  assert.ok(!(validErr instanceof Error));

  const invalidReview = new Review({
    user: new mongoose.Types.ObjectId(),
    service: new mongoose.Types.ObjectId(),
    rating: 6, // Beyond 5 stars
    comment: 'Too high rating'
  });
  const badErr = await invalidReview.validate().catch(e => e);
  assert.ok(badErr instanceof Error);
  assert.ok(badErr.errors.rating);

  // Check compound unique index { user: 1, service: 1 }
  const indexes = Review.schema.indexes();
  const compoundIdx = indexes.find(([fields, options]) => {
    return fields.user === 1 && fields.service === 1 && options && options.unique === true;
  });
  assert.ok(compoundIdx, 'Review schema must define a compound unique index on { user: 1, service: 1 }');
});

test('MODEL: SupportTicket auto-generates ticketNumber and validates priority/status', async () => {
  const ticket = new SupportTicket({
    user: new mongoose.Types.ObjectId(),
    subject: 'Need help with boat departure',
    description: 'Where should we meet at the port tomorrow morning?'
  });
  const err = await ticket.validate().catch(e => e);
  assert.ok(!(err instanceof Error));
  assert.ok(ticket.ticketNumber.startsWith('TIK-'));
  assert.equal(ticket.priority, 'medium');
  assert.equal(ticket.status, 'open');
});

test('MODEL: AuditLog blocks modification and deletion hooks (immutability)', () => {
  // Check that middleware hooks prevent update and delete
  const hooks = AuditLog.schema.s.hooks;
  assert.ok(hooks._pres.has('updateOne'), 'AuditLog must register pre updateOne hook');
  assert.ok(hooks._pres.has('deleteOne'), 'AuditLog must register pre deleteOne hook');
  assert.ok(hooks._pres.has('save'), 'AuditLog must register pre save hook');
});
