const PricingRule = require('../models/PricingRule');

class PricingService {
  /**
   * Calculate total price for a booking
   * @param {Object} bookingDetails - Court, equipment, coach, date, time
   * @returns {Object} Pricing breakdown
   */
  async calculatePrice(bookingDetails) {
    const { court, equipment = [], coach, date, startTime, endTime, duration } = bookingDetails;
    
    const pricing = {
      courtCharge: 0,
      equipmentCharges: [],
      coachCharge: 0,
      appliedRules: [],
      subtotal: 0,
      total: 0,
    };

    // 1. Base court charge
    let courtRate = court.baseRate * duration;
    pricing.courtCharge = courtRate;

    // 2. Equipment charges
    if (equipment.length > 0) {
      for (const item of equipment) {
        const charge = {
          equipmentName: item.equipment.name,
          quantity: item.quantity,
          rate: item.equipment.rate,
          total: item.equipment.rate * item.quantity * duration,
        };
        pricing.equipmentCharges.push(charge);
      }
    }

    // 3. Coach charge
    if (coach) {
      pricing.coachCharge = coach.hourlyRate * duration;
    }

    // 4. Calculate subtotal (before pricing rules)
    pricing.subtotal = pricing.courtCharge + 
                       pricing.equipmentCharges.reduce((sum, item) => sum + item.total, 0) +
                       pricing.coachCharge;

    // 5. Apply pricing rules
    const applicableRules = await this.getApplicableRules(bookingDetails);
    let total = pricing.subtotal;

    for (const rule of applicableRules) {
      let impact = 0;
      
      if (rule.ruleType === 'multiplier') {
        // Multiplier applies to court charge only
        const additionalCharge = pricing.courtCharge * (rule.value - 1);
        impact = additionalCharge;
        total += additionalCharge;
      } else if (rule.ruleType === 'addition') {
        impact = rule.value;
        total += rule.value;
      }

      pricing.appliedRules.push({
        ruleName: rule.name,
        ruleType: rule.ruleType,
        value: rule.value,
        impact: impact,
      });
    }

    pricing.total = total;
    return pricing;
  }

  /**
   * Get applicable pricing rules based on booking details
   */
  async getApplicableRules(bookingDetails) {
    const { court, date, startTime } = bookingDetails;
    
    // Get all active rules sorted by priority
    const allRules = await PricingRule.find({ isActive: true }).sort({ priority: -1 });
    
    const applicableRules = [];
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();
    
    for (const rule of allRules) {
      if (this.isRuleApplicable(rule, court, dayOfWeek, startTime)) {
        applicableRules.push(rule);
      }
    }
    
    return applicableRules;
  }

  /**
   * Check if a pricing rule applies to the booking
   */
  isRuleApplicable(rule, court, dayOfWeek, startTime) {
    const conditions = rule.conditions;
    
    // Check court type
    if (conditions.courtType && conditions.courtType !== 'any') {
      if (conditions.courtType !== court.type) {
        return false;
      }
    }

    // Check weekend
    if (conditions.isWeekend) {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        return false;
      }
    }

    // Check specific days
    if (conditions.specificDays && conditions.specificDays.length > 0) {
      if (!conditions.specificDays.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check peak hours
    if (conditions.isPeakHour && conditions.peakHourStart && conditions.peakHourEnd) {
      if (!this.isInTimeRange(startTime, conditions.peakHourStart, conditions.peakHourEnd)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a time falls within a range
   */
  isInTimeRange(time, startRange, endRange) {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(startRange);
    const endMinutes = this.timeToMinutes(endRange);
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  /**
   * Convert HH:MM to minutes since midnight
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

module.exports = new PricingService();
