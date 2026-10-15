import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Phone, Mail, Home, Key } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function Tenants({ notify }) {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_number: '',
    property_id: '',
    agent_id: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantRes, propRes, agentRes] = await Promise.all([
        api.getTenants(),
        api.getProperties(),
        api.getAgents()
      ]);
      setTenants(tenantRes.data || []);
      setProperties(propRes.data || []);
      setAgents(agentRes.data || []);
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
      const res = await api.createTenant(formData);
      notify(res.message, 'success');
      setShowModal(false);
      setFormData({ firstname: '', lastname: '', email: '', phone_number: '', property_id: '', agent_id: '' });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Tenant ID ${id}?`)) return;
    try {
      const res = await api.deleteTenant(id);
      notify(res.message, 'success');
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Tenants Directory</h2>
          <p className="page-subtitle">Manage leaseholders, contacts, and active premises assignments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Register Tenant</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Contact</th>
              <th>Assigned Property</th>
              <th>Lease Term</th>
              <th>Handling Agent</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading tenants...</td></tr>
            ) : tenants.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tenants found.</td></tr>
            ) : (
              tenants.map((t) => (
                <tr key={t.TENANT_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{t.TENANT_ID}</td>
                  <td style={{ fontWeight: 600 }}>{t.FIRSTNAME} {t.LASTNAME}</td>
                  <td>
                    <div style={{ fontSize: '0.8125rem' }}>{t.EMAIL}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.PHONE_NUMBER || '—'}</div>
                  </td>
                  <td>
                    {t.PROPERTY_ADDRESS ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.PROPERTY_ADDRESS}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.PROPERTY_CITY}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No Active Property</span>
                    )}
                  </td>
                  <td>
                    {t.LEASE_START ? (
                      <div style={{ fontSize: '0.75rem' }}>
                        <div>From: {new Date(t.LEASE_START).toLocaleDateString()}</div>
                        <div>To: {new Date(t.LEASE_END).toLocaleDateString()}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>{t.AGENT_NAME || 'Unassigned'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(t.TENANT_ID)} className="btn btn-sm btn-danger">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Tenant">
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
                placeholder="0722100001"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Initial Property (Optional)</label>
              <select
                className="form-select"
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
              >
                <option value="">None / Will lease later</option>
                {properties.map((p) => (
                  <option key={p.PROPERTY_ID} value={p.PROPERTY_ID}>{p.ADDRESS} ({p.CITY}) - {p.STATUS}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Managing Agent</label>
              <select
                className="form-select"
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              >
                <option value="">None / Unassigned</option>
                {agents.map((a) => (
                  <option key={a.AGENT_ID} value={a.AGENT_ID}>{a.FIRSTNAME} {a.LASTNAME}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Tenant</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
