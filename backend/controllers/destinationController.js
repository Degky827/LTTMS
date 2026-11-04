const Destination = require('../models/Destination');
const Service = require('../models/Service');
const { escapeRegex } = require('../shared/database/queryUtils');
const logger = require('../utils/logger');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Get all destinations
// @route   GET /api/v1/destinations
// @access  Public (Filterable for admin)
exports.getDestinations = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};

    // Non-admin users can ONLY see published destinations
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin) {
      filter.status = 'published';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.destinationType = req.query.type;
    }

    if (req.query.isFeatured === 'true') {
      filter.isFeatured = true;
    } else if (req.query.isFeatured === 'false') {
      filter.isFeatured = false;
    }

    if (req.query.search) {
      const safeSearch = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [
        { name: safeSearch },
        { description: safeSearch },
        { shortDescription: safeSearch },
        { 'location.address': safeSearch },
        { 'location.region': safeSearch },
        { highlights: safeSearch }
      ];
    }

    const total = await Destination.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const destinations = await Destination.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      page,
      totalPages,
      limit,
      data: destinations,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single destination by id or slug
// @route   GET /api/v1/destinations/:id
// @access  Public
exports.getDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const destination = isObjectId
      ? await Destination.findById(id).populate('createdBy', 'name email')
      : await Destination.findOne({ slug: id.toLowerCase() }).populate('createdBy', 'name email');

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    if (!isAdmin && destination.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Get count or list of available published services at this destination
    const serviceCount = await Service.countDocuments({
      destination: destination._id,
      status: 'published'
    });

    res.status(200).json({
      success: true,
      data: destination,
      metrics: {
        availableServices: serviceCount
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new destination
// @route   POST /api/v1/destinations
// @access  Private (Admin, Super Admin)
exports.createDestination = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.slug) {
      payload.slug = slugify(payload.name);
    } else {
      payload.slug = slugify(payload.slug);
    }

    // Check unique name / slug
    const existing = await Destination.findOne({
      $or: [{ name: payload.name }, { slug: payload.slug }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A destination with this name or slug already exists'
      });
    }

    payload.createdBy = req.user._id;
    payload.updatedBy = req.user._id;

    const destination = await Destination.create(payload);

    logger.info({
      action: 'destination.create',
      destinationId: destination._id,
      name: destination.name,
      adminId: req.user._id
    }, 'Destination created by admin');

    res.status(201).json({
      success: true,
      data: destination
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update destination
// @route   PATCH /api/v1/destinations/:id
// @access  Private (Admin, Super Admin)
exports.updateDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    let destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const payload = { ...req.body };
    if (payload.slug) {
      payload.slug = slugify(payload.slug);
      const conflict = await Destination.findOne({
        slug: payload.slug,
        _id: { $ne: destination._id }
      });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'Destination slug already in use' });
      }
    }

    payload.updatedBy = req.user._id;

    destination = await Destination.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });

    logger.info({
      action: 'destination.update',
      destinationId: destination._id,
      adminId: req.user._id
    }, 'Destination updated by admin');

    res.status(200).json({
      success: true,
      data: destination
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete destination (with safe referential integrity check)
// @route   DELETE /api/v1/destinations/:id
// @access  Private (Admin, Super Admin)
exports.deleteDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Referential integrity check: cannot delete if active services reference it
    const activeServicesCount = await Service.countDocuments({
      destination: destination._id
    });

    if (activeServicesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete destination: ${activeServicesCount} tourism service(s) reference this destination. Please reassign or archive those services first.`,
        code: 'DESTINATION_IN_USE'
      });
    }

    await destination.deleteOne();

    logger.info({
      action: 'destination.delete',
      destinationId: id,
      adminId: req.user._id
    }, 'Destination deleted safely');

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Publish/unpublish destination
// @route   PATCH /api/v1/destinations/:id/publish
// @access  Private (Admin, Super Admin)
exports.publishDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const nextStatus = req.body.status || (destination.status === 'published' ? 'draft' : 'published');
    if (!['draft', 'published', 'archived'].includes(nextStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    destination.status = nextStatus;
    destination.updatedBy = req.user._id;
    await destination.save();

    res.status(200).json({
      success: true,
      message: `Destination status updated to ${destination.status}`,
      data: destination
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Toggle featured destination
// @route   PATCH /api/v1/destinations/:id/feature
// @access  Private (Admin, Super Admin)
exports.featureDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    destination.isFeatured = req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : !destination.isFeatured;
    destination.updatedBy = req.user._id;
    await destination.save();

    res.status(200).json({
      success: true,
      message: `Destination featured status set to ${destination.isFeatured}`,
      data: destination
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
