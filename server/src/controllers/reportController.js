const db = require('../config/db');

// Report 1: Active leases grouped by City
exports.getActiveLeasesByCity = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT p.city,
                   COUNT(l.lease_id) AS active_leases_count,
                   NVL(SUM(l.monthly_rent), 0) AS total_monthly_rent,
                   ROUND(AVG(l.monthly_rent), 2) AS avg_monthly_rent
              FROM lease l
              JOIN property p ON l.property_id = p.property_id
             WHERE l.status = 'Active'
             GROUP BY p.city
             ORDER BY active_leases_count DESC, total_monthly_rent DESC
        `);
        res.json({ success: true, report_name: 'Active Leases by City', data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Report 2: Outstanding Rental Dues (calculated using Oracle PL/SQL function CALCULATE_RENTAL_DUES)
exports.getOutstandingDues = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT l.lease_id, l.lease_start, l.lease_end, l.monthly_rent, l.status,
                   p.property_id, p.address AS property_address, p.city,
                   t.tenant_id, t.firstname || ' ' || t.lastname AS tenant_name, t.phone_number AS tenant_phone,
                   calculate_rental_dues(l.lease_id) AS outstanding_dues,
                   get_lease_total_paid(l.lease_id) AS total_paid
              FROM lease l
              JOIN property p ON l.property_id = p.property_id
              JOIN tenant t ON l.tenant_id = t.tenant_id
             WHERE l.status = 'Active'
             ORDER BY outstanding_dues DESC
        `);
        res.json({ success: true, report_name: 'Outstanding Rental Dues Analysis', data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Report 3: Overdue / Unresolved Maintenance Requests
exports.getPendingMaintenance = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT m.request_id, m.request_date, m.description, m.status,
                   p.property_id, p.address AS property_address, p.city,
                   t.tenant_id, t.firstname || ' ' || t.lastname AS tenant_name, t.phone_number AS tenant_phone,
                   TRUNC(SYSDATE - m.request_date) AS days_open
              FROM maintenance_request m
              LEFT JOIN property p ON m.property_id = p.property_id
              LEFT JOIN tenant t ON m.tenant_id = t.tenant_id
             WHERE m.status IN ('Open', 'In Progress')
             ORDER BY m.request_date ASC
        `);
        res.json({ success: true, report_name: 'Pending Maintenance Requests', data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Report 4: Total Properties Revenue and Valuation
exports.getPropertyRevenue = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT p.property_id, p.address, p.city, p.property_type, p.price_ksh, p.status,
                   o.firstname || ' ' || o.lastname AS owner_name,
                   a.firstname || ' ' || a.lastname AS agent_name,
                   NVL(SUM(pay.amount_paid), 0) AS total_lease_revenue
              FROM property p
              LEFT JOIN owner o ON p.owner_id = o.owner_id
              LEFT JOIN agent a ON p.agent_id = a.agent_id
              LEFT JOIN lease l ON p.property_id = l.property_id
              LEFT JOIN payment pay ON l.lease_id = pay.lease_id
             GROUP BY p.property_id, p.address, p.city, p.property_type, p.price_ksh, p.status,
                      o.firstname, o.lastname, a.firstname, a.lastname
             ORDER BY total_lease_revenue DESC, p.price_ksh DESC
        `);
        res.json({ success: true, report_name: 'Property Portfolio Valuation & Revenue', data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
