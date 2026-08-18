const Appointment = require('../models/Appointment.model');
const Doctor = require('../models/Doctor.model');
const ApiError = require('../utils/apiError');
const emailService = require('./email.service');

/**
 * Create a new patient appointment and dispatch notification emails
 */
const createAppointment = async (appointmentData) => {
    // If doctorId is provided, verify doctor exists
    if (appointmentData.doctorId) {
        const doctor = await Doctor.findById(appointmentData.doctorId);
        if (!doctor || !doctor.isActive) {
            throw ApiError.badRequest('Selected doctor is currently unavailable or invalid.');
        }
    }

    const appointment = await Appointment.create(appointmentData);

    // Asynchronously send emails in the background without blocking the response
    emailService.sendPatientConfirmationEmail(appointment).catch(err => console.error('Patient email error:', err));
    emailService.sendClinicNotificationEmail(appointment).catch(err => console.error('Clinic email error:', err));

    return appointment;
};

/**
 * Get paginated and filtered appointments list
 */
const getAppointments = async ({ page = 1, limit = 20, status, doctorId, search, date }) => {
    const query = {};

    if (status) {
        query.status = status;
    }

    if (doctorId) {
        query.doctorId = doctorId;
    }

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
        query.$or = [
            { patientName: { $regex: search, $options: 'i' } },
            { patientPhone: { $regex: search, $options: 'i' } },
            { treatment: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;
    const [appointments, total] = await Promise.all([
        Appointment.find(query)
            .populate('doctorId', 'name qualification specialization')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Appointment.countDocuments(query)
    ]);

    return {
        appointments,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            limit: Number(limit)
        }
    };
};

/**
 * Get single appointment by ID
 */
const getAppointmentById = async (id) => {
    const appointment = await Appointment.findById(id).populate('doctorId', 'name qualification specialization');
    if (!appointment) {
        throw ApiError.notFound('Appointment not found.');
    }
    return appointment;
};

/**
 * Update appointment status & notes
 */
const updateAppointmentStatus = async (id, { status, doctorNotes }) => {
    const appointment = await Appointment.findById(id).populate('doctorId', 'name qualification specialization');
    if (!appointment) {
        throw ApiError.notFound('Appointment not found.');
    }

    const previousStatus = appointment.status;
    if (status) appointment.status = status;
    if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;

    await appointment.save();

    // Trigger status update email if status changed
    if (status && status !== previousStatus) {
        emailService.sendAppointmentStatusUpdateEmail(appointment).catch(err => {
            console.error(`Error sending status update email for appointment ${id}:`, err);
        });
    }

    return appointment;
};

/**
 * Delete an appointment
 */
const deleteAppointment = async (id) => {
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
        throw ApiError.notFound('Appointment not found.');
    }
    return true;
};

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment
};
