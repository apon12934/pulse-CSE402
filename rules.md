# Development Rules & AI Boundaries

**Core Engineering Standards:**
*   **Language:** Enforce strict TypeScript for all web and backend development. Avoid `any` types.
*   **Styling:** Use Tailwind CSS exclusively for the web frontend. 
*   **Database:** All database interactions must route through Prisma ORM. Do not write raw SQL unless absolutely necessary for complex joins.

**Strict Anti-Patterns (What to Avoid):**
*   **No Media in Database:** Never store BLOBs or image data in TiDB. Always upload to Cloudinary and store the secure URL string.
*   **No Monoliths:** Keep backend API endpoints stateless. Abstract business logic into controllers and services.
*   **No Third-Party Auth:** Handle JWT generation and validation internally within the API to prevent vendor lock-in and ensure the Android app can consume the exact same endpoints.

**AI Workflow Constraints (For Antigravity):**
*   Always check `memory.md` before generating code to understand the current build phase.
*   Update `memory.md` immediately upon completing a major feature or phase.
*   Do not hallucinate external npm packages; strictly use what is defined in `package.json`.