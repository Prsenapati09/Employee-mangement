# Backend

Versioned Express API written in TypeScript. The only implemented endpoint is `GET /api/v1/health`. Security headers, CORS, request logging, JSON 404 handling, centralized errors, and validated environment configuration are in place. Authentication, employee CRUD, and other business logic are not implemented.

Copy `.env.example` to `.env` and configure the required values. MongoDB connection support is prepared but not automatically invoked; no database connection occurs at startup.

Run `npm run dev`, `npm run build`, `npm run lint`, or `npm start` from this directory. Root scripts are also available from the repository root.

## Database setup

`src/config/database.ts` exports a connection function for a later integration phase. Set `MONGODB_URI` before calling it; this foundation intentionally does not connect on server startup.
