const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Support ticket must belong to a user'],
    index: true,
    alias: 'createdBy'
  },
  userRole: {
    type: String,
    enum: ['tourist', 'vendor', 'support', 'admin', 'super_admin'],
    default: 'tourist'
  },
  subject: {
    type: String,
    required: [true, 'Please provide a ticket subject'],
    trim: true,
    minlength: [5, 'Subject must be at least 5 characters'],
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide detailed issue description'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    enum: {
      values: [
        'booking',
        'payment',
        'refund',
        'vendor',
        'service_quality',
        'account',
        'technical',
        'safety',
        'eco_guideline',
        'general'
      ],
      message: '{VALUE} is not a valid support category'
    },
    default: 'general',
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'normal', 'medium', 'high', 'urgent'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: {
      values: [
        'open',
        'assigned',
        'in_progress',
        'waiting_for_user',
        'waiting_on_user',
        'waiting_for_vendor',
        'resolved',
        'closed',
        'reopened'
      ],
      message: '{VALUE} is not a valid ticket status'
    },
    default: 'open',
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
    index: true
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
    index: true
  },
  relatedVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null,
    index: true
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      default: 'user'
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    attachments: [{
      url: String,
      filename: String
    }],
    visibility: {
      type: String,
      enum: ['public', 'internal'],
      default: 'public'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    type: String,
    default: null
  },
  resolutionNote: {
    type: String,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate ticketNumber if not provided
supportTicketSchema.pre('validate', function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `TIK-${timestamp}-${random}`;
  }
  next();
});

// Compound indexes for support queues
supportTicketSchema.index({ status: 1, priority: -1, createdAt: 1 });
supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ relatedVendor: 1, status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
