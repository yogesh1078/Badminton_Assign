const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  
  // Desired booking details
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
  },
  
  status: {
    type: String,
    enum: ['waiting', 'notified', 'expired'],
    default: 'waiting',
  },
  
  position: Number,
  
  notifiedAt: Date,
  expiresAt: Date,
}, {
  timestamps: true,
});

// Index for queue ordering
waitlistSchema.index({ date: 1, startTime: 1, court: 1, createdAt: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
