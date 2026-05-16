const Vendor = require('../models/Vendor');

// @desc    Register vendor
// @route   POST /api/vendors
// @access  Private (User)
exports.registerVendor = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Check if user already has a vendor profile
    const existingVendor = await Vendor.findOne({ user: req.user.id });

    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'User already has a vendor profile' });
    }

    const vendor = await Vendor.create(req.body);

    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
