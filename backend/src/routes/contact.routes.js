const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact.controller');
const validate = require('../middlewares/validate.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { contactMessageSchema } = require('../validations/contact.validation');
const { appointmentLimiter } = require('../middlewares/rateLimiter.middleware');
const ROLES = require('../constants/roles');

// Public route: Submit contact message (rate limited & validated)
router.post(
    '/',
    appointmentLimiter,
    validate(contactMessageSchema),
    contactController.submitContactMessage
);

// Protected routes (Admin & Staff)
router.get(
    '/',
    protect,
    restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    contactController.getContactMessages
);

router.patch(
    '/:id/read',
    protect,
    restrictTo(ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST),
    contactController.markAsRead
);

module.exports = router;
