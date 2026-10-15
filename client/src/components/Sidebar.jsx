import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  UserCheck, 
  Briefcase, 
  Users, 
  FileText, 
  CreditCard, 
  Wrench, 
  DollarSign, 
  BarChart3, 
  Terminal, 
  Database,
  Building
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, dbConnected }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'owners', label: 'Owners', icon: UserCheck },
    { id: 'agents', label: 'Agents', icon: Briefcase },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'leases', label: 'Leases', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'transactions', label: 'Sales & Deeds', icon: DollarSign },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'plsql', label: 'PL/SQL Console', icon: Terminal, badge: 'ADBMS' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
          }}>
            <Building size={22} />
          </div>
          <div className="brand-text">
            <h2 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>
              PrimeState
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                backgroundColor: dbConnected ? '#10b981' : '#f43f5e',
                boxShadow: dbConnected ? '0 0 8px #10b981' : 'none'
              }}></span>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>
                Oracle 21c XE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ 
          fontSize: '0.6875rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: '#64748b', 
          padding: '0 12px 10px' 
        }}>
          Management
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '8px',
                    bottom: '8px',
                    width: '3px',
                    backgroundColor: 'var(--sidebar-accent)',
                    borderRadius: '0 4px 4px 0'
                  }}></span>
                )}
                <Icon size={18} color={isActive ? 'var(--sidebar-accent)' : '#94a3b8'} />
                <span className="nav-label" style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    backgroundColor: '#1e3a8a',
                    color: '#93c5fd',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Database Footer Status */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid var(--sidebar-border)', 
        backgroundColor: '#090d16' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={16} color="#38bdf8" />
          <div style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
            <div style={{ color: '#ffffff', fontWeight: 600 }}>REALESTATE_USER</div>
            <div style={{ color: '#64748b' }}>localhost:1521/XEPDB1</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
