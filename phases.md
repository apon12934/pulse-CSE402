# Execution Roadmap

*   **Phase 1: Monorepo Foundation & Database**
    *   Initialize the Turborepo structure (`apps/api`, `apps/web`, `apps/android`).
    *   Set up the TiDB Serverless instance and connect it to Prisma.
    *   Define the core database schema (Users, Tasks, Task_Blocks, Daily_Routines).
*   **Phase 2: Authentication & Core API**
    *   Build the Node.js/Express server.
    *   Implement user registration, login, and secure JWT middleware.
    *   Create CRUD endpoints for managing Anchors and Fluid Blocks.
*   **Phase 3: The Gemini AI Engine**
    *   Integrate the Gemini API service adapter into the backend.
    *   Write the system prompts to parse user chat input (energy levels, flexible goals).
    *   Implement the scheduling algorithm to generate the initial daily timeline.
*   **Phase 4A: UI Kernel (Component Library)**
    *   Build the `/packages/ui` shared component library housing all primitives (Button, Dropdown, Modal, Tooltip, TextInput, Card, Toast, ProgressBar, StatusBadge, etc.).
    *   Define centralized animation tokens, hover/focus/press interaction patterns, and transition curves.
    *   Ensure every primitive exposes a variant-driven API — no visual customization outside the kernel.
*   **Phase 4B: Web UI & Execution Tracking**
    *   Build the Next.js frontend dashboard by composing exclusively from `/packages/ui` primitives.
    *   Implement the active task countdown timer using kernel animation standards.
    *   Wire up the "Need More Time" button to trigger the backend "Domino Effect" recalculation route.
    *   Zero inline style overrides on kernel components in page-level code.
*   **Phase 5: Native Android Expansion (Future)**
    *   Consume the existing Node.js API endpoints in the native Kotlin environment.
    *   Implement local Room database caching and background services for lock-screen execution tracking.