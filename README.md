# NERSF

## National Energy, Resource & Security Framework

NERSF is a Bangladesh-focused digital government platform for energy services, public consumers, vendors and bidders, procurement, resources, infrastructure, support services, and government administration.

## Portals

- Public Information Portal
- Consumer Portal
- Vendor / Bidder Portal
- Government Administration Portal
- Auditor Access

## Technology

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: MySQL
- Real-time Services: Socket.IO

## Core Modules

- Authentication and role-based access control
- Public registration for citizens and vendors only
- Tender and bid management
- Consumer complaints and official responses
- Vendor management
- Import/export and resource workflows
- 24/7 Help Desk with persistent ticket conversations
- Government audit ledger
- CSV audit export

## Local Setup

### 1. Database

Create the MySQL database and apply the repository schema/migrations required by your environment.

### 2. Backend

Copy the environment example and configure:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- CORS_ORIGIN
- PORT

Then:

```bash
cd backend
npm install
npm run build
npm run dev
```

### 3. Frontend

Configure:

- VITE_API_URL
- VITE_SOCKET_URL

Then:

```bash
cd frontend
npm install
npm run build
npm run dev
```

## Security Notes

- Never commit production credentials.
- Use a strong, unique JWT_SECRET in production.
- Deploy behind HTTPS.
- Restrict CORS_ORIGIN to approved domains.
- Database access should use a least-privilege production account.
- Audit records should be retained according to the applicable government policy.

## Production Readiness Status

The repository has completed a major integration and security pass, including protected Socket.IO connections, ticket-level authorization, audit integration, and real audit dashboard connectivity.

Before an actual government production deployment, conduct independent penetration testing, load testing, database backup/recovery testing, disaster recovery validation, accessibility review, and a formal security/compliance assessment.
