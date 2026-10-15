const db = require('../config/db');
const oracledb = require('oracledb');

exports.getPayments = async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT p.payment_id, p.payment_date, p.amount_paid, p.payment_method,
                   p.lease_id, l.monthly_rent, l.status AS lease_status,
                   pr.property_id, pr.address AS property_address, pr.city AS property_city,
                   t.tenant_id, t.firstname || ' ' || t.lastname AS tenant_name, t.phone_number AS tenant_phone
              FROM payment p
              JOIN lease l ON p.lease_id = l.lease_id
              JOIN property pr ON l.property_id = pr.property_id
              JOIN tenant t ON l.tenant_id = t.tenant_id
             ORDER BY p.payment_date DESC, p.payment_id DESC
        `);
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// RECORD PAYMENT (CALLS ORACLE PL/SQL STORED PROCEDURE RECORD_PAYMENT)
exports.recordPayment = async (req, res) => {
    try {
        const lease_id = req.body.lease_id || req.body.leaseId;
        const amount_paid = req.body.amount_paid || req.body.amount || req.body.amountPaid;
        const payment_method = req.body.payment_method || req.body.paymentMethod || 'M-Pesa';
        const payment_date = req.body.payment_date || req.body.paymentDate;

        const binds = {
            p_lease_id: parseInt(lease_id),
            p_amount_paid: parseFloat(amount_paid),
            p_payment_method: payment_method,
            p_payment_date: payment_date ? new Date(payment_date) : new Date(),
            o_payment_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const plsql = `
            BEGIN
                record_payment(
                    :p_lease_id,
                    :p_amount_paid,
                    :p_payment_method,
                    :p_payment_date,
                    :o_payment_id
                );
            END;
        `;

        const result = await db.execute(plsql, binds);
        const newPaymentId = result.outBinds.o_payment_id;

        res.status(201).json({
            success: true,
            message: 'Payment successfully recorded via Oracle PL/SQL procedure RECORD_PAYMENT.',
            payment_id: newPaymentId
        });
    } catch (err) {
        console.error('Error in recordPayment:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};
