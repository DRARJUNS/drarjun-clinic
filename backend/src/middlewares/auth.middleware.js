const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes: verifies Bearer JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw ApiError.unauthorized('Not authorized to access this route. Token missing.');
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw ApiError.unauthorized('User associated with this token no longer exists.');
        }

        if (!user.isActive) {
            throw ApiError.forbidden('User account has been deactivated.');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            throw ApiError.unauthorized('Invalid authorization token.');
        } else if (err.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Authorization token has expired.');
        }
        throw err;
    }
});

/**
 * Restrict access to specific roles
 * @param  {...string} roles 
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw ApiError.forbidden('You do not have permission to perform this action.');
        }
        next();
    };
};

module.exports = {
    protect,
    restrictTo
};
