# App Flow & Architecture
API-First decoupled architecture using a Monorepo strategy (Turborepo). The backend acts as the single source of truth, serving stateless RESTful JSON endpoints to both the web client and the future native Android client.

**Monorepo Folder Structure:**
*   `/apps/api`: Node.js / Express backend (API Gateway).
*   `/apps/web`: Next.js web frontend.
*   `/apps/android`: Native Kotlin project (for Antigravity Android deployment).
*   `/packages/types`: Shared TypeScript definitions across the JS/TS ecosystem.

**Tech Stack:**
*   **Backend:** Node.js with Express (TypeScript). Hosted on Render (Hobby tier).
*   **Frontend (Web):** Next.js (React) for routing and UI. Hosted on Vercel.
*   **Database:** TiDB Serverless (MySQL) utilizing Prisma ORM.
*   **Media Storage:** Cloudinary (Zero-budget image hosting via signed backend URLs).
*   **Mobile (Future):** Native Kotlin utilizing Android Architecture Components (Room, WorkManager).