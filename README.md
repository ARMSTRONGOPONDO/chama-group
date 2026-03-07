# chama-group

## Overview

Chama Group is a cooperative savings and loans platform with member management, savings tracking, loan underwriting, repayment history, and reporting all backed by PostgreSQL/Prisma and a responsive React/Vite frontend.

## Tech stack

- Backend: Express 5, Prisma 7 (with `PrismaPg`), PostgreSQL, JWT auth, bcrypt for passwords.
- Frontend: React + Vite, Tailwind-inspired utility classes, Recharts for analytics, and shared UI primitives for cards, tables, forms, etc.
- Security: `helmet`, CORS origin whitelist, and rate limiting guard the API surface.

## Getting started

1. Install dependencies at the repository root, backend, and frontend if needed:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Create a `.env` file inside `backend/` with the following values (adjust host/creds):
   ```env
   DATABASE_URL="postgresql://chama_user:1234@localhost:5432/chama_group"
   DATABASE_SHADOW_URL="postgresql://postgres:1234@localhost:5432/chama_group_shadow"
   JWT_SECRET="your-super-secret"
   CORS_ORIGINS="http://localhost:5173"
   RATE_LIMIT_MAX=200
   ```
3. Generate Prisma client & run migrations:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Seed the admin user (per scripts/createAdmin.ts) and start the backend:
   ```bash
   npm run dev
   ```
5. Run the React frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Security posture

- Requests pass through `helmet` for secure headers, `express-rate-limit` (default 150 requests per 15 minutes) to limit brute-force attempts, and CORS origins are configurable via `CORS_ORIGINS`.
- Auth uses JWTs signed with `JWT_SECRET`, password storage via `bcryptjs` (12 rounds), and role-based guards ensure members only access permitted resources.
- Date inputs on both savings and loans only allow today/future dates, preventing backdating from the UI.

## Database notes

- Prisma schema lives in `backend/prisma/schema.prisma`; migrations are under `backend/prisma/migrations` (auto-created with `npx prisma migrate dev --name init`).
- The `scripts/createAdmin.ts` script seeds an admin user (`phone: 0700000000`, `password: Chama@1234`). Run it after migrations if you need credentials.

## Frontend responsiveness

- Pages like Savings, Members, Loans, Reports, and Dashboard now render compact cards/lists on `sm` screens while preserving tables on larger screens, ensuring a touch-friendly experience for mobile-first users.
- Alerts surface backend error messages verbatim, and API helpers refresh tokens on 401s.

## Running checks

- Backend lint/tests: not set up yet (you can add `npm run test` once coverage exists).
- Frontend formatting: rely on Vite defaults; run `npm run test`/`npm run build` from `frontend/` to validate once configured.
