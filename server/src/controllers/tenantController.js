const db = require('../config/db');

exports.getTenants = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT t.tenant_id, t.firstname, t.lastname, t.email, t.phone_number,
                   t.lease_start, t.lease_end,
                   t.property_id, p.address AS property_address, p.city AS property_city,
                   t.agent_id, a.firstname || ' ' || a.lastname AS agent_name,
                   (SELECT l.lease_id FROM lease l WHERE l.tenant_id = t.tenant_id AND l.status = 'Active' FETCH FIRST 1 ROWS ONLY) AS active_lease_id
              FROM tenant t
              LEFT JOIN property p ON t.property_id = p.property_id
              LEFT JOIN agent a ON t.agent_id = a.agent_id
             ORDER BY t.tenant_id ASC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getTenantById = async (req, res) => {
    try {
        const { id } = req.params;
        const tenant = await db.execute(`
            SELECT t.tenant_id, t.firstname, t.lastname, t.email, t.phone_number,
                   t.lease_start, t.lease_end,
                   t.property_id, p.address AS property_address, p.city AS property_city,
                   t.agent_id, a.firstname || ' ' || a.lastname AS agent_name
              FROM tenant t
              LEFT JOIN property p ON t.property_id = p.property_id
              LEFT JOIN agent a ON t.agent_id = a.agent_id
             WHERE t.tenant_id = :id
        `, { id: parseInt(id) });

        if (tenant.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Tenant not found' });
        }

        const leases = await db.execute(`
            SELECT l.lease_id, l.lease_start, l.lease_end, l.monthly_rent, l.status,
                   calculate_rental_dues(l.lease_id) AS rental_dues,
                   get_lease_total_paid(l.lease_id) AS total_paid
              FROM lease l
             WHERE l.tenant_id = :id
             ORDER BY l.lease_start DESC
        `, { id: parseInt(id) });

        const maintenance = await db.execute(`
            SELECT request_id, request_date, description, status, property_id
              FROM maintenance_request
             WHERE tenant_id = :id
             ORDER BY request_date DESC
        `, { id: parseInt(id) });

        res.json({
            success: true,
            data: {
                ...tenant.rows[0],
                leases: leases.rows,
                maintenance: maintenance.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createTenant = async (req, res) => {
    try {
        const { firstname, lastname, email, phone_number, property_id, agent_id } = req.body;
        const result = await db.execute(`
            INSERT INTO tenant (firstname, lastname, email, phone_number, property_id, agent_id)
            VALUES (:firstname, :lastname, :email, :phone_number, :property_id, :agent_id)
            RETURNING tenant_id INTO :o_id
        `, {
            firstname,
            lastname,
            email,
            phone_number: phone_number || null,
            property_id: property_id ? parseInt(property_id) : null,
            agent_id: agent_id ? parseInt(agent_id) : null,
            o_id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        });

        res.status(201).json({
            success: true,
            message: 'Tenant created successfully',
            tenant_id: result.outBinds.o_id[0]
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, phone_number, property_id, agent_id } = req.body;
        await db.execute(`
            UPDATE tenant
               SET firstname    = :firstname,
                   lastname     = :lastname,
                   email        = :email,
                   phone_number = :phone_number,
                   property_id  = :property_id,
                   agent_id     = :agent_id
             WHERE tenant_id    = :id
        `, {
            id: parseInt(id),
            firstname,
            lastname,
            email,
            phone_number: phone_number || null,
            property_id: property_id ? parseInt(property_id) : null,
            agent_id: agent_id ? parseInt(agent_id) : null
        });

        res.json({ success: true, message: `Tenant ID ${id} updated successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteTenant = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(`DELETE FROM tenant WHERE tenant_id = :id`, { id: parseInt(id) });
        res.json({ success: true, message: `Tenant ID ${id} deleted successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
