# HRMPro

HRMPro is the foundation for an employee management system. This repository currently contains the initial frontend and backend setup only; employee management and other business features are not implemented.

## Technology

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, ESLint
- Backend: Node.js, Express, TypeScript, MongoDB/Mongoose, Zod
- Middleware: Helmet, CORS, Morgan, dotenv
- API clients for future work: Postman and Bruno

## Prerequisites

- Node.js 20.9 or later
- npm

## Install

From the repository root, install each package:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

Copy `frontend/.env.example` to `frontend/.env.local` and `backend/.env.example` to `backend/.env`, then set the values for your local environment. A MongoDB URI is optional for this setup; the server does not connect to MongoDB automatically.

## Run

Run both development servers from the root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:frontend
npm run dev:backend
```

The frontend is available at http://localhost:3000 and the backend defaults to http://localhost:4000.

## Useful commands

```bash
npm run build
npm run lint
```

## API

The only initial endpoint is `GET /api/v1/health`. It returns a JSON success response and does not access the database.

## Project layout

- `frontend/` — Next.js application and reserved UI/feature directories
- `backend/` — Express application, configuration, middleware, and reserved feature modules
- `docs/` — architecture, directory plan, and API conventions

See [docs/folder-structure.md](docs/folder-structure.md) for the planned layout.

## API client workflow

Postman and Bruno directories are prepared under `backend/`. In later phases, use either client to maintain environment-specific API URLs and exercise versioned API requests. No collections or feature requests are included yet.
