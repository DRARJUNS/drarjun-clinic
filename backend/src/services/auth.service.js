const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User.model');
const ApiError = require('../utils/apiError');

/**
 * Generate JWT token
 * @param {string} userId 
 * @param {string} role 
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN }
    );
};

/**
 * Register a new user
 */
const register = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw ApiError.conflict('An account with this email already exists.');
    }

    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
        },
        token
    };
};

/**
 * Login user
 */
const login = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
        throw ApiError.forbidden('This account has been deactivated. Please contact the administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password.');
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            lastLogin: user.lastLogin
        },
        token
    };
};

module.exports = {
    generateToken,
    register,
    login
};
