const rateLimit = require('express-rate-limit');

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

// Appointment booking rate limiter (prevents bot spam)
const appointmentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10, // max 10 bookings per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: 'Too many appointment booking requests from this IP. Please try again after 15 minutes or contact clinic directly.'
    }
});

// Authentication rate limiter (prevents brute force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, // max 15 login attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    }
});

module.exports = {
    apiLimiter,
    appointmentLimiter,
    authLimiter
};
