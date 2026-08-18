const { getTransporter } = require('../config/mailer');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Send automated appointment confirmation to the patient
 * @param {Object} appointment 
 */
const sendPatientConfirmationEmail = async (appointment) => {
    if (!appointment.patientEmail) return;

    const transporter = getTransporter();
    const mailOptions = {
        from: config.EMAIL_FROM,
        to: appointment.patientEmail,
        subject: `Appointment Confirmation - ${config.CLINIC_NAME}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0b8457; color: #ffffff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">${config.CLINIC_NAME}</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">Holistic Homeopathic Treatment & Natural Healing</p>
                </div>
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                    <h2 style="color: #0b8457; margin-top: 0;">Appointment Request Received!</h2>
                    <p>Dear <strong>${appointment.patientName}</strong>,</p>
                    <p>Thank you for choosing ${config.CLINIC_NAME}. We have received your appointment request with the following details:</p>
                    
                    <div style="background-color: #f9f9f9; border-left: 4px solid #0b8457; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 4px 0;"><strong>Treatment:</strong> ${appointment.treatment}</p>
                        <p style="margin: 4px 0;"><strong>Consultation Mode:</strong> ${appointment.consultationType}</p>
                        <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}</p>
                        <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${appointment.preferredTimeSlot}</p>
                        <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">${appointment.status}</span></p>
                    </div>

                    <p>Our clinic coordinator will contact you shortly on <strong>${appointment.patientPhone}</strong> to confirm your exact consultation timing.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
                    
                    <p style="margin: 0; font-size: 13px; color: #777;">
                        For urgent queries, call us directly at <a href="tel:${config.CLINIC_PHONE}" style="color: #0b8457; text-decoration: none;">${config.CLINIC_PHONE}</a> or reply to this email.
                    </p>
                </div>
                <div style="background-color: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #666;">
                    © ${new Date().getFullYear()} ${config.CLINIC_NAME}. All rights reserved.
                </div>
            </div>
        `
    };

    if (transporter) {
        try {
            await transporter.sendMail(mailOptions);
            logger.info(`✉️ Patient confirmation email dispatched to: ${appointment.patientEmail}`);
        } catch (error) {
            logger.error(`Failed to send patient email: ${error.message}`);
        }
    } else {
        logger.info(`[SIMULATED EMAIL] Confirmation sent to patient: ${appointment.patientEmail}`);
    }
};

/**
 * Send notification to the clinic admin/doctor for a new appointment
 * @param {Object} appointment 
 */
const sendClinicNotificationEmail = async (appointment) => {
    const transporter = getTransporter();
    const mailOptions = {
        from: config.EMAIL_FROM,
        to: config.CLINIC_NOTIFICATION_EMAIL,
        subject: `🔔 New Appointment Alert: ${appointment.patientName} (${appointment.treatment})`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="background-color: #1e3a8a; color: #ffffff; padding: 15px 20px;">
                    <h2 style="margin: 0;">New Appointment Booked</h2>
                </div>
                <div style="padding: 20px; color: #333333; line-height: 1.6;">
                    <p>A new appointment has been scheduled via the website.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold; width: 40%;">Patient Name:</td><td>${appointment.patientName}</td></tr>
                        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${appointment.patientPhone}">${appointment.patientPhone}</a></td></tr>
                        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${appointment.patientEmail || 'Not provided'}</td></tr>
                        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Treatment:</td><td>${appointment.treatment}</td></tr>
                        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Preferred Slot:</td><td>${appointment.preferredTimeSlot}</td></tr>
                        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Consultation Mode:</td><td>${appointment.consultationType}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold;">Patient Notes / Problem:</td><td>${appointment.message || 'None'}</td></tr>
                    </table>
                </div>
            </div>
        `
    };

    if (transporter) {
        try {
            await transporter.sendMail(mailOptions);
            logger.info(`✉️ Clinic notification email dispatched to: ${config.CLINIC_NOTIFICATION_EMAIL}`);
        } catch (error) {
            logger.error(`Failed to send clinic alert email: ${error.message}`);
        }
    } else {
        logger.info(`[SIMULATED EMAIL] Clinic notification dispatched to: ${config.CLINIC_NOTIFICATION_EMAIL}`);
    }
};

module.exports = {
    sendPatientConfirmationEmail,
    sendClinicNotificationEmail
};
