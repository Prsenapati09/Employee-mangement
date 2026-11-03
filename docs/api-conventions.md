# API conventions

- Prefix API endpoints with `/api/v1`.
- Use JSON for request and response bodies.
- Return successful responses in the form `{ "success": true, "data": ... }`.
- Return errors in the form `{ "success": false, "error": { "message": "..." } }`.
- Route unmatched requests through the centralized 404 middleware and unexpected errors through the centralized error handler.
- Validate future request inputs with Zod before they reach feature logic.

`GET /api/v1/health` is an application liveness check and returns `{ "success": true, "data": { "status": "ok" } }`. `GET /api/v1/health/ready` is a database readiness check; it returns 200 when MongoDB is connected and 503 otherwise.

Authentication routes are under `/api/v1/auth`. Owner provisioning requires a server-configured provisioning key; login requires an organization slug, email, and password and returns a short-lived opaque bearer token. Authenticated endpoints derive organization scope from the validated session, never from request data.

Non-test backend startup requires an Atlas `mongodb+srv` URI in `backend/.env` targeting the `hrmpro` database. The URI is validated without logging its value; the API does not fall back to a local MongoDB instance.
