# Project Name: Pulse
**Concept:** An AI-Driven Dynamic Routine & Execution Tracker.
**Core Problem:** The "execution gap." Static schedules break when tasks overrun, causing users to abandon their daily plans. Pulse acts as an active AI assistant that absorbs delays and recalculates routines in real time.
**Target Users:** University students, freelancers, and early-career professionals managing multiple roles with a mix of fixed and flexible commitments.

**Core Features:**
*   **User Accounts & Authentication:** Secure, multi-tenant architecture utilizing stateless JWTs. Every user maintains an isolated environment for their routines and history.
*   **Intelligent Hybrid Scheduling:** The system strictly separates tasks into "Anchors" (immovable events like classes) and "Fluid Blocks" (flexible tasks). The Gemini AI API dynamically slots Fluid Blocks into the gaps.
*   **"Domino Effect" Auto-Rescheduler:** A core UI trigger ("Need More Time"). If a task runs long, the AI recalculates the rest of the day instantly, trimming breaks or pushing low-priority tasks back.
*   **Energy-Level Optimization:** Users report their current energy state via chat. The AI dynamically schedules high-focus tasks during peak energy windows and low-friction tasks during slumps.
*   **Active Execution Tracking:** High-visibility countdown timers to eliminate distractions and maintain focus on the active task.

**Future Mobile Vision:**
*   The system will eventually include a fully native Kotlin Android application to handle persistent lock-screen notifications, home-screen widgets, and offline database caching for viewing schedule status without an internet connection.