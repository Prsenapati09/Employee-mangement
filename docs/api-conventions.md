# API conventions

- Prefix API endpoints with `/api/v1`.
- Use JSON for request and response bodies.
- Return successful responses in the form `{ "success": true, "data": ... }`.
- Return errors in the form `{ "success": false, "error": { "message": "..." } }`.
- Route unmatched requests through the centralized 404 middleware and unexpected errors through the centralized error handler.
- Validate future request inputs with Zod before they reach feature logic.

The initial `GET /api/v1/health` endpoint returns `{ "success": true, "data": { "status": "ok" } }`.
