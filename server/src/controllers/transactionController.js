const db = require('../config/db');

exports.getTransactions = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT tr.transaction_id, tr.transaction_date, tr.amount, tr.status,
                   tr.property_id, p.address AS property_address, p.city AS property_city, p.property_type,
                   tr.client_id, c.firstname || ' ' || c.lastname AS client_name, c.email AS client_email, c.phone AS client_phone,
                   tr.agent_id, a.firstname || ' ' || a.lastname AS agent_name, a.agency,
                   calculate_agent_commission(tr.amount, 5.0) AS agent_commission
              FROM transactions tr
              JOIN property p ON tr.property_id = p.property_id
              JOIN clients c ON tr.client_id = c.client_id
              JOIN agent a ON tr.agent_id = a.agent_id
             ORDER BY tr.transaction_date DESC, tr.transaction_id DESC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT client_id, firstname, lastname, email, phone
              FROM clients
             ORDER BY client_id ASC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createClient = async (req, res) => {
    try {
        const { firstname, lastname, email, phone } = req.body;
        const result = await db.execute(`
            INSERT INTO clients (firstname, lastname, email, phone)
            VALUES (:firstname, :lastname, :email, :phone)
            RETURNING client_id INTO :o_id
        `, {
            firstname,
            lastname,
            email,
            phone: phone || null,
            o_id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        });

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            client_id: result.outBinds.o_id[0]
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
