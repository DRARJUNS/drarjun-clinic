/**
 * Wraps async route handlers to automatically forward exceptions to the global error middleware
 * @param {Function} fn - Async controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
