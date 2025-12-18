const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['racket', 'shoes', 'shuttlecock', 'other'],
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['available', 'disabled'],
    default: 'available',
  },
  description: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Equipment', equipmentSchema);
