-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 02_constraints_and_indexes.sql
-- Description: Foreign Keys, Check Constraints, and Performance Indexes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FOREIGN KEY CONSTRAINTS
-- ----------------------------------------------------------------------------

-- OWNER -> AGENT
ALTER TABLE owner
    ADD CONSTRAINT fk_owner_agent FOREIGN KEY (agent_id)
    REFERENCES agent(agent_id) ON DELETE SET NULL;

-- PROPERTY -> OWNER & AGENT
ALTER TABLE property
    ADD CONSTRAINT fk_property_owner FOREIGN KEY (owner_id)
    REFERENCES owner(owner_id) ON DELETE SET NULL;

ALTER TABLE property
    ADD CONSTRAINT fk_property_agent FOREIGN KEY (agent_id)
    REFERENCES agent(agent_id) ON DELETE SET NULL;

-- TENANT -> PROPERTY & AGENT
ALTER TABLE tenant
    ADD CONSTRAINT fk_tenant_property FOREIGN KEY (property_id)
    REFERENCES property(property_id) ON DELETE SET NULL;

ALTER TABLE tenant
    ADD CONSTRAINT fk_tenant_agent FOREIGN KEY (agent_id)
    REFERENCES agent(agent_id) ON DELETE SET NULL;

-- LEASE -> PROPERTY & TENANT
ALTER TABLE lease
    ADD CONSTRAINT fk_lease_property FOREIGN KEY (property_id)
    REFERENCES property(property_id) ON DELETE CASCADE;

ALTER TABLE lease
    ADD CONSTRAINT fk_lease_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenant(tenant_id) ON DELETE CASCADE;

-- PAYMENT -> LEASE
ALTER TABLE payment
    ADD CONSTRAINT fk_payment_lease FOREIGN KEY (lease_id)
    REFERENCES lease(lease_id) ON DELETE CASCADE;

-- MAINTENANCE_REQUEST -> PROPERTY & TENANT
ALTER TABLE maintenance_request
    ADD CONSTRAINT fk_maint_property FOREIGN KEY (property_id)
    REFERENCES property(property_id) ON DELETE CASCADE;

ALTER TABLE maintenance_request
    ADD CONSTRAINT fk_maint_tenant FOREIGN KEY (tenant_id)
    REFERENCES tenant(tenant_id) ON DELETE SET NULL;

-- TRANSACTIONS -> PROPERTY, CLIENTS, AGENT
ALTER TABLE transactions
    ADD CONSTRAINT fk_trans_property FOREIGN KEY (property_id)
    REFERENCES property(property_id) ON DELETE CASCADE;

ALTER TABLE transactions
    ADD CONSTRAINT fk_trans_client FOREIGN KEY (client_id)
    REFERENCES clients(client_id) ON DELETE CASCADE;

ALTER TABLE transactions
    ADD CONSTRAINT fk_trans_agent FOREIGN KEY (agent_id)
    REFERENCES agent(agent_id) ON DELETE CASCADE;

-- CLIENT_INTERACTIONS -> CLIENTS
ALTER TABLE client_interactions
    ADD CONSTRAINT fk_ci_client FOREIGN KEY (client_id)
    REFERENCES clients(client_id) ON DELETE CASCADE;

-- AUTOMATED_COMMUNICATIONS -> CLIENTS
ALTER TABLE automated_communications
    ADD CONSTRAINT fk_ac_client FOREIGN KEY (client_id)
    REFERENCES clients(client_id) ON DELETE CASCADE;

-- SECURITY_AUDIT -> USERS
ALTER TABLE security_audit
    ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE SET NULL;


-- ----------------------------------------------------------------------------
-- 2. CHECK CONSTRAINTS
-- ----------------------------------------------------------------------------

ALTER TABLE property
    ADD CONSTRAINT chk_prop_price CHECK (price_ksh > 0);

ALTER TABLE property
    ADD CONSTRAINT chk_prop_size CHECK (size_m2 IS NULL OR size_m2 > 0);

ALTER TABLE property
    ADD CONSTRAINT chk_prop_status CHECK (status IN ('Available', 'Rented', 'Sold', 'Under Maintenance'));

ALTER TABLE lease
    ADD CONSTRAINT chk_lease_rent CHECK (monthly_rent > 0);

ALTER TABLE lease
    ADD CONSTRAINT chk_lease_dates CHECK (lease_end >= lease_start);

ALTER TABLE lease
    ADD CONSTRAINT chk_lease_status CHECK (status IN ('Active', 'Terminated', 'Expired'));

ALTER TABLE payment
    ADD CONSTRAINT chk_pay_amount CHECK (amount_paid > 0);

ALTER TABLE maintenance_request
    ADD CONSTRAINT chk_maint_status CHECK (status IN ('Open', 'In Progress', 'Closed'));

ALTER TABLE transactions
    ADD CONSTRAINT chk_trans_amount CHECK (amount > 0);

ALTER TABLE transactions
    ADD CONSTRAINT chk_trans_status CHECK (status IN ('Completed', 'Pending', 'Cancelled'));


-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR QUERY OPTIMIZATION
-- ----------------------------------------------------------------------------

CREATE INDEX idx_prop_city ON property(city);
CREATE INDEX idx_prop_county ON property(county);
CREATE INDEX idx_prop_status ON property(status);
CREATE INDEX idx_prop_type ON property(property_type);
CREATE INDEX idx_prop_owner ON property(owner_id);
CREATE INDEX idx_prop_agent ON property(agent_id);

CREATE INDEX idx_lease_prop ON lease(property_id);
CREATE INDEX idx_lease_tenant ON lease(tenant_id);
CREATE INDEX idx_lease_status ON lease(status);

CREATE INDEX idx_pay_lease ON payment(lease_id);
CREATE INDEX idx_pay_date ON payment(payment_date);

CREATE INDEX idx_maint_prop ON maintenance_request(property_id);
CREATE INDEX idx_maint_status ON maintenance_request(status);

CREATE INDEX idx_trans_prop ON transactions(property_id);
CREATE INDEX idx_trans_client ON transactions(client_id);
CREATE INDEX idx_trans_date ON transactions(transaction_date);

CREATE INDEX idx_audit_time ON security_audit(audit_timestamp);

PROMPT Constraints and indexes added successfully.
