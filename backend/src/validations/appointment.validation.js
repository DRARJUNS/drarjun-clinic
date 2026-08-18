const { z } = require('zod');
const { APPOINTMENT_STATUS, CONSULTATION_TYPES } = require('../constants/appointmentStatus');

const createAppointmentSchema = z.object({
    patientName: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
    
    patientPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)').optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)').optional(),
    
    patientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    
    patientAge: z.number().int().min(0).max(120).optional(),
    patientGender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
    doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Doctor ID format').optional().or(z.literal('')),
    treatment: z.string().min(2, 'Please select or specify a treatment').trim(),
    consultationType: z.enum([CONSULTATION_TYPES.ONLINE_VIDEO, CONSULTATION_TYPES.PHONE_CALL, CONSULTATION_TYPES.ONLINE]).optional(),
    appointmentDate: z.string().optional(),
    preferredTimeSlot: z.string().optional(),
    message: z.string().max(1000, 'Message cannot exceed 1000 characters').optional().default('')
}).refine(data => data.patientName || data.name, {
    message: 'Patient name is required',
    path: ['patientName']
}).refine(data => data.patientPhone || data.phone, {
    message: 'Valid 10-digit Indian phone number is required',
    path: ['patientPhone']
}).transform(data => ({
    patientName: data.patientName || data.name,
    patientPhone: data.patientPhone || data.phone,
    patientEmail: data.patientEmail || data.email || '',
    patientAge: data.patientAge,
    patientGender: data.patientGender || 'Prefer not to say',
    doctorId: data.doctorId || undefined,
    treatment: data.treatment,
    consultationType: data.consultationType || CONSULTATION_TYPES.ONLINE_VIDEO,
    appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : new Date(),
    preferredTimeSlot: data.preferredTimeSlot || 'Morning (9 AM - 1 PM)',
    message: data.message || ''
}));

const updateAppointmentStatusSchema = z.object({
    status: z.enum([
        APPOINTMENT_STATUS.PENDING,
        APPOINTMENT_STATUS.CONFIRMED,
        APPOINTMENT_STATUS.COMPLETED,
        APPOINTMENT_STATUS.CANCELLED,
        APPOINTMENT_STATUS.NO_SHOW,
        APPOINTMENT_STATUS.RESCHEDULED
    ]),
    doctorNotes: z.string().optional()
});

module.exports = {
    createAppointmentSchema,
    updateAppointmentStatusSchema
};
