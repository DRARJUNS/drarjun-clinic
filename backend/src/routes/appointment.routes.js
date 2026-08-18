const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { appointmentLimiter } = require('../middlewares/rateLimiter.middleware');
const {
    createAppointmentSchema,
    updateAppointmentStatusSchema
} = require('../validations/appointment.validation');
const ROLES = require('../constants/roles');

// Public route: Book appointment (Rate limited & Validated)
router.post(
    '/',
    appointmentLimiter,
    validate(createAppointmentSchema),
    appointmentController.createAppointment
);

// Protected routes (Admin, Doctors & Receptionists)
router.use(protect);

router.get(
    '/',
    restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    appointmentController.getAppointments
);

router.get(
    '/:id',
    restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    appointmentController.getAppointmentById
);

router.patch(
    '/:id/status',
    restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    validate(updateAppointmentStatusSchema),
    appointmentController.updateAppointmentStatus
);

router.delete(
    '/:id',
    restrictTo(ROLES.SUPER_ADMIN),
    appointmentController.deleteAppointment
);

module.exports = router;
