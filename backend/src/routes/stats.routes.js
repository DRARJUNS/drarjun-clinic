const express = require('express');
const router = express.Router();

const statsController = require('../controllers/stats.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(protect);

router.get(
    '/overview',
    restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    statsController.getOverviewStats
);

router.post(
    '/test-email',
    restrictTo(ROLES.SUPER_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    statsController.testEmailNotification
);

module.exports = router;
