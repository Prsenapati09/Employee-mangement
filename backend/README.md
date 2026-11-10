# Backend

Versioned Express API written in TypeScript. It provides authentication and password recovery, owner provisioning, employee invitations, employee and department CRUD, team-scoped attendance and leave operations, user/organization settings, private employee documents, and MongoDB-backed HR reports. Security headers, origin-restricted CORS, privacy-safe request logging, JSON 404 handling, centralized errors, and validated environment configuration are enabled.

Configure `MONGODB_URI` in `backend/.env` with the MongoDB Atlas SRV connection string targeting the `hrmpro` database. Non-test startup rejects local MongoDB URIs and connects to Atlas before listening; startup errors are sanitized. `GET /api/v1/health` remains an application liveness check; `/api/v1/health/ready` returns 200 only when MongoDB is connected and 503 otherwise. MongoDB credentials belong only in the ignored `.env` file, never in source control.

Run `npm run dev`, `npm run build`, `npm run lint`, or `npm start` from this directory. Root scripts are also available from the repository root.

## Database setup

### MongoDB Atlas setup

1. In the MongoDB Atlas dashboard, create or select your project and create a cluster.
2. Under **Database Access**, create a database user with a strong password. Grant only the database permissions required by the application; do not use your Atlas account password.
3. Under **Network Access**, choose **Add IP Address → Add Current IP Address** to allow the development machine's current public IP. If the public IP changes, update this access-list entry. Avoid opening access to `0.0.0.0/0`.
4. Choose **Connect → Drivers**, select Node.js, and copy Atlas's connection string.
5. Copy `.env.example` to `.env` in the backend directory. Replace the username, password, and cluster-host placeholders with the values from Atlas. Keep `/hrmpro` as the database path. URL-encode reserved characters in the database password as required by Atlas.
6. Keep `.env` private; it is ignored by Git. Never paste the URI into source files, commits, chat, or logs.
7. From `backend`, run `npm run dev`. The server connects before listening. Verify `GET http://localhost:4000/api/v1/health` returns 200 and `GET http://localhost:4000/api/v1/health/ready` returns 200 with the database connected. If configuration or connection fails, the server exits without printing the URI.

Non-test startup requires an Atlas `mongodb+srv` URI whose database path is `hrmpro`; it does not fall back to local MongoDB. The server closes its HTTP listener and MongoDB connection on `SIGINT` or `SIGTERM`.

## Authentication

- `POST /api/v1/auth/register-owner` provisions a new organization and its first owner. It requires the `x-owner-provisioning-key` header matching `OWNER_PROVISIONING_SECRET`; configure a random secret of at least 32 characters in `.env`. This endpoint does not accept a role or organization ID from the caller.
- `POST /api/v1/auth/login` accepts `{ "organizationSlug": "...", "email": "...", "password": "..." }`. It returns an opaque access token and expiry; credentials are checked within the selected active organization.
- `GET /api/v1/auth/me` returns the authenticated user and organization profile. Send `Authorization: Bearer <accessToken>`.
- `POST /api/v1/auth/logout` revokes the presented access token.

Passwords are stored as scrypt hashes. Access tokens expire after 15 minutes; only their SHA-256 hashes are stored. No refresh tokens are implemented. Keep the provisioning secret private and rotate it if exposed.

## Roles and data access

- Owners and admins can update organization names and manage account status. Neither can change their own status or change a user's role through these APIs; admins cannot manage owner/admin accounts.
- HR manages employee records, departments, attendance, leave administration, and documents.
- Managers must have a linked employee profile with a department. Employee, attendance, department, document, and leave reads are limited to that department; managers can review team leave requests but cannot change organization-wide records.
- Employee accounts can access their linked employee profile, own attendance and leave requests, and own documents. They cannot enumerate or read another employee's private records.
- Every business query is scoped to the authenticated organization. Role checks are enforced on the API and are not dependent on frontend navigation.

## Invitations, reports, and documents

Employee invitation links use random 256-bit secrets; only token hashes are persisted. Tokens expire after 24 hours, acceptance is transactional, duplicate accounts and cross-organization links are rejected, and an invitation is removed if delivery fails. Configure `SMTP_USER` and `SMTP_APP_PASSWORD` to send email. Without SMTP, email-dependent operations report delivery failure rather than pretending that a message was sent.

`GET /api/v1/reports/summary` returns employee, department, attendance, leave approval, and joining-trend aggregates from MongoDB. Optional `from` and `to` query parameters use `YYYY-MM-DD`; report access is limited to owners, admins, and HR.

Documents are uploaded as `application/octet-stream` to authenticated `/api/v1/documents/employees/:employeeId` endpoints with `X-Document-Filename`, `X-Document-Content-Type`, and `X-Document-Category` headers. The local adapter accepts PDF, PNG, JPEG, and plain text files up to 5 MB, verifies file signatures, stores generated filenames outside public assets, and serves downloads only after organization/employee authorization. Set `DOCUMENT_STORAGE_DIR` to a persistent private directory for local deployments. Replace `modules/documents/local-document-storage.ts` with a managed private-storage adapter before deploying multiple API instances or using ephemeral hosting.

## Tests

`npm test` runs MongoDB integration tests. Configure a reachable `MONGODB_URI`; the test suite creates and drops a uniquely named test database, so use a database account with permission to create and drop databases. Email delivery tests inject success/failure outcomes and do not verify external SMTP credentials.
