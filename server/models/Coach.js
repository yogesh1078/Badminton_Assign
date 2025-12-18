const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  specialization: {
    type: [String],
    default: ['beginner', 'intermediate', 'advanced'],
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0,
  },
  availability: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6, // 0 = Sunday, 6 = Saturday
    },
    startTime: String, // Format: "HH:MM"
    endTime: String,   // Format: "HH:MM"
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  bio: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coach', coachSchema);
