const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Court routes
router.post('/courts', adminController.createCourt);
router.put('/courts/:id', adminController.updateCourt);
router.get('/courts', adminController.getCourts);
router.delete('/courts/:id', adminController.deleteCourt);

// Equipment routes
router.post('/equipment', adminController.createEquipment);
router.put('/equipment/:id', adminController.updateEquipment);
router.get('/equipment', adminController.getEquipment);
router.delete('/equipment/:id', adminController.deleteEquipment);

// Coach routes
router.post('/coaches', adminController.createCoach);
router.put('/coaches/:id', adminController.updateCoach);
router.get('/coaches', adminController.getCoaches);
router.delete('/coaches/:id', adminController.deleteCoach);

// Pricing rule routes
router.post('/pricing-rules', adminController.createPricingRule);
router.put('/pricing-rules/:id', adminController.updatePricingRule);
router.get('/pricing-rules', adminController.getPricingRules);
router.delete('/pricing-rules/:id', adminController.deletePricingRule);

// Waitlist management routes
router.get('/waitlist', adminController.getAllWaitlist);
router.put('/waitlist/:id/notify', adminController.notifyWaitlistUser);
router.delete('/waitlist/:id', adminController.removeFromWaitlist);

module.exports = router;
