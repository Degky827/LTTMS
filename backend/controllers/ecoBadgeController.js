const EcoBadge = require('../models/EcoBadge');
const EcoBadgeApplication = require('../models/EcoBadgeApplication');
const EcoBadgeHistory = require('../models/EcoBadgeHistory');
const Vendor = require('../models/Vendor');
const logger = require('../utils/logger');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    List all defined eco-badges and criteria
// @route   GET /api/v1/eco-badges
// @access  Public
exports.getEcoBadges = async (req, res, next) => {
  try {
    const filter = {};
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

    if (!isAdmin) {
      filter.isActive = true;
    }

    const badges = await EcoBadge.find(filter).sort({ tier: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create eco-badge definition (Admin only)
// @route   POST /api/v1/eco-badges
// @access  Private (Admin, Super Admin)
exports.createEcoBadge = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.slug) {
      payload.slug = slugify(payload.name);
    } else {
      payload.slug = slugify(payload.slug);
    }

    const badge = await EcoBadge.create(payload);

    logger.info({
      action: 'eco_badge.create',
      badgeId: badge._id,
      name: badge.name,
      adminId: req.user._id
    }, 'Eco badge definition created');

    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get badges awarded to a specific vendor
// @route   GET /api/v1/eco-badges/vendor/:id
// @access  Public
exports.getVendorEcoBadges = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('ecoBadges')
      .select('businessName ecoCertification ecoBadgeTier ecoBadges');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Also fetch active applications
    const approvedApplications = await EcoBadgeApplication.find({
      vendor: vendor._id,
      status: 'approved'
    }).populate('badge');

    res.status(200).json({
      success: true,
      data: {
        vendorId: vendor._id,
        businessName: vendor.businessName,
        ecoCertification: vendor.ecoCertification,
        ecoBadgeTier: vendor.ecoBadgeTier,
        badges: approvedApplications.map(app => ({
          badge: app.badge,
          validUntil: app.validUntil,
          approvedAt: app.reviewedAt
        }))
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Apply for an eco-badge
// @route   POST /api/v1/eco-badges/applications
// @access  Private (Vendor)
exports.applyForEcoBadge = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const { badgeId, sustainabilityPractices, evidenceDocuments } = req.body;
    const badge = await EcoBadge.findById(badgeId);
    if (!badge || !badge.isActive) {
      return res.status(404).json({ success: false, message: 'Eco badge not found or not active' });
    }

    // Check if an application is already under review
    const pendingApp = await EcoBadgeApplication.findOne({
      vendor: vendor._id,
      badge: badge._id,
      status: { $in: ['submitted', 'under_review'] }
    });

    if (pendingApp) {
      return res.status(400).json({
        success: false,
        message: 'An application for this badge is already currently under review'
      });
    }

    const application = await EcoBadgeApplication.create({
      vendor: vendor._id,
      badge: badge._id,
      sustainabilityPractices,
      evidenceDocuments,
      status: 'submitted'
    });

    await EcoBadgeHistory.create({
      vendor: vendor._id,
      badge: badge._id,
      action: 'applied',
      actor: userId,
      notes: `Applied for ${badge.name} badge with ${evidenceDocuments.length} evidence document(s)`
    });

    logger.info({
      action: 'eco_badge.applied',
      applicationId: application._id,
      vendorId: vendor._id,
      badgeId: badge._id
    }, 'Vendor applied for eco-badge');

    res.status(201).json({
      success: true,
      message: 'Eco-badge application submitted for review',
      data: application
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current vendor's eco-badge applications
// @route   GET /api/v1/eco-badges/applications/me
// @access  Private (Vendor)
exports.getMyBadgeApplications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const applications = await EcoBadgeApplication.find({ vendor: vendor._id })
      .populate('badge')
      .sort({ createdAt: -1 });

    const history = await EcoBadgeHistory.find({ vendor: vendor._id })
      .populate('badge')
      .populate('actor', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        applications,
        history
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    List all eco-badge applications (Admin only)
// @route   GET /api/v1/eco-badges/applications
// @access  Private (Admin, Super Admin)
exports.getAdminBadgeApplications = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const total = await EcoBadgeApplication.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const applications = await EcoBadgeApplication.find(filter)
      .populate('vendor', 'businessName businessType location')
      .populate('badge')
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      totalPages,
      limit,
      data: applications
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve eco-badge application (Admin only)
// @route   PATCH /api/v1/eco-badges/applications/:id/approve
// @access  Private (Admin, Super Admin)
exports.approveBadgeApplication = async (req, res, next) => {
  try {
    const application = await EcoBadgeApplication.findById(req.params.id)
      .populate('badge')
      .populate('vendor');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const validityMonths = req.body.validUntilMonths || 12;
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + validityMonths);

    application.status = 'approved';
    application.reviewer = req.user._id;
    application.reviewedAt = new Date();
    application.validUntil = validUntil;
    await application.save();

    // Award badge to vendor and update ecoBadgeTier & certification
    const vendor = await Vendor.findById(application.vendor._id);
    if (vendor) {
      vendor.ecoCertification = true;
      if (application.badge.tier) {
        vendor.ecoBadgeTier = application.badge.tier;
      }
      if (!vendor.ecoBadges.includes(application.badge._id)) {
        vendor.ecoBadges.push(application.badge._id);
      }
      await vendor.save();
    }

    await EcoBadgeHistory.create({
      vendor: application.vendor._id,
      badge: application.badge._id,
      action: 'approved',
      actor: req.user._id,
      notes: req.body.notes || `Eco-badge approved with validity until ${validUntil.toISOString().split('T')[0]}`
    });

    logger.info({
      action: 'eco_badge.approved',
      applicationId: application._id,
      vendorId: application.vendor._id,
      badgeId: application.badge._id,
      adminId: req.user._id
    }, 'Eco badge application approved by admin');

    res.status(200).json({
      success: true,
      message: 'Eco-badge application approved and badge awarded to vendor',
      data: application
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject eco-badge application (Admin only)
// @route   PATCH /api/v1/eco-badges/applications/:id/reject
// @access  Private (Admin, Super Admin)
exports.rejectBadgeApplication = async (req, res, next) => {
  try {
    const { rejectionReason, notes } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const application = await EcoBadgeApplication.findById(req.params.id)
      .populate('badge')
      .populate('vendor');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = 'rejected';
    application.reviewer = req.user._id;
    application.reviewedAt = new Date();
    application.rejectionReason = rejectionReason;
    await application.save();

    await EcoBadgeHistory.create({
      vendor: application.vendor._id,
      badge: application.badge._id,
      action: 'rejected',
      actor: req.user._id,
      notes: notes || rejectionReason
    });

    logger.info({
      action: 'eco_badge.rejected',
      applicationId: application._id,
      vendorId: application.vendor._id,
      reason: rejectionReason,
      adminId: req.user._id
    }, 'Eco badge application rejected by admin');

    res.status(200).json({
      success: true,
      message: 'Eco-badge application rejected',
      data: application
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
