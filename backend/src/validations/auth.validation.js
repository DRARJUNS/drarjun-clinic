const { z } = require('zod');
const ROLES = require('../constants/roles');

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]).optional()
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

module.exports = {
    registerSchema,
    loginSchema
};
