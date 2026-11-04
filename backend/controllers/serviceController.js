const crypto = require('crypto');
const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const Destination = require('../models/Destination');
const Category = require('../models/Category');
const NodeCache = require('node-cache');
const { escapeRegex } = require('../shared/database/queryUtils');
const logger = require('../utils/logger');

const serviceListCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Get all services (Marketplace search, filter, sort, pagination)
// @route   GET /api/v1/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'featured';

    const filters = {};

    // 1. Publication status filter:
    // Public marketplace queries ONLY return published services
    if (!isAdmin) {
      filters.status = 'published';
      filters.availability = true;
    } else if (req.query.status) {
      filters.status = req.query.status;
    }

    // 2. Vendor status guard:
    // Only approved vendors should appear in the public marketplace
    const approvedVendors = await Vendor.find({ status: 'approved' }).select('_id');
    const approvedVendorIds = approvedVendors.map(v => v._id);

    if (!isAdmin) {
      filters.vendor = { $in: approvedVendorIds };
    } else if (req.query.vendor) {
      filters.vendor = req.query.vendor;
    }

    // 3. Category & Subcategory filters
    if (req.query.category) {
      // Support matching by slug string, category name, or categoryRef
      filters.$or = [
        { category: req.query.category },
        { category: req.query.category.toLowerCase() }
      ];
      // If it looks like an ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(req.query.category)) {
        filters.$or.push({ categoryRef: req.query.category });
      }
    }
    if (req.query.categoryRef) {
      filters.categoryRef = req.query.categoryRef;
    }
    if (req.query.subcategory) {
      filters.subcategory = req.query.subcategory;
    }

    // 4. Destination filter
    if (req.query.destination) {
      if (/^[0-9a-fA-F]{24}$/.test(req.query.destination)) {
        filters.destination = req.query.destination;
      } else {
        const dest = await Destination.findOne({ slug: req.query.destination.toLowerCase() });
        if (dest) {
          filters.destination = dest._id;
        }
      }
    }

    // 5. Service Type
    if (req.query.serviceType) {
      filters.serviceType = req.query.serviceType;
    }

    // 6. Eco-Friendly filter
    if (req.query.ecoFriendly === 'true') {
      filters.ecoFriendly = true;
    } else if (req.query.ecoFriendly === 'false') {
      filters.ecoFriendly = false;
    }

    // 7. Price range
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      filters.price = {};
      if (!Number.isNaN(minPrice)) filters.price.$gte = minPrice;
      if (!Number.isNaN(maxPrice)) filters.price.$lte = maxPrice;
    }

    // 8. Rating filter
    if (req.query.rating) {
      const minRating = Number(req.query.rating);
      if (!Number.isNaN(minRating)) {
        filters.rating = { $gte: minRating };
      }
    }

    // 9. Duration filter
    if (req.query.duration) {
      filters.duration = new RegExp(escapeRegex(req.query.duration), 'i');
    }

    // 10. Text search
    if (req.query.search) {
      const safeSearch = new RegExp(escapeRegex(req.query.search), 'i');
      const searchConditions = [
        { title: safeSearch },
        { description: safeSearch },
        { shortDescription: safeSearch },
        { location: safeSearch },
        { highlights: safeSearch }
      ];
      if (filters.$or) {
        filters.$and = [{ $or: filters.$or }, { $or: searchConditions }];
        delete filters.$or;
      } else {
        filters.$or = searchConditions;
      }
    }

    // Sorting options
    let sort = { isFeatured: -1, createdAt: -1 };
    if (sortBy === 'newest') sort = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'price-low') sort = { price: 1 };
    if (sortBy === 'price-high') sort = { price: -1 };
    if (sortBy === 'rating') sort = { rating: -1, reviewCount: -1 };
    if (sortBy === 'alpha') sort = { title: 1 };

    const total = await Service.countDocuments(filters);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const services = await Service.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('vendor', 'businessName businessType location rating ecoCertification status')
      .populate('destination', 'name slug destinationType')
      .populate('categoryRef', 'name slug icon')
      .populate('subcategory', 'name slug');

    const responsePayload = {
      success: true,
      count: services.length,
      total,
      page,
      totalPages,
      limit,
      data: services,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single service by id or slug
// @route   GET /api/v1/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const service = isObjectId
      ? await Service.findById(id)
          .populate('vendor')
          .populate('destination')
          .populate('categoryRef')
          .populate('subcategory')
      : await Service.findOne({ slug: id.toLowerCase() })
          .populate('vendor')
          .populate('destination')
          .populate('categoryRef')
          .populate('subcategory');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const isOwner = req.user && service.vendor?.user?.toString() === req.user._id?.toString();

    // If service is not published or vendor is not approved, hide from general public
    if (!isAdmin && !isOwner) {
      if (service.status !== 'published' || service.vendor?.status !== 'approved') {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new tourism service
// @route   POST /api/v1/services
// @access  Private (Approved Vendor, Admin)
exports.createService = async (req, res, next) => {
  try {
    let vendor = req.vendor;
    if (!vendor) {
      vendor = await Vendor.findOne({ user: req.user._id || req.user.id });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

    if (!vendor && !isAdmin) {
      return res.status(401).json({ success: false, message: 'Only vendors can create services' });
    }

    if (!isAdmin && vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Vendor application is pending or not approved yet',
        code: 'VENDOR_NOT_APPROVED'
      });
    }

    const payload = { ...req.body };
    payload.vendor = vendor ? vendor._id : req.body.vendor;

    if (!payload.vendor) {
      return res.status(400).json({ success: false, message: 'Vendor reference is required' });
    }

    // Auto-generate slug
    if (!payload.slug) {
      payload.slug = `${slugify(payload.title)}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      payload.slug = slugify(payload.slug);
    }

    // Set initial status: draft unless admin or specified
    if (!isAdmin) {
      payload.status = payload.status === 'pending_review' ? 'pending_review' : 'draft';
    }

    // Sync coverImage if provided
    if (payload.coverImage && (!payload.images || payload.images.length === 0)) {
      payload.images = [payload.coverImage];
    }

    const service = await Service.create(payload);
    serviceListCache.flushAll();

    logger.info({
      action: 'service.create',
      serviceId: service._id,
      title: service.title,
      vendorId: payload.vendor,
      userId: req.user._id
    }, 'Tourism service created');

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update tourism service
// @route   PATCH /api/v1/services/:id
// @access  Private (Owner Vendor, Admin)
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this service' });
    }

    const payload = { ...req.body };

    // Prevent non-admin vendors from approving or featuring their own services
    if (!isAdmin) {
      delete payload.isFeatured;
      delete payload.moderationFeedback;
      if (payload.status === 'published' && service.status !== 'published') {
        // Must be approved to publish
        if (vendor.status !== 'approved') {
          return res.status(403).json({
            success: false,
            message: 'Unapproved vendors cannot publish public listings',
            code: 'VENDOR_NOT_APPROVED'
          });
        }
      }
    }

    if (payload.title && !payload.slug) {
      payload.slug = `${slugify(payload.title)}-${service._id.toString().slice(-4)}`;
    }

    service = await Service.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
// @access  Private (Owner Vendor, Admin)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    serviceListCache.flushAll();

    logger.info({
      action: 'service.delete',
      serviceId: req.params.id,
      userId: req.user._id
    }, 'Tourism service deleted');

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Submit service for review
// @route   POST /api/v1/services/:id/submit
// @access  Private (Owner Vendor)
exports.submitService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });
    if (!vendor || service.vendor.toString() !== vendor._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    service.status = 'pending_review';
    await service.save();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Service submitted for moderation review',
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve service (Admin only)
// @route   PATCH /api/v1/services/:id/approve
// @access  Private (Admin, Super Admin)
exports.approveService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('vendor');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    if (service.vendor && service.vendor.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve service: Vendor account is not yet approved',
        code: 'VENDOR_NOT_APPROVED'
      });
    }

    service.status = 'published';
    service.availability = true;
    service.moderationFeedback = null;
    await service.save();
    serviceListCache.flushAll();

    logger.info({
      action: 'service.approved',
      serviceId: service._id,
      adminId: req.user._id
    }, 'Service approved and published by admin');

    res.status(200).json({
      success: true,
      message: 'Service approved and published successfully',
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reject service with moderation feedback (Admin only)
// @route   PATCH /api/v1/services/:id/reject
// @access  Private (Admin, Super Admin)
exports.rejectService = async (req, res, next) => {
  try {
    const { feedback, reason } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.status = 'rejected';
    service.moderationFeedback = feedback || reason || 'Listing does not meet quality requirements.';
    await service.save();
    serviceListCache.flushAll();

    logger.info({
      action: 'service.rejected',
      serviceId: service._id,
      reason: service.moderationFeedback,
      adminId: req.user._id
    }, 'Service rejected by admin');

    res.status(200).json({
      success: true,
      message: 'Service rejected with moderation feedback',
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Publish service
// @route   PATCH /api/v1/services/:id/publish
// @access  Private (Owner Vendor, Admin)
exports.publishService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('vendor');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor._id.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (service.vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Cannot publish service: Vendor account is not approved',
        code: 'VENDOR_NOT_APPROVED'
      });
    }

    service.status = 'published';
    service.availability = true;
    await service.save();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Service published successfully',
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Archive service
// @route   PATCH /api/v1/services/:id/archive
// @access  Private (Owner Vendor, Admin)
exports.archiveService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    service.status = 'archived';
    service.availability = false;
    await service.save();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Service archived successfully',
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Toggle featured service (Admin only)
// @route   PATCH /api/v1/services/:id/feature
// @access  Private (Admin, Super Admin)
exports.featureService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    service.isFeatured = req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : !service.isFeatured;
    await service.save();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      message: `Service featured status set to ${service.isFeatured}`,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== MEDIA & GALLERY MANAGEMENT ====================

// @desc    Upload image to service gallery
// @route   POST /api/v1/services/:id/images
// @access  Private (Owner Vendor, Admin)
exports.addServiceImage = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { url, caption, displayOrder, isCover } = req.body;
    const imageId = crypto.randomUUID();

    if (isCover) {
      service.coverImage = url;
      // Mark others as not cover
      service.gallery.forEach(img => { img.isCover = false; });
    }

    service.gallery.push({
      id: imageId,
      url,
      caption: caption || '',
      displayOrder: displayOrder || service.gallery.length,
      isCover: Boolean(isCover)
    });

    if (!service.images.includes(url)) {
      service.images.push(url);
    }

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Image added to service gallery',
      data: service.gallery
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update image details in service gallery
// @route   PATCH /api/v1/services/:id/images/:imageId
// @access  Private (Owner Vendor, Admin)
exports.updateServiceImage = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const imageItem = service.gallery.find(img => img.id === req.params.imageId);
    if (!imageItem) {
      return res.status(404).json({ success: false, message: 'Image not found in gallery' });
    }

    if (req.body.caption !== undefined) imageItem.caption = req.body.caption;
    if (req.body.displayOrder !== undefined) imageItem.displayOrder = req.body.displayOrder;
    if (req.body.isCover) {
      service.gallery.forEach(img => { img.isCover = false; });
      imageItem.isCover = true;
      service.coverImage = imageItem.url;
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Gallery image updated',
      data: service.gallery
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Remove image from service gallery
// @route   DELETE /api/v1/services/:id/images/:imageId
// @access  Private (Owner Vendor, Admin)
exports.deleteServiceImage = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const imageToRemove = service.gallery.find(img => img.id === req.params.imageId);
    service.gallery = service.gallery.filter(img => img.id !== req.params.imageId);

    if (imageToRemove) {
      service.images = service.images.filter(u => u !== imageToRemove.url);
      if (service.coverImage === imageToRemove.url) {
        service.coverImage = service.gallery[0]?.url || null;
      }
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Image removed from gallery',
      data: service.gallery
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reorder gallery images
// @route   PATCH /api/v1/services/:id/images/reorder
// @access  Private (Owner Vendor, Admin)
exports.reorderServiceImages = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { orderedImageIds } = req.body;
    orderedImageIds.forEach((id, index) => {
      const img = service.gallery.find(item => item.id === id);
      if (img) img.displayOrder = index;
    });

    service.gallery.sort((a, b) => a.displayOrder - b.displayOrder);
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Gallery images reordered successfully',
      data: service.gallery
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==================== PRICING & AVAILABILITY CONFIGURATION ====================

// @desc    Get service pricing configuration
// @route   GET /api/v1/services/:id/pricing
// @access  Public
exports.getServicePricing = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).select(
      'price currency pricingUnit adultPrice childPrice groupPricing extraCharges'
    );
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        basePrice: service.price,
        currency: service.currency,
        pricingUnit: service.pricingUnit,
        adultPrice: service.adultPrice,
        childPrice: service.childPrice,
        groupPricing: service.groupPricing,
        extraCharges: service.extraCharges
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update service pricing configuration
// @route   PUT /api/v1/services/:id/pricing
// @access  Private (Owner Vendor, Admin)
exports.updateServicePricing = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { price, currency, pricingUnit, adultPrice, childPrice, groupPricing, extraCharges } = req.body;

    if (price !== undefined) service.price = price;
    if (currency !== undefined) service.currency = currency;
    if (pricingUnit !== undefined) service.pricingUnit = pricingUnit;
    if (adultPrice !== undefined) service.adultPrice = adultPrice;
    if (childPrice !== undefined) service.childPrice = childPrice;
    if (groupPricing !== undefined) service.groupPricing = groupPricing;
    if (extraCharges !== undefined) service.extraCharges = extraCharges;

    await service.save();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Service pricing updated successfully',
      data: {
        price: service.price,
        currency: service.currency,
        pricingUnit: service.pricingUnit,
        adultPrice: service.adultPrice,
        childPrice: service.childPrice,
        groupPricing: service.groupPricing,
        extraCharges: service.extraCharges
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get service capacity and availability configuration
// @route   GET /api/v1/services/:id/availability
// @access  Public
exports.getServiceAvailability = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).select(
      'dailyCapacity minBookingCapacity maxBookingCapacity operatingDays timeSlots unavailableDates seasonalAvailability availability'
    );
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        isAvailable: service.availability,
        dailyCapacity: service.dailyCapacity,
        minBookingCapacity: service.minBookingCapacity,
        maxBookingCapacity: service.maxBookingCapacity,
        operatingDays: service.operatingDays,
        timeSlots: service.timeSlots,
        unavailableDates: service.unavailableDates,
        seasonalAvailability: service.seasonalAvailability
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update service capacity and availability configuration
// @route   PUT /api/v1/services/:id/availability
// @access  Private (Owner Vendor, Admin)
exports.updateServiceAvailability = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const vendor = await Vendor.findOne({ user: req.user._id || req.user.id });

    if (!isAdmin && (!vendor || service.vendor.toString() !== vendor._id.toString())) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const {
      dailyCapacity,
      minBookingCapacity,
      maxBookingCapacity,
      operatingDays,
      timeSlots,
      unavailableDates,
      seasonalAvailability
    } = req.body;

    if (dailyCapacity !== undefined) service.dailyCapacity = dailyCapacity;
    if (minBookingCapacity !== undefined) service.minBookingCapacity = minBookingCapacity;
    if (maxBookingCapacity !== undefined) service.maxBookingCapacity = maxBookingCapacity;
    if (operatingDays !== undefined) service.operatingDays = operatingDays;
    if (timeSlots !== undefined) service.timeSlots = timeSlots;
    if (unavailableDates !== undefined) service.unavailableDates = unavailableDates;
    if (seasonalAvailability !== undefined) service.seasonalAvailability = seasonalAvailability;

    await service.save();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      message: 'Service availability and capacity configuration updated',
      data: {
        dailyCapacity: service.dailyCapacity,
        minBookingCapacity: service.minBookingCapacity,
        maxBookingCapacity: service.maxBookingCapacity,
        operatingDays: service.operatingDays,
        timeSlots: service.timeSlots,
        unavailableDates: service.unavailableDates,
        seasonalAvailability: service.seasonalAvailability
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
