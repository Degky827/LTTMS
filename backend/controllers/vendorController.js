const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Service = require('../models/Service');
const VendorDocument = require('../models/VendorDocument');
const VendorVerificationHistory = require('../models/VendorVerificationHistory');
const { escapeRegex } = require('../shared/database/queryUtils');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Register or create vendor business profile
// @route   POST /api/v1/vendors/profile
// @access  Private (User)
exports.registerVendor = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Check if user already has a vendor profile
    const existingVendor = await Vendor.findOne({ user: userId });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'User already has a vendor profile'
      });
    }

    const payload = { ...req.body };
    payload.user = userId;
    payload.slug = slugify(payload.businessName);

    // Initial lifecycle status
    payload.status = 'pending';
    payload.verificationStatus = 'draft';

    // Prevent unauthorized privilege fields
    delete payload.ecoCertification;
    delete payload.ecoBadgeTier;
    delete payload.ecoBadges;
    delete payload.adminNotes;
    delete payload.rejectionReason;
    delete payload.approvedAt;
    delete payload.suspendedAt;

    const vendor = await Vendor.create(payload);

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'profile_submitted',
      previousStatus: null,
      newStatus: 'pending',
      actor: userId,
      notes: 'Initial vendor business profile created'
    });

    logger.info({
      action: 'vendor.profile.create',
      vendorId: vendor._id,
      businessName: vendor.businessName,
      userId
    }, 'Vendor business profile created');

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get current authenticated vendor's own full profile
// @route   GET /api/v1/vendors/profile/me
// @access  Private (Vendor)
exports.getMyVendorProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId })
      .populate('user', 'name email phone role')
      .populate('destinations', 'name slug');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found for this user'
      });
    }

    // Attach documents and verification history
    const documents = await VendorDocument.find({ vendor: vendor._id }).sort({ createdAt: -1 });
    const history = await VendorVerificationHistory.find({ vendor: vendor._id })
      .sort({ createdAt: -1 })
      .populate('actor', 'name role');

    res.status(200).json({
      success: true,
      data: {
        ...vendor.toObject(),
        documents,
        verificationHistory: history
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update current vendor's permitted business information
// @route   PATCH /api/v1/vendors/profile/me
// @access  Private (Vendor)
exports.updateMyVendorProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    const payload = { ...req.body };

    // Disallow privilege escalation
    delete payload.user;
    delete payload.status;
    delete payload.verificationStatus;
    delete payload.ecoCertification;
    delete payload.ecoBadgeTier;
    delete payload.ecoBadges;
    delete payload.adminNotes;
    delete payload.rejectionReason;
    delete payload.approvedAt;
    delete payload.suspendedAt;

    if (payload.businessName) {
      payload.slug = slugify(payload.businessName);
      const conflict = await Vendor.findOne({
        businessName: payload.businessName,
        _id: { $ne: vendor._id }
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Business name already in use by another vendor'
        });
      }
    }

    const updated = await Vendor.findByIdAndUpdate(vendor._id, payload, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone');

    logger.info({
      action: 'vendor.profile.update',
      vendorId: vendor._id,
      userId
    }, 'Vendor updated business profile');

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all vendors (Public gets approved only; Admin gets full search/filter)
// @route   GET /api/v1/vendors
// @access  Public (Filterable for Admin)
exports.getVendors = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const filter = {};

    if (!isAdmin) {
      // Public marketplace only shows approved vendors
      filter.status = 'approved';
    } else {
      if (req.query.status) filter.status = req.query.status;
      if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
    }

    if (req.query.businessType) {
      filter.businessType = req.query.businessType;
    }

    if (req.query.ecoCertification === 'true') {
      filter.ecoCertification = true;
    }

    if (req.query.search) {
      const safeRegex = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [
        { businessName: safeRegex },
        { location: safeRegex },
        { city: safeRegex },
        { description: safeRegex },
        { businessDescription: safeRegex }
      ];
    }

    const total = await Vendor.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const vendors = await Vendor.find(filter)
      .populate('user', 'name email phone')
      .populate('destinations', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: vendors.length,
      total,
      page,
      totalPages,
      limit,
      data: vendors,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single vendor by id
// @route   GET /api/v1/vendors/:id
// @access  Public
exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('destinations', 'name slug');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const isOwner = req.user && vendor.user && vendor.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

    // If not approved and not owner/admin, hide
    if (vendor.status !== 'approved' && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Include published services of this vendor
    const services = await Service.find({
      vendor: vendor._id,
      status: 'published'
    }).select('title slug price currency category duration rating coverImage images');

    res.status(200).json({
      success: true,
      data: {
        ...vendor.toObject(),
        services
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Vendor upload KYC verification document
// @route   POST /api/v1/vendors/verification/documents
// @access  Private (Vendor)
exports.uploadVerificationDocument = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const { documentType, fileUrl, originalFilename, mimeType, fileSize } = req.body;

    const document = await VendorDocument.create({
      vendor: vendor._id,
      documentType,
      fileUrl,
      originalFilename,
      mimeType,
      fileSize,
      status: 'submitted'
    });

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'document_submitted',
      previousStatus: vendor.verificationStatus,
      newStatus: vendor.verificationStatus,
      actor: userId,
      notes: `Uploaded KYC document: ${documentType} (${originalFilename})`
    });

    res.status(201).json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: document
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Vendor view KYC verification status and document list
// @route   GET /api/v1/vendors/verification/status
// @access  Private (Vendor)
exports.getVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const documents = await VendorDocument.find({ vendor: vendor._id }).sort({ createdAt: -1 });
    const history = await VendorVerificationHistory.find({ vendor: vendor._id })
      .sort({ createdAt: -1 })
      .populate('actor', 'name role');

    res.status(200).json({
      success: true,
      data: {
        vendorId: vendor._id,
        businessName: vendor.businessName,
        accountStatus: vendor.status,
        verificationStatus: vendor.verificationStatus,
        rejectionReason: vendor.rejectionReason,
        adminNotes: vendor.adminNotes,
        documents,
        history
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Vendor submit profile and documents for verification
// @route   POST /api/v1/vendors/verification/submit
// @access  Private (Vendor)
exports.submitVerification = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const vendor = await Vendor.findOne({ user: userId });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const documentsCount = await VendorDocument.countDocuments({ vendor: vendor._id });
    if (documentsCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one verification document (e.g. business license) before submitting for review'
      });
    }

    const previousStatus = vendor.verificationStatus;
    vendor.verificationStatus = 'under_review';
    vendor.status = 'under_review';
    await vendor.save();

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'profile_submitted',
      previousStatus,
      newStatus: 'under_review',
      actor: userId,
      notes: 'Vendor submitted full business profile and KYC documents for administrative review'
    });

    logger.info({
      action: 'vendor.verification.submit',
      vendorId: vendor._id,
      userId
    }, 'Vendor submitted profile for verification');

    res.status(200).json({
      success: true,
      message: 'Application submitted for review. An administrator will verify your credentials shortly.',
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve vendor application (Admin only)
// @route   PATCH /api/v1/vendors/:id/approve
// @access  Private (Admin, Super Admin)
exports.approveVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id).populate('user');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const previousStatus = vendor.status;
    vendor.status = 'approved';
    vendor.verificationStatus = 'approved';
    vendor.approvedAt = new Date();
    vendor.rejectionReason = null;
    vendor.reviewedBy = req.user._id;
    vendor.reviewedAt = new Date();
    if (req.body.notes) vendor.adminNotes = req.body.notes;

    await vendor.save();

    // Promote user role to 'vendor'
    if (vendor.user) {
      await User.findByIdAndUpdate(vendor.user._id, { role: 'vendor' });
    }

    // Approve all pending KYC documents
    await VendorDocument.updateMany(
      { vendor: vendor._id, status: 'submitted' },
      { status: 'approved', reviewer: req.user._id, reviewedAt: new Date() }
    );

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'approved',
      previousStatus,
      newStatus: 'approved',
      actor: req.user._id,
      notes: req.body.notes || 'Vendor application approved by administrator'
    });

    logger.info({
      action: 'vendor.approved',
      vendorId: vendor._id,
      adminId: req.user._id
    }, 'Vendor approved');

    if (vendor.user?.email) {
      await sendEmail({
        to: vendor.user.email,
        subject: 'Vendor Account Approved - Lake Tana Tourism',
        template: 'vendor-approved',
        context: {
          name: vendor.user.name,
          businessName: vendor.businessName,
          url: `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/vendor/dashboard`
        }
      }).catch(err => logger.warn({ err: err.message }, 'Failed to send approval email'));
    }

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject vendor application (Admin only)
// @route   PATCH /api/v1/vendors/:id/reject
// @access  Private (Admin, Super Admin)
exports.rejectVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required'
      });
    }

    const vendor = await Vendor.findById(id).populate('user');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const previousStatus = vendor.status;
    vendor.status = 'rejected';
    vendor.verificationStatus = 'rejected';
    vendor.rejectionReason = reason;
    vendor.reviewedBy = req.user._id;
    vendor.reviewedAt = new Date();
    if (notes) vendor.adminNotes = notes;

    await vendor.save();

    // Revert user role to 'tourist' if needed
    if (vendor.user && vendor.user.role === 'vendor') {
      await User.findByIdAndUpdate(vendor.user._id, { role: 'tourist' });
    }

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'rejected',
      previousStatus,
      newStatus: 'rejected',
      actor: req.user._id,
      reason,
      notes: notes || reason
    });

    logger.info({
      action: 'vendor.rejected',
      vendorId: vendor._id,
      reason,
      adminId: req.user._id
    }, 'Vendor rejected');

    if (vendor.user?.email) {
      await sendEmail({
        to: vendor.user.email,
        subject: 'Vendor Application Update - Lake Tana Tourism',
        template: 'vendor-rejected',
        context: {
          name: vendor.user.name,
          businessName: vendor.businessName,
          reason
        }
      }).catch(err => logger.warn({ err: err.message }, 'Failed to send rejection email'));
    }

    res.status(200).json({
      success: true,
      message: 'Vendor application rejected',
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Suspend vendor (Admin only; hides published services)
// @route   PATCH /api/v1/vendors/:id/suspend
// @access  Private (Admin, Super Admin)
exports.suspendVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A suspension reason is required'
      });
    }

    const vendor = await Vendor.findById(id).populate('user');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const previousStatus = vendor.status;
    vendor.status = 'suspended';
    vendor.suspendedReason = reason;
    vendor.suspendedAt = new Date();
    if (notes) vendor.adminNotes = notes;

    await vendor.save();

    // CRITICAL BUSINESS RULE: Suspended vendor services must become unavailable in public marketplace
    await Service.updateMany(
      { vendor: vendor._id },
      { availability: false }
    );

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'suspended',
      previousStatus,
      newStatus: 'suspended',
      actor: req.user._id,
      reason,
      notes: notes || reason
    });

    logger.warn({
      action: 'vendor.suspended',
      vendorId: vendor._id,
      reason,
      adminId: req.user._id
    }, 'Vendor suspended and active services made unavailable');

    res.status(200).json({
      success: true,
      message: 'Vendor suspended and public service listings deactivated',
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reactivate suspended vendor (Admin only)
// @route   PATCH /api/v1/vendors/:id/reactivate
// @access  Private (Admin, Super Admin)
exports.reactivateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id).populate('user');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const previousStatus = vendor.status;
    vendor.status = 'approved';
    vendor.suspendedReason = null;
    vendor.suspendedAt = null;
    await vendor.save();

    // Restore service availability
    await Service.updateMany(
      { vendor: vendor._id, status: 'published' },
      { availability: true }
    );

    // Restore user role if needed
    if (vendor.user) {
      await User.findByIdAndUpdate(vendor.user._id, { role: 'vendor' });
    }

    await VendorVerificationHistory.create({
      vendor: vendor._id,
      action: 'reactivated',
      previousStatus,
      newStatus: 'approved',
      actor: req.user._id,
      notes: req.body.notes || 'Vendor reactivated by administrator'
    });

    logger.info({
      action: 'vendor.reactivated',
      vendorId: vendor._id,
      adminId: req.user._id
    }, 'Vendor reactivated');

    res.status(200).json({
      success: true,
      message: 'Vendor reactivated successfully and published services restored',
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
