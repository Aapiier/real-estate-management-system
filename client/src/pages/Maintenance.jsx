import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Maintenance({ notify }) {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    description: '',
    status: 'Open',
    request_date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const [maintRes, propRes, tenantRes] = await Promise.all([
        api.getMaintenance(params),
        api.getProperties(),
        api.getTenants()
      ]);
      setRequests(maintRes.data || []);
      setProperties(propRes.data || []);
      setTenants(tenantRes.data || []);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMaintenance(formData);
      notify(res.message, 'success');
      setShowModal(false);
      setFormData({
        property_id: '',
        tenant_id: '',
        description: '',
        status: 'Open',
        request_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.updateMaintenanceStatus(id, newStatus);
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
          <h2 className="page-title">Maintenance Requests</h2>
          <p className="page-subtitle">Track repairs, plumbing, electrical, and structural upkeep tickets.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>New Work Order</span>
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Open', 'In Progress', 'Closed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Date</th>
              <th>Property</th>
              <th>Tenant</th>
              <th>Issue Description</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No requests found.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r.REQUEST_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{r.REQUEST_ID}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{new Date(r.REQUEST_DATE).toLocaleDateString()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.PROPERTY_ADDRESS}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.PROPERTY_CITY}</div>
                  </td>
                  <td>{r.TENANT_NAME || 'Unassigned'}</td>
                  <td style={{ maxWidth: '300px' }}>{r.DESCRIPTION}</td>
                  <td><Badge status={r.STATUS} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {r.STATUS !== 'In Progress' && r.STATUS !== 'Closed' && (
                        <button
                          onClick={() => handleStatusChange(r.REQUEST_ID, 'In Progress')}
                          className="btn btn-sm btn-secondary"
                        >
                          In Progress
                        </button>
                      )}
                      {r.STATUS !== 'Closed' && (
                        <button
                          onClick={() => handleStatusChange(r.REQUEST_ID, 'Closed')}
                          className="btn btn-sm btn-primary"
                          style={{ backgroundColor: 'var(--emerald)' }}
                        >
                          Mark Closed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Maintenance Request">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Property *</label>
            <select
              className="form-select"
              value={formData.property_id}
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
              required
            >
              <option value="">Select Property</option>
              {properties.map((p) => (
                <option key={p.PROPERTY_ID} value={p.PROPERTY_ID}>{p.ADDRESS} ({p.CITY})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Tenant</label>
            <select
              className="form-select"
              value={formData.tenant_id}
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
            >
              <option value="">Select Tenant</option>
              {tenants.map((t) => (
                <option key={t.TENANT_ID} value={t.TENANT_ID}>{t.FIRSTNAME} {t.LASTNAME}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the maintenance or repair needed in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Reported</label>
              <input
                type="date"
                className="form-input"
                value={formData.request_date}
                onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
