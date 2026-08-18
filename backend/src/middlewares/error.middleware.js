const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Convert non-ApiError errors into ApiError instances
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    // Log the error
    logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} ${error.message}`);
    if (config.NODE_ENV === 'development' && error.stack) {
        console.error(error.stack);
    }

    // Specific Mongoose Error Handlers
    if (err.name === 'CastError') {
        const message = `Resource not found with id: ${err.value}`;
        error = ApiError.notFound(message);
    }

    // Mongoose Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate value entered for ${field} field. Value must be unique.`;
        error = ApiError.conflict(message);
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = ApiError.badRequest(message);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
        ...(config.NODE_ENV === 'development' && { stack: error.stack })
    };

    return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
