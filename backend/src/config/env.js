const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from cwd, backend/.env, and root/.env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_drarjun_homoeocare',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CLIENT_URL: process.env.CLIENT_URL || '*',
    
    // SMTP & HTTP Mail Config (Brevo / Resend / Gmail SMTP)
    BREVO_API_KEY: process.env.BREVO_API_KEY || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '"Dr Arjun\'s Homoeo Care" <drarjunshomoeocare@gmail.com>',
    CLINIC_NOTIFICATION_EMAIL: process.env.CLINIC_NOTIFICATION_EMAIL || 'drarjunshomoeocare@gmail.com',
    
    // Clinic Meta
    CLINIC_PHONE: process.env.CLINIC_PHONE || '+91 78429 11774',
    CLINIC_NAME: process.env.CLINIC_NAME || "Dr Arjun's Homoeo Care"
};

// Validate critical variables
if (!config.MONGO_URI) {
    console.warn("⚠️ Warning: MONGO_URI is not set in environment variables. Database connection will fail unless provided.");
}

module.exports = config;
