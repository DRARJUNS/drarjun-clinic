const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const appointmentRoutes = require('./appointment.routes');
const doctorRoutes = require('./doctor.routes');
const contactRoutes = require('./contact.routes');
const statsRoutes = require('./stats.routes');
const aiRoutes = require('./ai.routes');

// Healthcheck Route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Dr Arjun's Homoeo Care API is healthy and operational 🩺",
        timestamp: new Date().toISOString()
    });
});

// Mounting Sub-routes
router.use('/auth', authRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/contact', contactRoutes);
router.use('/stats', statsRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
