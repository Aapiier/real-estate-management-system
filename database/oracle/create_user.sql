-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: create_user.sql
-- Description: DBA Script to create REALESTATE_USER schema in Oracle XE (XEPDB1)
-- Usage: Connect as SYSDBA and run @@create_user.sql
-- ============================================================================

PROMPT Switching container to XEPDB1...
ALTER SESSION SET CONTAINER = XEPDB1;

PROMPT Checking if user REALESTATE_USER already exists...
BEGIN
    EXECUTE IMMEDIATE 'DROP USER REALESTATE_USER CASCADE';
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if user does not exist yet
END;
/

PROMPT Creating REALESTATE_USER...
CREATE USER REALESTATE_USER IDENTIFIED BY RealEstate2024#
    DEFAULT TABLESPACE USERS
    TEMPORARY TABLESPACE TEMP
    QUOTA UNLIMITED ON USERS;

PROMPT Granting necessary privileges for ADBMS college project...
GRANT CONNECT, RESOURCE TO REALESTATE_USER;
GRANT CREATE VIEW, CREATE PROCEDURE, CREATE TRIGGER, CREATE SEQUENCE, CREATE TABLE TO REALESTATE_USER;
GRANT UNLIMITED TABLESPACE TO REALESTATE_USER;

PROMPT User REALESTATE_USER successfully created and configured!
PROMPT You can now connect as:
PROMPT sqlplus REALESTATE_USER/RealEstate2024#@//localhost:1521/XEPDB1
