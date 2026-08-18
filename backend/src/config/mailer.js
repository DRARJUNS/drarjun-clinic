const nodemailer = require('nodemailer');
const config = require('./env');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        if (config.SMTP_USER && config.SMTP_PASS && config.SMTP_PASS !== 'app_password_placeholder') {
            transporter = nodemailer.createTransport({
                host: config.SMTP_HOST,
                port: config.SMTP_PORT,
                secure: config.SMTP_PORT === 465,
                auth: {
                    user: config.SMTP_USER,
                    pass: config.SMTP_PASS
                }
            });
            logger.info('📧 Nodemailer SMTP transporter initialized.');
        } else {
            logger.warn('⚠️ SMTP credentials not fully configured. Email dispatch will be simulated in console.');
        }
    }
    return transporter;
};

module.exports = {
    getTransporter
};
