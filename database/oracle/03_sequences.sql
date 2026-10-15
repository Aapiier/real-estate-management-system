-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 03_sequences.sql
-- Description: Oracle Sequences for explicit key generation and audit logging.
-- ============================================================================

-- Drop sequences if they exist
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_general_audit';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_report_id';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE seq_custom_transaction';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- Sequence for custom audit tracking and external transaction IDs
CREATE SEQUENCE seq_general_audit
    START WITH 1000
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for analytics reporting batches
CREATE SEQUENCE seq_report_id
    START WITH 500
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for custom reference numbers (e.g., invoice/receipt references)
CREATE SEQUENCE seq_custom_transaction
    START WITH 2000
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

PROMPT Sequences created successfully.
