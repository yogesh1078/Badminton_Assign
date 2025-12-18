const Court = require('../models/Court');
const Equipment = require('../models/Equipment');
const Coach = require('../models/Coach');
const PricingRule = require('../models/PricingRule');
const Waitlist = require('../models/Waitlist');

const adminController = {
  // Court management
  async createCourt(req, res) {
    try {
      const court = new Court(req.body);
      await court.save();
      res.status(201).json({ success: true, data: court });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateCourt(req, res) {
    try {
      const court = await Court.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!court) {
        return res.status(404).json({ success: false, error: 'Court not found' });
      }
      res.json({ success: true, data: court });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getCourts(req, res) {
    try {
      const courts = await Court.find();
      res.json({ success: true, data: courts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteCourt(req, res) {
    try {
      const court = await Court.findByIdAndDelete(req.params.id);
      if (!court) {
        return res.status(404).json({ success: false, error: 'Court not found' });
      }
      res.json({ success: true, message: 'Court deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Equipment management
  async createEquipment(req, res) {
    try {
      const equipment = new Equipment(req.body);
      await equipment.save();
      res.status(201).json({ success: true, data: equipment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateEquipment(req, res) {
    try {
      const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!equipment) {
        return res.status(404).json({ success: false, error: 'Equipment not found' });
      }
      res.json({ success: true, data: equipment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getEquipment(req, res) {
    try {
      const equipment = await Equipment.find();
      res.json({ success: true, data: equipment });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteEquipment(req, res) {
    try {
      const equipment = await Equipment.findByIdAndDelete(req.params.id);
      if (!equipment) {
        return res.status(404).json({ success: false, error: 'Equipment not found' });
      }
      res.json({ success: true, message: 'Equipment deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Coach management
  async createCoach(req, res) {
    try {
      const coach = new Coach(req.body);
      await coach.save();
      res.status(201).json({ success: true, data: coach });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updateCoach(req, res) {
    try {
      const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!coach) {
        return res.status(404).json({ success: false, error: 'Coach not found' });
      }
      res.json({ success: true, data: coach });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getCoaches(req, res) {
    try {
      const coaches = await Coach.find();
      res.json({ success: true, data: coaches });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteCoach(req, res) {
    try {
      const coach = await Coach.findByIdAndDelete(req.params.id);
      if (!coach) {
        return res.status(404).json({ success: false, error: 'Coach not found' });
      }
      res.json({ success: true, message: 'Coach deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Pricing Rule management
  async createPricingRule(req, res) {
    try {
      const rule = new PricingRule(req.body);
      await rule.save();
      res.status(201).json({ success: true, data: rule });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async updatePricingRule(req, res) {
    try {
      const rule = await PricingRule.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!rule) {
        return res.status(404).json({ success: false, error: 'Pricing rule not found' });
      }
      res.json({ success: true, data: rule });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getPricingRules(req, res) {
    try {
      const rules = await PricingRule.find().sort({ priority: -1 });
      res.json({ success: true, data: rules });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deletePricingRule(req, res) {
    try {
      const rule = await PricingRule.findByIdAndDelete(req.params.id);
      if (!rule) {
        return res.status(404).json({ success: false, error: 'Pricing rule not found' });
      }
      res.json({ success: true, message: 'Pricing rule deleted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Waitlist management
  async getAllWaitlist(req, res) {
    try {
      const waitlist = await Waitlist.find({ status: 'waiting' })
        .populate('court')
        .sort({ createdAt: -1 });
      res.json({ success: true, data: waitlist });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async notifyWaitlistUser(req, res) {
    try {
      const entry = await Waitlist.findByIdAndUpdate(
        req.params.id,
        { status: 'notified', notifiedAt: new Date() },
        { new: true }
      ).populate('court');
      
      if (!entry) {
        return res.status(404).json({ success: false, error: 'Waitlist entry not found' });
      }

      // Here you could add email/SMS notification logic
      // For now, just mark as notified
      
      res.json({ 
        success: true, 
        data: entry,
        message: `User ${entry.userName} notified about availability` 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async removeFromWaitlist(req, res) {
    try {
      const entry = await Waitlist.findByIdAndDelete(req.params.id);
      if (!entry) {
        return res.status(404).json({ success: false, error: 'Waitlist entry not found' });
      }
      res.json({ success: true, message: 'Removed from waitlist' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = adminController;
