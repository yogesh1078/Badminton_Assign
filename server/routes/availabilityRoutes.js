const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');

router.get('/check', availabilityController.checkAvailability);
router.get('/slots', availabilityController.getAvailableSlots);
router.get('/resources', availabilityController.getAvailableResources);

module.exports = router;
