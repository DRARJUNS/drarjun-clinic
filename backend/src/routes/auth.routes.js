const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const ROLES = require('../constants/roles');

// Public route: Login (rate limited)
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected route: Register new staff/doctor (Admin only)
router.post(
    '/register',
    protect,
    restrictTo(ROLES.SUPER_ADMIN),
    validate(registerSchema),
    authController.register
);

// Protected route: Current user profile
router.get('/me', protect, authController.getMe);

module.exports = router;
