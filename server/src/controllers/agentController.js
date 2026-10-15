const db = require('../config/db');

exports.getAgents = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT a.agent_id, a.firstname, a.lastname, a.email, a.phone, a.agency,
                   (SELECT COUNT(*) FROM property p WHERE p.agent_id = a.agent_id) AS property_count,
                   (SELECT COUNT(*) FROM transactions tr WHERE tr.agent_id = a.agent_id AND tr.status = 'Completed') AS sales_count,
                   (SELECT NVL(SUM(amount), 0) FROM transactions tr WHERE tr.agent_id = a.agent_id AND tr.status = 'Completed') AS total_sales_volume
              FROM agent a
             ORDER BY a.agent_id ASC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getAgentById = async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await db.execute(`
            SELECT a.agent_id, a.firstname, a.lastname, a.email, a.phone, a.agency
              FROM agent a
             WHERE a.agent_id = :id
        `, { id: parseInt(id) });

        if (agent.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        const properties = await db.execute(`
            SELECT property_id, property_type, address, city, price_ksh, status
              FROM property
             WHERE agent_id = :id
        `, { id: parseInt(id) });

        const sales = await db.execute(`
            SELECT tr.transaction_id, tr.transaction_date, tr.amount, tr.status,
                   c.firstname || ' ' || c.lastname AS client_name,
                   calculate_agent_commission(tr.amount, 5.0) AS commission_earned
              FROM transactions tr
              JOIN clients c ON tr.client_id = c.client_id
             WHERE tr.agent_id = :id
             ORDER BY tr.transaction_date DESC
        `, { id: parseInt(id) });

        res.json({
            success: true,
            data: {
                ...agent.rows[0],
                properties: properties.rows,
                sales: sales.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createAgent = async (req, res) => {
    try {
        const { firstname, lastname, email, phone, agency } = req.body;
        const result = await db.execute(`
            INSERT INTO agent (firstname, lastname, email, phone, agency)
            VALUES (:firstname, :lastname, :email, :phone, :agency)
            RETURNING agent_id INTO :o_id
        `, {
            firstname,
            lastname,
            email,
            phone: phone || null,
            agency: agency || null,
            o_id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        });

        res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            agent_id: result.outBinds.o_id[0]
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, phone, agency } = req.body;
        await db.execute(`
            UPDATE agent
               SET firstname = :firstname,
                   lastname  = :lastname,
                   email     = :email,
                   phone     = :phone,
                   agency    = :agency
             WHERE agent_id  = :id
        `, {
            id: parseInt(id),
            firstname,
            lastname,
            email,
            phone: phone || null,
            agency: agency || null
        });

        res.json({ success: true, message: `Agent ID ${id} updated successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(`DELETE FROM agent WHERE agent_id = :id`, { id: parseInt(id) });
        res.json({ success: true, message: `Agent ID ${id} deleted successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
