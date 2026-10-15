import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import { 
    Terminal, 
    CheckCircle, 
    Play, 
    RefreshCw, 
    ShieldAlert, 
    Code2, 
    BookOpen, 
    Zap,
    Cpu,
    Database,
    HelpCircle
} from 'lucide-react';

export default function PlSqlConsole({ notify }) {
    const [activeSection, setActiveSection] = useState('objects');
    const [loading, setLoading] = useState(false);

    // Objects status
    const [objects, setObjects] = useState([]);
    const [triggers, setTriggers] = useState([]);

    // Audit logs
    const [auditLogs, setAuditLogs] = useState([]);

    // Interactive Function Forms
    const [commForm, setCommForm] = useState({ saleAmount: '15000000', commissionRate: '3' });
    const [commResult, setCommResult] = useState(null);

    const [statusForm, setStatusForm] = useState({ propertyId: '1' });
    const [statusResult, setStatusResult] = useState(null);

    const [duesForm, setDuesForm] = useState({ leaseId: '1' });
    const [duesResult, setDuesResult] = useState(null);

    // Package runners
    const [portfolioFilter, setPortfolioFilter] = useState('0');
    const [portfolioLogs, setPortfolioLogs] = useState([]);
    const [reconcileLogs, setReconcileLogs] = useState([]);

    const loadMeta = async () => {
        setLoading(true);
        try {
            const [objRes, auditRes] = await Promise.all([
                api.getPlsqlObjects(),
                api.getAuditLog()
            ]);
            if (objRes && (objRes.success !== false)) {
                setObjects(objRes.data?.objects || objRes.objects || []);
                setTriggers(objRes.data?.triggers || objRes.triggers || []);
            }
            if (auditRes && (auditRes.success !== false)) {
                setAuditLogs(auditRes.data || auditRes.rows || []);
            }
        } catch (err) {
            notify(err.message || 'Failed loading PL/SQL metadata', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeta();
    }, []);

    // Handlers for functions
    const handleCalcCommission = async (e) => {
        e.preventDefault();
        try {
            const res = await api.testCommission(commForm);
            if (res.success) {
                setCommResult(res.data);
                notify('PL/SQL Function CALCULATE_AGENT_COMMISSION executed successfully', 'success');
            }
        } catch (err) {
            notify(err.message, 'error');
        }
    };

    const handleGetPropertyStatus = async (e) => {
        e.preventDefault();
        try {
            const res = await api.testPropertyStatus(statusForm);
            if (res.success) {
                setStatusResult(res.data);
                notify('PL/SQL Function GET_PROPERTY_STATUS executed successfully', 'success');
            }
        } catch (err) {
            notify(err.message, 'error');
        }
    };

    const handleCalcDues = async (e) => {
        e.preventDefault();
        try {
            const res = await api.testRentalDues(duesForm);
            if (res.success) {
                setDuesResult(res.data);
                notify('PL/SQL Function CALCULATE_RENTAL_DUES executed successfully', 'success');
            }
        } catch (err) {
            notify(err.message, 'error');
        }
    };

    // Handlers for packages
    const handleRunPortfolio = async () => {
        setLoading(true);
        try {
            const res = await api.runPortfolioReport({ minPrice: portfolioFilter });
            if (res.success) {
                setPortfolioLogs(res.data.dbmsOutput || []);
                notify('Package procedure generate_portfolio_report executed with explicit cursor', 'success');
            }
        } catch (err) {
            notify(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRunReconcile = async () => {
        setLoading(true);
        try {
            const res = await api.runReconcileDues();
            if (res.success) {
                setReconcileLogs(res.data.dbmsOutput || []);
                notify('Package procedure reconcile_all_dues executed with cursor FOR loop', 'success');
            }
        } catch (err) {
            notify(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Terminal size={28} color="var(--color-primary)" /> Oracle PL/SQL Faculty Viva & Demonstration Console
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Live Oracle 21c Database PL/SQL objects, stored procedures, functions, audit triggers, and package DBMS_OUTPUT buffers
                    </p>
                </div>
                <button 
                    onClick={loadMeta} 
                    className="btn btn-secondary" 
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Catalog & Logs
                </button>
            </div>

            {/* Quick Status Bar */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem' }}>
                            <Database size={18} /> CONNECTED ORACLE DATABASE
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
                            Oracle Database 21c Express Edition (XEPDB1)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                            Schema: <code>REALESTATE_USER</code> | Driver: <code>node-oracledb Thin Mode</code>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PL/SQL Objects</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80' }}>
                                {objects.length} Compiled
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Triggers</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                                {triggers.length} Active
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Security Audit Events</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#facc15' }}>
                                {auditLogs.length} Events
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', gap: '0.5rem', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveSection('objects')}
                    style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeSection === 'objects' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeSection === 'objects' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <Cpu size={16} /> Compiled PL/SQL Catalog
                </button>
                <button
                    onClick={() => setActiveSection('functions')}
                    style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeSection === 'functions' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeSection === 'functions' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <Zap size={16} /> Test Functions
                </button>
                <button
                    onClick={() => setActiveSection('package')}
                    style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeSection === 'package' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeSection === 'package' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <Code2 size={16} /> Package & Cursors (DBMS_OUTPUT)
                </button>
                <button
                    onClick={() => setActiveSection('audit')}
                    style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeSection === 'audit' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeSection === 'audit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <ShieldAlert size={16} /> Trigger Audit Trail
                </button>
                <button
                    onClick={() => setActiveSection('viva')}
                    style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderBottom: activeSection === 'viva' ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: activeSection === 'viva' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <BookOpen size={16} /> ADBMS Viva Q&A Guide
                </button>
            </div>

            {/* Section 1: Compiled Objects Catalog */}
            {activeSection === 'objects' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                            Live Database PL/SQL Objects (from <code>USER_OBJECTS</code>)
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            All procedures, functions, packages, and package bodies compiled and verified in the Oracle schema.
                        </p>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Object Name</th>
                                        <th>Object Type</th>
                                        <th>Status</th>
                                        <th>Created Date</th>
                                        <th>Last DDL Modification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {objects.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                                No objects loaded.
                                            </td>
                                        </tr>
                                    ) : (
                                        objects.map((obj, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{obj.OBJECT_NAME}</td>
                                                <td>
                                                    <Badge 
                                                        variant={
                                                            obj.OBJECT_TYPE === 'PROCEDURE' ? 'primary' :
                                                            obj.OBJECT_TYPE === 'FUNCTION' ? 'info' :
                                                            obj.OBJECT_TYPE === 'PACKAGE' ? 'warning' : 'secondary'
                                                        } 
                                                        label={obj.OBJECT_TYPE} 
                                                    />
                                                </td>
                                                <td>
                                                    <Badge variant={obj.STATUS === 'VALID' ? 'success' : 'danger'} label={obj.STATUS} />
                                                </td>
                                                <td style={{ fontSize: '0.85rem' }}>{new Date(obj.CREATED).toLocaleString()}</td>
                                                <td style={{ fontSize: '0.85rem' }}>{new Date(obj.LAST_DDL_TIME).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
                            Database Triggers (from <code>USER_TRIGGERS</code>)
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Database level event triggers enforcing validation and security audit logging.
                        </p>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Trigger Name</th>
                                        <th>Trigger Type</th>
                                        <th>Triggering Event</th>
                                        <th>Target Table</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {triggers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                                No triggers loaded.
                                            </td>
                                        </tr>
                                    ) : (
                                        triggers.map((t, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{t.TRIGGER_NAME}</td>
                                                <td><Badge variant="secondary" label={t.TRIGGER_TYPE} /></td>
                                                <td><Badge variant="info" label={t.TRIGGERING_EVENT} /></td>
                                                <td style={{ fontWeight: 600 }}>{t.TABLE_NAME}</td>
                                                <td><Badge variant={t.STATUS === 'ENABLED' ? 'success' : 'danger'} label={t.STATUS} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Section 2: Interactive Function Testers */}
            {activeSection === 'functions' && (
                <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                    {/* Function 1: CALCULATE_AGENT_COMMISSION */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Zap size={20} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                                CALCULATE_AGENT_COMMISSION
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Calculates broker commission from sale amount and percentage rate with input validation.
                        </p>
                        <form onSubmit={handleCalcCommission} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label className="form-label">Sale Amount (KES)</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={commForm.saleAmount} 
                                    onChange={(e) => setCommForm({ ...commForm, saleAmount: e.target.value })}
                                    required 
                                />
                            </div>
                            <div>
                                <label className="form-label">Commission Rate (%)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    className="form-control" 
                                    value={commForm.commissionRate} 
                                    onChange={(e) => setCommForm({ ...commForm, commissionRate: e.target.value })}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                                <Play size={16} /> Execute Function
                            </button>
                        </form>
                        {commResult && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Function Return Value:</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem' }}>
                                    KES {parseFloat(commResult.commission).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                                    {commResult.formula}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Function 2: GET_PROPERTY_STATUS */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Zap size={20} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                                GET_PROPERTY_STATUS
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Queries property status by ID and handles <code>NO_DATA_FOUND</code> exception gracefully.
                        </p>
                        <form onSubmit={handleGetPropertyStatus} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label className="form-label">Property ID</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={statusForm.propertyId} 
                                    onChange={(e) => setStatusForm({ ...statusForm, propertyId: e.target.value })}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                                <Play size={16} /> Query Status
                            </button>
                        </form>
                        {statusResult && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status Returned:</div>
                                <div style={{ marginTop: '0.3rem' }}>
                                    <Badge 
                                        variant={
                                            statusResult.status === 'AVAILABLE' ? 'success' :
                                            statusResult.status === 'RENTED' ? 'info' :
                                            statusResult.status === 'SOLD' ? 'warning' : 'secondary'
                                        } 
                                        label={statusResult.status} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Function 3: CALCULATE_RENTAL_DUES */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Zap size={20} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                                CALCULATE_RENTAL_DUES
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Calculates accrued rent from lease start date minus all verified payment records.
                        </p>
                        <form onSubmit={handleCalcDues} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label className="form-label">Lease ID</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    value={duesForm.leaseId} 
                                    onChange={(e) => setDuesForm({ ...duesForm, leaseId: e.target.value })}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                                <Play size={16} /> Calculate Dues
                            </button>
                        </form>
                        {duesResult && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                                    <span>Total Expected Rent:</span>
                                    <b>KES {parseFloat(duesResult.totalExpected || 0).toLocaleString()}</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--color-success)' }}>
                                    <span>Total Paid To Date:</span>
                                    <b>KES {parseFloat(duesResult.totalPaid || 0).toLocaleString()}</b>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem', color: duesResult.outstandingDues > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                    <span>Outstanding Balance:</span>
                                    <span>KES {parseFloat(duesResult.outstandingDues || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Section 3: Package & Explicit Cursors (DBMS_OUTPUT) */}
            {activeSection === 'package' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Demo 1: Explicit Cursor Portfolio Report */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code2 size={20} color="var(--color-primary)" /> REALESTATE_PKG.generate_portfolio_report (Explicit Cursor)
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Uses explicit cursor <code>c_prop</code> with <code>OPEN</code>, <code>FETCH</code>, <code>%NOTFOUND</code>, <code>%ROWCOUNT</code>, and <code>CLOSE</code>.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Min Price Filter:</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    style={{ width: '140px' }} 
                                    value={portfolioFilter} 
                                    onChange={(e) => setPortfolioFilter(e.target.value)} 
                                />
                                <button 
                                    onClick={handleRunPortfolio} 
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    <Play size={16} /> Run Cursor Routine
                                </button>
                            </div>
                        </div>

                        <div className="console-box">
                            <div style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                ORACLE DBMS_OUTPUT BUFFER (Line Count: {portfolioLogs.length})
                            </div>
                            {portfolioLogs.length === 0 ? (
                                <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                                    Click "Run Cursor Routine" above to execute REALESTATE_PKG.generate_portfolio_report on Oracle and capture the server output buffer...
                                </div>
                            ) : (
                                portfolioLogs.map((line, idx) => (
                                    <div key={idx} style={{ color: line.includes('===') ? '#38bdf8' : line.includes('Total') ? '#4ade80' : '#f1f5f9' }}>
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Demo 2: Cursor FOR Loop Reconcile Dues */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Code2 size={20} color="var(--color-primary)" /> REALESTATE_PKG.reconcile_all_dues (Cursor FOR Loop)
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Demonstrates automated cursor iteration using <code>FOR r_lease IN c_active_leases LOOP</code>.
                                </p>
                            </div>
                            <button 
                                onClick={handleRunReconcile} 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                <Play size={16} /> Run Dues Reconciliation
                            </button>
                        </div>

                        <div className="console-box">
                            <div style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                                ORACLE DBMS_OUTPUT BUFFER (Line Count: {reconcileLogs.length})
                            </div>
                            {reconcileLogs.length === 0 ? (
                                <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                                    Click "Run Dues Reconciliation" to loop through all active leases using a cursor FOR loop...
                                </div>
                            ) : (
                                reconcileLogs.map((line, idx) => (
                                    <div key={idx} style={{ color: line.includes('ALERT') ? '#f87171' : line.includes('===') ? '#38bdf8' : '#f1f5f9' }}>
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Section 4: Trigger Audit Trail */}
            {activeSection === 'audit' && (
                <div className="card">
                    <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldAlert size={20} color="var(--color-warning)" /> Live Trigger Security & Audit Trail (<code>SECURITY_AUDIT</code>)
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Automatically populated by row-level triggers: <code>TRG_PAYMENT_AUDIT</code> and <code>TRG_PROPERTY_STATUS_AUDIT</code> upon DML execution.
                        </p>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Audit ID</th>
                                    <th>Action</th>
                                    <th>Target Table</th>
                                    <th>Record ID</th>
                                    <th>Performed By</th>
                                    <th>Timestamp</th>
                                    <th>Audit Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                            No audit entries found.
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.map((log) => (
                                        <tr key={log.AUDIT_ID}>
                                            <td style={{ fontWeight: 600 }}>#{log.AUDIT_ID}</td>
                                            <td>
                                                <Badge 
                                                    variant={
                                                        log.ACTION === 'INSERT' ? 'success' :
                                                        log.ACTION === 'UPDATE' ? 'info' :
                                                        log.ACTION === 'DELETE' ? 'danger' : 'secondary'
                                                    } 
                                                    label={log.ACTION} 
                                                />
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{log.TABLE_NAME}</td>
                                            <td>#{log.RECORD_ID}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.PERFORMED_BY}</td>
                                            <td style={{ fontSize: '0.85rem' }}>{new Date(log.ACTION_TIMESTAMP).toLocaleString()}</td>
                                            <td style={{ maxWidth: '350px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                {log.DETAILS}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Section 5: ADBMS Viva Q&A Guide */}
            {activeSection === 'viva' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={22} color="var(--color-primary)" /> ADBMS College Viva Cheat Sheet & Architecture Defense
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                            Key talking points and code explanations for your faculty demonstration:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-primary)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.3rem' }}>
                                    1. Why Oracle PL/SQL over standard MySQL queries?
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                    Oracle PL/SQL (Procedural Language/Structured Query Language) allows running procedural blocks, loops, explicit cursors, and custom exception handling directly inside the database kernel. This eliminates multi-round-trip network latency, enforces ACID transactions at the database level, and ensures data integrity regardless of which application connects to it.
                                </p>
                            </div>

                            <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-success)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.3rem' }}>
                                    2. How are overlapping leases and double sales prevented?
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                    Inside <code>CREATE_LEASE</code>, an explicit date range condition checks for any existing active lease where <code>(start_date &lt;= p_end_date AND end_date &gt;= p_start_date)</code>. If found, it raises <code>RAISE_APPLICATION_ERROR(-20012, 'Active lease already overlaps...')</code>. Inside <code>COMPLETE_PROPERTY_SALE</code>, the property status is verified with <code>SELECT status FOR UPDATE</code>; if not AVAILABLE, it raises <code>-20031</code> and rolls back to a savepoint.
                                </p>
                            </div>

                            <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-warning)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.3rem' }}>
                                    3. What cursors did you implement?
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                    In <code>REALESTATE_PKG</code>, we implemented both:
                                    <br />• <b>Explicit Cursor:</b> <code>c_prop</code> with manual <code>OPEN</code>, <code>FETCH</code>, <code>%NOTFOUND</code> loop termination, <code>%ROWCOUNT</code> tracking, and mandatory <code>CLOSE</code>.
                                    <br />• <b>Cursor FOR Loop:</b> <code>FOR r_lease IN c_active_leases LOOP</code> which automatically opens, fetches, and closes the cursor safely.
                                </p>
                            </div>

                            <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-info)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '0.3rem' }}>
                                    4. How did you avoid mutating-table errors (ORA-04091) in Triggers?
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                                    Mutating table errors happen when a row-level trigger queries the very table being modified. We strictly separated responsibilities: triggers only access <code>:NEW</code> and <code>:OLD</code> bind variables and write to a separate audit table (<code>SECURITY_AUDIT</code>), while complex multi-table checks and status recalculations reside cleanly inside stored procedures.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
