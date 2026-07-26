// AI Routes — Week 7 AI Coach + premium AI Chatbot
const express = require('express');
const router  = express.Router();
const aiCoachController = require('../controllers/aiCoachController');
const aiChatController  = require('../controllers/aiChatController');

// POST /api/ai/coach — analyze the logged-in user's habits and return coaching feedback
router.post('/coach', aiCoachController.getCoaching);

// Premium AI Chatbot — natural-language follow-up questions about the
// user's habits, with conversation history persisted in MongoDB.
router.post('/chat',           aiChatController.sendMessage);
router.get('/chat/history',    aiChatController.getHistory);
router.delete('/chat/history', aiChatController.clearHistory);

module.exports = router;
