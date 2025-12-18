const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  ruleType: {
    type: String,
    enum: ['multiplier', 'addition'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  conditions: {
    // Time-based conditions
    isPeakHour: Boolean,
    peakHourStart: String, // "HH:MM"
    peakHourEnd: String,   // "HH:MM"
    
    // Day-based conditions
    isWeekend: Boolean,
    specificDays: [Number], // [0-6] where 0=Sunday
    
    // Court-based conditions
    courtType: {
      type: String,
      enum: ['indoor', 'outdoor', 'any'],
      default: 'any',
    },
  },
  priority: {
    type: Number,
    default: 0, // Higher priority rules apply first
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
