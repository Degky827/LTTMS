const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Approve or reject a vendor
// @route   PUT /api/admin/vendors/:id/status
// @access  Private (Admin)
exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, {
      new: true,
      runValidators: true
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // If approved, ensure user role is set to vendor
    if (status === 'approved') {
      await User.findByIdAndUpdate(vendor.user, { role: 'vendor' });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVendors = await Vendor.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: totalUsers,
        vendors: totalVendors,
        services: totalServices,
        bookings: totalBookings,
        totalRevenue: revenue.length > 0 ? revenue[0].total : 0
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
