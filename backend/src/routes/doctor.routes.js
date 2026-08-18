const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctor.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

// Public routes
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes (Admin only)
router.post('/', protect, restrictTo(ROLES.SUPER_ADMIN), doctorController.createDoctor);
router.put('/:id', protect, restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR), doctorController.updateDoctor);

module.exports = router;
