const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        if (!config.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is missing.");
        }

        const conn = await mongoose.connect(config.MONGO_URI, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000,
        });

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting reconnection...');
        });

    } catch (error) {
        logger.error(`MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
