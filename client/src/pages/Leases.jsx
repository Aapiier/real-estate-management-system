import React, { useState, useEffect } from 'react';
import { FileText, Plus, AlertCircle, Ban, CheckCircle2, Calendar } from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Leases({ notify }) {
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    lease_start: new Date().toISOString().split('T')[0],
    lease_end: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
    monthly_rent: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaseRes, propRes, tenantRes] = await Promise.all([
        api.getLeases(),
        api.getProperties(),
        api.getTenants()
      ]);
      setLeases(leaseRes.data || []);
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createLease(formData);
      notify(res.message, 'success');
      setShowModal(false);
      setFormData({
        property_id: '',
        tenant_id: '',
        lease_start: new Date().toISOString().split('T')[0],
        lease_end: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        monthly_rent: ''
      });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleTerminate = async (id) => {
    if (!window.confirm(`Are you sure you want to terminate Lease ID ${id}?`)) return;
    try {
      const res = await api.terminateLease(id);
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
          <h2 className="page-title">Lease Contracts</h2>
          <p className="page-subtitle">Manage rental agreements, term dates, and live arrears calculations.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Create Lease (PL/SQL)</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lease ID</th>
              <th>Property</th>
              <th>Tenant</th>
              <th>Monthly Rent</th>
              <th>Term Period</th>
              <th>Outstanding Dues</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading leases...</td></tr>
            ) : leases.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No leases found.</td></tr>
            ) : (
              leases.map((l) => (
                <tr key={l.LEASE_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{l.LEASE_ID}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.PROPERTY_ADDRESS}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.PROPERTY_CITY} ({l.PROPERTY_TYPE})</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.TENANT_NAME}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.TENANT_PHONE}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatCurrency(l.MONTHLY_RENT)}/mo
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    <div>{new Date(l.LEASE_START).toLocaleDateString()}</div>
                    <div style={{ color: 'var(--text-muted)' }}>to {new Date(l.LEASE_END).toLocaleDateString()}</div>
                  </td>
                  <td>
                    {l.STATUS === 'Active' ? (
                      l.RENTAL_DUES > 0 ? (
                        <span style={{ fontWeight: 700, color: 'var(--rose)' }}>
                          {formatCurrency(l.RENTAL_DUES)}
                        </span>
                      ) : (
                        <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>
                          Fully Paid
                        </span>
                      )
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <Badge status={l.STATUS} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {l.STATUS === 'Active' && (
                      <button 
                        onClick={() => handleTerminate(l.LEASE_ID)} 
                        className="btn btn-sm btn-secondary"
                        title="Terminate Lease"
                        style={{ color: 'var(--rose)', borderColor: '#fecdd3' }}
                      >
                        <Ban size={14} />
                        <span>Terminate</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Create Lease (PL/SQL) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Lease via Oracle PL/SQL (CREATE_LEASE)">
        <form onSubmit={handleSubmit}>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '16px',
            fontSize: '0.8125rem',
            color: '#1e40af',
            border: '1px solid #bfdbfe'
          }}>
            <strong>PL/SQL Validation:</strong> Directly executes <code>CREATE_LEASE</code>. Enforces availability check, rejects sold properties, blocks overlapping active leases, and automatically transitions property status to <em>Rented</em>.
          </div>

          <div className="form-group">
            <label className="form-label">Property to Lease *</label>
            <select
              className="form-select"
              value={formData.property_id}
              onChange={(e) => {
                const prop = properties.find(p => p.PROPERTY_ID === parseInt(e.target.value));
                setFormData({
                  ...formData,
                  property_id: e.target.value,
                  // Auto-estimate monthly rent as 0.5% of property value if available
                  monthly_rent: prop ? Math.round(prop.PRICE_KSH * 0.005) : formData.monthly_rent
                });
              }}
              required
            >
              <option value="">Select Property</option>
              {properties.map(p => (
                <option 
                  key={p.PROPERTY_ID} 
                  value={p.PROPERTY_ID}
                  disabled={p.STATUS === 'Sold'}
                >
                  #{p.PROPERTY_ID} - {p.ADDRESS}, {p.CITY} [{p.STATUS}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tenant *</label>
            <select
              className="form-select"
              value={formData.tenant_id}
              onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
              required
            >
              <option value="">Select Tenant</option>
              {tenants.map(t => (
                <option key={t.TENANT_ID} value={t.TENANT_ID}>
                  {t.FIRSTNAME} {t.LASTNAME} ({t.EMAIL})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Rent (KES) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 60000"
              value={formData.monthly_rent}
              onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Lease Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.lease_start}
                onChange={(e) => setFormData({ ...formData, lease_start: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lease End Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.lease_end}
                onChange={(e) => setFormData({ ...formData, lease_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Lease (PL/SQL)</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
