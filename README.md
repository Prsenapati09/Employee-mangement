# HRMPro

HRMPro is a full-stack HR and employee-management application built with Next.js, React, TypeScript, Express, and MongoDB. It combines a responsive web frontend with a versioned API and organization-scoped data access.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment configuration](#environment-configuration)
- [MongoDB setup and first owner](#mongodb-setup-and-first-owner)
- [Run the application](#run-the-application)
- [Useful commands](#useful-commands)
- [Testing and verification](#testing-and-verification)
- [API and health checks](#api-and-health-checks)
- [Project structure](#project-structure)
- [Document storage and production considerations](#document-storage-and-production-considerations)
- [Security](#security)
- [Git workflow](#git-workflow)
- [Troubleshooting](#troubleshooting)

## Features

- Organization-scoped sign-in, sign-out, and password recovery.
- Role-aware access for owners, admins, HR, managers, and employees. Access is enforced by the API and scoped to the user's organization; managers and employee accounts have narrower data access.
- Employee profiles, department management, and employee invitations with account activation.
- Attendance records and leave application/review workflows.
- Private employee documents with authorized upload, download, and deletion.
- Organization HR reports and analytics.
- Organization profile and user-account settings.
- Responsive frontend with Lucide icons.

New organization owner registration is provisioned through a protected backend endpoint; the public registration page does not provide open self-registration.

## Technology stack

Versions below are the ranges declared in the three `package.json` files.

| Area | Packages |
|---|---|
| Root package | `concurrently ^9.2.1` (development dependency), `lucide-react ^1.70.0` |
| Frontend runtime | `next ^16.4.3`, `react ^19.1.0`, `react-dom ^19.1.0`, `lucide-react ^1.70.0` |
| Frontend development | `typescript ^5.8.3`, `tailwindcss ^3.4.17`, `eslint ^9.30.1`, `eslint-config-next ^16.4.3`, `postcss ^8.5.6`, `autoprefixer ^10.4.21`, `@types/node ^22.15.30`, `@types/react ^19.1.8`, `@types/react-dom ^19.1.7` |
| Backend runtime | `express ^5.1.0`, `mongoose ^8.17.0`, `zod ^4.6.7`, `nodemailer ^10.3.1`, `helmet ^8.1.0`, `cors ^2.8.5`, `morgan ^1.10.0`, `express-rate-limit ^8.7.3`, `dotenv ^16.6.1` |
| Backend development | `tsx ^4.20.3`, `typescript ^5.8.3`, `eslint ^9.30.1`, `typescript-eslint ^8.35.1`, `@types/cors ^2.8.19`, `@types/express ^5.0.3`, `@types/morgan ^1.9.10`, `@types/node ^22.15.30` |

The root development script uses `concurrently` to run the frontend and backend scripts together.

## Prerequisites

- Node.js 20.9 or later.
- npm.
- MongoDB access. Non-test backend startup currently requires a MongoDB Atlas `mongodb+srv` URI targeting the `hrmpro` database. The test environment accepts a configured MongoDB URI.
- SMTP settings when invitation, password-reset, or notification email delivery is needed. The contact form stores submissions even when email notification is not configured.

## Installation

Run these commands from the repository root:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

The first command installs root development tooling. The next commands install the independently managed frontend and backend dependencies using their respective lockfiles.

## Environment configuration

Create local environment files from the checked-in templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Edit the copied files locally. Do not paste credentials into source code, commits, tickets, or logs. The `.env` and `.env.*` ignore rules exclude local environment files while allowing `.env.example` templates.

### Backend variables

| Variable | Required? | Purpose and behavior |
|---|---|---|
| `NODE_ENV` | Optional; defaults to `development` | Backend mode. Accepted values are `development`, `test`, and `production`. |
| `PORT` | Optional; defaults to `4000` | Port used by the Express API; must be between 1 and 65535. |
| `MONGODB_URI` | Required | MongoDB connection URI. For non-test startup it must be an Atlas SRV URI with database credentials and database path `hrmpro`. A test-mode URI is also required. Example shape: `mongodb+srv://<db_username>:<db_password>@<cluster-host>/hrmpro?retryWrites=true&w=majority`. URL-encode reserved characters in credentials. |
| `OWNER_PROVISIONING_SECRET` | Optional to start; required to provision an owner | Secret checked by the owner registration endpoint. Use a randomly generated value of at least 32 characters. |
| `FRONTEND_URL` | Optional; defaults to `http://localhost:3000` | Allowed frontend origin and base URL used when generating invitation and password-reset links. Set it to the deployed frontend origin in a deployment. |
| `DOCUMENT_STORAGE_DIR` | Optional | Path for private local document storage; an absolute path avoids working-directory ambiguity. If unset, storage defaults to `backend/storage/private-documents` when the backend is started from its directory. |
| `SMTP_USER` | Optional | SMTP account email address. |
| `SMTP_APP_PASSWORD` | Optional | SMTP account/app password. Keep it private; do not use or commit an account's regular password. |
| `CONTACT_NOTIFICATION_EMAIL` | Optional | Recipient for contact-form notification emails. Email notifications are attempted only when this and both SMTP settings are configured. |

SMTP is optional. Email-dependent invitation and password-reset workflows need working mail configuration to deliver messages; the contact message is persisted even if optional notification email is unavailable.

Generate a suitable owner provisioning secret locally, for example:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Store the generated value only in `backend/.env` and keep it available to the trusted operator who provisions the first owner.

### Frontend variable

| Variable | Required? | Purpose and behavior |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Optional; defaults in the frontend code to `http://localhost:4000/api/v1` | Base URL for browser-to-API requests. Use the API's public URL in a deployed frontend. This is a public build-time setting; never put secrets in `NEXT_PUBLIC_*` variables. |

## MongoDB setup and first owner

1. In MongoDB Atlas, create/select a project and cluster.
2. Create a dedicated database user with a strong password and only the permissions the app/test suite needs.
3. Allow the development machine's current IP in Atlas **Network Access**. Avoid unrestricted network access such as `0.0.0.0/0`.
4. Copy the Atlas driver connection string into `MONGODB_URI` in `backend/.env`; replace the username, password, and cluster-host placeholders and retain the `hrmpro` database path.
5. Set a random `OWNER_PROVISIONING_SECRET` of at least 32 characters.
6. Start the backend and confirm it connects before listening.
7. From the repository root, run the trusted local PowerShell owner-provisioning helper:

   ```powershell
   .\backend\scripts\register-owner.ps1
   ```

   The helper only targets `http://localhost:4000/api/v1/auth/register-owner`, prompts securely for the provisioning secret and initial owner password, and asks for organization name, slug, and owner email. The password must be 12–128 characters. There are no default owner credentials or seed accounts.

The backend validates the owner provisioning key in the `x-owner-provisioning-key` header. Keep the provisioning secret out of the frontend and do not expose it publicly.

## Run the application

From the repository root, start both development servers:

```bash
npm run dev
```

The root script runs the frontend and backend concurrently and stops them together.

Development URLs:

- Frontend: [http://localhost:3000](http://localhost:3000/)
- Backend: [http://localhost:4000](http://localhost:4000/)

To run either app separately, use its directory:

```bash
# Frontend
cd frontend
npm run dev

# Backend (in a separate terminal)
cd backend
npm run dev
```

## Useful commands

### Repository root

```bash
npm run dev
npm run build
npm run lint
```

Root `build` and `lint` delegate to both frontend and backend. There is no root `typecheck` or `test` script.

### Frontend

Run from `frontend/`:

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm run start` serves the production build; run `npm run build` first.

### Backend

Run from `backend/`:

```bash
npm run lint
npm run typecheck
npm run build
npm test
npm start
```

`npm start` serves the compiled output and requires `npm run build` first.

## Testing and verification

Backend `npm test` runs the MongoDB-backed integration suite in `backend/tests/auth.test.ts`. At the time this README was reviewed, that file contained **23 test cases**; this is a source audit count, not a guarantee of a future test count and not a test execution result.

The integration suite requires a reachable MongoDB instance and a database user allowed to create and drop databases. It creates a uniquely named test database and drops it after the run. Use a test-appropriate URI/account and do not run it against data that must be retained. Email tests simulate delivery outcomes and do not verify external SMTP credentials.

Run checks from the relevant directory:

| Check | Command | Directory |
|---|---|---|
| Frontend lint | `npm run lint` | `frontend/` |
| Frontend TypeScript | `npm run typecheck` | `frontend/` |
| Frontend production build | `npm run build` | `frontend/` |
| Backend lint | `npm run lint` | `backend/` |
| Backend TypeScript | `npm run typecheck` | `backend/` |
| Backend production build | `npm run build` | `backend/` |
| Backend integration tests | `npm test` | `backend/` |
| Combined lint/build | `npm run lint` / `npm run build` | Repository root |

## API and health checks

The Express API is versioned under `/api/v1`. The verified health endpoints are:

| Method and path | Meaning |
|---|---|
| `GET /api/v1/health` | Liveness check. Returns HTTP 200 when the API process is serving requests. |
| `GET /api/v1/health/ready` | Readiness check. Returns HTTP 200 when MongoDB is connected, or HTTP 503 when it is not. |

For example:

```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/health/ready
```

Owner provisioning is handled by the protected `POST /api/v1/auth/register-owner` endpoint described above. For other API behavior, use the backend implementation and its [backend README](backend/README.md); this document intentionally does not enumerate unverified endpoints.

## Project structure

```text
.
├── backend/
│   ├── scripts/                    # Trusted local owner-provisioning helper
│   ├── src/
│   │   ├── config/                 # Environment, database, CORS
│   │   ├── middleware/             # Authentication/role and request middleware
│   │   ├── modules/                # Auth, employees, attendance, documents, etc.
│   │   ├── routes/                 # Versioned API and health route composition
│   │   └── server.ts, app.ts
│   ├── storage/                    # Private local document storage
│   ├── tests/                      # MongoDB integration tests
│   ├── postman/                    # Postman resources
│   └── bruno/                      # Bruno resources
├── frontend/
│   ├── public/assets/              # Locally stored SVG illustrations
│   └── src/
│       ├── app/
│       │   ├── (marketing)/        # Home, features, solutions, about, contact
│       │   ├── (auth)/             # Login, registration, invitation, recovery
│       │   └── (dashboard)/        # Dashboard and HR management routes
│       ├── components/             # Auth, employee and shared UI
│       └── lib/                    # Frontend API clients
├── docs/                            # Project documentation
├── package.json                     # Root development/build/lint scripts
└── README.md
```

The `docs/folder-structure.md`, `docs/architecture.md`, and `docs/api-conventions.md` files contain earlier planning material and may not reflect all currently implemented features; use the application source and backend README for current behavior.

## Document storage and production considerations

Private employee documents are stored on the local filesystem by default, outside public frontend assets. `DOCUMENT_STORAGE_DIR` can point to another private local directory.

Local disk is not durable across many hosting platforms and is not automatically shared by multiple API instances. Production hosting with ephemeral filesystems or multiple API instances requires a persistent private volume or a suitable durable private-storage adapter. Configure backups, access controls, retention, and recovery for the selected storage. The current repository does not establish that production hosting or a managed document-storage service is deployed.

## Security

- Never commit `.env`, `.env.local`, database URIs, SMTP credentials, owner provisioning secrets, or other credentials. Use the example templates as non-secret configuration references.
- Keep `OWNER_PROVISIONING_SECRET` server-side, random, and at least 32 characters. Rotate it if it may have been exposed.
- Protect SMTP credentials and use a provider-issued application credential where applicable.
- Business access is scoped to the authenticated organization, and role permissions are enforced by the backend as well as reflected in the frontend.
- Employee documents are private and are returned only after authorization checks; do not place uploaded files in public assets.
- `NEXT_PUBLIC_*` values are exposed to browser code and must not contain secrets.
- Restrict MongoDB network access and use a dedicated database account.

## Git workflow

Use your actual working branch name in place of `<your-branch>`; no default branch is assumed here.

```bash
git status --short --branch
git diff
git switch <your-branch>
git pull --ff-only origin <your-branch>
git add README.md
git diff --cached
git commit -m "docs: expand project README"
git push -u origin <your-branch>
```

Review the staged diff before committing, and do not stage environment files or generated secrets.

## Troubleshooting

### MongoDB connection failure

- Confirm `MONGODB_URI` is set in `backend/.env`, points to the `hrmpro` database, and has URL-encoded credentials.
- For non-test startup, use the Atlas `mongodb+srv` URI; the current backend rejects other URI formats in development/production.
- Check Atlas database-user permissions and the Network Access IP allowlist.
- Confirm Atlas is reachable from the machine. Startup waits for MongoDB and does not begin listening when the connection fails.

### Port already in use

Change backend `PORT` in `backend/.env` if port 4000 is occupied. If the frontend port 3000 is occupied, stop the other process or use the Next.js port option, for example `npm run dev -- --port 3001` from `frontend/`, and update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` as needed.

### Missing or invalid environment variables

- Confirm local files were copied from the correct templates: `backend/.env.example` to `backend/.env`, and `frontend/.env.example` to `frontend/.env.local`.
- Check required values, valid email formats, URI shape, `PORT`, and the 32-character minimum for the owner provisioning secret.
- Restart the relevant development server after editing environment files.

### SMTP delivery problems

- Confirm `SMTP_USER` and `SMTP_APP_PASSWORD` are both configured with valid provider credentials.
- Confirm `CONTACT_NOTIFICATION_EMAIL` is set if contact-form notifications are required.
- Check provider account security settings and outbound network access. Contact form messages are saved even if notification delivery fails; invitations and password-reset flows require successful email delivery for the user to receive their link.

### Dependency installation issues

- Confirm Node.js is 20.9 or later and npm is available.
- Run `npm install` at the root and `npm --prefix frontend install` / `npm --prefix backend install` if dependencies are missing.
- If using `npm ci`, run it in the affected package directory and ensure the corresponding `package-lock.json` is present and in sync.

### Frontend cannot reach the API

- Confirm the backend is running at the configured API host and that `NEXT_PUBLIC_API_URL` includes the `/api/v1` prefix.
- Confirm `FRONTEND_URL` matches the browser origin (including scheme and port) allowed by backend CORS.
- Restart the frontend after changing `NEXT_PUBLIC_API_URL`; it is read during the frontend build/runtime configuration.
- Check `GET /api/v1/health`, then `GET /api/v1/health/ready` to distinguish an API availability issue from a MongoDB readiness issue.
