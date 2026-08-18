const app = require('./src/app');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const startServer = async () => {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start HTTP Listener
    const server = app.listen(config.PORT, () => {
        logger.info(`🚀 Dr Arjun's Homoeo Care Backend running in [${config.NODE_ENV}] mode on http://localhost:${config.PORT}`);
        logger.info(`👉 API Healthcheck available at: http://localhost:${config.PORT}/api/v1/health`);
    });

    // Graceful Shutdown Handlers
    const handleExit = (signal) => {
        logger.warn(`${signal} received. Closing HTTP server gracefully...`);
        server.close(() => {
            logger.info('HTTP server closed. Exiting process.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => handleExit('SIGTERM'));
    process.on('SIGINT', () => handleExit('SIGINT'));

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
        logger.error(`Unhandled Rejection: ${err.message}`);
        server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
        logger.error(`Uncaught Exception: ${err.message}`);
        process.exit(1);
    });
};

startServer();
