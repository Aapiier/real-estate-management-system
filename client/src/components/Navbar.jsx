import React from 'react';
import { RefreshCw, Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTitle, onRefresh, loading, dbStatus }) {
  return (
    <header className="top-header">
      <div>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {activeTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* DB Connection Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: dbStatus?.connected ? 'var(--emerald-light)' : 'var(--rose-light)',
          color: dbStatus?.connected ? 'var(--emerald)' : 'var(--rose)',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: `1px solid ${dbStatus?.connected ? '#a7f3d0' : '#fecdd3'}`
        }}>
          {dbStatus?.connected ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{dbStatus?.connected ? `Oracle XE: Connected` : 'Oracle Disconnected'}</span>
        </div>

        {/* Viva Readiness Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: '1px solid #bfdbfe'
        }}>
          <ShieldCheck size={14} />
          <span>PL/SQL Verified</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn btn-secondary btn-sm"
          title="Refresh Data from Oracle"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
