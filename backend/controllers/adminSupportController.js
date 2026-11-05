const SupportTicket = require('../models/SupportTicket');
const sendEmail = require('../utils/email');
const { notifyUser } = require('../utils/socket');
const logger = require('../utils/logger');

// @desc    Admin: Get all support tickets with filters
// @route   GET /api/v1/admin/support/tickets
// @access  Private (Support / Admin)
exports.getAdminTickets = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;
    if (req.query.search) {
      query.$or = [
        { ticketNumber: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('user', 'name email role')
        .populate('assignedTo', 'name email')
        .sort({ priority: -1, createdAt: -1 })
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

// @desc    Admin: Get ticket detail with internal notes
// @route   GET /api/v1/admin/support/tickets/:ticketId
// @access  Private (Support / Admin)
exports.getAdminTicketDetail = async (req, res, next) => {
  try {
    const ticketId = req.params.ticketId || req.params.id;
    const ticket = await SupportTicket.findById(ticketId)
      .populate('user', 'name email role phone')
      .populate('assignedTo', 'name email')
      .populate('relatedBooking')
      .populate('relatedPayment')
      .populate('messages.sender', 'name role');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Assign ticket to staff member
// @route   PATCH /api/v1/admin/support/tickets/:ticketId/assign
// @access  Private (Support / Admin)
exports.assignTicket = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId || req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.assignedTo = assignedTo;
    if (ticket.status === 'open') {
      ticket.status = 'assigned';
    }

    ticket.messages.push({
      sender: req.user.id,
      senderRole: req.user.role,
      message: `Ticket assigned to staff member`,
      visibility: 'internal',
      createdAt: new Date()
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Update ticket status
// @route   PATCH /api/v1/admin/support/tickets/:ticketId/status
// @access  Private (Support / Admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId || req.params.id).populate('user');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.status = status;
    if (resolutionNote) {
      ticket.resolutionNote = resolutionNote;
    }

    if (['resolved', 'closed'].includes(status)) {
      ticket.resolvedBy = req.user.id;
      ticket.resolvedAt = new Date();
      if (status === 'closed') {
        ticket.closedAt = new Date();
      }
    }

    await ticket.save();

    // Notify ticket owner
    if (ticket.user) {
      notifyUser(ticket.user._id, 'support:status_update', {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status
      });
    }

    res.status(200).json({
      success: true,
      message: `Ticket status updated to '${status}'`,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Update ticket priority
// @route   PATCH /api/v1/admin/support/tickets/:ticketId/priority
// @access  Private (Support / Admin)
exports.updatePriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId || req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.priority = priority;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: `Ticket priority updated to '${priority}'`,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Reply to user on support ticket
// @route   POST /api/v1/admin/support/tickets/:ticketId/reply
// @access  Private (Support / Admin)
exports.adminReply = async (req, res, next) => {
  try {
    const { message, attachments } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId || req.params.id).populate('user');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.messages.push({
      sender: req.user.id,
      senderRole: req.user.role || 'support',
      message: message.trim(),
      attachments: attachments || [],
      visibility: 'public',
      createdAt: new Date()
    });

    ticket.status = 'waiting_for_user';
    await ticket.save();

    // Realtime notification
    if (ticket.user) {
      notifyUser(ticket.user._id, 'support:new_message', {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        message: message.trim()
      });

      // Send email notification
      if (ticket.user.email) {
        sendEmail({
          to: ticket.user.email,
          subject: `Support Ticket Reply [${ticket.ticketNumber}]`,
          template: 'support-reply',
          context: {
            name: ticket.user.name,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            senderName: req.user.name || 'Support Team',
            message: message.trim()
          }
        }).catch(e => logger.warn({ err: e.message }, 'Failed to dispatch ticket reply email'));
      }
    }

    res.status(200).json({
      success: true,
      message: 'Support reply delivered successfully',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Add internal private note to ticket
// @route   POST /api/v1/admin/support/tickets/:ticketId/internal-notes
// @access  Private (Support / Admin)
exports.adminInternalNote = async (req, res, next) => {
  try {
    const { message, attachments } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId || req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.messages.push({
      sender: req.user.id,
      senderRole: req.user.role || 'support',
      message: message.trim(),
      attachments: attachments || [],
      visibility: 'internal',
      createdAt: new Date()
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Internal note recorded',
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};
