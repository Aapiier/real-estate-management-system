import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Owners from './pages/Owners';
import Agents from './pages/Agents';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import PlSqlConsole from './pages/PlSqlConsole';

import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState({ connected: false, version: '' });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Notification helper
  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Health check Oracle connection
  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await api.checkHealth();
      const isConnected = res.connected || (res.success && res.database?.connected);
      if (isConnected) {
        setDbStatus({
          connected: true,
          version: res.database?.versionString || res.database?.name || 'Oracle 21c XE',
          schema: res.database?.schema || res.details?.DB_USER || 'REALESTATE_USER'
        });
      } else {
        setDbStatus({ connected: false, error: res.error });
      }
    } catch (err) {
      setDbStatus({ connected: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalRefresh = () => {
    checkHealth();
    setRefreshKey((prev) => prev + 1);
    notify('Refreshed data from Oracle Database', 'success');
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Executive Management Dashboard';
      case 'properties': return 'Property Portfolio Management';
      case 'owners': return 'Property Owners Registry';
      case 'agents': return 'Brokers & Real Estate Agents';
      case 'tenants': return 'Tenants Registry';
      case 'leases': return 'Lease Agreements (PL/SQL CREATE_LEASE)';
      case 'payments': return 'Payments & Receipts (PL/SQL RECORD_PAYMENT)';
      case 'maintenance': return 'Maintenance Requests & Ticketing';
      case 'transactions': return 'Sales Transactions (PL/SQL COMPLETE_PROPERTY_SALE)';
      case 'reports': return 'ADBMS Analytical Reports';
      case 'plsql': return 'Oracle PL/SQL Demonstration & Viva Console';
      default: return 'Real Estate Management System';
    }
  };

  const renderCurrentPage = () => {
    const commonProps = { notify, key: `${activePage}-${refreshKey}` };
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={(page) => setActivePage(page)} notify={notify} key={refreshKey} />;
      case 'properties':
        return <Properties {...commonProps} />;
      case 'owners':
        return <Owners {...commonProps} />;
      case 'agents':
        return <Agents {...commonProps} />;
      case 'tenants':
        return <Tenants {...commonProps} />;
      case 'leases':
        return <Leases {...commonProps} />;
      case 'payments':
        return <Payments {...commonProps} />;
      case 'maintenance':
        return <Maintenance {...commonProps} />;
      case 'transactions':
        return <Transactions {...commonProps} />;
      case 'reports':
        return <Reports {...commonProps} />;
      case 'plsql':
        return <PlSqlConsole {...commonProps} />;
      default:
        return <Dashboard onNavigate={(page) => setActivePage(page)} notify={notify} key={refreshKey} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Toast Manager */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Fixed Left Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        dbConnected={dbStatus.connected} 
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar 
          activeTitle={getPageTitle()} 
          onRefresh={handleGlobalRefresh} 
          loading={loading} 
          dbStatus={dbStatus} 
        />
        <main className="page-container">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}
