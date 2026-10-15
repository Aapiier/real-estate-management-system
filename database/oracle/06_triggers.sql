-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 06_triggers.sql
-- Description: Oracle PL/SQL Triggers for data validation and security auditing.
--              Designed specifically to prevent mutating table (ORA-04091) errors.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger 1: TRG_PROPERTY_VALIDATE_FORMAT
-- Timing: BEFORE INSERT OR UPDATE ON property FOR EACH ROW
-- Purpose: Validates property attributes and standardizes City/County casing.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_property_validate_format
BEFORE INSERT OR UPDATE ON property
FOR EACH ROW
BEGIN
    -- Standardize string representations
    IF :NEW.city IS NOT NULL THEN
        :NEW.city := INITCAP(TRIM(:NEW.city));
    END IF;

    IF :NEW.county IS NOT NULL THEN
        :NEW.county := INITCAP(TRIM(:NEW.county));
    END IF;

    IF :NEW.property_type IS NOT NULL THEN
        :NEW.property_type := INITCAP(TRIM(:NEW.property_type));
    END IF;

    -- Validate positive values
    IF :NEW.price_ksh <= 0 THEN
        RAISE_APPLICATION_ERROR(-20050, 'Trigger Error: Property price must be strictly greater than zero.');
    END IF;

    IF :NEW.size_m2 IS NOT NULL AND :NEW.size_m2 <= 0 THEN
        RAISE_APPLICATION_ERROR(-20051, 'Trigger Error: Property size must be strictly greater than zero.');
    END IF;

    -- Ensure default status
    IF :NEW.status IS NULL THEN
        :NEW.status := 'Available';
    END IF;
END trg_property_validate_format;
/

-- ----------------------------------------------------------------------------
-- Trigger 2: TRG_LEASE_DATES_VALIDATE
-- Timing: BEFORE INSERT OR UPDATE ON lease FOR EACH ROW
-- Purpose: Enforce business timeline constraints at the database engine level.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_lease_dates_validate
BEFORE INSERT OR UPDATE ON lease
FOR EACH ROW
BEGIN
    IF :NEW.lease_end <= :NEW.lease_start THEN
        RAISE_APPLICATION_ERROR(-20052, 'Trigger Error: Lease end date (' || TO_CHAR(:NEW.lease_end, 'YYYY-MM-DD') || ') must be after start date (' || TO_CHAR(:NEW.lease_start, 'YYYY-MM-DD') || ').');
    END IF;

    IF :NEW.monthly_rent <= 0 THEN
        RAISE_APPLICATION_ERROR(-20053, 'Trigger Error: Lease monthly rent must be strictly positive.');
    END IF;
END trg_lease_dates_validate;
/

-- ----------------------------------------------------------------------------
-- Trigger 3: TRG_PAYMENT_AUDIT
-- Timing: AFTER INSERT OR UPDATE OR DELETE ON payment FOR EACH ROW
-- Purpose: Maintain immutable financial audit trail in security_audit.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_payment_audit
AFTER INSERT OR UPDATE OR DELETE ON payment
FOR EACH ROW
DECLARE
    v_action  VARCHAR2(255);
    v_details VARCHAR2(2000);
BEGIN
    IF INSERTING THEN
        v_action  := 'PAYMENT_INSERT';
        v_details := 'Payment ID ' || :NEW.payment_id || ' inserted: ' || :NEW.amount_paid || ' KES for Lease ID ' || :NEW.lease_id || ' via ' || :NEW.payment_method;
    ELSIF UPDATING THEN
        v_action  := 'PAYMENT_UPDATE';
        v_details := 'Payment ID ' || :NEW.payment_id || ' adjusted from ' || :OLD.amount_paid || ' to ' || :NEW.amount_paid || ' KES for Lease ID ' || :NEW.lease_id;
    ELSIF DELETING THEN
        v_action  := 'PAYMENT_DELETE';
        v_details := 'Payment ID ' || :OLD.payment_id || ' of ' || :OLD.amount_paid || ' KES for Lease ID ' || :OLD.lease_id || ' was deleted.';
    END IF;

    INSERT INTO security_audit (
        audit_timestamp,
        user_id,
        action,
        details
    ) VALUES (
        SYSTIMESTAMP,
        NULL,
        v_action,
        v_details
    );
END trg_payment_audit;
/

-- ----------------------------------------------------------------------------
-- Trigger 4: TRG_PROPERTY_STATUS_AUDIT
-- Timing: AFTER UPDATE OF status ON property FOR EACH ROW
-- Purpose: Track lifecycle transitions of properties (Available -> Rented -> Sold).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_property_status_audit
AFTER UPDATE OF status ON property
FOR EACH ROW
WHEN (OLD.status IS NULL OR OLD.status <> NEW.status)
BEGIN
    INSERT INTO security_audit (
        audit_timestamp,
        user_id,
        action,
        details
    ) VALUES (
        SYSTIMESTAMP,
        NULL,
        'PROPERTY_STATUS_CHANGE',
        'Property ID ' || :NEW.property_id || ' (' || :NEW.address || ') changed status from [' || NVL(:OLD.status, 'None') || '] to [' || :NEW.status || ']'
    );
END trg_property_status_audit;
/

PROMPT Triggers compiled successfully.
