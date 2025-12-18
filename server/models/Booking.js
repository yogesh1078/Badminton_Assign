const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true, // In a real app, this would reference a User model
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPhone: String,
  
  // Booking date and time
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: "HH:MM"
  },
  endTime: {
    type: String,
    required: true, // Format: "HH:MM"
  },
  duration: {
    type: Number,
    required: true, // Duration in hours
  },
  
  // Resources
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true,
  },
  equipment: [{
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    quantity: {
      type: Number,
      min: 1,
    },
  }],
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
  },
  
  // Pricing breakdown
  pricing: {
    courtCharge: Number,
    equipmentCharges: [{
      equipmentName: String,
      quantity: Number,
      rate: Number,
      total: Number,
    }],
    coachCharge: Number,
    appliedRules: [{
      ruleName: String,
      ruleType: String,
      value: Number,
      impact: Number,
    }],
    subtotal: Number,
    total: Number,
  },
  
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  
  // Concurrency control
  version: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient availability queries
bookingSchema.index({ court: 1, date: 1, status: 1 });
bookingSchema.index({ coach: 1, date: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
