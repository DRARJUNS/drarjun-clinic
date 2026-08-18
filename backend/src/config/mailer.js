const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        const cleanPass = (config.SMTP_PASS || '').replace(/\s+/g, '');
        if (config.SMTP_USER && cleanPass && cleanPass !== 'app_password_placeholder') {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.SMTP_USER,
                    pass: cleanPass
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 15000
            });
            logger.info('📧 Nodemailer SMTP transporter initialized for Gmail.');
        } else {
            logger.warn('⚠️ SMTP credentials not fully configured. Email dispatch will be simulated in console.');
        }
    }
    return transporter;
};

module.exports = {
    getTransporter
};
