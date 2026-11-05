const SupportTicket = require('../models/SupportTicket');
const { notifySupport, notifyUser } = require('../utils/socket');
const crypto = require('crypto');

// @desc    Create a new support ticket
// @route   POST /api/v1/support/tickets
// @access  Private (Tourist / Vendor)
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, description, message, category, priority, relatedBooking, relatedPayment, relatedVendor } = req.body;
    const content = description || message;

    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const ticketNumber = `TIK-${year}-${randomHex}`;

    const ticket = await SupportTicket.create({
      ticketNumber,
      user: req.user.id,
      userRole: req.user.role || 'tourist',
      subject,
      description: content,
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      relatedBooking: relatedBooking || null,
      relatedPayment: relatedPayment || null,
      relatedVendor: relatedVendor || null,
      messages: [{
        sender: req.user.id,
        senderRole: req.user.role || 'tourist',
        message: content,
        visibility: 'public',
        createdAt: new Date()
      }]
    });

    // Notify staff
    notifySupport('support:new_ticket', {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      priority: ticket.priority
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's tickets
// @route   GET /api/v1/support/tickets/my-tickets
// @access  Private
exports.getMyTickets = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    if (req.query.status) query.status = req.query.status;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      SupportTicket.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ticket by ID (filtering out internal notes for non-staff)
// @route   GET /api/v1/support/tickets/:ticketId
// @access  Private
exports.getTicketById = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId || req.params.id;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(ticketId);
    const query = isObjectId
      ? { $or: [{ _id: ticketId }, { ticketNumber: ticketId }] }
      : { ticketNumber: ticketId };

    const ticket = await SupportTicket.findOne(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('relatedBooking', 'bookingReference totalAmount')
      .populate('messages.sender', 'name role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const isStaff = ['admin', 'super_admin', 'support'].includes(req.user.role);
    const isOwner = ticket.user && (ticket.user._id ? ticket.user._id.toString() : ticket.user.toString()) === req.user.id;
    const isRelatedVendor = ticket.relatedVendor && req.user.vendorId && ticket.relatedVendor.toString() === req.user.vendorId.toString();

    if (!isOwner && !isRelatedVendor && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    const ticketObj = ticket.toObject();

    // STRICT PRIVACY ISOLATION: Hide internal notes from tourists/vendors
    if (!isStaff && ticketObj.messages) {
      ticketObj.messages = ticketObj.messages.filter(m => m.visibility !== 'internal');
    }

    res.status(200).json({
      success: true,
      data: ticketObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    User adds message to ticket
// @route   POST /api/v1/support/tickets/:ticketId/messages
// @access  Private
exports.addMessage = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId || req.params.id;
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const isStaff = ['admin', 'super_admin', 'support'].includes(req.user.role);
    const isOwner = ticket.user.toString() === req.user.id;
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this ticket' });
    }

    const { message, attachments } = req.body;

    ticket.messages.push({
      sender: req.user.id,
      senderRole: req.user.role || 'user',
      message: message.trim(),
      attachments: attachments || [],
      visibility: 'public',
      createdAt: new Date()
    });

    if (ticket.status === 'waiting_for_user' || ticket.status === 'waiting_on_user') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Message added to ticket',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reopen a resolved ticket
// @route   PATCH /api/v1/support/tickets/:ticketId/reopen
// @access  Private
exports.reopenTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId || req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const isOwner = ticket.user.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'support'].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to reopen this ticket' });
    }

    if (!['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({ success: false, message: `Ticket in status '${ticket.status}' cannot be reopened` });
    }

    ticket.status = 'reopened';
    ticket.resolvedAt = null;
    ticket.closedAt = null;

    ticket.messages.push({
      sender: req.user.id,
      senderRole: req.user.role || 'user',
      message: req.body.reason || 'Ticket reopened by user',
      visibility: 'public',
      createdAt: new Date()
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket reopened successfully',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};
