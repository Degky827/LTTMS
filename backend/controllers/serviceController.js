const Service = require('../models/Service');
const Vendor = require('../models/Vendor');
const NodeCache = require('node-cache');

const serviceListCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const cacheKey = `services:${JSON.stringify(req.query || {})}`;
    const cached = serviceListCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 50);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'featured';

    const filters = {};
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.ecoFriendly === 'true') {
      filters.ecoFriendly = true;
    }
    if (req.query.ecoFriendly === 'false') {
      filters.ecoFriendly = false;
    }

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      filters.price = {};
      if (!Number.isNaN(minPrice)) filters.price.$gte = minPrice;
      if (!Number.isNaN(maxPrice)) filters.price.$lte = maxPrice;
    }

    if (req.query.search) {
      filters.$text = { $search: req.query.search };
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'price-low') sort = { price: 1 };
    if (sortBy === 'price-high') sort = { price: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };

    const total = await Service.countDocuments(filters);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const services = await Service.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
      path: 'vendor',
      select: 'businessName location'
    });

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

    serviceListCache.set(cacheKey, responsePayload);
    res.status(200).json(responsePayload);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('vendor');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Vendor)
exports.createService = async (req, res, next) => {
  try {
    // Check if user is a vendor
    const vendor = await Vendor.findOne({ user: req.user.id });

    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Only vendors can create services' });
    }

    req.body.vendor = vendor._id;

    const service = await Service.create(req.body);
    serviceListCache.flushAll();

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Vendor)
exports.updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Make sure user is service owner
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || service.vendor.toString() !== vendor._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this service' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
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
// @route   DELETE /api/services/:id
// @access  Private (Vendor)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Make sure user is service owner
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || service.vendor.toString() !== vendor._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    serviceListCache.flushAll();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
