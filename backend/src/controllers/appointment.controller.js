const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const appointmentService = require('../services/appointment.service');

/**
 * Create/Book a new appointment (Public)
 * POST /api/v1/appointments
 */
const createAppointment = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.createAppointment(req.body);
    return ApiResponse.created(
        res,
        'Appointment request submitted successfully! Our clinic will contact you shortly.',
        appointment
    );
});

/**
 * Get all appointments (Admin/Doctor)
 * GET /api/v1/appointments
 */
const getAppointments = asyncHandler(async (req, res) => {
    const { page, limit, status, doctorId, search, date } = req.query;
    const result = await appointmentService.getAppointments({
        page,
        limit,
        status,
        doctorId,
        search,
        date
    });
    return ApiResponse.success(res, 'Appointments retrieved successfully', result);
});

/**
 * Get single appointment details (Admin/Doctor)
 * GET /api/v1/appointments/:id
 */
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    return ApiResponse.success(res, 'Appointment details retrieved successfully', appointment);
});

/**
 * Update appointment status & notes (Admin/Doctor)
 * PATCH /api/v1/appointments/:id/status
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.updateAppointmentStatus(req.params.id, req.body);
    return ApiResponse.success(res, 'Appointment status updated successfully', appointment);
});

/**
 * Delete an appointment (Admin)
 * DELETE /api/v1/appointments/:id
 */
const deleteAppointment = asyncHandler(async (req, res) => {
    await appointmentService.deleteAppointment(req.params.id);
    return ApiResponse.success(res, 'Appointment deleted successfully');
});

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment
};
