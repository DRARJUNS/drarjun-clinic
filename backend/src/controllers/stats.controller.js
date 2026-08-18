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
    const { sendEmail } = require('../services/email.service');
    const config = require('../config/env');

    const targetEmail = req.body.email || config.CLINIC_NOTIFICATION_EMAIL;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0b8457; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">Email System Test Successful! 🌿</h2>
            </div>
            <div style="padding: 24px; color: #333; line-height: 1.6;">
                <p>Hello Doctor / Admin,</p>
                <p>This is a test notification confirming that the automated email dispatch system for <strong>Dr Arjun's Homoeo Care</strong> is live and operating correctly.</p>
                <p>Patients and clinic staff will receive real-time confirmations whenever appointments are scheduled or updated.</p>
                <div style="background-color: #f4fbf7; border-left: 4px solid #0b8457; padding: 12px; margin: 15px 0;">
                    <p style="margin: 0; font-size: 13px; color: #0b8457;"><strong>Status:</strong> Active & Connected</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">Timestamp: ${new Date().toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>
    `;

    try {
        await sendEmail({
            to: targetEmail,
            subject: `🧪 Test Email - Dr Arjun's Homoeo Care`,
            html
        });
    } catch (mailError) {
        throw ApiError.badRequest(`Email delivery failed: ${mailError.message}. For cloud hosting on Render, you can configure BREVO_API_KEY (recommended) or check your SMTP settings.`);
    }

    return ApiResponse.success(res, `Test email successfully sent to ${targetEmail}!`);
});

module.exports = {
    getOverviewStats,
    testEmailNotification
};
