const db = require('../config/db');
const oracledb = require('oracledb');

// GET all properties with search and filters
exports.getProperties = async (req, res) => {
    try {
        const { search, type, status, city, minPrice, maxPrice } = req.query;

        let sql = `
            SELECT p.property_id, p.property_type, p.address, p.county, p.city,
                   p.price_ksh, p.zipcode, p.size_m2, p.status,
                   p.owner_id, o.firstname || ' ' || o.lastname AS owner_name,
                   p.agent_id, a.firstname || ' ' || a.lastname AS agent_name,
                   a.agency
              FROM property p
              LEFT JOIN owner o ON p.owner_id = o.owner_id
              LEFT JOIN agent a ON p.agent_id = a.agent_id
             WHERE 1=1
        `;

        const binds = {};

        if (search) {
            sql += ` AND (UPPER(p.address) LIKE UPPER(:search) OR UPPER(p.city) LIKE UPPER(:search) OR UPPER(p.county) LIKE UPPER(:search))`;
            binds.search = `%${search.trim()}%`;
        }

        if (type && type !== 'All') {
            sql += ` AND UPPER(p.property_type) = UPPER(:type)`;
            binds.type = type.trim();
        }

        if (status && status !== 'All') {
            sql += ` AND UPPER(p.status) = UPPER(:status)`;
            binds.status = status.trim();
        }

        if (city && city !== 'All') {
            sql += ` AND UPPER(p.city) = UPPER(:city)`;
            binds.city = city.trim();
        }

        if (minPrice) {
            sql += ` AND p.price_ksh >= :minPrice`;
            binds.minPrice = parseFloat(minPrice);
        }

        if (maxPrice) {
            sql += ` AND p.price_ksh <= :maxPrice`;
            binds.maxPrice = parseFloat(maxPrice);
        }

        sql += ` ORDER BY p.property_id DESC`;

        const result = await db.execute(sql, binds);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        console.error('Error fetching properties:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET single property by ID
exports.getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const propResult = await db.execute(`
            SELECT p.property_id, p.property_type, p.address, p.county, p.city,
                   p.price_ksh, p.zipcode, p.size_m2, p.status,
                   p.owner_id, o.firstname || ' ' || o.lastname AS owner_name, o.phone_number AS owner_phone, o.email AS owner_email,
                   p.agent_id, a.firstname || ' ' || a.lastname AS agent_name, a.agency, a.phone AS agent_phone
              FROM property p
              LEFT JOIN owner o ON p.owner_id = o.owner_id
              LEFT JOIN agent a ON p.agent_id = a.agent_id
             WHERE p.property_id = :id
        `, { id: parseInt(id) });

        if (propResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: `Property ID ${id} not found.` });
        }

        // Fetch leases for this property
        const leases = await db.execute(`
            SELECT l.lease_id, l.lease_start, l.lease_end, l.monthly_rent, l.status,
                   t.tenant_id, t.firstname || ' ' || t.lastname AS tenant_name, t.phone_number AS tenant_phone
              FROM lease l
              JOIN tenant t ON l.tenant_id = t.tenant_id
             WHERE l.property_id = :id
             ORDER BY l.lease_start DESC
        `, { id: parseInt(id) });

        // Fetch maintenance history
        const maintenance = await db.execute(`
            SELECT request_id, request_date, description, status
              FROM maintenance_request
             WHERE property_id = :id
             ORDER BY request_date DESC
        `, { id: parseInt(id) });

        // Fetch sales transactions
        const transactions = await db.execute(`
            SELECT tr.transaction_id, tr.transaction_date, tr.amount, tr.status,
                   c.firstname || ' ' || c.lastname AS client_name
              FROM transactions tr
              JOIN clients c ON tr.client_id = c.client_id
             WHERE tr.property_id = :id
        `, { id: parseInt(id) });

        res.json({
            success: true,
            data: {
                ...propResult.rows[0],
                leases: leases.rows,
                maintenance: maintenance.rows,
                transactions: transactions.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// REGISTER Property (CALLS ORACLE PL/SQL STORED PROCEDURE REGISTER_PROPERTY)
exports.registerProperty = async (req, res) => {
    try {
        const property_type = req.body.property_type || req.body.type || 'Apartment';
        const address = req.body.address;
        const county = req.body.county || 'Nairobi';
        const city = req.body.city || 'Nairobi';
        const price_ksh = req.body.price_ksh || req.body.price || req.body.priceKsh;
        const owner_id = req.body.owner_id || req.body.ownerId;
        const agent_id = req.body.agent_id || req.body.agentId;
        const zipcode = req.body.zipcode;
        const size_m2 = req.body.size_m2 || req.body.size_sqft || req.body.size;
        const status = req.body.status || 'Available';

        const binds = {
            p_property_type: property_type,
            p_address: address,
            p_county: county,
            p_city: city,
            p_price_ksh: parseFloat(price_ksh),
            p_owner_id: owner_id ? parseInt(owner_id) : null,
            p_agent_id: agent_id ? parseInt(agent_id) : null,
            p_zipcode: zipcode || null,
            p_size_m2: size_m2 ? parseFloat(size_m2) : null,
            p_status: status || 'Available',
            o_property_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const plsql = `
            BEGIN
                register_property(
                    :p_property_type,
                    :p_address,
                    :p_county,
                    :p_city,
                    :p_price_ksh,
                    :p_owner_id,
                    :p_agent_id,
                    :p_zipcode,
                    :p_size_m2,
                    :p_status,
                    :o_property_id
                );
            END;
        `;

        const result = await db.execute(plsql, binds);
        const newPropertyId = result.outBinds.o_property_id;

        res.status(201).json({
            success: true,
            message: `Property successfully registered via Oracle PL/SQL procedure REGISTER_PROPERTY.`,
            property_id: newPropertyId
        });
    } catch (err) {
        console.error('Error in registerProperty:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// COMPLETE PROPERTY SALE (CALLS ORACLE PL/SQL STORED PROCEDURE COMPLETE_PROPERTY_SALE)
exports.completeSale = async (req, res) => {
    try {
        const { property_id, client_id, agent_id, sale_amount, sale_date } = req.body;

        const binds = {
            p_property_id: parseInt(property_id),
            p_client_id: parseInt(client_id),
            p_agent_id: parseInt(agent_id),
            p_sale_amount: parseFloat(sale_amount),
            p_sale_date: sale_date ? new Date(sale_date) : new Date(),
            o_transaction_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const plsql = `
            BEGIN
                complete_property_sale(
                    :p_property_id,
                    :p_client_id,
                    :p_agent_id,
                    :p_sale_amount,
                    :p_sale_date,
                    :o_transaction_id
                );
            END;
        `;

        const result = await db.execute(plsql, binds);
        const transactionId = result.outBinds.o_transaction_id;

        res.json({
            success: true,
            message: `Property sale successfully completed via Oracle PL/SQL procedure COMPLETE_PROPERTY_SALE.`,
            transaction_id: transactionId
        });
    } catch (err) {
        console.error('Error in completeSale:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE Property
exports.updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const { property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status } = req.body;

        await db.execute(`
            UPDATE property
               SET property_type = :property_type,
                   address       = :address,
                   county        = :county,
                   city          = :city,
                   price_ksh     = :price_ksh,
                   owner_id      = :owner_id,
                   agent_id      = :agent_id,
                   zipcode       = :zipcode,
                   size_m2       = :size_m2,
                   status        = :status
             WHERE property_id   = :id
        `, {
            id: parseInt(id),
            property_type,
            address,
            county,
            city,
            price_ksh: parseFloat(price_ksh),
            owner_id: owner_id ? parseInt(owner_id) : null,
            agent_id: agent_id ? parseInt(agent_id) : null,
            zipcode: zipcode || null,
            size_m2: size_m2 ? parseFloat(size_m2) : null,
            status
        });

        res.json({ success: true, message: `Property ID ${id} updated successfully.` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// DELETE Property
exports.deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if property is currently rented
        const check = await db.execute(`SELECT status FROM property WHERE property_id = :id`, { id: parseInt(id) });
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, error: `Property ID ${id} not found.` });
        }

        if (check.rows[0].STATUS === 'Rented') {
            return res.status(400).json({ success: false, error: `Cannot delete a property that is currently Rented.` });
        }

        await db.execute(`DELETE FROM property WHERE property_id = :id`, { id: parseInt(id) });
        res.json({ success: true, message: `Property ID ${id} deleted successfully.` });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
