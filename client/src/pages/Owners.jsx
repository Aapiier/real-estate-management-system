import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Phone, Mail, Building2 } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function Owners({ notify }) {
  const [owners, setOwners] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_number: '',
    agent_id: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ownerRes, agentRes] = await Promise.all([
        api.getOwners(),
        api.getAgents()
      ]);
      setOwners(ownerRes.data || []);
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
      const res = await api.createOwner(formData);
      notify(res.message, 'success');
      setShowModal(false);
      setFormData({ firstname: '', lastname: '', email: '', phone_number: '', agent_id: '' });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Owner ID ${id}?`)) return;
    try {
      const res = await api.deleteOwner(id);
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
          <h2 className="page-title">Property Owners</h2>
          <p className="page-subtitle">Manage landlord entities, contacts, and linked properties.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Register Owner</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Managing Agent</th>
              <th>Properties Owned</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading owners...</td></tr>
            ) : owners.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No owners found.</td></tr>
            ) : (
              owners.map((o) => (
                <tr key={o.OWNER_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{o.OWNER_ID}</td>
                  <td style={{ fontWeight: 600 }}>{o.FIRSTNAME} {o.LASTNAME}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <span>{o.EMAIL}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      <span>{o.PHONE_NUMBER || '—'}</span>
                    </div>
                  </td>
                  <td>{o.AGENT_NAME || 'Unassigned'}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                      <Building2 size={12} />
                      <span>{o.PROPERTY_COUNT} Properties</span>
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(o.OWNER_ID)} className="btn btn-sm btn-danger">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Property Owner">
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
                placeholder="+254 711 000 000"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Agent</label>
            <select
              className="form-select"
              value={formData.agent_id}
              onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
            >
              <option value="">None / Unassigned</option>
              {agents.map((a) => (
                <option key={a.AGENT_ID} value={a.AGENT_ID}>{a.FIRSTNAME} {a.LASTNAME} ({a.AGENCY})</option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Owner</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
