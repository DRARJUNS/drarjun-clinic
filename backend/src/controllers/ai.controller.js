const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const aiService = require('../services/ai.service');

/**
 * Chat with Arjun AI Bot Assistant (Public)
 * POST /api/v1/ai/chat
 */
const chatWithAi = asyncHandler(async (req, res) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
        throw ApiError.badRequest('Message cannot be empty.');
    }

    const botResponse = await aiService.generateBotResponse(message.trim(), history || []);

    return ApiResponse.success(res, 'AI response generated successfully', botResponse);
});

module.exports = {
    chatWithAi
};
