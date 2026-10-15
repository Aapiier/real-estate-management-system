-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 10_setup_instructions.sql
-- Description: Step-by-Step execution guide for students and faculty evaluators.
-- ============================================================================

/*
================================================================================
                    ORACLE DATABASE SETUP INSTRUCTIONS
================================================================================

PREREQUISITES:
  1. Oracle Database 19c / 21c (Enterprise, Standard, or Express Edition XE)
  2. SQL*Plus or Oracle SQL Developer installed locally.
  3. Pluggable database XEPDB1 running on default port 1521.

STEP 1: CREATE THE DEDICATED SCHEMA USER (AS SYSDBA)
---------------------------------------------------
Open Command Prompt or PowerShell and connect to SQL*Plus as SYSDBA:

    sqlplus / as sysdba

Then run:

    @c:\rofl\College Documents\Projects\real-estate-management-system\database\oracle\create_user.sql;

Alternatively, run the manual commands:
    ALTER SESSION SET CONTAINER = XEPDB1;
    CREATE USER REALESTATE_USER IDENTIFIED BY RealEstate2024# DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS;
    GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER, CREATE SEQUENCE, CREATE TABLE TO REALESTATE_USER;

STEP 2: RUN THE MASTER SETUP SCRIPT
-----------------------------------
Connect to the new schema:

    sqlplus REALESTATE_USER/RealEstate2024#@//localhost:1521/XEPDB1

Run the master batch script:

    @c:\rofl\College Documents\Projects\real-estate-management-system\database\oracle\run_all.sql;

This will automatically execute the files in exact dependency sequence:
    01_create_tables.sql
    02_constraints_and_indexes.sql
    03_sequences.sql
    04_functions.sql
    05_procedures.sql
    06_triggers.sql
    07_packages.sql
    08_sample_data.sql
    09_test_scripts.sql

STEP 3: RUN INDIVIDUAL SCRIPTS (OPTIONAL)
----------------------------------------
If you wish to test individual components separately:
  - To re-run test suite:
      @@09_test_scripts.sql
  - To test functions:
      SELECT calculate_agent_commission(5000000, 5) FROM dual;
      SELECT get_property_status(1) FROM dual;
      SELECT calculate_rental_dues(1) FROM dual;
  - To view triggers:
      SELECT trigger_name, status FROM user_triggers;
  - To view procedures and functions:
      SELECT object_name, object_type, status FROM user_objects WHERE object_type IN ('PROCEDURE','FUNCTION','PACKAGE');

STEP 4: BACKEND CONFIGURATION
-----------------------------
In the `server/` directory, configure your `.env` file:
    PORT=5000
    ORACLE_USER=REALESTATE_USER
    ORACLE_PASSWORD=RealEstate2024#
    ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

Then start the backend:
    cd server
    npm install
    npm start

STEP 5: FRONTEND STARTUP
------------------------
In the `client/` directory:
    cd client
    npm install
    npm run dev

Open browser at: http://localhost:5173
================================================================================
*/
SELECT 'Setup instructions loaded. Please refer to comments above or README.md.' AS status FROM dual;
