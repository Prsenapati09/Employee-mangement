# Architecture

HRMPro is organized as two independently configured applications in one repository. The frontend is a Next.js App Router application; the backend is a versioned Express API. The root npm scripts coordinate development without a monorepo framework.

## Boundaries

- `frontend/src/app/` owns route entry points and shared application layout.
- `frontend/src/components/`, `features/`, and `lib/` reserve shared UI, domain UI, and reusable utilities.
- `backend/src/routes/` composes versioned routes. Feature-specific code is reserved under `backend/src/modules/`.
- `backend/src/config/` holds environment, CORS, and database configuration.
- Backend middleware provides security headers, request logging, JSON 404 responses, and centralized error responses.

The database connection module is prepared for later use but is not called during application startup. Business modules and user-facing business workflows have not been implemented.
