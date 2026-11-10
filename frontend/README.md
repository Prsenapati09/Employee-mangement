# Frontend

Next.js App Router application with TypeScript, Tailwind CSS, and ESLint. The UI provides marketing pages, authentication and recovery forms, invitation acceptance, role-aware employee/department/attendance/leave workflows, private document uploads/downloads, organization settings, and live report cards.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` if the backend URL differs from its local default. API authorization remains enforced by the backend; hiding a page action is not treated as an access control.

Run `npm run dev`, `npm run build`, `npm run lint`, or `npm run typecheck` from this directory. Root scripts are also available from the repository root.
