import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Phone, Mail, Building, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function Agents({ notify }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    agency: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAgents();
      setAgents(res.data || []);
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
      const res = await api.createAgent(formData);
      notify(res.message, 'success');
      setShowModal(false);
      setFormData({ firstname: '', lastname: '', email: '', phone: '', agency: '' });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Agent ID ${id}?`)) return;
    try {
      const res = await api.deleteAgent(id);
      notify(res.message, 'success');
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-KE') + ' KES';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Real Estate Agents</h2>
          <p className="page-subtitle">Track agency brokers, active portfolios, and sales volume.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Register Agent</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Agency</th>
              <th>Contact Details</th>
              <th>Listings</th>
              <th>Deals Closed</th>
              <th>Total Volume</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading agents...</td></tr>
            ) : agents.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No agents found.</td></tr>
            ) : (
              agents.map((a) => (
                <tr key={a.AGENT_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{a.AGENT_ID}</td>
                  <td style={{ fontWeight: 600 }}>{a.FIRSTNAME} {a.LASTNAME}</td>
                  <td>
                    <span className="badge badge-purple">{a.AGENCY || 'Independent'}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem' }}>{a.EMAIL}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.PHONE || '—'}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">{a.PROPERTY_COUNT} Properties</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{a.SALES_COUNT}</td>
                  <td style={{ fontWeight: 700, color: 'var(--emerald)' }}>
                    {formatCurrency(a.TOTAL_SALES_VOLUME)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(a.AGENT_ID)} className="btn btn-sm btn-danger">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Real Estate Agent">
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="1234500001"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Agency / Brokerage Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. RealEstateCo, PropertyHub"
              value={formData.agency}
              onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Agent</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
