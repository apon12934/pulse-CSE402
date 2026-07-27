# Project State & Working Memory

**Current Status:**
*   ✅ **Phase 1 COMPLETE** — Monorepo Foundation & Database Schema.
*   Turborepo monorepo initialized with npm workspaces.
*   Workspaces operational: `@pulse/web` (Next.js 16), `@pulse/api` (Express 5), `@pulse/ui` (UI Kernel), `@pulse/types` (shared types), `apps/android` (placeholder).
*   Prisma schema defined and validated — 4 models (User, Task, TaskBlock, DailyRoutine) with enums, indexes, and relational constraints.
*   TiDB Serverless connection template ready in `apps/api/.env.example`.
*   Turbo build pipeline verified — dependency graph resolves correctly across all 4 packages.

**Next Immediate Action:**
*   Execute Phase 2: Authentication & Core API — Build the Express server routes, implement user registration/login, secure JWT middleware, and create CRUD endpoints for Anchors and Fluid Blocks.

**Key Decisions Locked:**
*   Package manager: npm (with workspaces).
*   Turbo v2 task syntax (not legacy `pipeline`).
*   Express 5 (native async/await error handling).
*   Prisma with `mysql` provider for TiDB Serverless.
*   Snake_case table/column mapping via `@@map` / `@map`.
*   UI Kernel in `/packages/ui` with centralized CSS design tokens.

*(Note to AI Agent: Continuously update this block as you complete files and hit milestones. Never start a new phase without marking the previous one complete.)*