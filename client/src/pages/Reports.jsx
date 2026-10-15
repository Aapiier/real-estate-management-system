import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import { 
    FileText, 
    RefreshCw, 
    DollarSign, 
    Home, 
    Wrench, 
    Calendar,
    Download,
    TrendingUp,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

export default function Reports({ notify }) {
    const [activeTab, setActiveTab] = useState('dues');
    const [loading, setLoading] = useState(false);

    // Reports data
    const [leasesByCity, setLeasesByCity] = useState([]);
    const [outstandingDues, setOutstandingDues] = useState([]);
    const [maintenanceReport, setMaintenanceReport] = useState([]);
    const [portfolioReport, setPortfolioReport] = useState([]);

    const loadAllReports = async () => {
        setLoading(true);
        try {
            const [cRes, dRes, mRes, pRes] = await Promise.all([
                api.getActiveLeasesReport(),
                api.getOutstandingDuesReport(),
                api.getPendingMaintenanceReport(),
                api.getPropertyRevenueReport()
            ]);

            if (cRes.success) setLeasesByCity(cRes.data);
            if (dRes.success) setOutstandingDues(dRes.data);
            if (mRes.success) setMaintenanceReport(mRes.data);
            if (pRes.success) setPortfolioReport(pRes.data);
        } catch (err) {
            notify(err.message || 'Error loading reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllReports();
    }, []);

    // Summary calculations
    const totalDuesKsh = outstandingDues.reduce((sum, item) => sum + (parseFloat(item.OUTSTANDING_DUES) || 0), 0);
    const criticalMaintenanceCount = maintenanceReport.filter(m => m.PRIORITY === 'HIGH' || m.PRIORITY === 'URGENT').length;
    const totalPortfolioValue = portfolioReport.reduce((sum, item) => sum + (parseFloat(item.TOTAL_PORTFOLIO_VALUE) || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                        ADBMS Analytical Reports
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Complex relational aggregation queries, PL/SQL function calculations, and portfolio insights
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={loadAllReports} 
                        className="btn btn-secondary" 
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh All Reports
                    </button>
                    <button 
                        onClick={() => window.print()} 
                        className="btn btn-primary"
                    >
                        <Download size={16} /> Print / Export PDF
                    </button>
                </div>
            </div>

            {/* Quick Summary KPI Cards */}
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Outstanding Rental Dues</span>
                        <DollarSign size={20} color="var(--color-danger)" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--color-danger)' }}>
                        KES {totalDuesKsh.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Calculated by PL/SQL function
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>High Priority Maintenance</span>
                        <AlertTriangle size={20} color="var(--color-warning)" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--color-navy)' }}>
                        {criticalMaintenanceCount} Issues
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        High / Urgent attention required
                    </div>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Portfolio Value</span>
                        <TrendingUp size={20} color="var(--color-primary)" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--color-navy)' }}>
                        KES {totalPortfolioValue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Across all registered properties
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', gap: '1rem', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('dues')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'dues' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeTab === 'dues' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <DollarSign size={18} /> Outstanding Dues (PL/SQL)
                </button>
                <button
                    onClick={() => setActiveTab('city')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'city' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeTab === 'city' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Home size={18} /> Active Leases by City
                </button>
                <button
                    onClick={() => setActiveTab('maintenance')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'maintenance' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeTab === 'maintenance' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Wrench size={18} /> Maintenance Open Aging
                </button>
                <button
                    onClick={() => setActiveTab('portfolio')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'portfolio' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeTab === 'portfolio' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <TrendingUp size={18} /> Portfolio Valuation
                </button>
            </div>

            {/* Tab 1: Outstanding Rental Dues */}
            {activeTab === 'dues' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                                Lease Rental Dues Reconciliation
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                Uses the Oracle PL/SQL function <code>CALCULATE_RENTAL_DUES(p_lease_id)</code> to determine expected vs actual payments.
                            </p>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Lease ID</th>
                                    <th>Tenant</th>
                                    <th>Property</th>
                                    <th>Monthly Rent</th>
                                    <th>Total Paid</th>
                                    <th>Outstanding Dues</th>
                                    <th>Financial Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outstandingDues.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                            No active lease dues data found.
                                        </td>
                                    </tr>
                                ) : (
                                    outstandingDues.map((row) => {
                                        const dues = parseFloat(row.OUTSTANDING_DUES) || 0;
                                        return (
                                            <tr key={row.LEASE_ID}>
                                                <td style={{ fontWeight: 600 }}>#{row.LEASE_ID}</td>
                                                <td>{row.TENANT_NAME}</td>
                                                <td style={{ maxWidth: '240px' }}>{row.PROPERTY_TITLE}</td>
                                                <td>KES {parseFloat(row.MONTHLY_RENT).toLocaleString()}</td>
                                                <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                                    KES {parseFloat(row.TOTAL_PAID || 0).toLocaleString()}
                                                </td>
                                                <td style={{ fontWeight: 700, color: dues > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                                    KES {dues.toLocaleString()}
                                                </td>
                                                <td>
                                                    {dues > 0 ? (
                                                        <Badge variant="danger" label="Payment Due" />
                                                    ) : (
                                                        <Badge variant="success" label="Fully Cleared" />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Leases by City */}
            {activeTab === 'city' && (
                <div className="card">
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                            Active Leases & Rental Revenue by City
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Relational multi-table join aggregating leases, properties, and locations.
                        </p>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>City / Municipality</th>
                                    <th>Active Leases</th>
                                    <th>Total Monthly Revenue</th>
                                    <th>Average Monthly Rent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leasesByCity.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                            No city lease data available.
                                        </td>
                                    </tr>
                                ) : (
                                    leasesByCity.map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600 }}>{row.CITY || 'Unspecified'}</td>
                                            <td>
                                                <Badge variant="primary" label={`${row.ACTIVE_LEASES} Active`} />
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                                                KES {parseFloat(row.TOTAL_MONTHLY_RENT || 0).toLocaleString()}
                                            </td>
                                            <td>
                                                KES {Math.round(parseFloat(row.AVG_MONTHLY_RENT || 0)).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Maintenance Aging */}
            {activeTab === 'maintenance' && (
                <div className="card">
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                            Pending Maintenance Aging Report
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Displays unresolved maintenance requests with calculated days open from <code>SYSDATE</code>.
                        </p>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Property</th>
                                    <th>Tenant</th>
                                    <th>Issue Description</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Days Open</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenanceReport.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                            No open maintenance requests pending.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenanceReport.map((m) => (
                                        <tr key={m.REQUEST_ID}>
                                            <td style={{ fontWeight: 600 }}>#{m.REQUEST_ID}</td>
                                            <td style={{ maxWidth: '200px' }}>{m.PROPERTY_TITLE}</td>
                                            <td>{m.TENANT_NAME}</td>
                                            <td style={{ maxWidth: '280px' }}>{m.DESCRIPTION}</td>
                                            <td>
                                                <Badge 
                                                    variant={m.PRIORITY === 'URGENT' ? 'danger' : m.PRIORITY === 'HIGH' ? 'warning' : 'info'} 
                                                    label={m.PRIORITY} 
                                                />
                                            </td>
                                            <td>
                                                <Badge variant="secondary" label={m.STATUS} />
                                            </td>
                                            <td style={{ fontWeight: 600, color: m.DAYS_OPEN > 7 ? 'var(--color-danger)' : 'var(--color-navy)' }}>
                                                {m.DAYS_OPEN} day(s)
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Portfolio Valuation */}
            {activeTab === 'portfolio' && (
                <div className="card">
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                            Property Portfolio Valuation & Status Distribution
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Aggregated metrics on inventory value, minimum, maximum, and average listing prices by status.
                        </p>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Property Status</th>
                                    <th>Total Units</th>
                                    <th>Combined Portfolio Value</th>
                                    <th>Average Price</th>
                                    <th>Minimum Price</th>
                                    <th>Maximum Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolioReport.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                            No portfolio data available.
                                        </td>
                                    </tr>
                                ) : (
                                    portfolioReport.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <Badge 
                                                    variant={
                                                        p.STATUS === 'AVAILABLE' ? 'success' :
                                                        p.STATUS === 'RENTED' ? 'info' :
                                                        p.STATUS === 'SOLD' ? 'warning' : 'secondary'
                                                    } 
                                                    label={p.STATUS} 
                                                />
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{p.PROPERTY_COUNT}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                                                KES {parseFloat(p.TOTAL_PORTFOLIO_VALUE || 0).toLocaleString()}
                                            </td>
                                            <td>KES {Math.round(parseFloat(p.AVG_PRICE || 0)).toLocaleString()}</td>
                                            <td>KES {parseFloat(p.MIN_PRICE || 0).toLocaleString()}</td>
                                            <td>KES {parseFloat(p.MAX_PRICE || 0).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
