const ApiError = require('../utils/apiError');

/**
 * Validates request data (body, query, or params) against a Zod schema
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req[source]);
            req[source] = parsed; // assign validated and coerced data back
            next();
        } catch (error) {
            if (error.errors) {
                const formattedErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                const message = formattedErrors.map(e => e.message).join(', ');
                return next(new ApiError(400, message, formattedErrors));
            }
            next(error);
        }
    };
};

module.exports = validate;
