const { z } = require('zod');

const contactMessageSchema = z.object({
    name: z.string().min(2, 'Name is required').trim(),
    phone: z.string().min(10, 'Valid phone number is required').trim(),
    email: z.string().email('Valid email address is required').optional().or(z.literal('')),
    subject: z.string().optional().default('General Inquiry'),
    message: z.string().min(5, 'Message must be at least 5 characters long').max(1500, 'Message cannot exceed 1500 characters').trim()
});

module.exports = {
    contactMessageSchema
};
