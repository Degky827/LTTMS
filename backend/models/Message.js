const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a sender'],
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a receiver'],
    index: true
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters'],
    default: null
  },
  content: {
    type: String,
    required: [true, 'Please add message content'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  attachments: [{
    url: { type: String, trim: true },
    filename: { type: String, trim: true },
    fileType: { type: String, trim: true }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save normalization: handle legacy aliases (recipient -> receiver, message -> content)
messageSchema.pre('validate', function(next) {
  if (!this.receiver && this.recipient) {
    this.receiver = this.recipient;
  }
  if (!this.content && this.message) {
    this.content = this.message;
  }
  next();
});

// Auto-populate readAt timestamp when marked as read
messageSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Compound indexes for high-frequency queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
