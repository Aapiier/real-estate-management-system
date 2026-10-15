-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 07_packages.sql
-- Description: Oracle PL/SQL Package Specification and Body (REALESTATE_PKG)
--              Encapsulates business operations, explicit cursors, loops,
--              exceptions, and DBMS_OUTPUT reporting.
-- ============================================================================

CREATE OR REPLACE PACKAGE realestate_pkg AS

    -- Custom Record Type for Financial Summary
    TYPE t_prop_summary IS RECORD (
        property_id   property.property_id%TYPE,
        address       property.address%TYPE,
        city          property.city%TYPE,
        price_ksh     property.price_ksh%TYPE,
        status        property.status%TYPE,
        total_revenue NUMBER(14,2)
    );

    -- Cursor Definition
    CURSOR c_active_leases IS
        SELECT l.lease_id,
               l.property_id,
               p.address,
               p.city,
               t.firstname || ' ' || t.lastname AS tenant_name,
               l.monthly_rent,
               l.lease_start,
               l.lease_end
          FROM lease l
          JOIN property p ON l.property_id = p.property_id
          JOIN tenant t ON l.tenant_id = t.tenant_id
         WHERE l.status = 'Active';

    -- Procedure Declarations
    PROCEDURE register_property_pkg(
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
    );

    PROCEDURE create_lease_pkg(
        p_property_id  IN NUMBER,
        p_tenant_id    IN NUMBER,
        p_lease_start  IN DATE,
        p_lease_end    IN DATE,
        p_monthly_rent IN NUMBER,
        o_lease_id     OUT NUMBER
    );

    PROCEDURE record_payment_pkg(
        p_lease_id       IN NUMBER,
        p_amount_paid    IN NUMBER,
        p_payment_method IN VARCHAR2,
        p_payment_date   IN DATE DEFAULT SYSDATE,
        o_payment_id     OUT NUMBER
    );

    PROCEDURE complete_property_sale_pkg(
        p_property_id    IN NUMBER,
        p_client_id      IN NUMBER,
        p_agent_id       IN NUMBER,
        p_sale_amount    IN NUMBER,
        p_sale_date      IN DATE DEFAULT SYSDATE,
        o_transaction_id OUT NUMBER
    );

    -- Advanced ADBMS Demonstration Procedures:
    -- 1. Explicit Cursor using OPEN, FETCH, CLOSE with WHILE Loop
    PROCEDURE generate_portfolio_report(p_city_filter IN VARCHAR2 DEFAULT NULL);

    -- 2. Cursor FOR Loop with IF/ELSIF/ELSE evaluating outstanding dues
    PROCEDURE reconcile_all_dues;

    -- Function Declarations
    FUNCTION calculate_commission(
        p_sale_amount     IN NUMBER,
        p_commission_rate IN NUMBER DEFAULT 5.0
    ) RETURN NUMBER;

    FUNCTION get_property_status(p_property_id IN NUMBER) RETURN VARCHAR2;

    FUNCTION calculate_rental_dues(p_lease_id IN NUMBER) RETURN NUMBER;

END realestate_pkg;
/

CREATE OR REPLACE PACKAGE BODY realestate_pkg AS

    PROCEDURE register_property_pkg(
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
    ) IS
    BEGIN
        register_property(
            p_property_type, p_address, p_county, p_city, p_price_ksh,
            p_owner_id, p_agent_id, p_zipcode, p_size_m2, p_status, o_property_id
        );
    END register_property_pkg;

    PROCEDURE create_lease_pkg(
        p_property_id  IN NUMBER,
        p_tenant_id    IN NUMBER,
        p_lease_start  IN DATE,
        p_lease_end    IN DATE,
        p_monthly_rent IN NUMBER,
        o_lease_id     OUT NUMBER
    ) IS
    BEGIN
        create_lease(
            p_property_id, p_tenant_id, p_lease_start, p_lease_end,
            p_monthly_rent, o_lease_id
        );
    END create_lease_pkg;

    PROCEDURE record_payment_pkg(
        p_lease_id       IN NUMBER,
        p_amount_paid    IN NUMBER,
        p_payment_method IN VARCHAR2,
        p_payment_date   IN DATE DEFAULT SYSDATE,
        o_payment_id     OUT NUMBER
    ) IS
    BEGIN
        record_payment(
            p_lease_id, p_amount_paid, p_payment_method, p_payment_date, o_payment_id
        );
    END record_payment_pkg;

    PROCEDURE complete_property_sale_pkg(
        p_property_id    IN NUMBER,
        p_client_id      IN NUMBER,
        p_agent_id       IN NUMBER,
        p_sale_amount    IN NUMBER,
        p_sale_date      IN DATE DEFAULT SYSDATE,
        o_transaction_id OUT NUMBER
    ) IS
    BEGIN
        complete_property_sale(
            p_property_id, p_client_id, p_agent_id, p_sale_amount, p_sale_date, o_transaction_id
        );
    END complete_property_sale_pkg;

    -- ------------------------------------------------------------------------
    -- Demonstration of EXPLICIT CURSOR (OPEN, FETCH, CLOSE, %NOTFOUND, %ROWCOUNT)
    -- ------------------------------------------------------------------------
    PROCEDURE generate_portfolio_report(p_city_filter IN VARCHAR2 DEFAULT NULL)
    IS
        CURSOR c_prop IS
            SELECT p.property_id,
                   p.address,
                   p.city,
                   p.price_ksh,
                   p.status,
                   NVL(SUM(pay.amount_paid), 0) AS total_revenue
              FROM property p
              LEFT JOIN lease l ON p.property_id = l.property_id
              LEFT JOIN payment pay ON l.lease_id = pay.lease_id
             WHERE (p_city_filter IS NULL OR UPPER(p.city) = UPPER(TRIM(p_city_filter)))
             GROUP BY p.property_id, p.address, p.city, p.price_ksh, p.status
             ORDER BY p.property_id;

        v_record t_prop_summary;
        v_total_portfolio NUMBER(14,2) := 0;
        v_total_revenue   NUMBER(14,2) := 0;
    BEGIN
        DBMS_OUTPUT.PUT_LINE('========================================================================');
        DBMS_OUTPUT.PUT_LINE('             REAL ESTATE PORTFOLIO AND REVENUE REPORT                 ');
        DBMS_OUTPUT.PUT_LINE('             City Filter: ' || NVL(p_city_filter, 'ALL CITIES'));
        DBMS_OUTPUT.PUT_LINE('========================================================================');
        DBMS_OUTPUT.PUT_LINE(RPAD('ID', 5) || RPAD('Address', 25) || RPAD('City', 12) || RPAD('Status', 14) || RPAD('Price (KES)', 16) || 'Revenue (KES)');
        DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------------------');

        -- 1. Explicitly OPEN the cursor
        OPEN c_prop;

        -- 2. FETCH in a loop
        LOOP
            FETCH c_prop INTO v_record;
            EXIT WHEN c_prop%NOTFOUND;

            v_total_portfolio := v_total_portfolio + v_record.price_ksh;
            v_total_revenue   := v_total_revenue + v_record.total_revenue;

            DBMS_OUTPUT.PUT_LINE(
                RPAD(TO_CHAR(v_record.property_id), 5) ||
                RPAD(SUBSTR(v_record.address, 1, 23), 25) ||
                RPAD(SUBSTR(v_record.city, 1, 10), 12) ||
                RPAD(v_record.status, 14) ||
                RPAD(TO_CHAR(v_record.price_ksh, '999,999,990.00'), 16) ||
                TO_CHAR(v_record.total_revenue, '999,999,990.00')
            );
        END LOOP;

        -- 3. Check %ROWCOUNT
        IF c_prop%ROWCOUNT = 0 THEN
            DBMS_OUTPUT.PUT_LINE('No property records matched the given criteria.');
        ELSE
            DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------------------');
            DBMS_OUTPUT.PUT_LINE('Total Properties Processed: ' || c_prop%ROWCOUNT);
            DBMS_OUTPUT.PUT_LINE('Total Portfolio Value:     ' || TO_CHAR(v_total_portfolio, '999,999,999,990.00') || ' KES');
            DBMS_OUTPUT.PUT_LINE('Total Lease Revenue:       ' || TO_CHAR(v_total_revenue, '999,999,999,990.00') || ' KES');
        END IF;

        -- 4. Explicitly CLOSE the cursor
        CLOSE c_prop;
        DBMS_OUTPUT.PUT_LINE('========================================================================');

    EXCEPTION
        WHEN OTHERS THEN
            IF c_prop%ISOPEN THEN
                CLOSE c_prop;
            END IF;
            RAISE_APPLICATION_ERROR(-20060, 'Error in generate_portfolio_report: ' || SQLERRM);
    END generate_portfolio_report;

    -- ------------------------------------------------------------------------
    -- Demonstration of CURSOR FOR LOOP with IF/ELSIF/ELSE
    -- ------------------------------------------------------------------------
    PROCEDURE reconcile_all_dues
    IS
        v_dues          NUMBER(14,2);
        v_warning_count NUMBER := 0;
    BEGIN
        DBMS_OUTPUT.PUT_LINE('========================================================================');
        DBMS_OUTPUT.PUT_LINE('                ACTIVE LEASE RENTAL DUES AUDIT                          ');
        DBMS_OUTPUT.PUT_LINE('========================================================================');

        FOR r IN c_active_leases LOOP
            v_dues := REALESTATE_USER.calculate_rental_dues(r.lease_id);

            IF v_dues > 100000 THEN
                v_warning_count := v_warning_count + 1;
                DBMS_OUTPUT.PUT_LINE('[CRITICAL ARREARS] Lease ID ' || r.lease_id || ' (' || r.tenant_name || ') has severe arrears of ' || TO_CHAR(v_dues, '999,999,990.00') || ' KES on ' || r.address);
            ELSIF v_dues > 0 THEN
                DBMS_OUTPUT.PUT_LINE('[PENDING DUES] Lease ID ' || r.lease_id || ' (' || r.tenant_name || ') has outstanding balance of ' || TO_CHAR(v_dues, '999,999,990.00') || ' KES');
            ELSE
                DBMS_OUTPUT.PUT_LINE('[UP TO DATE] Lease ID ' || r.lease_id || ' (' || r.tenant_name || ') payments are fully settled.');
            END IF;
        END LOOP;

        DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------------------');
        DBMS_OUTPUT.PUT_LINE('Total Critical Overdue Leases: ' || v_warning_count);
        DBMS_OUTPUT.PUT_LINE('========================================================================');
    END reconcile_all_dues;

    FUNCTION calculate_commission(
        p_sale_amount     IN NUMBER,
        p_commission_rate IN NUMBER DEFAULT 5.0
    ) RETURN NUMBER IS
    BEGIN
        RETURN calculate_agent_commission(p_sale_amount, p_commission_rate);
    END calculate_commission;

    FUNCTION get_property_status(p_property_id IN NUMBER) RETURN VARCHAR2 IS
    BEGIN
        RETURN REALESTATE_USER.get_property_status(p_property_id);
    END get_property_status;

    FUNCTION calculate_rental_dues(p_lease_id IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN REALESTATE_USER.calculate_rental_dues(p_lease_id);
    END calculate_rental_dues;

END realestate_pkg;
/

PROMPT Package REALESTATE_PKG compiled successfully.
