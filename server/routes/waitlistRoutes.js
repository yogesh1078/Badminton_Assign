const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const { authenticate } = require('../middleware/auth');

// All waitlist routes require authentication
router.post('/', authenticate, waitlistController.addToWaitlist);
router.get('/user/:userId', authenticate, waitlistController.getUserWaitlist);
router.delete('/:id', authenticate, waitlistController.removeFromWaitlist);

module.exports = router;
