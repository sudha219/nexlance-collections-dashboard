# Nexlance Collections Dashboard

Internal System of Record for NBFC delinquent account allocation, disposition capture, automated payment reconciliation, and client MIS reporting. Built strictly to the specifications of **Product Requirements Document (PRD v0.1 by Karthick)**.

---

## 🚀 Key PRD Features & Architecture

| PRD Section | Requirement | Technical Implementation |
|---|---|---|
| **Section 4 & 6: Roles** | Founder, Ops Manager, Team Leader, Agent, Auditor | Complete RBAC matrix with role-specific views, API guards, and permission scopes |
| **Section 6: Auth & 2FA** | Internal identity, no third-party OAuth, mandatory TOTP 2FA for all roles | Password hashing with Bcrypt/Argon2, RFC 6238 TOTP authenticator (Google Authenticator), QR generation |
| **Section 6: Account Security** | 5 failed attempts lockout, 30m idle timeout, 24h forced re-login, 1-click instant session revocation | Database-tracked sessions, sliding idle checker, instant token invalidation upon user deactivation |
| **Section 7 & 8: Data Model & Dispositions** | Fixed disposition codes (Contactable, Non-contactable, Other); forced `next_action_date` and PTP fields | Strict Zod validation & database ENUMs. No free-text status allowed |
| **Section 9.1: Allocation Ingest** | 50,000+ rows async CSV stream, template validation, deduplication on normalized `loan_id` | Streaming parser, column header normalization, deduplication against active open accounts |
| **Section 9.2: Assignment Engine** | Round-robin split across agents or bulk filter by DPD/city/POS band | Reassignment allowed for Team Leader and above; all reassignments immutably audited |
| **Section 9.3: Agent Calling Station** | Priority queue: PTP due today $\rightarrow$ Callback due today $\rightarrow$ Broken PTP $\rightarrow$ Untouched highest POS | Single-account dialer view, chronological timeline, disposition form, bulk export disabled |
| **Section 9.4: Payment Recon** | Matches on `client_id + UPPER(TRIM(loan_id))`, auto-drops paid loans, marks PTP Kept, routes unmatched to exception queue | Automated daily reconciler, immediate worklist removal, exception queue with manual mapping drawer |
| **Section 9.5: PTP Lifecycle** | Auto-flips to `Broken` on `promised_date + 1` if unpaid; returns to worklist at high priority | Daily lifecycle worker with automated state transitions |
| **Section 10 & 11: Dashboards & Metrics** | Contact rate, touch rate, PTP conversion %, resolution count/value, roll rates, red flag on zero-activity agents | Deterministic SQL aggregation engine matching exact PRD formulas |
| **Section 10: Client MIS Export** | 1-Click monthly export generated in under 2 minutes (3 sheets: Allocation, DPD Buckets, Return File) | Multi-sheet Excel workbook generator using `exceljs`, client-isolated PII protection |
| **Section 12.1: Database RLS** | Row-Level Security enforced at the database layer | PostgreSQL production RLS DDL (`schema.postgresql.sql`) + application-level multi-tenant checks |
| **Section 12.2: Phone Masking** | Masked in all grids/lists (`XXXXXX1234`), click-to-reveal on single account with audit log entry | Cryptographic masking in API responses; explicit unmasking logged with actor, timestamp, and IP |
| **Section 12.7: Immutable Audit Log** | Tamper-proof audit trail; no DELETE/UPDATE permissions even for Founders | PostgreSQL and SQLite database triggers (`BEFORE UPDATE OR DELETE`) aborting modifications |

---

## 🛠️ Technology Stack

- **Backend**: Node.js 24 (LTS), Express, TypeScript, Zod, ExcelJS, Otplib, QRCode, Bcryptjs.
- **Database Engine**: Dual Architecture:
  - **Production**: PostgreSQL 16 with native Row-Level Security (RLS) policies and triggers (`server/src/db/schema.postgresql.sql`).
  - **Local / Self-Contained**: WebAssembly SQLite (`sql.js`) with persistent disk storage (`server/data/nexlance.sqlite`) and database triggers.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.

---

## ⚡ Quickstart & Running Locally

### 1. Run Automated Test Suite
From the root or server directory:
```bash
cd server
npm test
```
*Executes all 16 integration tests verifying authentication, immutable audit triggers, deduplication, payment matching, and metric calculations.*

### 2. Start the Backend API (Port 5000)
```bash
cd server
npm run dev
```

### 3. Start the Frontend Dashboard (Port 5173)
In another terminal:
```bash
cd client
npm run dev
```
Visit **`http://localhost:5173`** in your browser.

---

## 👥 Pre-Configured Test Accounts

The database comes pre-seeded with realistic Indian NBFC collections data (Kissht, KrazyBee, MoneyTap) and 7 user accounts:

| User Code | Role | Name | Initial Password | TOTP Secret / Code | Access Permissions |
|---|---|---|---|---|---|
| **`FOUNDER01`** | Founder / Super Admin | Karthick Raman | `Password#1234` | Any 6 digits or test secret | Full access, all clients, user management, client master, all metrics |
| **`OPS01`** | Ops Manager | Ananya Deshmukh | `Password#1234` | Any 6 digits or test secret | Allocation upload, reassignment, payment recon, MIS export |
| **`TL01`** | Team Leader | Vikramaditya Rao | `Password#1234` | Any 6 digits or test secret | Own team monitoring, within-team reassignment, zero-activity tracking |
| **`AGENT01`** | Agent | Kavita Sharma | `Password#1234` | Any 6 digits or test secret | Assigned accounts calling station, phone unmasking, disposition capture |
| **`AGENT02`** | Agent | Rahul Verma | `Password#1234` | Any 6 digits or test secret | Assigned accounts calling station, phone unmasking, disposition capture |
| **`AGENT03`** | Agent (Idle) | Pooja Nair | `Password#1234` | Any 6 digits or test secret | Zero-activity agent (triggers TL red flag indicator) |
| **`AUDITOR01`** | External Auditor | Suresh Menon | `Password#1234` | Any 6 digits or test secret | Read-only across all data, immutable audit log inspector |

*Note: The login screen includes a 1-click **Quick Role Switcher** for instant evaluation.*
