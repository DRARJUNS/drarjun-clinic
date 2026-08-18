const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const authService = require('../services/auth.service');
const User = require('../models/User.model');

/**
 * Register new user (Staff/Doctor/Admin)
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, 'User registered successfully', result);
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return ApiResponse.success(res, 'Login successful', result);
});

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    return ApiResponse.success(res, 'Profile retrieved successfully', user);
});

module.exports = {
    register,
    login,
    getMe
};
