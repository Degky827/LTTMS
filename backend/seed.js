/**
 * Lake Tana Tourism Management System (LTTMS V1)
 * Comprehensive Development Seed Script
 *
 * Populates a complete, realistic tourism dataset covering:
 * - 5 target user roles (super_admin, admin, support, vendor, tourist)
 * - Approved and certified eco-vendors
 * - Standard tourism categories and Lake Tana destinations
 * - Published services with pricing, duration, and eco-features
 * - Realistic bookings with price/currency snapshots
 * - Successful payment and 5% platform commission transactions
 * - Verified reviews with category ratings and vendor replies
 * - In-app messages, notifications, support tickets, and audit trails
 *
 * Usage:
 *   node backend/seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Category = require('./models/Category');
const Destination = require('./models/Destination');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const CommissionTransaction = require('./models/CommissionTransaction');
const Review = require('./models/Review');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const SupportTicket = require('./models/SupportTicket');
const AuditLog = require('./models/AuditLog');

async function seedData() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lttms';

  // Production safety guard: Block accidental execution in production environment
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force-prod')) {
    console.error('CRITICAL: Seed execution blocked in production environment. Use --force-prod if intended.');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log(' LTTMS V1 — Database Development Seeder');
  console.log(` Target URI: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
  console.log('='.repeat(70));

  try {
    await mongoose.connect(uri);
    console.log('[OK] Connected to MongoDB for seeding.');

    // Clean existing seed collections
    console.log('[...] Purging previous development records...');
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Category.deleteMany({}),
      Destination.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      CommissionTransaction.deleteMany({}),
      Review.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      SupportTicket.deleteMany({})
    ]);

    // =========================================================================
    // 1. SEED ALL 5 USER ROLES
    // =========================================================================
    console.log('\n[1/10] Seeding 5 Target User Roles...');

    const superAdmin = await User.create({
      name: 'Desalegn SuperAdmin',
      email: 'superadmin@laketana.com',
      password: 'password123',
      role: 'super_admin',
      phone: '+251918000001',
      isEmailVerified: true,
      isActive: true
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@laketana.com',
      password: 'password123',
      role: 'admin',
      phone: '+251918000002',
      isEmailVerified: true,
      isActive: true
    });

    const support = await User.create({
      name: 'Customer Support Lead',
      email: 'support@laketana.com',
      password: 'password123',
      role: 'support',
      phone: '+251918000003',
      isEmailVerified: true,
      isActive: true
    });

    const vendorUser1 = await User.create({
      name: 'Kassahun Tadesse',
      email: 'vendor@laketana.com',
      password: 'password123',
      role: 'vendor',
      phone: '+251918112233',
      isEmailVerified: true,
      isActive: true
    });

    const vendorUser2 = await User.create({
      name: 'Zege Peninsula Eco Guides',
      email: 'zegeguides@laketana.com',
      password: 'password123',
      role: 'vendor',
      phone: '+251918445566',
      isEmailVerified: true,
      isActive: true
    });

    const tourist1 = await User.create({
      name: 'Dawit Getachew',
      email: 'tourist@laketana.com',
      password: 'password123',
      role: 'tourist',
      phone: '+251911998877',
      isEmailVerified: true,
      isActive: true,
      avatar: '/uploads/avatars/tourist1.jpg',
      bio: 'Eco-traveler and Ethiopian history enthusiast.'
    });

    const tourist2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena@worldtraveler.com',
      password: 'password123',
      role: 'tourist',
      phone: '+447911123456',
      isEmailVerified: true,
      isActive: true
    });

    console.log(`[OK] 7 users seeded across all 5 roles.`);

    // =========================================================================
    // 2. SEED VENDORS
    // =========================================================================
    console.log('\n[2/10] Seeding Certified Tourism Vendors...');

    const vendor1 = await Vendor.create({
      user: vendorUser1._id,
      businessName: 'Lake Tana Eco-Boat Tours',
      businessType: 'boat_operator',
      location: 'Bahir Dar Port & Marina, Lake Tana',
      address: 'Kebele 03, Marine Drive, Bahir Dar',
      city: 'Bahir Dar',
      phone: '+251918112233',
      description: 'Solar-assisted and modern motor boats licensed for monastery island expeditions and sunset cruises.',
      ecoCertification: true,
      ecoBadgeTier: 'gold',
      taxId: 'TIN-00982312',
      status: 'approved',
      approvedAt: new Date()
    });

    const vendor2 = await Vendor.create({
      user: vendorUser2._id,
      businessName: 'Zege Heritage & Monastery Guides Association',
      businessType: 'guide',
      location: 'Zege Peninsula Forest Reserve',
      address: 'Afaf Port Entrance, Zege',
      city: 'Bahir Dar Zuria',
      phone: '+251918445566',
      description: 'Certified local guides dedicated to coffee forest conservation and 14th-century church heritage.',
      ecoCertification: true,
      ecoBadgeTier: 'platinum',
      taxId: 'TIN-00445588',
      status: 'approved',
      approvedAt: new Date()
    });

    console.log(`[OK] 2 certified vendors created.`);

    // =========================================================================
    // 3. SEED CATEGORIES
    // =========================================================================
    console.log('\n[3/10] Seeding Tourism Categories...');

    const catMonastery = await Category.create({
      name: 'Island Monasteries & Heritage',
      slug: 'island-monasteries',
      description: 'Ancient 14th to 17th-century Ethiopian Orthodox Christian monasteries on Lake Tana islands.',
      icon: 'church',
      displayOrder: 1,
      isActive: true
    });

    const catBoat = await Category.create({
      name: 'Lake Cruises & Traditional Boating',
      slug: 'lake-cruises-boating',
      description: 'Motorboat charters, sunset cruises, and traditional papyrus Tankwa boat excursions.',
      icon: 'boat',
      displayOrder: 2,
      isActive: true
    });

    const catWaterfall = await Category.create({
      name: 'Waterfalls & Trekking',
      slug: 'waterfalls-trekking',
      description: 'Hikes to the spectacular Tis Abay (Blue Nile Falls) and surrounding rural landscapes.',
      icon: 'waterfall',
      displayOrder: 3,
      isActive: true
    });

    const catBird = await Category.create({
      name: 'Bird Watching & Biosphere Reserve',
      slug: 'bird-watching',
      description: 'UNESCO Biosphere birdwatching tours with over 300 registered wetland bird species.',
      icon: 'bird',
      displayOrder: 4,
      isActive: true
    });

    console.log(`[OK] 4 categories created.`);

    // =========================================================================
    // 4. SEED DESTINATIONS
    // =========================================================================
    console.log('\n[4/10] Seeding Lake Tana Destinations...');

    const destZege = await Destination.create({
      name: 'Zege Peninsula',
      slug: 'zege-peninsula',
      description: 'A densely forested peninsula hosting ancient monasteries like Ura Kidane Mehret, indigenous coffee forests, and vervet monkeys.',
      location: {
        type: 'Point',
        coordinates: [37.3308, 11.6931],
        address: 'Zege Peninsula, Lake Tana'
      },
      highlights: [
        'Ura Kidane Mehret 14th Century Murals',
        'Traditional wild coffee harvesting',
        'Lush indigenous rainforest canopy'
      ],
      travelTips: [
        'Modest attire required to enter monastery grounds',
        'Allow 45 minutes boat ride from Bahir Dar port'
      ],
      status: 'published',
      isFeatured: true,
      destinationType: 'monastery',
      coverImage: '/images/monastery.jpg'
    });

    const destFalls = await Destination.create({
      name: 'Blue Nile Falls (Tis Abay)',
      slug: 'blue-nile-falls',
      description: 'Known locally as "Smoking Water", a dramatic 42-meter high waterfall downstream of Lake Tana.',
      location: {
        type: 'Point',
        coordinates: [37.5933, 11.4853],
        address: 'Tis Abay Village, 30km South of Bahir Dar'
      },
      highlights: [
        '17th-century Portuguese Stone Bridge',
        'Stunning gorge crossing and rainbow mist'
      ],
      travelTips: [
        'Best water volume during August to November rainy season',
        'Wear sturdy walking shoes for rocky trail'
      ],
      status: 'published',
      isFeatured: true,
      destinationType: 'waterfall',
      coverImage: '/images/waterfall.jpg'
    });

    const destKibran = await Destination.create({
      name: 'Kibran Gebriel Island Monastery',
      slug: 'kibran-gebriel',
      description: '14th-century monastery island surrounded by towering acacia trees and housing ancient manuscripts.',
      location: {
        type: 'Point',
        coordinates: [37.3622, 11.6425],
        address: 'South Lake Tana, Bahir Dar'
      },
      highlights: [
        'Ancient library of parchment manuscripts',
        'Historic 14th-century stone church',
        'Tranquil island birdlife'
      ],
      travelTips: [
        'Respect sacred monastic regulations',
        'Combine with boat tour from Bahir Dar pier'
      ],
      status: 'published',
      isFeatured: true,
      destinationType: 'monastery',
      coverImage: '/images/Boat.jpg'
    });

    const destTanaQirqos = await Destination.create({
      name: 'Tana Qirqos Historic Island',
      slug: 'tana-qirqos',
      description: 'Sacred island steeped in ancient biblical traditions and early Ethiopian ecclesiastical history.',
      location: {
        type: 'Point',
        coordinates: [37.4819, 11.8644],
        address: 'Eastern Lake Tana'
      },
      highlights: [
        'Sacred stone altars from ancient times',
        'Centuries of monastic sanctuary',
        'Panoramic views across Lake Tana'
      ],
      travelTips: [
        'Full day boat charter recommended',
        'Carry sun protection and drinking water'
      ],
      status: 'published',
      isFeatured: true,
      destinationType: 'cultural_site',
      coverImage: '/images/LakeTana.jpg'
    });

    console.log(`[OK] 2 primary destinations created.`);

    // =========================================================================
    // 5. SEED TOURISM SERVICES
    // =========================================================================
    console.log('\n[5/10] Seeding Tourism Services...');

    const svcZege = await Service.create({
      vendor: vendor1._id,
      categoryRef: catMonastery._id,
      destination: destZege._id,
      title: 'Full-Day Zege Peninsula & Monastery Island Expedition',
      category: 'monastery',
      description: 'Comprehensive guided cruise visiting Ura Kidane Mehret and Azwa Maryam monasteries with coffee forest nature walk.',
      price: 1850,
      currency: 'ETB',
      duration: '6 hours',
      maxCapacity: 12,
      location: 'Lake Tana Islands & Zege',
      highlights: [
        'Private certified boat with life jackets',
        'English & Amharic speaking local guide',
        'Traditional Ethiopian coffee ceremony included'
      ],
      ecoFriendly: true,
      ecoFeatures: [
        'Zero single-use plastic policy',
        'Engine noise reduction dampener',
        'Community guide revenue sharing'
      ],
      images: ['/uploads/services/zege-boat-tour.jpg'],
      status: 'published',
      rating: 4.9,
      reviewCount: 18
    });

    const svcTankwa = await Service.create({
      vendor: vendor1._id,
      categoryRef: catBoat._id,
      title: 'Traditional Papyrus Tankwa Boat Sunset Experience',
      category: 'boat',
      description: 'Glide quietly along the southern shore of Lake Tana on an authentic papyrus reed boat guided by heritage boat builders.',
      price: 650,
      currency: 'ETB',
      duration: '2 hours',
      maxCapacity: 4,
      location: 'Bahir Dar Shoreline',
      highlights: [
        'Authentic hand-woven Tankwa papyrus vessel',
        'Birdwatching near Pelican Island',
        'Spectacular Lake Tana sunset vista'
      ],
      ecoFriendly: true,
      ecoFeatures: [
        '100% human-powered (zero emissions)',
        'Preserves indigenous reed boat craftsmanship'
      ],
      images: ['/uploads/services/tankwa-sunset.jpg'],
      status: 'published',
      rating: 4.8,
      reviewCount: 9
    });

    const svcTrek = await Service.create({
      vendor: vendor2._id,
      categoryRef: catWaterfall._id,
      destination: destFalls._id,
      title: 'Blue Nile Falls Guided Hike & Countryside Trek',
      category: 'waterfall',
      description: 'Guided 3-hour walking trail across the historic Portuguese Bridge, village trails, and misty viewpoints of Tis Abay.',
      price: 1200,
      currency: 'ETB',
      duration: '4 hours',
      maxCapacity: 15,
      location: 'Tis Abay Village',
      highlights: [
        'Crossing the 1626 Portuguese stone bridge',
        'Panoramic view of the 400m wide falls spray',
        'Local village community visit'
      ],
      ecoFriendly: true,
      ecoFeatures: [
        'Footpath conservation maintenance fee included',
        'Village cooperative guide partnership'
      ],
      images: ['/uploads/services/tis-abay-hike.jpg'],
      status: 'published',
      rating: 4.7,
      reviewCount: 12
    });

    console.log(`[OK] 3 published services created.`);

    // =========================================================================
    // 6. SEED BOOKINGS
    // =========================================================================
    console.log('\n[6/10] Seeding Historical & Upcoming Bookings...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const booking1 = await Booking.create({
      bookingReference: 'LTTMS-20261104-ZG01',
      user: tourist1._id,
      service: svcZege._id,
      vendor: vendor1._id,
      date: tomorrow,
      guests: 2,
      totalPrice: 3700,
      priceSnapshot: 1850,
      serviceTitleSnapshot: svcZege.title,
      currency: 'ETB',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const booking2 = await Booking.create({
      bookingReference: 'LTTMS-20261029-TK02',
      user: tourist1._id,
      service: svcTankwa._id,
      vendor: vendor1._id,
      date: pastDate,
      guests: 1,
      totalPrice: 650,
      priceSnapshot: 650,
      serviceTitleSnapshot: svcTankwa.title,
      currency: 'ETB',
      status: 'completed',
      paymentStatus: 'paid'
    });

    console.log(`[OK] 2 bookings created (1 confirmed, 1 completed).`);

    // =========================================================================
    // 7. SEED PAYMENTS & COMMISSIONS
    // =========================================================================
    console.log('\n[7/10] Seeding Payments and Commission Transactions...');

    const payment1 = await Payment.create({
      txRef: 'LTTMS-TX-20261104-001',
      booking: booking1._id,
      user: tourist1._id,
      vendor: vendor1._id,
      amount: 3700,
      currency: 'ETB',
      status: 'successful',
      chapaReference: 'CHP-REF-99882211',
      paymentMethod: 'telebirr',
      verifiedAt: new Date()
    });

    // 5% platform commission
    const commissionAmount = 3700 * 0.05; // 185 ETB
    const vendorPayout = 3700 - commissionAmount; // 3515 ETB

    await CommissionTransaction.create({
      booking: booking1._id,
      payment: payment1._id,
      vendor: vendor1._id,
      grossAmount: 3700,
      commissionRate: 0.05,
      commissionAmount,
      vendorPayoutAmount: vendorPayout,
      currency: 'ETB',
      status: 'collected'
    });

    console.log(`[OK] Payment and 5% commission recorded (Commission: ${commissionAmount} ETB).`);

    // =========================================================================
    // 8. SEED VERIFIED REVIEWS
    // =========================================================================
    console.log('\n[8/10] Seeding Verified Tourist Reviews...');

    await Review.create({
      user: tourist1._id,
      service: svcTankwa._id,
      booking: booking2._id,
      rating: 5,
      categories: {
        cleanliness: 5,
        ecoFriendly: 5,
        hospitality: 5,
        value: 5
      },
      comment: 'An unforgettable, peaceful journey on Lake Tana. Floating on the traditional papyrus boat was pure magic.',
      isVerifiedBuyer: true,
      vendorReply: 'Ameseginalehu Dawit! We are honored to preserve our papyrus boat culture with mindful travelers like you.',
      repliedAt: new Date()
    });

    console.log(`[OK] 1 verified review with vendor reply created.`);

    // =========================================================================
    // 9. SEED MESSAGING, NOTIFICATIONS & SUPPORT TICKETS
    // =========================================================================
    console.log('\n[9/10] Seeding Messages, Notifications, and Support Tickets...');

    // Message between tourist and vendor
    await Message.create({
      sender: tourist1._id,
      receiver: vendorUser1._id,
      booking: booking1._id,
      subject: 'Inquiry regarding departure location',
      content: 'Hello Kassahun, should we meet directly at the Marina gate 2 at 8:30 AM tomorrow?',
      isRead: true,
      readAt: new Date()
    });

    await Message.create({
      sender: vendorUser1._id,
      receiver: tourist1._id,
      booking: booking1._id,
      subject: 'Re: Departure confirmation',
      content: 'Yes exactly Dawit, Gate 2 beside the tourist information office. Captain Samuel will be awaiting you!',
      isRead: false
    });

    // Notification for tourist
    await Notification.create({
      recipient: tourist1._id,
      type: 'booking',
      title: 'Booking Confirmed!',
      message: 'Your Zege Peninsula expedition has been confirmed for tomorrow at 8:30 AM.',
      relatedResource: {
        resourceType: 'Booking',
        resourceId: booking1._id
      },
      actionUrl: `/bookings/${booking1._id}`,
      isRead: false
    });

    // Support ticket
    await SupportTicket.create({
      user: tourist2._id,
      subject: 'Inquiry on monastery entrance ticket currency',
      description: 'Does the church entrance require cash Ethiopian Birr or can card/telebirr be accepted at the gate?',
      category: 'booking',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: support._id
    });

    console.log(`[OK] Communication records created.`);

    // =========================================================================
    // 10. SEED AUDIT LOG
    // =========================================================================
    console.log('\n[10/10] Seeding Immutable Audit Logs...');

    await AuditLog.create({
      actor: superAdmin._id,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'System',
      targetId: 'LTTMS_V1',
      metadata: { version: '1.0.0', environment: process.env.NODE_ENV || 'development' },
      ipAddress: '127.0.0.1',
      userAgent: 'LTTMS-Seeder/1.0'
    });

    await AuditLog.create({
      actor: admin._id,
      action: 'VENDOR_APPROVED',
      targetType: 'Vendor',
      targetId: vendor1._id,
      newState: { status: 'approved', ecoBadgeTier: 'gold' },
      metadata: { reason: 'Eco-certification verified by Bahir Dar Tourism Bureau' },
      ipAddress: '127.0.0.1'
    });

    console.log(`[OK] Audit trail entries recorded.`);

    console.log('\n' + '='.repeat(70));
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Credentials:');
    console.log('   Super Admin : superadmin@laketana.com / password123');
    console.log('   Admin       : admin@laketana.com      / password123');
    console.log('   Support     : support@laketana.com    / password123');
    console.log('   Vendor      : vendor@laketana.com     / password123');
    console.log('   Tourist     : tourist@laketana.com    / password123');
    console.log('='.repeat(70));

    process.exit(0);
  } catch (err) {
    console.error('\n[ERROR] Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
