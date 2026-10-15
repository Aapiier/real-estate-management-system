const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        // 1. Property Counts
        const propStats = await db.execute(`
            SELECT 
                COUNT(*) AS total_properties,
                SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available_properties,
                SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END) AS rented_properties,
                SUM(CASE WHEN status = 'Sold' THEN 1 ELSE 0 END) AS sold_properties,
                SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) AS maintenance_properties,
                NVL(SUM(price_ksh), 0) AS total_portfolio_value
            FROM property
        `);

        // 2. Entity Counts
        const ownerCount = await db.execute(`SELECT COUNT(*) AS total FROM owner`);
        const agentCount = await db.execute(`SELECT COUNT(*) AS total FROM agent`);
        const tenantCount = await db.execute(`SELECT COUNT(*) AS total FROM tenant`);
        const clientCount = await db.execute(`SELECT COUNT(*) AS total FROM clients`);

        // 3. Financial Metrics
        const paymentStats = await db.execute(`
            SELECT 
                COUNT(*) AS total_payments,
                NVL(SUM(amount_paid), 0) AS total_rental_revenue
            FROM payment
        `);

        const transStats = await db.execute(`
            SELECT 
                COUNT(*) AS total_sales,
                NVL(SUM(amount), 0) AS total_sales_volume
            FROM transactions
            WHERE status = 'Completed'
        `);

        // 4. Operations Metrics
        const leaseStats = await db.execute(`
            SELECT 
                COUNT(*) AS total_leases,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_leases
            FROM lease
        `);

        const maintStats = await db.execute(`
            SELECT 
                COUNT(*) AS total_requests,
                SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_requests,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_requests
            FROM maintenance_request
        `);

        // 5. Recent Activity
        const recentPayments = await db.execute(`
            SELECT p.payment_id, p.payment_date, p.amount_paid, p.payment_method,
                   l.lease_id, pr.address AS property_address,
                   t.firstname || ' ' || t.lastname AS tenant_name
              FROM payment p
              JOIN lease l ON p.lease_id = l.lease_id
              JOIN property pr ON l.property_id = pr.property_id
              JOIN tenant t ON l.tenant_id = t.tenant_id
             ORDER BY p.payment_date DESC, p.payment_id DESC
             FETCH FIRST 5 ROWS ONLY
        `);

        const recentMaint = await db.execute(`
            SELECT m.request_id, m.request_date, m.description, m.status,
                   pr.address AS property_address,
                   t.firstname || ' ' || t.lastname AS tenant_name
              FROM maintenance_request m
              LEFT JOIN property pr ON m.property_id = pr.property_id
              LEFT JOIN tenant t ON m.tenant_id = t.tenant_id
             ORDER BY m.request_date DESC, m.request_id DESC
             FETCH FIRST 5 ROWS ONLY
        `);

        const recentTrans = await db.execute(`
            SELECT tr.transaction_id, tr.transaction_date, tr.amount, tr.status,
                   pr.address AS property_address,
                   c.firstname || ' ' || c.lastname AS client_name,
                   a.firstname || ' ' || a.lastname AS agent_name
              FROM transactions tr
              JOIN property pr ON tr.property_id = pr.property_id
              JOIN clients c ON tr.client_id = c.client_id
              JOIN agent a ON tr.agent_id = a.agent_id
             ORDER BY tr.transaction_date DESC, tr.transaction_id DESC
             FETCH FIRST 5 ROWS ONLY
        `);

        // 6. Property Breakdown by City
        const cityBreakdown = await db.execute(`
            SELECT city, COUNT(*) AS count, SUM(price_ksh) AS total_value
              FROM property
             GROUP BY city
             ORDER BY count DESC
        `);

        // 7. Property Breakdown by Type
        const typeBreakdown = await db.execute(`
            SELECT property_type, COUNT(*) AS count
              FROM property
             GROUP BY property_type
             ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: {
                properties: propStats.rows[0],
                owners: ownerCount.rows[0].TOTAL,
                agents: agentCount.rows[0].TOTAL,
                tenants: tenantCount.rows[0].TOTAL,
                clients: clientCount.rows[0].TOTAL,
                finances: {
                    total_rental_revenue: paymentStats.rows[0].TOTAL_RENTAL_REVENUE,
                    total_payments: paymentStats.rows[0].TOTAL_PAYMENTS,
                    total_sales_volume: transStats.rows[0].TOTAL_SALES_VOLUME,
                    total_sales_count: transStats.rows[0].TOTAL_SALES
                },
                leases: leaseStats.rows[0],
                maintenance: maintStats.rows[0],
                recent_payments: recentPayments.rows,
                recent_maintenance: recentMaint.rows,
                recent_transactions: recentTrans.rows,
                city_breakdown: cityBreakdown.rows,
                type_breakdown: typeBreakdown.rows
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
