const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/sessions', analyticsController.getSessions);
router.get('/drivers', analyticsController.getDrivers);
router.post('/analyze', analyticsController.analyzeRace);

module.exports = router;
