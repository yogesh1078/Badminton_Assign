const Waitlist = require('../models/Waitlist');

const waitlistController = {
  // Add user to waitlist
  async addToWaitlist(req, res) {
    try {
      const { userId, userName, userEmail, date, startTime, endTime, courtId } = req.body;

      const bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0);

      // Count existing entries for this slot
      const existingCount = await Waitlist.countDocuments({
        date: bookingDate,
        startTime,
        endTime,
        court: courtId,
        status: 'waiting',
      });

      const waitlistEntry = new Waitlist({
        userId,
        userName,
        userEmail,
        date: bookingDate,
        startTime,
        endTime,
        court: courtId,
        position: existingCount + 1,
      });

      await waitlistEntry.save();

      res.status(201).json({
        success: true,
        data: waitlistEntry,
        message: `Added to waitlist at position ${waitlistEntry.position}`,
      });
    } catch (error) {
      console.error('Add to waitlist error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get user's waitlist entries
  async getUserWaitlist(req, res) {
    try {
      const { userId } = req.params;

      const entries = await Waitlist.find({ userId })
        .populate('court')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: entries,
      });
    } catch (error) {
      console.error('Get waitlist error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Remove from waitlist
  async removeFromWaitlist(req, res) {
    try {
      const { id } = req.params;

      const entry = await Waitlist.findByIdAndDelete(id);

      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Waitlist entry not found',
        });
      }

      res.json({
        success: true,
        message: 'Removed from waitlist',
      });
    } catch (error) {
      console.error('Remove from waitlist error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = waitlistController;
