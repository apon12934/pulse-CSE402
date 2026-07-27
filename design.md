# Design System & UI Architecture (Tailwind CSS)

**1. Core Philosophy**
*   **Aesthetic:** Swiss international design, high-tech minimalism, and extreme focus.
*   **Structure:** Complex, highly structured typographic grids. Avoid plain layouts and standard centered boilerplate designs.
*   **Visual Treatment:** Hard masking and sharp edges for components. Absolutely no soft masking, heavy drop shadows, or distracting decorative gradients.

**2. Color Palette & Theme**
*   **Base Theme:** Native Dark Mode (High-contrast, developer-friendly).
*   **Backgrounds:** 
    *   Primary App Canvas: Pitch Black (`bg-black` / `#000000`) to eliminate screen bleed and reduce eye strain.
    *   Cards/Containers: Dark Slate/Charcoal (`bg-neutral-900` / `#121212`).
*   **Primary Accent:** Electric Yellow (`text-yellow-400` / `bg-yellow-400`). Used *exclusively* for the active execution timer, the "Need More Time" trigger, active navigation links, and the AI chat send button.
*   **Secondary/Muted Accents:** Dark grays (`text-neutral-500`) for locked Anchor tasks and inactive UI elements to push them down the visual hierarchy.

**3. Typography**
*   **Font Families:** Inter or Roboto (sans-serif) for high legibility at small sizes, paired with a display font for the timer.
*   **Hierarchy:** 
    *   Massive, bold font-weights for the active focus timer.
    *   Monospaced fonts for technical data (like API keys in settings and log timestamps).
    *   Subtle, muted text for upcoming tasks in the pipeline.

**4. Global Layout Components**
*   **Application Shell:** Must stretch to `100vh` and `100vw` with no dead whitespace at the bottom.
*   **Persistent Header:** A global sticky top navigation bar present across ALL routes (Dashboard, Timeline, Analytics, Settings). 
    *   Contains the Pulse Logo (left), `LOW | MED | HIGH` energy toggle (center), and User Profile Pill (right).
*   **Sidebar Navigation:** Left-aligned, compact, using clean iconography.

**5. Task Visualization Rules (The Grid)**
*   **Anchors (Fixed):** Rendered with solid 1px borders, muted text, and a locked padlock icon.
*   **Fluid Blocks (AI Scheduled):** Rendered with glowing or dashed yellow border treatments and a draggable grip icon to indicate AI flexibility.

**6. Micro-Interactions**
*   Use skeleton loaders during AI recalculations (the "Domino Effect" trigger) instead of freezing the UI.
*   Buttons should have sharp, immediate hover states rather than soft, prolonged transitions.