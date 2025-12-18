const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

// All booking routes require authentication
router.post('/', authenticate, bookingController.createBooking);
router.get('/user/:userId', authenticate, bookingController.getUserBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.delete('/:id', authenticate, bookingController.cancelBooking);

// Pricing preview is public (for checking prices before login)
router.post('/pricing-preview', bookingController.getPricingPreview);

module.exports = router;
