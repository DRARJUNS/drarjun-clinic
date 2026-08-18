const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const Doctor = require('../models/Doctor.model');

/**
 * Get all active doctors (Public)
 * GET /api/v1/doctors
 */
const getDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find({ isActive: true }).select('-__v');
    return ApiResponse.success(res, 'Doctors retrieved successfully', doctors);
});

/**
 * Get doctor by ID with details (Public)
 * GET /api/v1/doctors/:id
 */
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
        throw ApiError.notFound('Doctor not found.');
    }
    return ApiResponse.success(res, 'Doctor retrieved successfully', doctor);
});

/**
 * Create new doctor profile (Admin only)
 * POST /api/v1/doctors
 */
const createDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.create(req.body);
    return ApiResponse.created(res, 'Doctor profile created successfully', doctor);
});

/**
 * Update doctor profile (Admin / Self)
 * PUT /api/v1/doctors/:id
 */
const updateDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doctor) {
        throw ApiError.notFound('Doctor not found.');
    }
    return ApiResponse.success(res, 'Doctor profile updated successfully', doctor);
});

module.exports = {
    getDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor
};
