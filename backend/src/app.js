const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const path = require('path');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const ApiError = require('./utils/apiError');

const app = express();

// Security HTTP Headers (relaxed CSP for CDN fonts & icons)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
const allowedOrigins = config.CLIENT_URL === '*' 
    ? '*' 
    : config.CLIENT_URL.split(',').map(url => url.trim());

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Request Logging
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Route shortcut for Admin Portal
app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendPath, 'admin.html'));
});

// Apply General Rate Limiter to API
app.use('/api', apiLimiter);

// API Status Route
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Dr Arjun's Homoeo Care API 🌿",
        version: "v1.0.0",
        docs: "/api/v1/health"
    });
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
