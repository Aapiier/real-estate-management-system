const db = require('../config/db');

exports.getOwners = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT o.owner_id, o.firstname, o.lastname, o.email, o.phone_number,
                   o.agent_id, a.firstname || ' ' || a.lastname AS agent_name,
                   (SELECT COUNT(*) FROM property p WHERE p.owner_id = o.owner_id) AS property_count
              FROM owner o
              LEFT JOIN agent a ON o.agent_id = a.agent_id
             ORDER BY o.owner_id ASC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getOwnerById = async (req, res) => {
    try {
        const { id } = req.params;
        const owner = await db.execute(`
            SELECT o.owner_id, o.firstname, o.lastname, o.email, o.phone_number,
                   o.agent_id, a.firstname || ' ' || a.lastname AS agent_name
              FROM owner o
              LEFT JOIN agent a ON o.agent_id = a.agent_id
             WHERE o.owner_id = :id
        `, { id: parseInt(id) });

        if (owner.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Owner not found' });
        }

        const properties = await db.execute(`
            SELECT property_id, property_type, address, city, price_ksh, status
              FROM property
             WHERE owner_id = :id
        `, { id: parseInt(id) });

        res.json({ success: true, data: { ...owner.rows[0], properties: properties.rows } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createOwner = async (req, res) => {
    try {
        const { firstname, lastname, email, phone_number, agent_id } = req.body;
        const result = await db.execute(`
            INSERT INTO owner (firstname, lastname, email, phone_number, agent_id)
            VALUES (:firstname, :lastname, :email, :phone_number, :agent_id)
            RETURNING owner_id INTO :o_id
        `, {
            firstname,
            lastname,
            email,
            phone_number: phone_number || null,
            agent_id: agent_id ? parseInt(agent_id) : null,
            o_id: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
        });

        res.status(201).json({
            success: true,
            message: 'Owner created successfully',
            owner_id: result.outBinds.o_id[0]
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, email, phone_number, agent_id } = req.body;
        await db.execute(`
            UPDATE owner
               SET firstname    = :firstname,
                   lastname     = :lastname,
                   email        = :email,
                   phone_number = :phone_number,
                   agent_id     = :agent_id
             WHERE owner_id     = :id
        `, {
            id: parseInt(id),
            firstname,
            lastname,
            email,
            phone_number: phone_number || null,
            agent_id: agent_id ? parseInt(agent_id) : null
        });

        res.json({ success: true, message: `Owner ID ${id} updated successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(`DELETE FROM owner WHERE owner_id = :id`, { id: parseInt(id) });
        res.json({ success: true, message: `Owner ID ${id} deleted successfully` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
