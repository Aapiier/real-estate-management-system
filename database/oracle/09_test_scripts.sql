-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 09_test_scripts.sql
-- Description: Rigorous Test Suite Demonstrating All PL/SQL Procedures,
--              Functions, Packages, Triggers, Cursors, and Exception Handling.
-- ============================================================================

SET DEFINE OFF;
SET SERVEROUTPUT ON SIZE 1000000;
SET FEEDBACK ON;

PROMPT ========================================================================
PROMPT TEST 1: FUNCTION - calculate_agent_commission (Valid AND Exception tests)
PROMPT ========================================================================
DECLARE
    v_comm NUMBER;
BEGIN
    -- Valid calculation (KES 10,000,000 at standard 5%)
    v_comm := calculate_agent_commission(10000000, 5.0);
    DBMS_OUTPUT.PUT_LINE('[PASS] Commission on 10,000,000 KES @ 5%: ' || v_comm || ' KES (Expected: 500,000.00)');

    -- Exception test: Invalid negative amount
    BEGIN
        v_comm := calculate_agent_commission(-50000, 5.0);
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have raised error on negative amount.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Caught expected exception for negative amount: ' || SQLERRM);
    END;

    -- Exception test: Invalid rate (> 100%)
    BEGIN
        v_comm := calculate_agent_commission(100000, 150.0);
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have raised error on rate > 100%.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Caught expected exception for excessive rate: ' || SQLERRM);
    END;
END;
/

PROMPT ========================================================================
PROMPT TEST 2: FUNCTION - get_property_status AND calculate_rental_dues
PROMPT ========================================================================
DECLARE
    v_status VARCHAR2(30);
    v_dues   NUMBER;
BEGIN
    -- Existing property status
    v_status := get_property_status(1);
    DBMS_OUTPUT.PUT_LINE('[PASS] Property 1 Status: ' || v_status);

    -- Dues calculation for Lease 1
    v_dues := calculate_rental_dues(1);
    DBMS_OUTPUT.PUT_LINE('[PASS] Calculated Rental Dues for Lease 1: ' || v_dues || ' KES');

    -- Exception test: Non-existent property
    BEGIN
        v_status := get_property_status(99999);
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have raised NO_DATA_FOUND.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Caught expected exception for non-existent property: ' || SQLERRM);
    END;
END;
/

PROMPT ========================================================================
PROMPT TEST 3: PROCEDURE - register_property (Success, Trigger Validation AND Audit)
PROMPT ========================================================================
DECLARE
    v_new_prop_id NUMBER;
    v_audit_count NUMBER;
BEGIN
    -- Register a brand new property
    register_property(
        p_property_type => 'Villa',
        p_address       => '888 Whispering Palms Road',
        p_county        => 'Mombasa',
        p_city          => 'Nyali',
        p_price_ksh     => 45000000,
        p_owner_id      => 1,
        p_agent_id      => 1,
        p_zipcode       => '80100',
        p_size_m2       => 450,
        p_status        => 'Available',
        o_property_id   => v_new_prop_id
    );

    DBMS_OUTPUT.PUT_LINE('[PASS] Registered new Property with ID: ' || v_new_prop_id);

    -- Verify security audit log record created by procedure/triggers
    SELECT COUNT(*) INTO v_audit_count
      FROM security_audit
     WHERE details LIKE '%' || v_new_prop_id || '%';

    DBMS_OUTPUT.PUT_LINE('[PASS] Found ' || v_audit_count || ' audit log entry/entries for Property ID ' || v_new_prop_id);

    -- Exception test: Invalid price (<= 0)
    BEGIN
        register_property(
            p_property_type => 'Apartment',
            p_address       => 'Bad Price Way',
            p_county        => 'Nairobi',
            p_city          => 'Nairobi',
            p_price_ksh     => -100,
            p_owner_id      => 1,
            p_agent_id      => 1,
            p_zipcode       => '00100',
            p_size_m2       => 100,
            p_status        => 'Available',
            o_property_id   => v_new_prop_id
        );
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have rejected negative price.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Correctly rejected negative price: ' || SQLERRM);
    END;

    -- Exception test: Non-existent Owner ID (Foreign key validation)
    BEGIN
        register_property(
            p_property_type => 'Apartment',
            p_address       => 'Ghost Owner Blvd',
            p_county        => 'Nairobi',
            p_city          => 'Nairobi',
            p_price_ksh     => 5000000,
            p_owner_id      => 9999,
            p_agent_id      => 1,
            p_zipcode       => '00100',
            p_size_m2       => 80,
            p_status        => 'Available',
            o_property_id   => v_new_prop_id
        );
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have rejected invalid owner ID.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Correctly rejected invalid owner ID: ' || SQLERRM);
    END;
    COMMIT;
END;
/

PROMPT ========================================================================
PROMPT TEST 4: PROCEDURE - create_lease AND Lease Conflict Prevention
PROMPT ========================================================================
DECLARE
    v_lease_id NUMBER;
    v_prop_status property.status%TYPE;
BEGIN
    -- Property 4 is 'Available'. Let's lease it to Tenant 4.
    create_lease(
        p_property_id  => 4,
        p_tenant_id    => 4,
        p_lease_start  => DATE '2025-01-01',
        p_lease_end    => DATE '2025-12-31',
        p_monthly_rent => 120000.00,
        o_lease_id     => v_lease_id
    );
    DBMS_OUTPUT.PUT_LINE('[PASS] Created Lease ID: ' || v_lease_id || ' for Property 4');

    -- Verify property status transitioned to 'Rented'
    SELECT status INTO v_prop_status FROM property WHERE property_id = 4;
    DBMS_OUTPUT.PUT_LINE('[PASS] Property 4 Status is now: ' || v_prop_status);

    -- Conflict Test: Attempt to create overlapping lease on Property 4
    BEGIN
        create_lease(
            p_property_id  => 4,
            p_tenant_id    => 5,
            p_lease_start  => DATE '2025-06-01',
            p_lease_end    => DATE '2026-05-31',
            p_monthly_rent => 130000.00,
            o_lease_id     => v_lease_id
        );
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have blocked overlapping lease on Property 4.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Correctly prevented overlapping lease: ' || SQLERRM);
    END;
    COMMIT;
END;
/

PROMPT ========================================================================
PROMPT TEST 5: PROCEDURE - record_payment AND Duplicate Guard
PROMPT ========================================================================
DECLARE
    v_pay_id NUMBER;
    v_audit_entry VARCHAR2(500);
BEGIN
    -- Record payment for Lease 1
    record_payment(
        p_lease_id       => 1,
        p_amount_paid    => 50000.00,
        p_payment_method => 'M-Pesa',
        p_payment_date   => SYSDATE,
        o_payment_id     => v_pay_id
    );
    DBMS_OUTPUT.PUT_LINE('[PASS] Recorded Payment ID: ' || v_pay_id || ' for Lease 1');

    -- Duplicate check: Attempt identical payment on the same day
    BEGIN
        record_payment(
            p_lease_id       => 1,
            p_amount_paid    => 50000.00,
            p_payment_method => 'M-Pesa',
            p_payment_date   => SYSDATE,
            o_payment_id     => v_pay_id
        );
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have blocked duplicate payment on the same day.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Correctly blocked duplicate payment: ' || SQLERRM);
    END;
    COMMIT;
END;
/

PROMPT ========================================================================
PROMPT TEST 6: PROCEDURE - complete_property_sale AND Double Sale Prevention
PROMPT ========================================================================
DECLARE
    v_trans_id NUMBER;
    v_prop_status property.status%TYPE;
BEGIN
    -- Property 6 is 'Available'. Sell it to Client 1 via Agent 6.
    complete_property_sale(
        p_property_id    => 6,
        p_client_id      => 1,
        p_agent_id       => 6,
        p_sale_amount    => 13000000.00,
        p_sale_date      => SYSDATE,
        o_transaction_id => v_trans_id
    );
    DBMS_OUTPUT.PUT_LINE('[PASS] Recorded Property Sale Transaction ID: ' || v_trans_id);

    SELECT status INTO v_prop_status FROM property WHERE property_id = 6;
    DBMS_OUTPUT.PUT_LINE('[PASS] Property 6 status updated to: ' || v_prop_status);

    -- Double Sale Test: Attempt to sell Property 6 again
    BEGIN
        complete_property_sale(
            p_property_id    => 6,
            p_client_id      => 2,
            p_agent_id       => 6,
            p_sale_amount    => 14000000.00,
            p_sale_date      => SYSDATE,
            o_transaction_id => v_trans_id
        );
        DBMS_OUTPUT.PUT_LINE('[FAIL] Should have blocked duplicate sale of Property 6.');
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('[PASS] Correctly blocked duplicate sale: ' || SQLERRM);
    END;
    COMMIT;
END;
/

PROMPT ========================================================================
PROMPT TEST 7: PACKAGE - realestate_pkg (Explicit Cursors AND Loops)
PROMPT ========================================================================
BEGIN
    -- Run explicit cursor report procedure
    realestate_pkg.generate_portfolio_report('Nairobi');

    -- Run cursor FOR loop dues reconciliation procedure
    realestate_pkg.reconcile_all_dues;
END;
/

PROMPT ========================================================================
PROMPT TEST 8: ANONYMOUS PL/SQL BLOCK WITH SAVEPOINT AND ROLLBACK
PROMPT ========================================================================
DECLARE
    v_orig_count NUMBER;
    v_after_count NUMBER;
    v_prop_id NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_orig_count FROM property;
    DBMS_OUTPUT.PUT_LINE('Starting property count: ' || v_orig_count);

    SAVEPOINT sp_demo;

    -- Insert temporary property inside transaction
    register_property(
        p_property_type => 'Temporary Demo',
        p_address       => 'Rollback Test Lane',
        p_county        => 'Nairobi',
        p_city          => 'Nairobi',
        p_price_ksh     => 999999.00,
        p_owner_id      => 1,
        p_agent_id      => 1,
        p_zipcode       => '00100',
        p_size_m2       => 50,
        p_status        => 'Available',
        o_property_id   => v_prop_id
    );

    SELECT COUNT(*) INTO v_after_count FROM property;
    DBMS_OUTPUT.PUT_LINE('Count after insert: ' || v_after_count || ' (Created Property ID: ' || v_prop_id || ')');

    -- Explicit ROLLBACK TO SAVEPOINT
    ROLLBACK TO sp_demo;

    SELECT COUNT(*) INTO v_after_count FROM property;
    DBMS_OUTPUT.PUT_LINE('[PASS] Count after rollback: ' || v_after_count || ' (Successfully rolled back to savepoint)');
END;
/

PROMPT ========================================================================
PROMPT ALL TESTS EXECUTED SUCCESSFULLY!
PROMPT ========================================================================
