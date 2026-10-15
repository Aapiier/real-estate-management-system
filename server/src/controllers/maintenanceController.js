const db = require('../config/db');

exports.getMaintenanceRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let sql = `
            SELECT m.request_id, m.request_date, m.description, m.status,
                   m.property_id, p.address AS property_address, p.city AS property_city,
                   m.tenant_id, t.firstname || ' ' || t.lastname AS tenant_name, t.phone_number AS tenant_phone
              FROM maintenance_request m
              LEFT JOIN property p ON m.property_id = p.property_id
              LEFT JOIN tenant t ON m.tenant_id = t.tenant_id
             WHERE 1=1
        `;

        const binds = {};
        if (status && status !== 'All') {
            sql += ` AND UPPER(m.status) = UPPER(:status)`;
            binds.status = status;
        }

        sql += ` ORDER BY m.request_date DESC, m.request_id DESC`;

        const result = await db.execute(sql, binds);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createMaintenanceRequest = async (req, res) => {
    try {
        const { property_id, tenant_id, description, status = 'Open', request_date } = req.body;

        const result = await db.execute(`
            INSERT INTO maintenance_request (
                request_date,
                description,
                status,
                property_id,
                tenant_id
            ) VALUES (
                :request_date,
                :description,
                :status,
                :property_id,
                :tenant_id
            )
            RETURNING request_id INTO :o_id
        `, {
            request_date: request_date ? new Date(request_date) : new Date(),
            description,
            status,
            property_id: property_id ? parseInt(property_id) : null,
            tenant_id: tenant_id ? parseInt(tenant_id) : null,
            o_id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        });

        res.status(201).json({
            success: true,
            message: 'Maintenance request created successfully',
            request_id: result.outBinds.o_id[0]
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Open', 'In Progress', 'Closed'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Status must be Open, In Progress, or Closed.' });
        }

        await db.execute(`
            UPDATE maintenance_request
               SET status = :status
             WHERE request_id = :id
        `, { id: parseInt(id), status });

        res.json({ success: true, message: `Maintenance request ID ${id} updated to ${status}.` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
