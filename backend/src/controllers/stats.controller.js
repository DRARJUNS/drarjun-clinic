const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const Appointment = require('../models/Appointment.model');
const Doctor = require('../models/Doctor.model');
const ContactMessage = require('../models/ContactMessage.model');
const { APPOINTMENT_STATUS } = require('../constants/appointmentStatus');

/**
 * Get dashboard overview metrics (Admin / Doctor)
 * GET /api/v1/stats/overview
 */
const getOverviewStats = asyncHandler(async (req, res) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        todayAppointments,
        totalDoctors,
        unreadMessages,
        treatmentBreakdown
    ] = await Promise.all([
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: APPOINTMENT_STATUS.PENDING }),
        Appointment.countDocuments({ status: APPOINTMENT_STATUS.CONFIRMED }),
        Appointment.countDocuments({ appointmentDate: { $gte: todayStart, $lte: todayEnd } }),
        Doctor.countDocuments({ isActive: true }),
        ContactMessage.countDocuments({ isRead: false }),
        Appointment.aggregate([
            { $group: { _id: '$treatment', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ])
    ]);

    return ApiResponse.success(res, 'Dashboard metrics retrieved successfully', {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        todayAppointments,
        totalDoctors,
        unreadMessages,
        treatmentBreakdown
    });
});

/**
 * Send a test email (Admin only)
 * POST /api/v1/stats/test-email
 */
const testEmailNotification = asyncHandler(async (req, res) => {
    const { getTransporter } = require('../config/mailer');
    const config = require('../config/env');
    const transporter = getTransporter();

    const targetEmail = req.body.email || config.CLINIC_NOTIFICATION_EMAIL;

    if (!transporter) {
        throw ApiError.badRequest('SMTP is not yet configured in backend/.env. Please replace SMTP_PASS placeholder with your Gmail App Password.');
    }

    const mailOptions = {
        from: config.EMAIL_FROM,
        to: targetEmail,
        subject: `🧪 Test Email - Dr Arjun's Homoeo Care`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0b8457; color: #ffffff; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">SMTP Test Successful!</h2>
                </div>
                <div style="padding: 20px; color: #333;">
                    <p>Hello Admin,</p>
                    <p>This is a test email confirming that your email notification system for <strong>Dr Arjun's Homoeo Care</strong> is working properly.</p>
                    <p>Patients and clinic administrators will automatically receive real-time email notifications for every booked appointment.</p>
                    <p style="color: #666; font-size: 13px;">Timestamp: ${new Date().toLocaleString('en-IN')}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (mailError) {
        throw ApiError.badRequest(`SMTP delivery failed: ${mailError.message}. Please check your Gmail App Password and ensure 2-Step Verification is active.`);
    }

    return ApiResponse.success(res, `Test email successfully sent to ${targetEmail}!`);
});

module.exports = {
    getOverviewStats,
    testEmailNotification
};
