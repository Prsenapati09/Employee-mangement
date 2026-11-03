# Backend

Versioned Express API written in TypeScript. The implemented operational endpoints are `GET /api/v1/health` and `GET /api/v1/health/ready`. Security headers, CORS, request logging, JSON 404 handling, centralized errors, and validated environment configuration are in place. Authentication, employee CRUD, and other business logic are not implemented.

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
