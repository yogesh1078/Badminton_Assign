const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true,
  },
  baseRate: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'disabled'],
    default: 'active',
  },
  description: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Court', courtSchema);
