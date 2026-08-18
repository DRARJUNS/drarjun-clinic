const { getTransporter } = require('../config/mailer');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Send email via Brevo HTTPS REST API (Port 443 - 100% reliable on Render/Cloud)
 */
const sendViaBrevo = async ({ to, subject, html, fromEmail, fromName }) => {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': config.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: fromName || config.CLINIC_NAME,
                email: fromEmail || config.SMTP_USER || 'drarjunshomoeocare@gmail.com'
            },
            to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
            subject,
            htmlContent: html
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Brevo HTTP Error: ${res.status}`);
    }
    return await res.json();
};

/**
 * Send email via Resend HTTPS REST API (Port 443)
 */
const sendViaResend = async ({ to, subject, html, from }) => {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: from || `Dr Arjun's Homoeo Care <onboarding@resend.dev>`,
            to: Array.isArray(to) ? to : [to],
            subject,
            html
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Resend HTTP Error: ${res.status}`);
    }
    return await res.json();
};

/**
 * Send email via Nodemailer SMTP (Gmail / Custom SMTP)
 */
const sendViaSmtp = async ({ to, subject, html, from }) => {
    const transporter = getTransporter();
    if (!transporter) {
        throw new Error('SMTP transporter is not configured. Please set BREVO_API_KEY or SMTP_USER/SMTP_PASS.');
    }
    return await transporter.sendMail({
        from: from || config.EMAIL_FROM,
        to,
        subject,
        html
    });
};

/**
 * Core Universal Email Dispatcher
 */
const sendEmail = async ({ to, subject, html, from, fromEmail, fromName }) => {
    if (config.BREVO_API_KEY) {
        logger.info(`📨 Dispatching email via Brevo HTTPS API to: ${Array.isArray(to) ? to.join(', ') : to}`);
        return await sendViaBrevo({ to, subject, html, fromEmail, fromName });
    } else if (config.RESEND_API_KEY) {
        logger.info(`📨 Dispatching email via Resend HTTPS API to: ${Array.isArray(to) ? to.join(', ') : to}`);
        return await sendViaResend({ to, subject, html, from });
    } else if (config.SMTP_USER && config.SMTP_PASS && config.SMTP_PASS !== 'app_password_placeholder') {
        logger.info(`📨 Dispatching email via SMTP to: ${Array.isArray(to) ? to.join(', ') : to}`);
        return await sendViaSmtp({ to, subject, html, from });
    } else {
        logger.warn(`⚠️ No email provider configured (BREVO_API_KEY or SMTP_PASS). Simulating dispatch.`);
        logger.info(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
        return { simulated: true };
    }
};

/**
 * Send automated appointment confirmation to the patient
 * @param {Object} appointment 
 */
const sendPatientConfirmationEmail = async (appointment) => {
    if (!appointment.patientEmail) return;

    const html = `
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
    `;

    try {
        await sendEmail({
            to: appointment.patientEmail,
            subject: `Appointment Confirmation - ${config.CLINIC_NAME}`,
            html
        });
        logger.info(`✉️ Patient confirmation email dispatched to: ${appointment.patientEmail}`);
    } catch (error) {
        logger.error(`Failed to send patient email: ${error.message}`);
    }
};

/**
 * Send notification to the clinic admin/doctor for a new appointment
 * @param {Object} appointment 
 */
const sendClinicNotificationEmail = async (appointment) => {
    const html = `
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
    `;

    try {
        await sendEmail({
            to: config.CLINIC_NOTIFICATION_EMAIL,
            subject: `🔔 New Appointment Alert: ${appointment.patientName} (${appointment.treatment})`,
            html
        });
        logger.info(`✉️ Clinic notification email dispatched to: ${config.CLINIC_NOTIFICATION_EMAIL}`);
    } catch (error) {
        logger.error(`Failed to send clinic alert email: ${error.message}`);
    }
};

/**
 * Send notification to the patient when appointment status is updated (Confirmed, Completed, Cancelled)
 * @param {Object} appointment 
 */
const sendAppointmentStatusUpdateEmail = async (appointment) => {
    if (!appointment.patientEmail) return;

    let statusTitle = 'Appointment Update';
    let statusColor = '#0b8457';
    let statusMessage = `Your appointment status has been updated to: <strong>${appointment.status}</strong>.`;

    if (appointment.status === 'CONFIRMED') {
        statusTitle = 'Appointment Confirmed! ✅';
        statusColor = '#0b8457';
        statusMessage = `Great news! Your consultation with <strong>${config.CLINIC_NAME}</strong> has been officially confirmed by our medical team.`;
    } else if (appointment.status === 'COMPLETED') {
        statusTitle = 'Consultation Completed 🌿';
        statusColor = '#1e3a8a';
        statusMessage = `Thank you for consulting with <strong>${config.CLINIC_NAME}</strong>. We hope you had a positive and healing experience.`;
    } else if (appointment.status === 'CANCELLED') {
        statusTitle = 'Appointment Cancelled';
        statusColor = '#dc2626';
        statusMessage = `Your appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString('en-IN')} has been cancelled. If you wish to reschedule, please contact our clinic.`;
    }

    const doctorName = appointment.doctorId?.name || "Dr Arjun's Medical Team";

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: ${statusColor}; color: #ffffff; padding: 22px; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">${statusTitle}</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px;">${config.CLINIC_NAME}</p>
            </div>
            <div style="padding: 24px; color: #333333; line-height: 1.6;">
                <p>Dear <strong>${appointment.patientName}</strong>,</p>
                <p>${statusMessage}</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid ${statusColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 4px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                    <p style="margin: 4px 0;"><strong>Treatment:</strong> ${appointment.treatment}</p>
                    <p style="margin: 4px 0;"><strong>Consultation Mode:</strong> ${appointment.consultationType}</p>
                    <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}</p>
                    <p style="margin: 4px 0;"><strong>Time Slot:</strong> ${appointment.preferredTimeSlot}</p>
                    <p style="margin: 4px 0;"><strong>Current Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${appointment.status}</span></p>
                    ${appointment.doctorNotes ? `<p style="margin: 8px 0 4px 0;"><strong>Doctor's Notes:</strong> ${appointment.doctorNotes}</p>` : ''}
                </div>

                ${appointment.consultationType === 'Online Video Consultation' && appointment.status === 'CONFIRMED' ? `
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 13px; color: #1e40af;">
                            📹 <strong>Online Consultation:</strong> Our doctor will initiate the consultation call on your phone (<strong>${appointment.patientPhone}</strong>) / WhatsApp at the scheduled slot.
                        </p>
                    </div>
                ` : ''}

                <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
                
                <p style="margin: 0; font-size: 13px; color: #777;">
                    For any assistance, call us directly at <a href="tel:${config.CLINIC_PHONE}" style="color: #0b8457; text-decoration: none;">${config.CLINIC_PHONE}</a>.
                </p>
            </div>
            <div style="background-color: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #666;">
                © ${new Date().getFullYear()} ${config.CLINIC_NAME}. All rights reserved.
            </div>
        </div>
    `;

    try {
        await sendEmail({
            to: appointment.patientEmail,
            subject: `[${appointment.status}] Appointment Status Update - ${config.CLINIC_NAME}`,
            html
        });
        logger.info(`✉️ Status update email (${appointment.status}) dispatched to patient: ${appointment.patientEmail}`);
    } catch (error) {
        logger.error(`Failed to send status update email: ${error.message}`);
    }
};

module.exports = {
    sendEmail,
    sendPatientConfirmationEmail,
    sendClinicNotificationEmail,
    sendAppointmentStatusUpdateEmail
};
