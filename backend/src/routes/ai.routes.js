const express = require('express');
const router = express.Router();

const aiController = require('../controllers/ai.controller');
const { appointmentLimiter } = require('../middlewares/rateLimiter.middleware');

// Public AI Chatbot Route (rate limited)
router.post('/chat', appointmentLimiter, aiController.chatWithAi);

module.exports = router;
