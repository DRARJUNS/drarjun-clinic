const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const ContactMessage = require('../models/ContactMessage.model');

/**
 * Submit contact inquiry (Public)
 * POST /api/v1/contact
 */
const submitContactMessage = asyncHandler(async (req, res) => {
    const message = await ContactMessage.create(req.body);
    return ApiResponse.created(
        res,
        'Thank you for contacting Dr Arjun\'s Homoeo Care. We will get back to you soon.',
        message
    );
});

/**
 * Get all contact messages (Admin)
 * GET /api/v1/contact
 */
const getContactMessages = asyncHandler(async (req, res) => {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, 'Contact messages retrieved successfully', messages);
});

/**
 * Mark contact message as read (Admin)
 * PATCH /api/v1/contact/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
    const message = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );
    if (!message) {
        throw ApiError.notFound('Contact message not found.');
    }
    return ApiResponse.success(res, 'Message marked as read', message);
});

module.exports = {
    submitContactMessage,
    getContactMessages,
    markAsRead
};
