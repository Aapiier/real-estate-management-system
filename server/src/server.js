const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Real Estate Management System API',
        version: '1.0.0',
        database: 'Oracle Database 21c Express Edition',
        status: 'Online',
        endpoints: '/api'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Start Server and Initialize DB Pool
async function startServer() {
    try {
        await db.initializePool();
        const health = await db.checkHealth();
        if (health.connected) {
            console.log(`[Oracle DB] Connected successfully to container: ${health.details.CONTAINER} as ${health.details.DB_USER}`);
        } else {
            console.warn('[Oracle DB] Warning: Could not verify connection health:', health.error);
        }

        const server = app.listen(PORT, () => {
            console.log(`================================================================`);
            console.log(`Real Estate Management System Backend`);
            console.log(`Server running at: http://localhost:${PORT}`);
            console.log(`API Health Check:   http://localhost:${PORT}/api/health`);
            console.log(`Database:           Oracle Database 21c (XE)`);
            console.log(`================================================================`);
        });

        // Graceful Shutdown
        const shutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Gracefully shutting down...`);
            server.close(async () => {
                await db.closePool();
                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (err) {
        console.error('Fatal error starting server:', err);
        process.exit(1);
    }
}

startServer();
