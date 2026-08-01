# Project State & Working Memory

**Current Status:**
*   ✅ **Phase 1 COMPLETE** — Monorepo Foundation & Database Schema.
*   ✅ **Phase 2 COMPLETE** — Authentication & Core API.
*   ✅ **Phase 3 COMPLETE** — The Gemini AI Engine.
*   ✅ **Phase 4A COMPLETE** — UI Kernel (Component Library).
*   ✅ **Phase 4B COMPLETE** — Web UI & Execution Tracking.
*   Full Next.js dashboard built by exclusively composing `@pulse/ui` primitives.
*   Global persistent layout with sticky header and left sidebar.
*   Four core routes: Dashboard (`/`), Timeline (`/timeline`), Analytics (`/analytics`), Settings (`/settings`).
*   Configured `@/*` and `@pulse/web/*` path aliases.

**Next Immediate Action:**
*   Execute Phase 5: Native Android Expansion (Future) — Consume API endpoints in a native Kotlin environment with local Room database caching.

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

**[2026-07-28] [Antigravity / Gemini 3.1 Pro] Phase 4B: Web UI & Execution Tracking (Completed)**
*   Composed the full-screen SaaS web application using Next.js App Router.
*   Built persistent layout shell (`layout.tsx`, `Header.tsx`, `Sidebar.tsx`) with zero dead whitespace and pure black backgrounds.
*   Built the Main Dashboard (`/`) featuring the Active Task timer, Upcoming Pipeline, and Gemini Core AI Chat Panel.
*   Built the Timeline Manager (`/timeline`) with a vertical time-blocking grid.
*   Built the Analytics View (`/analytics`) with KPI cards and a CSS-based planned vs actual time allocation bar chart.
*   Built the Settings & Profile (`/settings`) page for AI strategy configuration and integrations.
*   Created a strongly-typed API client wrapper (`lib/api.ts`) for JWT management and backend communication.
*   *Developer Note:* Replaced `.js` extensions in `@pulse/ui` exports to fix Next.js Turbopack source resolution issues. Added `@/*` path alias to the web app's `tsconfig.json`.

**[2026-07-28] [Antigravity / Claude Opus 4.6] Phase 4B Refinement: Screenshot-Matched UI Rebuild**
*   Rebuilt all shell components (Header, Sidebar, Layout) to match verified UI screenshots pixel-for-pixel.
*   Sidebar redesigned: "AI CORE / V2.4 STATUS: ACTIVE" branding, 5 nav items (DASHBOARD, TIMELINE, ANALYTICS, CHAT, CONFIG) with lucide-react icons.
*   Dashboard rebuilt: blinking cursor, "CURRENT FOCUS BLOCK" MM:SS countdown timer (24:58), minimal pipeline rows with ANCHOR/FLUID badges and lock/drag icons, GEMINI CORE chat panel with timestamped messages.
*   Analytics rebuilt: PULSE ANALYTICS MODULE top bar, 3 KPI cards (Execution Rate 92%, Domino Triggers 3, Peak Flow State), PLANNED VS ACTUAL allocation bar chart, SYSTEM INSIGHT card with APPLY CALIBRATION CTA.
*   Config page created: IDENTITY.SYS profile card, INTEGRATION_PARAMS (Gemini API key + auto-reschedule strategy), SYNC_PROTOCOLS section, SAVE CONFIGURATIONS button.
*   Added `/chat` route (full-page Gemini Core view) and `/config` route (replaced `/settings`).
*   Installed `lucide-react` for consistent iconography across all pages.

**[2026-07-28] [Antigravity / Gemini 3.1 Pro] Phase 4C: Frontend API Wiring**
*   Introduced `zustand` to manage global authentication state (`user`, `token`, `isLoading`).
*   Created `ProtectedRoute` wrapper and a unified `/login` & registration view.
*   Wired Dashboard (`page.tsx`) to fetch daily tasks from `/api/tasks` and cascade them down to `ActiveTask.tsx` (using real countdown mechanics to the `endTime`) and `UpcomingPipeline.tsx`.
*   Wired `Timeline` view to fetch scheduled blocks from the API and connected the "GENERATE AI ROUTINE" button to `/api/schedule/generate`.
*   Wired `AiChatPanel.tsx` and the full `/chat` route to send directives to `/api/schedule/chat`, maintaining local message state.
*   Wired Config page (`/config`) to use `localStorage` for Gemini API Key and Reschedule strategy persistence pending future DB migrations.

**[2026-07-28] [Antigravity / Gemini 3.1 Pro] Database Migration & User Config Refactor**
*   Updated `User` model in `schema.prisma` to include `geminiApiKey` and `rescheduleStrategy`. Generated new Prisma Client.
*   Added `PATCH /api/user/profile` endpoint in the Express backend, backed by Zod validation, to securely update user preferences.
*   Refactored the `/api/auth/me` and `/api/auth/login` endpoints to return these new fields during hydration.
*   Updated the `useAuthStore` User interface and refactored `/config/page.tsx` to save and read settings via the DB rather than `localStorage`.

**[2026-08-01] [Antigravity / Gemini 3.1 Pro] Roadmap Adjustment**
*   **Decision:** Phase 5 (Native Android Expansion) is officially placed on hold. We will focus entirely on polishing and ensuring the web version is 100% fully functional before touching the mobile app codebase.