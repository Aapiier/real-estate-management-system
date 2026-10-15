const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const propertyController = require('../controllers/propertyController');
const ownerController = require('../controllers/ownerController');
const agentController = require('../controllers/agentController');
const tenantController = require('../controllers/tenantController');
const leaseController = require('../controllers/leaseController');
const paymentController = require('../controllers/paymentController');
const maintenanceController = require('../controllers/maintenanceController');
const transactionController = require('../controllers/transactionController');
const reportController = require('../controllers/reportController');
const plsqlController = require('../controllers/plsqlController');
const db = require('../config/db');

// Health Check
router.get('/health', async (req, res) => {
    const health = await db.checkHealth();
    res.json({
        success: health.connected,
        status: health.connected ? 'OK' : 'ERROR',
        connected: health.connected,
        database: {
            connected: health.connected,
            name: 'Oracle Database 21c Express Edition',
            container: health.details?.CONTAINER || 'XEPDB1',
            schema: health.details?.DB_USER || 'REALESTATE_USER'
        },
        driver: 'oracledb',
        timestamp: new Date().toISOString(),
        ...health
    });
});

// Dashboard
router.get('/dashboard/stats', dashboardController.getStats);

// Properties (Includes PL/SQL procedure REGISTER_PROPERTY and COMPLETE_PROPERTY_SALE)
router.get('/properties', propertyController.getProperties);
router.get('/properties/:id', propertyController.getPropertyById);
router.post('/properties', propertyController.registerProperty);
router.post('/properties/sale', propertyController.completeSale);
router.put('/properties/:id', propertyController.updateProperty);
router.delete('/properties/:id', propertyController.deleteProperty);

// Owners
router.get('/owners', ownerController.getOwners);
router.get('/owners/:id', ownerController.getOwnerById);
router.post('/owners', ownerController.createOwner);
router.put('/owners/:id', ownerController.updateOwner);
router.delete('/owners/:id', ownerController.deleteOwner);

// Agents
router.get('/agents', agentController.getAgents);
router.get('/agents/:id', agentController.getAgentById);
router.post('/agents', agentController.createAgent);
router.put('/agents/:id', agentController.updateAgent);
router.delete('/agents/:id', agentController.deleteAgent);

// Tenants
router.get('/tenants', tenantController.getTenants);
router.get('/tenants/:id', tenantController.getTenantById);
router.post('/tenants', tenantController.createTenant);
router.put('/tenants/:id', tenantController.updateTenant);
router.delete('/tenants/:id', tenantController.deleteTenant);

// Leases (Includes PL/SQL procedure CREATE_LEASE)
router.get('/leases', leaseController.getLeases);
router.post('/leases', leaseController.createLease);
router.put('/leases/:id/terminate', leaseController.terminateLease);

// Payments (Includes PL/SQL procedure RECORD_PAYMENT)
router.get('/payments', paymentController.getPayments);
router.post('/payments', paymentController.recordPayment);

// Maintenance Requests
router.get('/maintenance', maintenanceController.getMaintenanceRequests);
router.post('/maintenance', maintenanceController.createMaintenanceRequest);
router.patch('/maintenance/:id/status', maintenanceController.updateStatus);

// Transactions & Clients
router.get('/transactions', transactionController.getTransactions);
router.get('/clients', transactionController.getClients);
router.post('/clients', transactionController.createClient);

// Reports
router.get('/reports/active-leases-by-city', reportController.getActiveLeasesByCity);
router.get('/reports/outstanding-dues', reportController.getOutstandingDues);
router.get('/reports/pending-maintenance', reportController.getPendingMaintenance);
router.get('/reports/property-revenue', reportController.getPropertyRevenue);

// PL/SQL Viva & Demonstration Console
router.get('/plsql/objects', plsqlController.getObjects);
router.post('/plsql/calc-commission', plsqlController.testCommission);
router.post('/plsql/property-status', plsqlController.testPropertyStatus);
router.post('/plsql/calc-dues', plsqlController.testRentalDues);
router.post('/plsql/portfolio-report', plsqlController.runPortfolioReport);
router.post('/plsql/reconcile-dues', plsqlController.runReconcileDues);
router.get('/plsql/audit-log', plsqlController.getAuditLog);

module.exports = router;
