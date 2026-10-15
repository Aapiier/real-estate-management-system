import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, UserPlus, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Transactions({ notify }) {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);

  const [clientForm, setClientForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [transRes, clientRes] = await Promise.all([
        api.getTransactions(),
        api.getClients()
      ]);
      setTransactions(transRes.data || []);
      setClients(clientRes.data || []);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createClient(clientForm);
      notify(res.message, 'success');
      setShowClientModal(false);
      setClientForm({ firstname: '', lastname: '', email: '', phone: '' });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-KE') + ' KES';
  };

  const totalVolume = transactions
    .filter(t => t.STATUS === 'Completed')
    .reduce((acc, t) => acc + (parseFloat(t.AMOUNT) || 0), 0);

  const totalCommission = transactions
    .filter(t => t.STATUS === 'Completed')
    .reduce((acc, t) => acc + (parseFloat(t.AGENT_COMMISSION) || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales & Property Deeds</h2>
          <p className="page-subtitle">Historical records of closed sales, client purchases, and agent commissions.</p>
        </div>
        <button onClick={() => setShowClientModal(true)} className="btn btn-secondary">
          <UserPlus size={18} />
          <span>Register New Buyer</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--emerald)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Sales Closed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {formatCurrency(totalVolume)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginTop: '4px' }}>
            {transactions.filter(t => t.STATUS === 'Completed').length} Completed Deeds
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Broker Commissions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            {formatCurrency(totalCommission)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Calculated via PL/SQL Function (5% standard)
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered Buyers/Clients</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {clients.length} Clients
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Available for sales deed signing
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Property</th>
              <th>Buyer / Client</th>
              <th>Closing Agent</th>
              <th>Sale Price</th>
              <th>Commission (5%)</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading transactions...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No sales recorded.</td></tr>
            ) : (
              transactions.map((tr) => (
                <tr key={tr.TRANSACTION_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{tr.TRANSACTION_ID}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tr.PROPERTY_ADDRESS}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.PROPERTY_CITY} ({tr.PROPERTY_TYPE})</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tr.CLIENT_NAME}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.CLIENT_PHONE}</div>
                  </td>
                  <td>
                    <div>{tr.AGENT_NAME}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.AGENCY}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald)', fontSize: '0.9375rem' }}>
                    {formatCurrency(tr.AMOUNT)}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    {formatCurrency(tr.AGENT_COMMISSION)}
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {new Date(tr.TRANSACTION_DATE).toLocaleDateString()}
                  </td>
                  <td><Badge status={tr.STATUS} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Register Client */}
      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)} title="Register New Buyer / Client">
        <form onSubmit={handleCreateClient}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                value={clientForm.firstname}
                onChange={(e) => setClientForm({ ...clientForm, firstname: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                value={clientForm.lastname}
                onChange={(e) => setClientForm({ ...clientForm, lastname: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="1234567890"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowClientModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Client</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
