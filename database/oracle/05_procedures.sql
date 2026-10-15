-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 05_procedures.sql
-- Description: Oracle PL/SQL Stored Procedures for Core Business Transactions.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Procedure 1: REGISTER_PROPERTY
-- Purpose: Safely validate and register a new property in the system.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE register_property(
    p_property_type IN VARCHAR2,
    p_address       IN VARCHAR2,
    p_county        IN VARCHAR2,
    p_city          IN VARCHAR2,
    p_price_ksh     IN NUMBER,
    p_owner_id      IN NUMBER,
    p_agent_id      IN NUMBER,
    p_zipcode       IN VARCHAR2,
    p_size_m2       IN NUMBER,
    p_status        IN VARCHAR2 DEFAULT 'Available',
    o_property_id   OUT NUMBER
)
IS
    v_owner_count NUMBER;
    v_agent_count NUMBER;
    v_clean_status VARCHAR2(30);
BEGIN
    SAVEPOINT sp_register_prop;

    -- 1. Mandatory Input Validations
    IF TRIM(p_property_type) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20010, 'Validation Error: Property Type is required.');
    END IF;

    IF TRIM(p_address) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20011, 'Validation Error: Address is required.');
    END IF;

    IF TRIM(p_city) IS NULL OR TRIM(p_county) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20012, 'Validation Error: City and County are required.');
    END IF;

    IF p_price_ksh IS NULL OR p_price_ksh <= 0 THEN
        RAISE_APPLICATION_ERROR(-20013, 'Validation Error: Price must be a positive number.');
    END IF;

    IF p_size_m2 IS NOT NULL AND p_size_m2 <= 0 THEN
        RAISE_APPLICATION_ERROR(-20014, 'Validation Error: Size (m2) must be greater than zero.');
    END IF;

    -- 2. Validate Owner existence if provided
    IF p_owner_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_owner_count FROM owner WHERE owner_id = p_owner_id;
        IF v_owner_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20015, 'Foreign Key Error: Owner ID ' || p_owner_id || ' does not exist.');
        END IF;
    END IF;

    -- 3. Validate Agent existence if provided
    IF p_agent_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_agent_count FROM agent WHERE agent_id = p_agent_id;
        IF v_agent_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20016, 'Foreign Key Error: Agent ID ' || p_agent_id || ' does not exist.');
        END IF;
    END IF;

    v_clean_status := NVL(p_status, 'Available');
    IF v_clean_status NOT IN ('Available', 'Rented', 'Sold', 'Under Maintenance') THEN
        RAISE_APPLICATION_ERROR(-20017, 'Validation Error: Invalid status "' || v_clean_status || '". Must be Available, Rented, Sold, or Under Maintenance.');
    END IF;

    -- 4. Insert Property record
    INSERT INTO property (
        property_type,
        address,
        county,
        city,
        price_ksh,
        owner_id,
        agent_id,
        zipcode,
        size_m2,
        status
    ) VALUES (
        TRIM(p_property_type),
        TRIM(p_address),
        TRIM(p_county),
        TRIM(p_city),
        p_price_ksh,
        p_owner_id,
        p_agent_id,
        TRIM(p_zipcode),
        p_size_m2,
        v_clean_status
    )
    RETURNING property_id INTO o_property_id;

    -- 5. Audit Logging
    INSERT INTO security_audit (
        audit_timestamp,
        user_id,
        action,
        details
    ) VALUES (
        SYSTIMESTAMP,
        NULL,
        'REGISTER_PROPERTY',
        'Registered Property ID ' || o_property_id || ' at ' || TRIM(p_address) || ', ' || TRIM(p_city) || ' (Price: ' || p_price_ksh || ' KES)'
    );

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_register_prop;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20019, 'System Error in register_property: ' || SQLERRM);
        END IF;
END register_property;
/

-- ----------------------------------------------------------------------------
-- Procedure 2: CREATE_LEASE
-- Purpose: Validate property availability and dates, then create lease contract.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE create_lease(
    p_property_id  IN NUMBER,
    p_tenant_id    IN NUMBER,
    p_lease_start  IN DATE,
    p_lease_end    IN DATE,
    p_monthly_rent IN NUMBER,
    o_lease_id     OUT NUMBER
)
IS
    v_prop_status      property.status%TYPE;
    v_tenant_count     NUMBER;
    v_overlapping_count NUMBER;
BEGIN
    SAVEPOINT sp_create_lease;

    -- 1. Validate mandatory inputs
    IF p_property_id IS NULL OR p_tenant_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20020, 'Validation Error: Property ID and Tenant ID are required.');
    END IF;

    IF p_lease_start IS NULL OR p_lease_end IS NULL THEN
        RAISE_APPLICATION_ERROR(-20021, 'Validation Error: Lease start and end dates are required.');
    END IF;

    IF p_lease_end <= p_lease_start THEN
        RAISE_APPLICATION_ERROR(-20022, 'Validation Error: Lease end date must be strictly after lease start date.');
    END IF;

    IF p_monthly_rent IS NULL OR p_monthly_rent <= 0 THEN
        RAISE_APPLICATION_ERROR(-20023, 'Validation Error: Monthly rent must be greater than zero.');
    END IF;

    -- 2. Verify property exists and check availability
    BEGIN
        SELECT status
          INTO v_prop_status
          FROM property
         WHERE property_id = p_property_id
           FOR UPDATE; -- Row lock to prevent race condition
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20024, 'Property Error: Property ID ' || p_property_id || ' does not exist.');
    END;

    IF v_prop_status = 'Sold' THEN
        RAISE_APPLICATION_ERROR(-20025, 'Lease Error: Property ID ' || p_property_id || ' is already SOLD and cannot be leased.');
    END IF;

    IF v_prop_status = 'Under Maintenance' THEN
        RAISE_APPLICATION_ERROR(-20026, 'Lease Error: Property ID ' || p_property_id || ' is currently under maintenance.');
    END IF;

    -- 3. Check for overlapping active leases on this property
    SELECT COUNT(*)
      INTO v_overlapping_count
      FROM lease
     WHERE property_id = p_property_id
       AND status = 'Active'
       AND (
           (p_lease_start BETWEEN lease_start AND lease_end)
           OR (p_lease_end BETWEEN lease_start AND lease_end)
           OR (lease_start BETWEEN p_lease_start AND p_lease_end)
       );

    IF v_overlapping_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20027, 'Lease Conflict: Property ID ' || p_property_id || ' already has an active overlapping lease.');
    END IF;

    -- 4. Verify tenant exists
    SELECT COUNT(*)
      INTO v_tenant_count
      FROM tenant
     WHERE tenant_id = p_tenant_id;

    IF v_tenant_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20028, 'Tenant Error: Tenant ID ' || p_tenant_id || ' does not exist.');
    END IF;

    -- 5. Insert new lease
    INSERT INTO lease (
        lease_start,
        lease_end,
        monthly_rent,
        property_id,
        tenant_id,
        status
    ) VALUES (
        p_lease_start,
        p_lease_end,
        p_monthly_rent,
        p_property_id,
        p_tenant_id,
        'Active'
    )
    RETURNING lease_id INTO o_lease_id;

    -- 6. Update property status to Rented
    UPDATE property
       SET status = 'Rented'
     WHERE property_id = p_property_id;

    -- 7. Update tenant record with active lease information
    UPDATE tenant
       SET property_id = p_property_id,
           lease_start = p_lease_start,
           lease_end   = p_lease_end
     WHERE tenant_id = p_tenant_id;

    -- 8. Audit Logging
    INSERT INTO security_audit (
        audit_timestamp,
        user_id,
        action,
        details
    ) VALUES (
        SYSTIMESTAMP,
        NULL,
        'CREATE_LEASE',
        'Created Lease ID ' || o_lease_id || ' for Property ' || p_property_id || ' and Tenant ' || p_tenant_id || ' (Rent: ' || p_monthly_rent || ' KES/mo)'
    );

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_create_lease;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20029, 'System Error in create_lease: ' || SQLERRM);
        END IF;
END create_lease;
/

-- ----------------------------------------------------------------------------
-- Procedure 3: RECORD_PAYMENT
-- Purpose: Safely record rent payment against a valid active lease.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE record_payment(
    p_lease_id       IN NUMBER,
    p_amount_paid    IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_payment_date   IN DATE DEFAULT SYSDATE,
    o_payment_id     OUT NUMBER
)
IS
    v_lease_status   lease.status%TYPE;
    v_property_id    lease.property_id%TYPE;
    v_eff_date       DATE;
    v_dup_check      NUMBER;
BEGIN
    SAVEPOINT sp_record_payment;

    -- 1. Input validations
    IF p_lease_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20030, 'Validation Error: Lease ID is required.');
    END IF;

    IF p_amount_paid IS NULL OR p_amount_paid <= 0 THEN
        RAISE_APPLICATION_ERROR(-20031, 'Validation Error: Payment amount must be strictly greater than zero.');
    END IF;

    IF TRIM(p_payment_method) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20032, 'Validation Error: Payment method is required.');
    END IF;

    v_eff_date := NVL(p_payment_date, SYSDATE);

    -- 2. Verify lease exists and is active
    BEGIN
        SELECT status, property_id
          INTO v_lease_status, v_property_id
          FROM lease
         WHERE lease_id = p_lease_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20033, 'Payment Error: Lease ID ' || p_lease_id || ' does not exist.');
    END;

    IF v_lease_status = 'Terminated' THEN
        RAISE_APPLICATION_ERROR(-20034, 'Payment Error: Cannot record payment for a TERMINATED lease.');
    END IF;

    -- 3. Duplicate check guard (same lease, amount, method on the same date)
    SELECT COUNT(*)
      INTO v_dup_check
      FROM payment
     WHERE lease_id = p_lease_id
       AND amount_paid = p_amount_paid
       AND payment_method = TRIM(p_payment_method)
       AND TRUNC(payment_date) = TRUNC(v_eff_date);

    IF v_dup_check > 0 THEN
        RAISE_APPLICATION_ERROR(-20035, 'Duplicate Payment: An identical payment for ' || p_amount_paid || ' KES was already recorded today.');
    END IF;

    -- 4. Record payment
    INSERT INTO payment (
        payment_date,
        amount_paid,
        payment_method,
        lease_id
    ) VALUES (
        v_eff_date,
        p_amount_paid,
        TRIM(p_payment_method),
        p_lease_id
    )
    RETURNING payment_id INTO o_payment_id;

    -- 5. Audit Logging
    INSERT INTO security_audit (
        audit_timestamp,
        user_id,
        action,
        details
    ) VALUES (
        SYSTIMESTAMP,
        NULL,
        'RECORD_PAYMENT',
        'Payment ID ' || o_payment_id || ' of ' || p_amount_paid || ' KES recorded for Lease ' || p_lease_id || ' via ' || TRIM(p_payment_method)
    );

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_record_payment;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20039, 'System Error in record_payment: ' || SQLERRM);
        END IF;
END record_payment;
/

-- ----------------------------------------------------------------------------
-- Procedure 4: COMPLETE_PROPERTY_SALE
-- Purpose: Execute sale transaction, prevent duplicate sales, update property status,
--          and calculate agent commission.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE complete_property_sale(
    p_property_id    IN NUMBER,
    p_client_id      IN NUMBER,
    p_agent_id       IN NUMBER,
    p_sale_amount    IN NUMBER,
    p_sale_date      IN DATE DEFAULT SYSDATE,
    o_transaction_id OUT NUMBER
)
IS
    v_prop_status  property.status%TYPE;
    v_client_count NUMBER;
    v_agent_count  NUMBER;
    v_eff_date     DATE;
    v_commission   NUMBER(14,2);
BEGIN
    SAVEPOINT sp_prop_sale;

    -- 1. Validate mandatory inputs
    IF p_property_id IS NULL OR p_client_id IS NULL OR p_agent_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20040, 'Validation Error: Property ID, Client ID, and Agent ID are all required.');
    END IF;

    IF p_sale_amount IS NULL OR p_sale_amount <= 0 THEN
        RAISE_APPLICATION_ERROR(-20041, 'Validation Error: Sale amount must be greater than zero.');
    END IF;

    v_eff_date := NVL(p_sale_date, SYSDATE);

    -- 2. Check property status and lock row
    BEGIN
        SELECT status
          INTO v_prop_status
          FROM property
         WHERE property_id = p_property_id
           FOR UPDATE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20042, 'Sale Error: Property ID ' || p_property_id || ' does not exist.');
    END;

    -- Critical business rule: Prevent double selling
    IF v_prop_status = 'Sold' THEN
        RAISE_APPLICATION_ERROR(-20043, 'Duplicate Sale Error: Property ID ' || p_property_id || ' has ALREADY been sold!');
    END IF;

    -- 3. Verify client exists
    SELECT COUNT(*) INTO v_client_count FROM clients WHERE client_id = p_client_id;
    IF v_client_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20044, 'Sale Error: Client ID ' || p_client_id || ' does not exist.');
    END IF;

    -- 4. Verify agent exists
    SELECT COUNT(*) INTO v_agent_count FROM agent WHERE agent_id = p_agent_id;
    IF v_agent_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20045, 'Sale Error: Agent ID ' || p_agent_id || ' does not exist.');
    END IF;

    -- 5. Calculate agent commission
    v_commission := calculate_agent_commission(p_sale_amount, 5.0);

    -- 6. Insert transaction
    INSERT INTO transactions (
        property_id,
        client_id,
        agent_id,
        transaction_date,
        amount,
        status
    ) VALUES (
        p_property_id,
        p_client_id,
        p_agent_id,
        v_eff_date,
        p_sale_amount,
        'Completed'
    )
    RETURNING transaction_id INTO o_transaction_id;

    -- 7. Update property status to 'Sold'
    UPDATE property
       SET status = 'Sold',
           agent_id = p_agent_id
     WHERE property_id = p_property_id;

    -- 8. Terminate any active leases on this property
    UPDATE lease
       SET status = 'Terminated'
     WHERE property_id = p_property_id
       AND status = 'Active';

    -- 9. Audit Logging
    INSERT INTO security_audit (
        audit_timestamp,
        user_id,
        action,
        details
    ) VALUES (
        SYSTIMESTAMP,
        NULL,
        'COMPLETE_PROPERTY_SALE',
        'Sold Property ID ' || p_property_id || ' to Client ' || p_client_id || ' via Agent ' || p_agent_id || ' for ' || p_sale_amount || ' KES. Commission: ' || v_commission || ' KES.'
    );

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO sp_prop_sale;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20049, 'System Error in complete_property_sale: ' || SQLERRM);
        END IF;
END complete_property_sale;
/

PROMPT Stored procedures compiled successfully.
