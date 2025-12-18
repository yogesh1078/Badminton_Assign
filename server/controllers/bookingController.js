const bookingService = require('../services/bookingService');
const pricingService = require('../services/pricingService');
const Booking = require('../models/Booking');

const bookingController = {
  // Create a new booking
  async createBooking(req, res) {
    try {
      // Use authenticated user's info
      const bookingData = {
        ...req.body,
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone,
      };
      
      const booking = await bookingService.createBooking(bookingData);
      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully',
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get all bookings for a user
  async getUserBookings(req, res) {
    try {
      // Only allow users to see their own bookings (admins can see all)
      const userId = req.user.role === 'admin' ? req.params.userId : req.user._id;
      
      const bookings = await Booking.find({ userId })
        .populate(['court', 'equipment.equipmentId', 'coach'])
        .sort({ date: -1, startTime: -1 });

      res.json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get booking by ID
  async getBookingById(req, res) {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate(['court', 'equipment.equipmentId', 'coach']);

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Cancel a booking
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const booking = await bookingService.cancelBooking(id, userId);

      res.json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully',
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get pricing preview
  async getPricingPreview(req, res) {
    try {
      const Court = require('../models/Court');
      const Equipment = require('../models/Equipment');
      const Coach = require('../models/Coach');

      const { courtId, equipment = [], coachId, date, startTime, endTime } = req.body;

      const court = await Court.findById(courtId);
      if (!court) {
        return res.status(404).json({ success: false, error: 'Court not found' });
      }

      const equipmentDetails = [];
      for (const item of equipment) {
        const equip = await Equipment.findById(item.equipmentId);
        if (equip) {
          equipmentDetails.push({
            equipment: equip,
            quantity: item.quantity,
          });
        }
      }

      let coachDetails = null;
      if (coachId) {
        coachDetails = await Coach.findById(coachId);
      }

      const duration = bookingService.calculateDuration(startTime, endTime);

      const pricing = await pricingService.calculatePrice({
        court,
        equipment: equipmentDetails,
        coach: coachDetails,
        date,
        startTime,
        endTime,
        duration,
      });

      res.json({
        success: true,
        data: pricing,
      });
    } catch (error) {
      console.error('Pricing preview error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = bookingController;
