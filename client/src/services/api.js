const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.error || `HTTP error ${response.status}`);
        }
        return data;
    } catch (err) {
        console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
        throw err;
    }
}

export const api = {
    // Health
    getHealth: () => request('/health'),
    checkHealth: () => request('/health'),

    // Dashboard
    getDashboardStats: () => request('/dashboard/stats'),

    // Properties
    getProperties: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/properties${query ? `?${query}` : ''}`);
    },
    getProperty: (id) => request(`/properties/${id}`),
    registerProperty: (data) => request('/properties', { method: 'POST', body: data }),
    completeSale: (data) => request('/properties/sale', { method: 'POST', body: data }),
    updateProperty: (id, data) => request(`/properties/${id}`, { method: 'PUT', body: data }),
    deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),

    // Owners
    getOwners: () => request('/owners'),
    getOwner: (id) => request(`/owners/${id}`),
    createOwner: (data) => request('/owners', { method: 'POST', body: data }),
    updateOwner: (id, data) => request(`/owners/${id}`, { method: 'PUT', body: data }),
    deleteOwner: (id) => request(`/owners/${id}`, { method: 'DELETE' }),

    // Agents
    getAgents: () => request('/agents'),
    getAgent: (id) => request(`/agents/${id}`),
    createAgent: (data) => request('/agents', { method: 'POST', body: data }),
    updateAgent: (id, data) => request(`/agents/${id}`, { method: 'PUT', body: data }),
    deleteAgent: (id) => request(`/agents/${id}`, { method: 'DELETE' }),

    // Tenants
    getTenants: () => request('/tenants'),
    getTenant: (id) => request(`/tenants/${id}`),
    createTenant: (data) => request('/tenants', { method: 'POST', body: data }),
    updateTenant: (id, data) => request(`/tenants/${id}`, { method: 'PUT', body: data }),
    deleteTenant: (id) => request(`/tenants/${id}`, { method: 'DELETE' }),

    // Leases
    getLeases: () => request('/leases'),
    createLease: (data) => request('/leases', { method: 'POST', body: data }),
    terminateLease: (id) => request(`/leases/${id}/terminate`, { method: 'PUT' }),

    // Payments
    getPayments: () => request('/payments'),
    recordPayment: (data) => request('/payments', { method: 'POST', body: data }),

    // Maintenance
    getMaintenance: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/maintenance${query ? `?${query}` : ''}`);
    },
    createMaintenance: (data) => request('/maintenance', { method: 'POST', body: data }),
    updateMaintenanceStatus: (id, status) => request(`/maintenance/${id}/status`, { method: 'PATCH', body: { status } }),

    // Transactions & Clients
    getTransactions: () => request('/transactions'),
    getClients: () => request('/clients'),
    createClient: (data) => request('/clients', { method: 'POST', body: data }),

    // Reports
    getActiveLeasesReport: () => request('/reports/active-leases-by-city'),
    getOutstandingDuesReport: () => request('/reports/outstanding-dues'),
    getPendingMaintenanceReport: () => request('/reports/pending-maintenance'),
    getPropertyRevenueReport: () => request('/reports/property-revenue'),

    // PL/SQL Viva & Demonstration
    getPlsqlObjects: () => request('/plsql/objects'),
    testCommission: (data) => request('/plsql/calc-commission', { method: 'POST', body: data }),
    testPropertyStatus: (data) => request('/plsql/property-status', { method: 'POST', body: data }),
    testRentalDues: (data) => request('/plsql/calc-dues', { method: 'POST', body: data }),
    runPortfolioReport: (data) => request('/plsql/portfolio-report', { method: 'POST', body: data }),
    runReconcileDues: () => request('/plsql/reconcile-dues', { method: 'POST' }),
    getAuditLog: () => request('/plsql/audit-log')
};
