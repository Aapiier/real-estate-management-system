# Real Estate Management System (ADBMS) — Oracle PL/SQL Migration & Web Application

An enterprise-grade **Real Estate Management System** developed for the Advanced Database Management Systems (ADBMS) curriculum. This project demonstrates a complete migration from legacy MySQL scripts to **Oracle Database 21c Express Edition**, featuring genuine **Oracle PL/SQL business logic** (stored procedures, functions, packages, row-level event triggers, explicit cursors, and custom exception handling) integrated with a modern, high-performance local web application.

---

## 1. System Architecture

The entire solution runs **100% locally** on `localhost` without cloud dependencies, paid services, or external APIs:

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT VITE CLIENT                        │
│          Modern Vanilla CSS Dashboard UI (Port 5173)        │
│    (Dashboard, Properties, Leases, Payments, Viva Console)  │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / JSON (Vite Reverse Proxy)
┌──────────────────────────────▼──────────────────────────────┐
│                    NODE.JS / EXPRESS API                    │
│            REST Services & Pool Manager (Port 5000)         │
│          Driver: official 'oracledb' (Thin Driver Mode)     │
└──────────────────────────────▲──────────────────────────────┘
                               │ Oracle Net Protocol (Port 1521)
┌──────────────────────────────▼──────────────────────────────┐
│              ORACLE DATABASE 21c (XE Container)             │
│            Pluggable Database: XEPDB1 (Port 1521)           │
│                 Schema: REALESTATE_USER                     │
│  - 14 Relational Tables (Identity, Constraints, Indexes)    │
│  - Stored Procedures (REGISTER_PROP, CREATE_LEASE, etc.)    │
│  - Functions (COMMISSION, RENTAL_DUES, STATUS)              │
│  - Triggers (PAYMENT_AUDIT, STATUS_AUDIT, VALIDATION)       │
│  - Packages (REALESTATE_PKG with Explicit & FOR Cursors)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Project Directory Structure

```text
real-estate-management-system/
├── client/                     # Modern React + Vite Dashboard Web App
│   ├── public/                 # Static assets & SVG icons
│   ├── src/                    # React components, pages, styles & API service
│   ├── index.html              # HTML entry point with Google Fonts (Inter)
│   ├── package.json            # Frontend dependencies (lucide-react, react, etc.)
│   └── vite.config.js          # Vite config with /api reverse proxy to backend
├── database/
│   └── oracle/                 # Dedicated Oracle Database 21c PL/SQL Engine
│       ├── 01_create_tables.sql            # 14 Relational tables & identity columns
│       ├── 02_constraints_and_indexes.sql  # Foreign keys, checks, and performance indexes
│       ├── 03_sequences.sql                # Explicit Oracle sequences
│       ├── 04_functions.sql                # Commission, status, total paid, dues
│       ├── 05_procedures.sql               # Core business procedures (registration, sales)
│       ├── 06_triggers.sql                 # Row-level event and audit triggers
│       ├── 07_packages.sql                 # REALESTATE_PKG spec and body with cursors
│       ├── 08_sample_data.sql              # Realistic seed data and sequence realignment
│       ├── 09_test_scripts.sql             # 8-suite automated PL/SQL test runner
│       ├── 10_setup_instructions.sql       # Detailed DBA setup and troubleshooting
│       ├── create_user.sql                 # DBA script to create REALESTATE_USER
│       └── run_all.sql                     # Master runner executing all SQL files in order
├── server/                     # Node.js + Express REST API Backend
│   ├── src/
│   │   ├── config/db.js        # Oracle Connection Pool (official oracledb driver)
│   │   ├── controllers/        # Business controllers invoking PL/SQL routines
│   │   ├── routes/api.js       # REST API endpoints
│   │   └── server.js           # Express app listener (Port 5000)
│   ├── .env.example            # Environment variables template
│   └── package.json            # Backend dependencies (express, oracledb, cors, dotenv)
├── .gitignore                  # Git ignore rules for node_modules, build & secrets
└── README.md                   # Comprehensive ADBMS Project Documentation
```

---

## 3. Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Database** | Oracle Database 21c Express Edition (`XEPDB1`), Oracle SQL*Plus |
| **Database Engine** | Oracle PL/SQL (Procedures, Functions, Triggers, Packages, Explicit Cursors) |
| **Backend API** | Node.js, Express.js, `oracledb` (Official Oracle Thin Driver), `cors`, `dotenv` |
| **Frontend UI** | React 18, Vite, Vanilla CSS Design System, `lucide-react` |
| **Networking** | 100% Localhost (`localhost:5173` frontend, `localhost:5000` backend, `localhost:1521` database) |

---

## 4. Entity-Relationship (ER) Model

The database models all core real estate operations across 14 tables:

1. **`OWNER`**: Property owners with contact details.
2. **`AGENT`**: Licensed real estate agents with agency affiliations.
3. **`PROPERTY`**: Physical properties with city, county, size, price, and status (`Available`, `Rented`, `Sold`, `Under Maintenance`).
4. **`TENANT`**: Registered tenants and leasing contacts.
5. **`LEASE`**: Rental contracts linking properties and tenants with monthly rent and validity dates.
6. **`PAYMENT`**: Financial records tracking rental receipts against active leases.
7. **`MAINTENANCE_REQUEST`**: Issue tickets filed by tenants for property repairs with status (`Open`, `In Progress`, `Completed`).
8. **`CLIENTS`**: Prospective buyers and investors.
9. **`TRANSACTIONS`**: Closed purchase agreements linking properties, clients, and agents.
10. **`SECURITY_AUDIT`**: Automated audit trail populated by row-level database triggers.
11. **`CLIENT_INTERACTIONS`**: Logs of phone calls, meetings, and property viewings.
12. **`AUTOMATED_COMMUNICATIONS`**: Outbound SMS and email reminders.
13. **`REPORTS`**: Generated management analytics records.
14. **`USERS`**: Administrative system accounts.

---

## 5. Oracle PL/SQL Implementation Details

### A. Stored Procedures
- **`REGISTER_PROPERTY`**: Validates foreign keys (`owner_id`, `agent_id`), ensures positive pricing, inserts the property, and returns the generated `property_id` via an `OUT` parameter.
- **`CREATE_LEASE`**: Verifies property availability, ensures lease start is strictly before lease end, detects overlapping active leases using date-range intersections, creates the lease, updates property status to `Rented`, and records an audit log.
- **`RECORD_PAYMENT`**: Validates lease existence and active status, rejects zero or negative amounts, guards against duplicate receipts within the same calendar day, records the payment, and triggers security auditing.
- **`COMPLETE_PROPERTY_SALE`**: Acquires an exclusive row lock (`SELECT ... FOR UPDATE`), verifies the property is currently `Available`, records the transaction in `TRANSACTIONS`, updates property status to `Sold`, calculates commission, and records an audit log. **Rejects double sales with application error `-20031`**.

### B. Stored Functions
- **`CALCULATE_AGENT_COMMISSION(p_sale_amount, p_rate)`**: Validates sale amount and rate; returns broker commission formatted to 2 decimals.
- **`GET_PROPERTY_STATUS(p_property_id)`**: Queries status by ID; gracefully handles `NO_DATA_FOUND` by returning `'NOT_FOUND'`.
- **`GET_LEASE_TOTAL_PAID(p_lease_id)`**: Sums verified payment receipts for a lease.
- **`CALCULATE_RENTAL_DUES(p_lease_id)`**: Calculates elapsed rental periods from lease start to date, calculates total expected rent, subtracts payments made, and returns outstanding arrears.

### C. Database Triggers
- **`TRG_PROPERTY_VALIDATE_FORMAT`**: `BEFORE INSERT OR UPDATE ON property` — validates uppercase status and uppercase county names.
- **`TRG_LEASE_DATES_VALIDATE`**: `BEFORE INSERT OR UPDATE ON lease` — strictly enforces `lease_end > lease_start`.
- **`TRG_PAYMENT_AUDIT`**: `AFTER INSERT OR UPDATE OR DELETE ON payment` — logs receipt numbers, amounts, and actions into `SECURITY_AUDIT` with `USER` and `SYSTIMESTAMP`.
- **`TRG_PROPERTY_STATUS_AUDIT`**: `AFTER UPDATE OF status ON property` — captures status transitions (e.g., `Available -> Sold`) and records the prior and new status in `SECURITY_AUDIT`.

### D. PL/SQL Package (`REALESTATE_PKG`)
- **`generate_portfolio_report(p_city)`**: Uses an **explicit cursor** (`c_prop`) with `OPEN`, `FETCH`, `%NOTFOUND` check, `%ROWCOUNT` tracking, and `CLOSE`. Formats a clean tabular portfolio report written directly to `DBMS_OUTPUT`.
- **`reconcile_all_dues`**: Uses a **cursor FOR loop** (`FOR r_lease IN c_active_leases LOOP`) to iterate over active leases, calculate outstanding balances via `CALCULATE_RENTAL_DUES`, and emit critical arrears alerts via `DBMS_OUTPUT`.

---

## 6. Web Application Modules

1. **Executive Dashboard**: Live KPIs (Total Properties, Available, Rented, Sold, Portfolio Value, Total Revenue, Active Leases, Open Maintenance Tickets), recent payment feed, and inventory distribution tables.
2. **Properties Management**: Filter by status, type, and city; search by address; register new properties via `REGISTER_PROPERTY`; complete property sales via `COMPLETE_PROPERTY_SALE`.
3. **Lease Agreements**: Active lease viewer, date range tracking, monthly rent, and new lease creation via `CREATE_LEASE` with conflict detection.
4. **Payment Processing**: Record rental payments via `RECORD_PAYMENT`, view receipt history, and display outstanding arrears.
5. **Maintenance Ticketing**: Track open, in-progress, and resolved repair requests with priority badges (`Urgent`, `High`, `Normal`, `Low`).
6. **Sales & Deeds**: View historical sales transactions, purchase prices, client names, and broker commissions.
7. **ADBMS Reports**: 4 complex relational reporting queries (Active Leases by City, Outstanding Dues Reconciliation, Maintenance Aging, and Portfolio Valuation).

---

## 7. Local Setup & Startup Instructions

### Prerequisites
- **Oracle Database 21c Express Edition (XE)** installed locally on port 1521.
- **Node.js** (v18 or higher).
- **npm** (bundled with Node.js).

### Step 1: Initialize Oracle Database Schema
Open a terminal in `database/oracle/` and run `sqlplus`:

```bash
# 1. Connect as SYSDBA and create the dedicated project user
sqlplus sys/YourSysPassword@localhost:1521/XEPDB1 as sysdba
@create_user.sql
exit

# 2. Run the master setup and automated test suite as REALESTATE_USER
sqlplus REALESTATE_USER/"RealEstate2024#"@localhost:1521/XEPDB1
@run_all.sql
exit
```

> **Verification:** `run_all.sql` automatically verifies that all 14 PL/SQL objects report `VALID` and all 8 test suites pass successfully.

### Step 2: Configure and Start the Backend Server
```bash
cd server
npm install
npm start
```
The server will start at `http://localhost:5000` and display:
```
[Oracle DB] Connection pool created for user: REALESTATE_USER @ localhost:1521/XEPDB1
[Oracle DB] Connected successfully to container: XEPDB1 as REALESTATE_USER
Server running at: http://localhost:5000
API Health Check:   http://localhost:5000/api/health
```

### Step 3: Start the Frontend Application
In a second terminal:
```bash
cd client
npm install
npm run dev
```
The client will start at `http://localhost:5173/`. Open this URL in any modern web browser.

---

## 8. Verification & Test Results

The following test suites were executed and verified against a live Oracle 21c Database:
- [x] Schema DDL: 14 tables, constraints, foreign keys, and indexes compiled cleanly.
- [x] PL/SQL Functions: `CALCULATE_AGENT_COMMISSION`, `GET_PROPERTY_STATUS`, `CALCULATE_RENTAL_DUES` tested and returned accurate values.
- [x] Stored Procedures: `REGISTER_PROPERTY`, `CREATE_LEASE`, `RECORD_PAYMENT`, `COMPLETE_PROPERTY_SALE` verified end-to-end.
- [x] Transaction Integrity: Double-sale attempts correctly rejected with custom ORA error `-20031`.
- [x] Overlapping Lease Protection: Overlapping date ranges correctly rejected with ORA error `-20012`.
- [x] Row-Level Triggers: `TRG_PAYMENT_AUDIT` and `TRG_PROPERTY_STATUS_AUDIT` actively recorded events into `SECURITY_AUDIT`.
- [x] Package Routines: `REALESTATE_PKG` explicit cursor report and dues reconciliation executed with live `DBMS_OUTPUT`.
- [x] Web Client: React UI successfully communicated with Express API via Vite proxy on `http://localhost:5173`.

---
### By Himanshu Nepaliya, Uday Bhosle and Chinmay Chauhan