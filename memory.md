# Project State & Working Memory

**Current Status:**
*   ✅ **Phase 1 COMPLETE** — Monorepo Foundation & Database Schema.
*   ✅ **Phase 2 COMPLETE** — Authentication & Core API.
*   ✅ **Phase 3 COMPLETE** — The Gemini AI Engine.
*   Gemini 2.5 Flash integrated with three prompt pipelines: schedule generation, domino rescheduling, and chat parsing.
*   Structured JSON output mode enforced on all AI calls (temperature 0.2).
*   Energy-level optimization baked into scheduling prompts.

**Next Immediate Action:**
*   Execute Phase 4A: UI Kernel — Build the shared component library in `/packages/ui`.

**Key Decisions Locked:**
*   Package manager: npm (with workspaces).
*   Turbo v2 task syntax (not legacy `pipeline`).
*   Express 5 (native async/await error handling).
*   Prisma 7 with `@prisma/adapter-mariadb` driver adapter.
*   Snake_case table/column mapping via `@@map` / `@map`.
*   UI Kernel in `/packages/ui` with centralized CSS design tokens.
*   JWT secret via `JWT_SECRET` env var, 7-day token expiry.
*   Zod for input validation.
*   Gemini 2.5 Flash for AI scheduling, `@google/genai` SDK.

**API Endpoints Built:**
*   `POST /api/auth/register` — Create account, return JWT.
*   `POST /api/auth/login` — Verify credentials, return JWT.
*   `GET  /api/auth/me` — Authenticated user profile.
*   `POST /api/tasks` — Create task (Anchor or Fluid).
*   `GET  /api/tasks` — List tasks (filterable by status, type, date).
*   `GET  /api/tasks/:id` — Get single task.
*   `PATCH /api/tasks/:id` — Update task.
*   `DELETE /api/tasks/:id` — Delete task.
*   `POST /api/schedule/generate` — AI-powered daily schedule generation.
*   `POST /api/schedule/reschedule` — Domino-effect rescheduler (task overrun).
*   `POST /api/schedule/chat` — Natural language → structured tasks.

*(Note to AI Agent: Continuously update this block as you complete files and hit milestones. Never start a new phase without marking the previous one complete.)*