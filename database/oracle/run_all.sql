-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: run_all.sql
-- Description: Master execution script to setup complete Oracle schema,
--              constraints, sequences, functions, procedures, triggers,
--              packages, and sample data in correct dependency order.
-- ============================================================================

SET ECHO OFF;
SET DEFINE OFF;
SET FEEDBACK ON;
SET SERVEROUTPUT ON SIZE 1000000;

PROMPT ========================================================================
PROMPT REAL ESTATE MANAGEMENT SYSTEM - ORACLE PL/SQL SETUP
PROMPT Current Database Container:
SELECT sys_context('USERENV', 'CON_NAME') AS container, sys_context('USERENV', 'SESSION_USER') AS current_user FROM dual;
PROMPT ========================================================================

PROMPT [1/8] Executing 01_create_tables.sql...
@@01_create_tables.sql

PROMPT [2/8] Executing 02_constraints_and_indexes.sql...
@@02_constraints_and_indexes.sql

PROMPT [3/8] Executing 03_sequences.sql...
@@03_sequences.sql

PROMPT [4/8] Executing 04_functions.sql...
@@04_functions.sql

PROMPT [5/8] Executing 05_procedures.sql...
@@05_procedures.sql

PROMPT [6/8] Executing 06_triggers.sql...
@@06_triggers.sql

PROMPT [7/8] Executing 07_packages.sql...
@@07_packages.sql

PROMPT [8/8] Executing 08_sample_data.sql...
@@08_sample_data.sql

PROMPT ========================================================================
PROMPT RECOMPILING ANY DEPENDENT SCHEMA OBJECTS...
PROMPT ========================================================================
EXEC DBMS_UTILITY.COMPILE_SCHEMA(USER, FALSE);

PROMPT ========================================================================
PROMPT VERIFYING COMPILED DATABASE OBJECTS:
PROMPT ========================================================================
COLUMN object_name FORMAT A30;
COLUMN object_type FORMAT A20;
COLUMN status FORMAT A10;

SELECT object_name, object_type, status
  FROM user_objects
 WHERE object_type IN ('PROCEDURE', 'FUNCTION', 'PACKAGE', 'PACKAGE BODY', 'TRIGGER')
 ORDER BY object_type, object_name;

PROMPT ========================================================================
PROMPT RUNNING AUTOMATED PL/SQL TEST SUITE:
PROMPT ========================================================================
@@09_test_scripts.sql

PROMPT ========================================================================
PROMPT ORACLE PL/SQL DATABASE SETUP AND VERIFICATION COMPLETE!
PROMPT ========================================================================
EXIT;


