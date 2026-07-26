// AI Routes — Week 7
const express = require('express');
const router  = express.Router();
const aiCoachController = require('../controllers/aiCoachController');

// POST /api/ai/coach — analyze the logged-in user's habits and return coaching feedback
router.post('/coach', aiCoachController.getCoaching);

module.exports = router;
