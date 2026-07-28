# Project State & Working Memory

**Current Status:**
*   ✅ **Phase 1 COMPLETE** — Monorepo Foundation & Database Schema.
*   ✅ **Phase 2 COMPLETE** — Authentication & Core API.
*   Stateless JWT auth (7-day expiry) with bcrypt password hashing (12 rounds).
*   Modular controller/route/middleware architecture in `apps/api/src`.
*   Zod request validation on all mutation endpoints.
*   Full CRUD for tasks (scoped to authenticated userId) with query filters.
*   Global error handler with structured JSON responses (AppError pattern).
*   Prisma 7 + MariaDB driver adapter for TiDB Serverless connectivity.

**Next Immediate Action:**
*   Execute Phase 3: The Gemini AI Engine — Integrate Gemini API, build the scheduling algorithm, and implement the "Domino Effect" rescheduler.

**Key Decisions Locked:**
*   Package manager: npm (with workspaces).
*   Turbo v2 task syntax (not legacy `pipeline`).
*   Express 5 (native async/await error handling).
*   Prisma 7 with `@prisma/adapter-mariadb` driver adapter (not legacy `prisma-client-js`).
*   Snake_case table/column mapping via `@@map` / `@map`.
*   UI Kernel in `/packages/ui` with centralized CSS design tokens.
*   JWT secret via `JWT_SECRET` env var, 7-day token expiry.
*   Zod for input validation (not class-validator or joi).

**API Endpoints Built:**
*   `POST /api/auth/register` — Create account, return JWT.
*   `POST /api/auth/login` — Verify credentials, return JWT.
*   `GET  /api/auth/me` — Authenticated user profile.
*   `POST /api/tasks` — Create task (Anchor or Fluid).
*   `GET  /api/tasks` — List tasks (filterable by status, type, date).
*   `GET  /api/tasks/:id` — Get single task.
*   `PATCH /api/tasks/:id` — Update task.
*   `DELETE /api/tasks/:id` — Delete task.

*(Note to AI Agent: Continuously update this block as you complete files and hit milestones. Never start a new phase without marking the previous one complete.)*