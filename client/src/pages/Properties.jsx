import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function Properties({ notify }) {
  const [properties, setProperties] = useState([]);
  const [owners, setOwners] = useState([]);
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Register Form State
  const [formData, setFormData] = useState({
    property_type: 'Apartment',
    address: '',
    county: 'Nairobi',
    city: 'Nairobi',
    price_ksh: '',
    owner_id: '',
    agent_id: '',
    zipcode: '00100',
    size_m2: '',
    status: 'Available'
  });

  // Sale Form State
  const [saleData, setSaleData] = useState({
    client_id: '',
    agent_id: '',
    sale_amount: '',
    sale_date: new Date().toISOString().split('T')[0]
  });

  const propertyTypes = [
    'All', 'Apartment', 'House', 'Condo', 'Villa', 'Townhouse', 
    'Duplex', 'Penthouse', 'Studio', 'Loft', 'Cottage'
  ];

  const statuses = ['All', 'Available', 'Rented', 'Sold', 'Under Maintenance'];

  const cities = ['All', 'Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kisumu', 'Nyali'];

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedCity !== 'All') params.city = selectedCity;

      const [propRes, ownerRes, agentRes, clientRes] = await Promise.all([
        api.getProperties(params),
        api.getOwners(),
        api.getAgents(),
        api.getClients()
      ]);

      setProperties(propRes.data || []);
      setOwners(ownerRes.data || []);
      setAgents(agentRes.data || []);
      setClients(clientRes.data || []);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedType, selectedStatus, selectedCity]);

  // Handle PL/SQL Property Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.registerProperty(formData);
      notify(res.message, 'success');
      setShowRegisterModal(false);
      setFormData({
        property_type: 'Apartment',
        address: '',
        county: 'Nairobi',
        city: 'Nairobi',
        price_ksh: '',
        owner_id: '',
        agent_id: '',
        zipcode: '00100',
        size_m2: '',
        status: 'Available'
      });
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Handle PL/SQL Complete Sale
  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;

    try {
      const res = await api.completeSale({
        property_id: selectedProperty.PROPERTY_ID,
        client_id: saleData.client_id,
        agent_id: saleData.agent_id || selectedProperty.AGENT_ID,
        sale_amount: saleData.sale_amount || selectedProperty.PRICE_KSH,
        sale_date: saleData.sale_date
      });
      notify(res.message, 'success');
      setShowSaleModal(false);
      setSelectedProperty(null);
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Property ID ${id}?`)) return;
    try {
      const res = await api.deleteProperty(id);
      notify(res.message, 'success');
      loadData();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const openSaleModal = (prop) => {
    setSelectedProperty(prop);
    setSaleData({
      client_id: clients[0]?.CLIENT_ID || '',
      agent_id: prop.AGENT_ID || agents[0]?.AGENT_ID || '',
      sale_amount: prop.PRICE_KSH,
      sale_date: new Date().toISOString().split('T')[0]
    });
    setShowSaleModal(true);
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-KE') + ' KES';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Property Management</h2>
          <p className="page-subtitle">Manage listings, register units via Oracle PL/SQL, and record property sales.</p>
        </div>
        <button 
          onClick={() => setShowRegisterModal(true)} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Register Property (PL/SQL)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by address, city, or county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="form-select" 
          style={{ width: '160px' }}
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {propertyTypes.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
          ))}
        </select>

        <select 
          className="form-select" 
          style={{ width: '170px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>

        <select 
          className="form-select" 
          style={{ width: '150px' }}
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Location</th>
              <th>Price</th>
              <th>Size</th>
              <th>Owner</th>
              <th>Agent</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading properties...</td>
              </tr>
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No properties found matching current filter.
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr key={p.PROPERTY_ID}>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{p.PROPERTY_ID}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.ADDRESS}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.PROPERTY_TYPE}</div>
                  </td>
                  <td>
                    <div>{p.CITY}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.COUNTY}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatCurrency(p.PRICE_KSH)}
                  </td>
                  <td>{p.SIZE_M2 ? `${p.SIZE_M2} m²` : '—'}</td>
                  <td>{p.OWNER_NAME || 'Unassigned'}</td>
                  <td>
                    <div>{p.AGENT_NAME || 'Unassigned'}</div>
                    {p.AGENCY && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.AGENCY}</div>}
                  </td>
                  <td>
                    <Badge status={p.STATUS} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {p.STATUS === 'Available' && (
                        <button
                          onClick={() => openSaleModal(p)}
                          className="btn btn-sm btn-primary"
                          title="Complete Sale (PL/SQL)"
                          style={{ backgroundColor: 'var(--emerald)' }}
                        >
                          <DollarSign size={14} />
                          <span>Sell</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.PROPERTY_ID)}
                        className="btn btn-sm btn-danger"
                        title="Delete Property"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Register Property (PL/SQL) */}
      <Modal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        title="Register Property via Oracle PL/SQL (REGISTER_PROPERTY)"
      >
        <form onSubmit={handleRegister}>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            padding: '12px 16px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '16px',
            fontSize: '0.8125rem',
            color: '#1e40af',
            border: '1px solid #bfdbfe'
          }}>
            <strong>ADBMS Requirement:</strong> This form directly calls the Oracle PL/SQL stored procedure <code>REGISTER_PROPERTY</code> with transactional validation, trigger casing, and audit logging.
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Property Type *</label>
              <select
                className="form-select"
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                required
              >
                {propertyTypes.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price in KES *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 15000000"
                value={formData.price_ksh}
                onChange={(e) => setFormData({ ...formData, price_ksh: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 450 Riverside Drive, Apt 4B"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nairobi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">County *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Nairobi"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zipcode</label>
              <input
                type="text"
                className="form-input"
                placeholder="00100"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Size (m²)</label>
              <input
                type="number"
                className="form-input"
                placeholder="150"
                value={formData.size_m2}
                onChange={(e) => setFormData({ ...formData, size_m2: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Owner *</label>
              <select
                className="form-select"
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                required
              >
                <option value="">Select Owner</option>
                {owners.map(o => (
                  <option key={o.OWNER_ID} value={o.OWNER_ID}>{o.FIRSTNAME} {o.LASTNAME}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Listing Agent *</label>
              <select
                className="form-select"
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                required
              >
                <option value="">Select Agent</option>
                {agents.map(a => (
                  <option key={a.AGENT_ID} value={a.AGENT_ID}>{a.FIRSTNAME} {a.LASTNAME}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '16px -24px -24px' }}>
            <button 
              type="button" 
              onClick={() => setShowRegisterModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Property (PL/SQL)
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Complete Property Sale (PL/SQL) */}
      <Modal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        title="Complete Property Sale via Oracle PL/SQL (COMPLETE_PROPERTY_SALE)"
      >
        {selectedProperty && (
          <form onSubmit={handleCompleteSale}>
            <div style={{ 
              backgroundColor: '#ecfdf5', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '16px',
              fontSize: '0.8125rem',
              color: '#065f46',
              border: '1px solid #a7f3d0'
            }}>
              <strong>Business Rule Enforced:</strong> Calls <code>COMPLETE_PROPERTY_SALE</code>. Updates property status to <em>Sold</em>, prevents double selling, calculates 5% agent commission, and writes to audit log.
            </div>

            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Selling Property:</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProperty.ADDRESS}, {selectedProperty.CITY}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
                Listed Price: {formatCurrency(selectedProperty.PRICE_KSH)}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Buyer / Client *</label>
                <select
                  className="form-select"
                  value={saleData.client_id}
                  onChange={(e) => setSaleData({ ...saleData, client_id: e.target.value })}
                  required
                >
                  <option value="">Select Buyer</option>
                  {clients.map(c => (
                    <option key={c.CLIENT_ID} value={c.CLIENT_ID}>{c.FIRSTNAME} {c.LASTNAME} ({c.EMAIL})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Closing Agent *</label>
                <select
                  className="form-select"
                  value={saleData.agent_id}
                  onChange={(e) => setSaleData({ ...saleData, agent_id: e.target.value })}
                  required
                >
                  <option value="">Select Agent</option>
                  {agents.map(a => (
                    <option key={a.AGENT_ID} value={a.AGENT_ID}>{a.FIRSTNAME} {a.LASTNAME}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Agreed Sale Amount (KES) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={saleData.sale_amount}
                  onChange={(e) => setSaleData({ ...saleData, sale_amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sale Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={saleData.sale_date}
                  onChange={(e) => setSaleData({ ...saleData, sale_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Calculated Agent Commission (5%): <strong>{formatCurrency((saleData.sale_amount || 0) * 0.05)}</strong>
            </div>

            <div className="modal-footer" style={{ margin: '20px -24px -24px' }}>
              <button 
                type="button" 
                onClick={() => setShowSaleModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--emerald)' }}>
                Finalize Sale (PL/SQL)
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
