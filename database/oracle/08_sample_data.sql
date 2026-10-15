-- ============================================================================
-- ADBMS Project: Real Estate Management System (Oracle PL/SQL Migration)
-- File: 08_sample_data.sql
-- Description: Comprehensive sample dataset adapted from original project data
--              with strict referential integrity and ANSI date formats.
-- ============================================================================

-- Clean existing data in reverse dependency order
DELETE FROM reports;
DELETE FROM security_audit;
DELETE FROM automated_communications;
DELETE FROM client_interactions;
DELETE FROM transactions;
DELETE FROM maintenance_request;
DELETE FROM payment;
DELETE FROM lease;
DELETE FROM tenant;
DELETE FROM property;
DELETE FROM owner;
DELETE FROM clients;
DELETE FROM agent;
DELETE FROM users;

-- ----------------------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------------------
INSERT INTO users (user_id, username, password, email) VALUES
(1, 'admin', 'admin123', 'admin@realestate.co.ke');
INSERT INTO users (user_id, username, password, email) VALUES
(2, 'manager', 'mgr123', 'manager@realestate.co.ke');
INSERT INTO users (user_id, username, password, email) VALUES
(3, 'alice_b', 'alice123', 'alice.agent@realestate.co.ke');
INSERT INTO users (user_id, username, password, email) VALUES
(4, 'bob_g', 'bob123', 'bob.agent@realestate.co.ke');
INSERT INTO users (user_id, username, password, email) VALUES
(5, 'auditor', 'audit123', 'auditor@realestate.co.ke');

-- ----------------------------------------------------------------------------
-- 2. AGENTS
-- ----------------------------------------------------------------------------
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(1, 'Alice', 'Brown', 'alice.brown@example.com', '1234500001', 'RealEstateCo');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(2, 'Bob', 'Green', 'bob.green@example.com', '1234500002', 'PropertyHub');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(3, 'Charlie', 'Black', 'charlie.black@example.com', '1234500003', 'HomeFinders');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(4, 'Donna', 'White', 'donna.white@example.com', '1234500004', 'SecureEstates');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(5, 'Evan', 'Grey', 'evan.grey@example.com', '1234500005', 'PrimeLands');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(6, 'Fiona', 'Blue', 'fiona.blue@example.com', '1234500006', 'RealtyWorld');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(7, 'George', 'Violet', 'george.violet@example.com', '1234500007', 'MetroEstates');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(8, 'Helen', 'Indigo', 'helen.indigo@example.com', '1234500008', 'CityProperties');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(9, 'Ivan', 'Red', 'ivan.red@example.com', '1234500009', 'SuburbanHomes');
INSERT INTO agent (agent_id, firstname, lastname, email, phone, agency) VALUES
(10, 'Jack', 'Yellow', 'jack.yellow@example.com', '1234500010', 'ModernResidences');

-- ----------------------------------------------------------------------------
-- 3. OWNERS
-- ----------------------------------------------------------------------------
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(1, 'Samuel', 'Kariuki', 'samuel.kariuki@owner.co.ke', '+254711000001', 1);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(2, 'Beatrice', 'Wanjiku', 'beatrice.wanjiku@owner.co.ke', '+254711000002', 2);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(3, 'Daniel', 'Otieno', 'daniel.otieno@owner.co.ke', '+254711000003', 3);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(4, 'Grace', 'Muthoni', 'grace.muthoni@owner.co.ke', '+254711000004', 4);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(5, 'Joseph', 'Kiprono', 'joseph.kiprono@owner.co.ke', '+254711000005', 5);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(6, 'Mercy', 'Chebet', 'mercy.chebet@owner.co.ke', '+254711000006', 6);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(7, 'Peter', 'Kamau', 'peter.kamau@owner.co.ke', '+254711000007', 7);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(8, 'Faith', 'Achieng', 'faith.achieng@owner.co.ke', '+254711000008', 8);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(9, 'Moses', 'Mwangi', 'moses.mwangi@owner.co.ke', '+254711000009', 9);
INSERT INTO owner (owner_id, firstname, lastname, email, phone_number, agent_id) VALUES
(10, 'Esther', 'Nyambura', 'esther.nyambura@owner.co.ke', '+254711000010', 10);

-- ----------------------------------------------------------------------------
-- 4. CLIENTS
-- ----------------------------------------------------------------------------
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', '1234567890');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(2, 'Jane', 'Smith', 'jane.smith@example.com', '1234567891');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(3, 'Sam', 'Wilson', 'sam.wilson@example.com', '1234567892');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(4, 'Lisa', 'Taylor', 'lisa.taylor@example.com', '1234567893');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(5, 'Mike', 'Brown', 'mike.brown@example.com', '1234567894');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(6, 'Emily', 'Davis', 'emily.davis@example.com', '1234567895');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(7, 'David', 'Clark', 'david.clark@example.com', '1234567896');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(8, 'Susan', 'Lewis', 'susan.lewis@example.com', '1234567897');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(9, 'Paul', 'Young', 'paul.young@example.com', '1234567898');
INSERT INTO clients (client_id, firstname, lastname, email, phone) VALUES
(10, 'Anna', 'King', 'anna.king@example.com', '1234567899');

-- ----------------------------------------------------------------------------
-- 5. PROPERTY
-- ----------------------------------------------------------------------------
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(1, 'Apartment', '123 Main St', 'Nairobi', 'Nairobi', 10000000.00, 1, 1, '00100', 100, 'Rented');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(2, 'House', '456 Elm St', 'Nairobi', 'Nairobi', 20000000.00, 2, 2, '00101', 200, 'Rented');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(3, 'Condo', '789 Pine St', 'Nairobi', 'Nairobi', 15000000.00, 3, 3, '00102', 150, 'Rented');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(4, 'Villa', '101 Maple St', 'Mombasa', 'Mombasa', 30000000.00, 4, 4, '00103', 300, 'Available');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(5, 'Townhouse', '202 Oak St', 'Kiambu', 'Kiambu', 12000000.00, 5, 5, '00104', 120, 'Rented');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(6, 'Duplex', '303 Cedar St', 'Nakuru', 'Nakuru', 13000000.00, 6, 6, '00105', 130, 'Available');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(7, 'Penthouse', '404 Birch St', 'Nairobi', 'Nairobi', 25000000.00, 7, 7, '00106', 250, 'Sold');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(8, 'Studio', '505 Spruce St', 'Kisumu', 'Kisumu', 8000000.00, 8, 8, '00107', 80, 'Rented');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(9, 'Loft', '606 Fir St', 'Mombasa', 'Mombasa', 14000000.00, 9, 9, '00108', 140, 'Available');
INSERT INTO property (property_id, property_type, address, county, city, price_ksh, owner_id, agent_id, zipcode, size_m2, status) VALUES
(10, 'Cottage', '707 Redwood St', 'Nairobi', 'Nairobi', 9000000.00, 10, 10, '00109', 90, 'Rented');

-- ----------------------------------------------------------------------------
-- 6. TENANT
-- ----------------------------------------------------------------------------
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(1, 'Kevin', 'Otieno', 'kevin.otieno@tenant.com', '0722100001', DATE '2024-01-01', DATE '2024-12-31', 1, 1);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(2, 'Sarah', 'Kiprotich', 'sarah.kip@tenant.com', '0722100002', DATE '2024-02-01', DATE '2024-11-30', 2, 2);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(3, 'Dennis', 'Muthomi', 'dennis.m@tenant.com', '0722100003', DATE '2024-03-01', DATE '2025-02-28', 3, 3);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(4, 'Brenda', 'Wambui', 'brenda.w@tenant.com', '0722100004', DATE '2024-04-01', DATE '2025-03-31', 4, 4);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(5, 'Brian', 'Ouma', 'brian.ouma@tenant.com', '0722100005', DATE '2024-05-01', DATE '2025-04-30', 5, 5);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(6, 'Nancy', 'Jeptoo', 'nancy.j@tenant.com', '0722100006', DATE '2024-06-01', DATE '2025-05-31', 6, 6);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(7, 'Victor', 'Njoroge', 'victor.n@tenant.com', '0722100007', DATE '2024-07-01', DATE '2025-06-30', 7, 7);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(8, 'Cynthia', 'Anyango', 'cynthia.a@tenant.com', '0722100008', DATE '2024-08-01', DATE '2025-07-31', 8, 8);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(9, 'Patrick', 'Mutua', 'patrick.m@tenant.com', '0722100009', DATE '2024-09-01', DATE '2025-08-31', 9, 9);
INSERT INTO tenant (tenant_id, firstname, lastname, email, phone_number, lease_start, lease_end, property_id, agent_id) VALUES
(10, 'Joy', 'Wanza', 'joy.wanza@tenant.com', '0722100010', DATE '2024-10-01', DATE '2025-09-30', 10, 10);

-- ----------------------------------------------------------------------------
-- 7. LEASE
-- ----------------------------------------------------------------------------
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(1, DATE '2024-01-01', DATE '2024-12-31', 50000.00, 1, 1, 'Active');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(2, DATE '2024-02-01', DATE '2024-11-30', 55000.00, 2, 2, 'Active');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(3, DATE '2024-03-01', DATE '2025-02-28', 60000.00, 3, 3, 'Active');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(4, DATE '2024-04-01', DATE '2025-03-31', 65000.00, 4, 4, 'Terminated');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(5, DATE '2024-05-01', DATE '2025-04-30', 70000.00, 5, 5, 'Active');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(6, DATE '2024-06-01', DATE '2025-05-31', 75000.00, 6, 6, 'Expired');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(7, DATE '2024-07-01', DATE '2025-06-30', 80000.00, 7, 7, 'Terminated');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(8, DATE '2024-08-01', DATE '2025-07-31', 85000.00, 8, 8, 'Active');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(9, DATE '2024-09-01', DATE '2025-08-31', 90000.00, 9, 9, 'Expired');
INSERT INTO lease (lease_id, lease_start, lease_end, monthly_rent, property_id, tenant_id, status) VALUES
(10, DATE '2024-10-01', DATE '2025-09-30', 95000.00, 10, 10, 'Active');

-- ----------------------------------------------------------------------------
-- 8. PAYMENT
-- ----------------------------------------------------------------------------
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(1, DATE '2024-11-20', 50000.00, 'Credit Card', 1);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(2, DATE '2024-11-21', 55000.00, 'Bank Transfer', 2);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(3, DATE '2024-11-22', 60000.00, 'Cash', 3);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(4, DATE '2024-11-23', 65000.00, 'Credit Card', 4);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(5, DATE '2024-11-24', 70000.00, 'Bank Transfer', 5);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(6, DATE '2024-11-25', 75000.00, 'Cash', 6);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(7, DATE '2024-11-26', 80000.00, 'Credit Card', 7);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(8, DATE '2024-11-27', 85000.00, 'Bank Transfer', 8);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(9, DATE '2024-11-28', 90000.00, 'Cash', 9);
INSERT INTO payment (payment_id, payment_date, amount_paid, payment_method, lease_id) VALUES
(10, DATE '2024-11-29', 95000.00, 'Credit Card', 10);

-- ----------------------------------------------------------------------------
-- 9. MAINTENANCE_REQUEST
-- ----------------------------------------------------------------------------
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(1, DATE '2024-11-20', 'Plumbing issue in master bath', 'Open', 1, 1);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(2, DATE '2024-11-21', 'Electrical fault in main panel', 'In Progress', 2, 2);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(3, DATE '2024-11-22', 'Roof leak during heavy rains', 'Closed', 3, 3);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(4, DATE '2024-11-23', 'Solar water heating failure', 'Open', 4, 4);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(5, DATE '2024-11-24', 'Broken balcony window frame', 'Closed', 5, 5);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(6, DATE '2024-11-25', 'Air conditioning compressor faulty', 'In Progress', 6, 6);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(7, DATE '2024-11-26', 'Water heater thermostat replacement', 'Open', 7, 7);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(8, DATE '2024-11-27', 'Termite inspection and pest control', 'Closed', 8, 8);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(9, DATE '2024-11-28', 'Mold remediation on basement wall', 'Open', 9, 9);
INSERT INTO maintenance_request (request_id, request_date, description, status, property_id, tenant_id) VALUES
(10, DATE '2024-11-29', 'Exterior paint touch-ups and sealing', 'In Progress', 10, 10);

-- ----------------------------------------------------------------------------
-- 10. TRANSACTIONS
-- ----------------------------------------------------------------------------
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(1, 1, 1, 1, DATE '2024-11-20', 100000.00, 'Completed');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(2, 2, 2, 2, DATE '2024-11-21', 200000.00, 'Pending');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(3, 3, 3, 3, DATE '2024-11-22', 150000.00, 'Completed');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(4, 4, 4, 4, DATE '2024-11-23', 300000.00, 'Cancelled');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(5, 5, 5, 5, DATE '2024-11-24', 120000.00, 'Completed');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(6, 6, 6, 6, DATE '2024-11-25', 130000.00, 'Pending');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(7, 7, 7, 7, DATE '2024-11-26', 25000000.00, 'Completed');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(8, 8, 8, 8, DATE '2024-11-27', 80000.00, 'Completed');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(9, 9, 9, 9, DATE '2024-11-28', 140000.00, 'Pending');
INSERT INTO transactions (transaction_id, property_id, client_id, agent_id, transaction_date, amount, status) VALUES
(10, 10, 10, 10, DATE '2024-11-29', 90000.00, 'Completed');

-- ----------------------------------------------------------------------------
-- 11. CLIENT_INTERACTIONS
-- ----------------------------------------------------------------------------
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(1, 1, TIMESTAMP '2024-11-20 10:00:00', 'Email', 'Initial inquiry regarding Nairobi apartment');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(2, 2, TIMESTAMP '2024-11-21 11:00:00', 'Phone call', 'Scheduled viewing for Elm St house');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(3, 3, TIMESTAMP '2024-11-22 12:00:00', 'Meeting', 'Reviewed condo purchase agreement');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(4, 4, TIMESTAMP '2024-11-23 13:00:00', 'Email', 'Sent valuation report for Mombasa villa');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(5, 5, TIMESTAMP '2024-11-24 14:00:00', 'Phone call', 'Confirmed mortgage pre-approval status');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(6, 6, TIMESTAMP '2024-11-25 15:00:00', 'Email', 'Received revised offer on Nakuru duplex');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(7, 7, TIMESTAMP '2024-11-26 16:00:00', 'Meeting', 'Finalized penthouse sale deed signing');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(8, 8, TIMESTAMP '2024-11-27 17:00:00', 'Email', 'Sent lease terms for Kisumu studio');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(9, 9, TIMESTAMP '2024-11-28 18:00:00', 'Phone call', 'Answered queries on property taxes');
INSERT INTO client_interactions (interaction_id, client_id, interaction_date, interaction_type, notes) VALUES
(10, 10, TIMESTAMP '2024-11-29 19:00:00', 'Email', 'Welcomed new tenant into Redwood cottage');

-- ----------------------------------------------------------------------------
-- 12. AUTOMATED_COMMUNICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(1, 1, TIMESTAMP '2024-11-20 10:00:00', 'Welcome to Premier Real Estate Kenya!', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(2, 2, TIMESTAMP '2024-11-21 11:00:00', 'Your property tour is confirmed for Saturday.', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(3, 3, TIMESTAMP '2024-11-22 12:00:00', 'Survey: How was your agent consultation experience?', 'Pending');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(4, 4, TIMESTAMP '2024-11-23 13:00:00', 'Reminder: Lease installment due in 5 days.', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(5, 5, TIMESTAMP '2024-11-24 14:00:00', 'Special: Zero processing fee on new listings this month.', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(6, 6, TIMESTAMP '2024-11-25 15:00:00', 'Important update on zoning regulations in Nakuru.', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(7, 7, TIMESTAMP '2024-11-26 16:00:00', 'Monthly real estate investment market digest.', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(8, 8, TIMESTAMP '2024-11-27 17:00:00', 'Warm birthday greetings from Real Estate Management team!', 'Sent');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(9, 9, TIMESTAMP '2024-11-28 18:00:00', 'Security alert: Scheduled portal maintenance tonight.', 'Pending');
INSERT INTO automated_communications (communication_id, client_id, communication_date, message, status) VALUES
(10, 10, TIMESTAMP '2024-11-29 19:00:00', 'Receipt acknowledgment for your recent payment.', 'Sent');

-- ----------------------------------------------------------------------------
-- 13. SECURITY_AUDIT
-- ----------------------------------------------------------------------------
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-20 10:00:00', 1, 'USER_LOGIN', 'Administrator logged in from 127.0.0.1');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-20 12:00:00', 2, 'PASSWORD_CHANGE', 'Manager password updated successfully');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-21 14:00:00', 3, 'USER_LOGIN', 'Agent Alice logged into management portal');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-22 16:00:00', 1, 'DATA_UPDATE', 'Updated client record for John Doe');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-22 18:00:00', 2, 'USER_LOGOUT', 'Manager logged out cleanly');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-23 10:00:00', 3, 'USER_LOGIN', 'Agent Alice logged in');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-23 12:00:00', 1, 'TRANSACTION_AUDIT', 'Verified completed transaction record 1');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-24 14:00:00', 2, 'USER_LOGIN', 'Manager logged in');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-24 16:00:00', 5, 'AUDIT_INSPECTION', 'Internal auditor ran compliance verification');
INSERT INTO security_audit (audit_timestamp, user_id, action, details) VALUES
(TIMESTAMP '2024-11-25 10:00:00', 1, 'ACCOUNT_CREATION', 'Created credentials for auditor user 5');

-- ----------------------------------------------------------------------------
-- 14. REPORTS (JSON Analytical snapshots)
-- ----------------------------------------------------------------------------
INSERT INTO reports (report_id, generated_on, report_type, report_data) VALUES
(1, TIMESTAMP '2024-11-29 20:00:00', 'ACTIVE_LEASES_BY_CITY',
 '{"title": "Active Leases Summary", "generatedBy": "admin", "data": [{"city": "Nairobi", "active_leases": 4}, {"city": "Kiambu", "active_leases": 1}, {"city": "Kisumu", "active_leases": 1}]}');

INSERT INTO reports (report_id, generated_on, report_type, report_data) VALUES
(2, TIMESTAMP '2024-11-29 20:05:00', 'PORTFOLIO_VALUATION',
 '{"title": "Portfolio Revenue Summary", "generatedBy": "manager", "data": [{"city": "Nairobi", "property_count": 5, "total_value_ksh": 79000000}, {"city": "Mombasa", "property_count": 2, "total_value_ksh": 44000000}]}');

COMMIT;

-- ----------------------------------------------------------------------------
-- Advance all identity sequences beyond sample data IDs to ensure future
-- inserts generated by procedures/triggers do not collide with sample data (ORA-00001)
-- ----------------------------------------------------------------------------
ALTER TABLE users MODIFY user_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE agent MODIFY agent_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE owner MODIFY owner_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE clients MODIFY client_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE property MODIFY property_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE tenant MODIFY tenant_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE lease MODIFY lease_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE payment MODIFY payment_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE maintenance_request MODIFY request_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE transactions MODIFY transaction_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE client_interactions MODIFY interaction_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE automated_communications MODIFY communication_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE security_audit MODIFY audit_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);
ALTER TABLE reports MODIFY report_id GENERATED BY DEFAULT AS IDENTITY (START WITH LIMIT VALUE);

PROMPT Sample data inserted and committed successfully.
