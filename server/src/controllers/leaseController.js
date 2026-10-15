const db = require('../config/db');
const oracledb = require('oracledb');

exports.getLeases = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT l.lease_id, l.lease_start, l.lease_end, l.monthly_rent, l.status,
                   l.property_id, p.address AS property_address, p.city AS property_city, p.property_type,
                   l.tenant_id, t.firstname || ' ' || t.lastname AS tenant_name, t.email AS tenant_email, t.phone_number AS tenant_phone,
                   calculate_rental_dues(l.lease_id) AS rental_dues,
                   get_lease_total_paid(l.lease_id) AS total_paid
              FROM lease l
              JOIN property p ON l.property_id = p.property_id
              JOIN tenant t ON l.tenant_id = t.tenant_id
             ORDER BY l.lease_id DESC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// CREATE LEASE (CALLS ORACLE PL/SQL STORED PROCEDURE CREATE_LEASE)
exports.createLease = async (req, res) => {
    try {
        const property_id = req.body.property_id || req.body.propertyId;
        const tenant_id = req.body.tenant_id || req.body.tenantId;
        const lease_start = req.body.lease_start || req.body.startDate || req.body.start_date;
        const lease_end = req.body.lease_end || req.body.endDate || req.body.end_date;
        const monthly_rent = req.body.monthly_rent || req.body.rent || req.body.monthlyRent;

        const binds = {
            p_property_id: parseInt(property_id),
            p_tenant_id: parseInt(tenant_id),
            p_lease_start: new Date(lease_start),
            p_lease_end: new Date(lease_end),
            p_monthly_rent: parseFloat(monthly_rent),
            o_lease_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const plsql = `
            BEGIN
                create_lease(
                    :p_property_id,
                    :p_tenant_id,
                    :p_lease_start,
                    :p_lease_end,
                    :p_monthly_rent,
                    :o_lease_id
                );
            END;
        `;

        const result = await db.execute(plsql, binds);
        const newLeaseId = result.outBinds.o_lease_id;

        res.status(201).json({
            success: true,
            message: 'Lease contract successfully created via Oracle PL/SQL procedure CREATE_LEASE.',
            lease_id: newLeaseId
        });
    } catch (err) {
        console.error('Error in createLease:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.terminateLease = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch property id
        const lease = await db.execute(`SELECT property_id, status FROM lease WHERE lease_id = :id`, { id: parseInt(id) });
        if (lease.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Lease not found' });
        }

        const propId = lease.rows[0].PROPERTY_ID;

        // Terminate lease
        await db.execute(`UPDATE lease SET status = 'Terminated' WHERE lease_id = :id`, { id: parseInt(id) });

        // Update property status to Available if no other active lease
        const otherActive = await db.execute(`SELECT COUNT(*) AS active_count FROM lease WHERE property_id = :propId AND status = 'Active'`, { propId });
        if (otherActive.rows[0].ACTIVE_COUNT === 0) {
            await db.execute(`UPDATE property SET status = 'Available' WHERE property_id = :propId AND status = 'Rented'`, { propId });
        }

        res.json({ success: true, message: `Lease ID ${id} terminated successfully.` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
