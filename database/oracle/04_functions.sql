-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 04_functions.sql
-- Description: Oracle PL/SQL Functions for business calculations and status inquiries.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function 1: CALCULATE_AGENT_COMMISSION
-- Purpose: Calculate agent commission from sale amount and percentage rate.
-- Parameters:
--   p_sale_amount: Total sale amount in KES (must be positive)
--   p_commission_rate: Percentage rate (default 5%, must be between 0 and 100)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_agent_commission(
    p_sale_amount     IN NUMBER,
    p_commission_rate IN NUMBER DEFAULT 5.0
) RETURN NUMBER
IS
    v_commission NUMBER(14,2);
BEGIN
    -- Input Validation
    IF p_sale_amount IS NULL OR p_sale_amount <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Invalid sale amount: Amount must be greater than zero.');
    END IF;

    IF p_commission_rate IS NULL OR p_commission_rate < 0 OR p_commission_rate > 100 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Invalid commission rate: Rate must be between 0 and 100 percent.');
    END IF;

    -- Calculate commission
    v_commission := ROUND(p_sale_amount * (p_commission_rate / 100), 2);
    RETURN v_commission;
EXCEPTION
    WHEN OTHERS THEN
        -- Re-raise application errors or wrap unknown exceptions
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20099, 'Error in calculate_agent_commission: ' || SQLERRM);
        END IF;
END calculate_agent_commission;
/

-- ----------------------------------------------------------------------------
-- Function 2: GET_PROPERTY_STATUS
-- Purpose: Retrieve current availability / sale status for a given property ID.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_property_status(
    p_property_id IN NUMBER
) RETURN VARCHAR2
IS
    v_status property.status%TYPE;
BEGIN
    IF p_property_id IS NULL OR p_property_id <= 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Invalid Property ID provided.');
    END IF;

    SELECT status
      INTO v_status
      FROM property
     WHERE property_id = p_property_id;

    RETURN v_status;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20004, 'Property ID ' || p_property_id || ' does not exist.');
    WHEN TOO_MANY_ROWS THEN
        RAISE_APPLICATION_ERROR(-20005, 'Data integrity error: Multiple records found for Property ID ' || p_property_id);
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20099, 'Error in get_property_status: ' || SQLERRM);
        END IF;
END get_property_status;
/

-- ----------------------------------------------------------------------------
-- Function 3: GET_LEASE_TOTAL_PAID
-- Purpose: Calculate total sum of payments made against a given lease.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_lease_total_paid(
    p_lease_id IN NUMBER
) RETURN NUMBER
IS
    v_total_paid NUMBER(14,2) := 0;
    v_lease_exists NUMBER;
BEGIN
    IF p_lease_id IS NULL OR p_lease_id <= 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 'Invalid Lease ID provided.');
    END IF;

    -- Verify lease exists
    SELECT COUNT(*)
      INTO v_lease_exists
      FROM lease
     WHERE lease_id = p_lease_id;

    IF v_lease_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20007, 'Lease ID ' || p_lease_id || ' does not exist.');
    END IF;

    SELECT NVL(SUM(amount_paid), 0)
      INTO v_total_paid
      FROM payment
     WHERE lease_id = p_lease_id;

    RETURN v_total_paid;
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20099, 'Error in get_lease_total_paid: ' || SQLERRM);
        END IF;
END get_lease_total_paid;
/

-- ----------------------------------------------------------------------------
-- Function 4: CALCULATE_RENTAL_DUES
-- Purpose: Calculate outstanding rental dues for a lease based on months
--          elapsed and payments recorded.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_rental_dues(
    p_lease_id IN NUMBER
) RETURN NUMBER
IS
    v_start_date   DATE;
    v_end_date     DATE;
    v_monthly_rent NUMBER(12,2);
    v_calc_date    DATE;
    v_months       NUMBER;
    v_total_due    NUMBER(14,2);
    v_total_paid   NUMBER(14,2);
    v_net_dues     NUMBER(14,2);
BEGIN
    IF p_lease_id IS NULL OR p_lease_id <= 0 THEN
        RAISE_APPLICATION_ERROR(-20008, 'Invalid Lease ID provided.');
    END IF;

    SELECT lease_start, lease_end, monthly_rent
      INTO v_start_date, v_end_date, v_monthly_rent
      FROM lease
     WHERE lease_id = p_lease_id;

    -- Determine effective calculation cutoff date (current date or lease end, whichever earlier)
    IF SYSDATE < v_start_date THEN
        -- Lease has not started yet; no dues
        RETURN 0;
    ELSIF SYSDATE > v_end_date THEN
        v_calc_date := v_end_date;
    ELSE
        v_calc_date := SYSDATE;
    END IF;

    -- Calculate full months elapsed (at least 1 if active in current month)
    v_months := GREATEST(1, CEIL(MONTHS_BETWEEN(v_calc_date, v_start_date)));
    v_total_due := v_months * v_monthly_rent;

    -- Fetch total payments made
    v_total_paid := get_lease_total_paid(p_lease_id);

    -- Dues cannot be negative (if tenant overpaid / advance deposit)
    v_net_dues := GREATEST(0, v_total_due - v_total_paid);

    RETURN v_net_dues;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20009, 'Lease ID ' || p_lease_id || ' does not exist.');
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20099, 'Error in calculate_rental_dues: ' || SQLERRM);
        END IF;
END calculate_rental_dues;
/

PROMPT Functions compiled successfully.
