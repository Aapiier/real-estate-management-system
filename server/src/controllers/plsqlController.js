const db = require('../config/db');
const oracledb = require('oracledb');

// List all PL/SQL objects and status from user_objects
exports.getObjects = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT object_name, object_type, status, created, last_ddl_time
              FROM user_objects
             WHERE object_type IN ('PROCEDURE', 'FUNCTION', 'PACKAGE', 'PACKAGE BODY', 'TRIGGER')
             ORDER BY object_type, object_name
        `);

        // Also fetch triggers details
        const triggers = await db.execute(`
            SELECT trigger_name, trigger_type, triggering_event, table_name, status
              FROM user_triggers
             ORDER BY trigger_name
        `);

        res.json({
            success: true,
            data: {
                objects: result.rows,
                triggers: triggers.rows
            },
            objects: result.rows,
            triggers: triggers.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Test Function: calculate_agent_commission
exports.testCommission = async (req, res) => {
    try {
        const amount = req.body.amount || req.body.saleAmount;
        const rate = req.body.rate || req.body.commissionRate || 5.0;
        const startTime = Date.now();

        const result = await db.execute(`
            SELECT calculate_agent_commission(:amount, :rate) AS commission
              FROM dual
        `, {
            amount: parseFloat(amount),
            rate: parseFloat(rate)
        });

        const duration = Date.now() - startTime;
        res.json({
            success: true,
            commission: result.rows[0].COMMISSION,
            execution_time_ms: duration,
            inputs: { amount, rate },
            formula: `${amount} * ${rate}% = ${result.rows[0].COMMISSION}`
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Test Function: get_property_status
exports.testPropertyStatus = async (req, res) => {
    try {
        const property_id = req.body.property_id || req.body.propertyId;
        const startTime = Date.now();

        const result = await db.execute(`
            SELECT get_property_status(:id) AS status
              FROM dual
        `, { id: parseInt(property_id) });

        const duration = Date.now() - startTime;
        res.json({
            success: true,
            status: result.rows[0].STATUS,
            execution_time_ms: duration,
            property_id
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Test Function: calculate_rental_dues
exports.testRentalDues = async (req, res) => {
    try {
        const lease_id = req.body.lease_id || req.body.leaseId;
        const startTime = Date.now();

        const result = await db.execute(`
            SELECT calculate_rental_dues(:id) AS rental_dues,
                   get_lease_total_paid(:id) AS total_paid
              FROM dual
        `, { id: parseInt(lease_id) });

        const duration = Date.now() - startTime;
        res.json({
            success: true,
            rental_dues: result.rows[0].RENTAL_DUES,
            outstandingDues: result.rows[0].RENTAL_DUES,
            total_paid: result.rows[0].TOTAL_PAID,
            totalPaid: result.rows[0].TOTAL_PAID,
            execution_time_ms: duration,
            lease_id
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Run package explicit cursor report with DBMS_OUTPUT
exports.runPortfolioReport = async (req, res) => {
    let connection;
    try {
        const city = req.body.city || null;
        const pool = await db.initializePool();
        connection = await pool.getConnection();

        // 1. Enable DBMS_OUTPUT buffer
        await connection.execute(`BEGIN DBMS_OUTPUT.ENABLE(1000000); END;`);

        // 2. Call package procedure
        await connection.execute(
            `BEGIN realestate_pkg.generate_portfolio_report(:city); END;`,
            { city: city && city !== 'All' ? city : null }
        );

        // 3. Fetch DBMS_OUTPUT lines
        const linesResult = await connection.execute(
            `BEGIN DBMS_OUTPUT.GET_LINES(:lines, :numlines); END;`,
            {
                lines: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500, maxArraySize: 100 },
                numlines: { dir: oracledb.BIND_INOUT, type: oracledb.NUMBER, val: 100 }
            }
        );

        const lines = linesResult.outBinds.lines || [];
        res.json({
            success: true,
            procedure: 'realestate_pkg.generate_portfolio_report',
            output: lines,
            dbmsOutput: lines,
            line_count: lines.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) {}
        }
    }
};

// Run package reconcile dues with DBMS_OUTPUT
exports.runReconcileDues = async (req, res) => {
    let connection;
    try {
        const pool = await db.initializePool();
        connection = await pool.getConnection();

        await connection.execute(`BEGIN DBMS_OUTPUT.ENABLE(1000000); END;`);
        await connection.execute(`BEGIN realestate_pkg.reconcile_all_dues; END;`);

        const linesResult = await connection.execute(
            `BEGIN DBMS_OUTPUT.GET_LINES(:lines, :numlines); END;`,
            {
                lines: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500, maxArraySize: 100 },
                numlines: { dir: oracledb.BIND_INOUT, type: oracledb.NUMBER, val: 100 }
            }
        );

        const lines = linesResult.outBinds.lines || [];
        res.json({
            success: true,
            procedure: 'realestate_pkg.reconcile_all_dues',
            output: lines,
            dbmsOutput: lines,
            line_count: lines.length
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) {}
        }
    }
};

// Fetch security audit log entries to verify trigger & procedure logs
exports.getAuditLog = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT audit_id, audit_timestamp, action, details, user_id
              FROM security_audit
             ORDER BY audit_timestamp DESC, audit_id DESC
             FETCH FIRST 50 ROWS ONLY
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
