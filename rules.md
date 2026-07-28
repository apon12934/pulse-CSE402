# Development Rules & AI Boundaries

**Core Engineering Standards:**
*   **Language:** Enforce strict TypeScript for all web and backend development. Avoid `any` types.
*   **Styling:** Use Tailwind CSS exclusively for the web frontend. 
*   **Database:** All database interactions must route through Prisma ORM. Do not write raw SQL unless absolutely necessary for complex joins.

**UI Kernel Standards:**
*   **Consume, Never Recreate:** Every interactive UI element (dropdown, modal, tooltip, button, input, toast, etc.) must be imported from `/packages/ui`. Page-level code must never reimplement or duplicate a primitive.
*   **Variant-Only Styling:** Visual differences between instances of a primitive must be expressed through variant props, not through inline styles, `className` overrides, or wrapper hacks. If a new visual need arises, add a variant to the kernel component.
*   **Centralized Animations:** All hover effects, focus rings, transitions, and micro-animations are defined in the kernel's shared CSS/animation tokens. No page may define its own `@keyframes` or transition overrides for kernel primitives.
*   **Composition Pattern:** Complex UI blocks (e.g., a task row) must be assembled by composing kernel primitives, not by building monolithic custom components with embedded styling.

**Strict Anti-Patterns (What to Avoid):**
*   **No Media in Database:** Never store BLOBs or image data in TiDB. Always upload to Cloudinary and store the secure URL string.
*   **No Monoliths:** Keep backend API endpoints stateless. Abstract business logic into controllers and services.
*   **No Third-Party Auth:** Handle JWT generation and validation internally within the API to prevent vendor lock-in and ensure the Android app can consume the exact same endpoints.

**AI Workflow Constraints (For Antigravity):**
*   Always check `memory.md` before generating code to understand the current build phase.
*   Update `memory.md` immediately upon completing a major feature or phase.
*   Do not hallucinate external npm packages; strictly use what is defined in `package.json`.

**Git & Version Control Workflow (Mandatory):**
*   **When to Commit:** Automatically stage, commit, and push your work to the `origin main` branch immediately after completing a major feature, fixing a critical bug, or finishing a Phase. Do not wait for the user to prompt you to save.
*   **Commit Style:** Write short, natural, human-like commit messages. 
    *   *Good:* "wired up the jwt auth middleware" or "fixed the prisma config bug"
    *   *Bad:* "Implemented Authentication Middleware Feature Set v1.0" or "Refactored Database Connection Logic"