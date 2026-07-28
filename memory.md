# Project State & Working Memory

**Current Status:**
*   ✅ **Phase 1 COMPLETE** — Monorepo Foundation & Database Schema.
*   ✅ **Phase 2 COMPLETE** — Authentication & Core API.
*   ✅ **Phase 3 COMPLETE** — The Gemini AI Engine.
*   ✅ **Phase 4A COMPLETE** — UI Kernel (Component Library).
*   Tailwind v4 design tokens configured from DESIGN.md (Kinetic Precision).
*   Four kernel primitives built: Button, Input, Card, StatusChip.
*   Centralized kernel.css with Swiss International Style tokens and animations.

**Next Immediate Action:**
*   Execute Phase 4B: Web UI & Execution Tracking — Build the Next.js dashboard composing from `/packages/ui`.

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

---

## 📜 Execution History & Changelog
*(Note to AI Agent: NEVER delete from this section. ONLY append new entries chronologically. Every entry MUST begin with the current date and your specific model version. This is the permanent historical context.)*

**[2026-07-28] [Antigravity / Gemini 1.5 Pro] Phase 1: Monorepo Foundation (Completed)**
*   Scaffolded Turborepo v2 with `apps/api`, `apps/web`, `apps/android`, `packages/ui`, and `packages/types`.
*   *Developer Note/Pivot:* Prisma 7 required a shift from schema-based `DATABASE_URL` to using `prisma.config.ts`. Adapted architecture to support the new Prisma 7 configuration model and successfully deployed the schema to TiDB Serverless.
*   Implemented strict CUIDs for database primary keys to ensure clean routing later.

**[2026-07-28] [Antigravity / Gemini 1.5 Pro] Phase 2: Authentication & Core API (Completed)**
*   Built Express 5 server with stateless JWT authentication (7-day expiry).
*   Established standard AppError pattern for global, structured JSON error handling.
*   *Developer Note:* Ensured all CRUD operations on the `tasks` endpoints are strictly scoped to the authenticated `userId` extracted from the JWT middleware.
*   Integrated Zod for robust input validation on all mutation endpoints.

**[2026-07-28] [Antigravity / Gemini 1.5 Pro] Phase 3: The Gemini AI Engine (Completed)**
*   Integrated Gemini 2.5 Flash via the `@google/genai` SDK.
*   Engineered three distinct prompt pipelines: Schedule Generation, Domino Rescheduling, and Chat Parsing.
*   *Developer Note:* Enforced structured JSON output mode with a low temperature (`0.2`) across all AI calls to guarantee deterministic, machine-readable data structures for the frontend.
*   Successfully baked energy-level optimization parameters into the core scheduling prompts.

**[2026-07-28] [Antigravity / Claude Opus 4.6] Phase 4A: UI Kernel (Completed)**
*   Configured Tailwind v4 `@theme` with full Kinetic Precision design tokens — colors, fonts, transitions, animations.
*   Built four kernel primitives: `Button` (4 variants), `Input` (2 variants + error state), `Card` (with header rule + elevated), `StatusChip` (5 status colors + 6px dot indicator).
*   Created `cn` utility (clsx + tailwind-merge) as the only sanctioned class composition method.
*   *Developer Note:* All components enforce 0px border-radius, use color inversion for hover/press (no opacity shifts), and JetBrains Mono for all labels/metadata per the Swiss International Style spec.