const oracledb = require('oracledb');
require('dotenv').config();

// Ensure output format is JavaScript Object
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const dbConfig = {
    user: process.env.ORACLE_USER || 'REALESTATE_USER',
    password: process.env.ORACLE_PASSWORD || 'RealEstate2024#',
    connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1',
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 60
};

let pool = null;

async function initializePool() {
    if (!pool) {
        try {
            pool = await oracledb.createPool(dbConfig);
            console.log(`[Oracle DB] Connection pool created for user: ${dbConfig.user} @ ${dbConfig.connectString}`);
        } catch (err) {
            console.error('[Oracle DB] Error initializing connection pool:', err.message);
            throw err;
        }
    }
    return pool;
}

async function closePool() {
    if (pool) {
        try {
            await pool.close(10);
            pool = null;
            console.log('[Oracle DB] Connection pool closed.');
        } catch (err) {
            console.error('[Oracle DB] Error closing connection pool:', err.message);
        }
    }
}

/**
 * Execute SQL Query with optional binds and options
 */
async function execute(sql, binds = {}, options = {}) {
    let connection;
    try {
        if (!pool) await initializePool();
        connection = await pool.getConnection();
        const result = await connection.execute(sql, binds, {
            autoCommit: true,
            ...options
        });
        return result;
    } catch (err) {
        // Format clean error message
        const cleanedMessage = extractOracleError(err);
        const error = new Error(cleanedMessage);
        error.original = err;
        error.code = err.errorNum || err.code;
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('[Oracle DB] Error closing connection:', closeErr);
            }
        }
    }
}

/**
 * Helper to clean and format Oracle exception messages for UI consumption
 */
function extractOracleError(err) {
    if (!err || !err.message) return 'Unknown database error occurred.';
    const msg = err.message;
    // Look for ORA-20xxx application errors
    const appMatch = msg.match(/ORA-20\d{3}:\s*([^\n\r]+)/);
    if (appMatch) {
        return appMatch[1].replace(/ORA-\d+:\s*/g, '').trim();
    }
    const genericMatch = msg.match(/ORA-\d+:\s*([^\n\r]+)/);
    if (genericMatch) {
        return genericMatch[0].trim();
    }
    return msg;
}

/**
 * Check connectivity and retrieve DB metadata
 */
async function checkHealth() {
    try {
        const result = await execute(`
            SELECT sys_context('USERENV', 'CON_NAME') AS container,
                   sys_context('USERENV', 'SESSION_USER') AS db_user,
                   sys_context('USERENV', 'DB_NAME') AS db_name,
                   SYSTIMESTAMP AS current_time
              FROM dual
        `);
        return {
            connected: true,
            details: result.rows[0]
        };
    } catch (err) {
        return {
            connected: false,
            error: err.message
        };
    }
}

module.exports = {
    oracledb,
    initializePool,
    closePool,
    execute,
    checkHealth,
    extractOracleError
};
