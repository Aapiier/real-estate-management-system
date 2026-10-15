import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function Payments({ notify }) {
  const [payments, setPayments] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    lease_id: '',
    amount_paid: '',
    payment_method: 'M-Pesa',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const paymentMethods = ['M-Pesa', 'Credit Card', 'Bank Transfer', 'Cash', 'Cheque'];

  const loadData = async () => {
    try {
      setLoading(true);
      const [payRes, leaseRes] = await Promise.all([
        api.getPayments(),
        api.getLeases()
      ]);
      setPayments(payRes.data || []);
      setLeases(leaseRes.data || []);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.recordPayment(formData);
      notify(res.message, 'success');
      setShowModal(false);
      setFormData({
        lease_id: '',
        amount_paid: '',
        payment_method: 'M-Pesa',
        payment_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-KE') + ' KES';
  };

  const totalCollected = payments.reduce((acc, p) => acc + (parseFloat(p.AMOUNT_PAID) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Rent Payments</h2>
          <p className="page-subtitle">Track rent receipts, settlement channels, and live financial audit trails.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Record Payment (PL/SQL)</span>
        </button>
      </div>

      {/* KPI Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        color: '#ffffff',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Total Rent Collections to Date
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
            {formatCurrency(totalCollected)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Audited Transactions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{payments.length} Receipts</div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Tenant</th>
              <th>Property</th>
              <th>Amount Paid</th>
              <th>Method</th>
              <th>Payment Date</th>
              <th>Lease Ref</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading payments...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No payments found.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.PAYMENT_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
                    REC-{p.PAYMENT_ID}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.TENANT_NAME}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.TENANT_PHONE}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.PROPERTY_ADDRESS}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.PROPERTY_CITY}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.9375rem' }}>
                    {formatCurrency(p.AMOUNT_PAID)}
                  </td>
                  <td>
                    <span className="badge badge-info">{p.PAYMENT_METHOD}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {new Date(p.PAYMENT_DATE).toLocaleDateString()}
                  </td>
                  <td>
                    <span className="badge badge-neutral">Lease #{p.LEASE_ID}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Record Payment (PL/SQL) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment via Oracle PL/SQL (RECORD_PAYMENT)">
        <form onSubmit={handleSubmit}>
          <div style={{ 
            backgroundColor: '#ecfdf5', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '16px',
            fontSize: '0.8125rem',
            color: '#065f46',
            border: '1px solid #a7f3d0'
          }}>
            <strong>Trigger & Audit:</strong> Directly executes <code>RECORD_PAYMENT</code>. Fires Oracle trigger <code>TRG_PAYMENT_AUDIT</code> to log financial entries, validates lease status, and rejects duplicate same-day transactions.
          </div>

          <div className="form-group">
            <label className="form-label">Lease Contract *</label>
            <select
              className="form-select"
              value={formData.lease_id}
              onChange={(e) => {
                const lease = leases.find(l => l.LEASE_ID === parseInt(e.target.value));
                setFormData({
                  ...formData,
                  lease_id: e.target.value,
                  amount_paid: lease ? lease.MONTHLY_RENT : formData.amount_paid
                });
              }}
              required
            >
              <option value="">Select Lease Contract</option>
              {leases.map(l => (
                <option key={l.LEASE_ID} value={l.LEASE_ID}>
                  Lease #{l.LEASE_ID} - {l.TENANT_NAME} ({l.PROPERTY_ADDRESS}) [Rent: {formatCurrency(l.MONTHLY_RENT)}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Amount Paid (KES) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 50000"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                required
              >
                {paymentMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Date *</label>
            <input
              type="date"
              className="form-input"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--emerald)' }}>
              Record Payment (PL/SQL)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
