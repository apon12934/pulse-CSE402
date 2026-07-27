---
name: Kinetic Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cac8aa'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#939277'
  outline-variant: '#484831'
  surface-tint: '#cdcd00'
  primary: '#ffffff'
  on-primary: '#323200'
  primary-container: '#eaea00'
  on-primary-container: '#686800'
  inverse-primary: '#626200'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#303030'
  tertiary-container: '#e4e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaea00'
  primary-fixed-dim: '#cdcd00'
  on-primary-fixed: '#1d1d00'
  on-primary-fixed-variant: '#494900'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e4e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
spacing:
  unit: 4px
  container-padding: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-gap-sm: 8px
  stack-gap-md: 24px
  stack-gap-lg: 48px
---

## Brand & Style

The design system is built upon the principles of the Swiss International Style, adapted for a high-performance AI execution context. It prioritizes clarity, objective functionality, and a rigorous mathematical grid. The aesthetic is "High-Tech Minimalist"—avoiding decorative flourishes in favor of structural integrity and information density.

The brand persona is authoritative, efficient, and precise. It evokes an emotional response of "controlled power." By utilizing a restricted color palette and stark contrast, the UI disappears to let the AI-driven data and execution paths take center stage. The visual language uses sharp edges and distinct modules to communicate that every element serves a logical purpose.

## Colors

The palette is strictly functional, utilizing high-contrast relationships to guide the eye toward "Pulse" points—active AI processes and primary calls to action.

- **Backgrounds:** Pure Black (#000000) serves as the canvas. Dark Charcoal (#121212) is used for modular containers to provide subtle depth without traditional shadows.
- **Primary Accent:** Vibrant Yellow (#FFFF00) is reserved exclusively for the most critical information, active states, and primary action buttons.
- **Typography & Details:** White (#FFFFFF) is used for primary text to ensure maximum legibility. Mid-tones and borders utilize a scale of grays to maintain a hierarchy of secondary information.
- **Status:** Functional colors (Red for error, Green for success) should be used sparingly and desaturated unless an immediate intervention is required.

## Typography

This design system employs a dual-typeface system to balance editorial impact with technical precision.

- **Primary Sans:** Inter is the workhorse. It must be used with tight letter-spacing in headlines to achieve the "Swiss" look. Large display sizes should be set with "Ink Traps" visible if possible, emphasizing the tech-forward nature.
- **Technical Mono:** JetBrains Mono is used for metadata, AI status codes, and secondary labels. This reinforces the "Assistant" persona as a tool of logic and code.
- **Hierarchy:** Use extreme scale shifts. A 72px headline next to a 12px mono label creates the tension necessary for a high-end editorial feel. All text should be strictly aligned to a baseline grid.

## Layout & Spacing

The layout is governed by a strict 12-column grid for desktop and a 4-column grid for mobile. 

- **Modular Blocks:** Content must be housed in modular units. Avoid "floating" elements; every piece of data should feel anchored to a structural line.
- **The "Rule of Lines":** Use thin (1px) solid borders (#262626) instead of white space to separate sections. This mimics architectural blueprints.
- **Alignment:** Left-alignment is the default for all editorial content. Right-alignment is reserved for data values and timestamps within technical modules.
- **Negative Space:** Use generous margins on the outer edges of the viewport to create an "inner-frame" effect, common in premium editorial design.

## Elevation & Depth

This system rejects soft shadows and "natural" lighting. Depth is communicated through **Z-axis Tonal Stacking**:

1.  **Level 0 (Floor):** #000000 (Pure Black) - The base workspace.
2.  **Level 1 (Modules):** #121212 (Dark Charcoal) - The primary containers for tools and lists.
3.  **Level 2 (Overlays/Modals):** #1A1A1A with a 1px solid border (#FFFF00 for focus, #333333 for neutral).

**Borders as Depth:** Instead of shadows, use 1px or 2px solid strokes. A stroke of #FFFF00 on a module immediately "elevates" it to the user's primary attention. No blurs or glassmorphism are permitted; clarity and sharpness are paramount.

## Shapes

The shape language is strictly **geometric and sharp**.

- **Corner Radius:** 0px. All buttons, cards, and input fields must have 90-degree angles. This reinforces the Swiss International aesthetic and the precision of the AI.
- **Icons:** Use stroke-based icons with consistent 2px weights. Do not use rounded terminals; icon ends should be butt-capped or square.
- **Visual Dividers:** Vertical and horizontal lines should be used to create clear boundaries between data points.

## Components

- **Buttons:** Primary buttons are solid #FFFF00 with #000000 text, strictly rectangular. Secondary buttons are 1px white strokes with no fill. Interaction states involve inverted colors—never opacity shifts.
- **Input Fields:** Bottom-border only or full 1px box. Focus state is a 2px #FFFF00 border. Labels must be in JetBrains Mono, placed above the input field in all-caps.
- **Status Chips:** Rectangular boxes with a 1px border. Use the Mono font. The active state is indicated by a 6px solid square of color preceding the text.
- **Cards/Modules:** Use #121212 backgrounds. Headers within cards should be separated by a 1px horizontal rule.
- **Execution Progress:** Represent AI processing using a solid, non-rounded progress bar in #FFFF00. Use stepped increments rather than smooth animations to emphasize "calculated" progress.
- **Data Grids:** High-density tables with subtle row-hover highlights (#1A1A1A). Columns must be clearly delineated by 1px vertical rules.

## Component Architecture (UI Kernel)

The UI follows an **operating-system-style architecture**. Every interactive element is a centralized primitive defined once inside `/packages/ui` and consumed across all pages and features. No page or feature may create its own ad-hoc dropdown, modal, tooltip, or button variant — all must compose from the kernel.

**Primitive Categories:**

| Category | Primitives |
|---|---|
| **Controls** | Button, IconButton, ToggleSwitch, Slider |
| **Inputs** | TextInput, TextArea, SearchField, TimeInput |
| **Selection** | Dropdown (custom), Checkbox, RadioGroup, ChipSelect |
| **Overlays** | Modal, Drawer, Tooltip, ContextMenu, Toast |
| **Feedback** | ProgressBar, Spinner, Skeleton, StatusBadge |
| **Layout** | Card, Divider, Container, Stack, Grid |
| **Navigation** | NavItem, Tabs, Breadcrumb, CommandPalette |

**Key Principles:**

1.  **Single Source of Truth:** Each primitive lives in one file. To change how every dropdown in the app looks or behaves, you edit one component — the change cascades globally.
2.  **Variant-Driven API:** Primitives expose variants via props (e.g., `<Button variant="primary" />`, `<Button variant="ghost" />`). New visual styles are added as variants, never as new components.
3.  **Composition Over Customization:** Complex UI (e.g., a task card with a timer, status chip, and action menu) is assembled by composing kernel primitives. Styles must not leak between primitives.
4.  **Zero Inline Overrides:** No `style={}` or one-off class overrides on kernel components in consuming code. If a new visual need arises, it is added as a variant or token inside the kernel itself.

## Interaction & Animation Standards

All interaction behaviors are defined centrally in the UI Kernel to guarantee identical feel across the entire application.

**Hover:**
-   **Controls & Cards:** Background shifts one elevation level up (e.g., `#121212` → `#1A1A1A`). Transition: `150ms ease-out`.
-   **Text Links / Nav Items:** Underline slides in from left via `scaleX` transform. Color shifts to `#FFFF00`.
-   **Icon Buttons:** Subtle scale pulse (`scale(1.08)`) with `120ms ease`.

**Focus:**
-   All focusable elements receive a `2px solid #FFFF00` outline with `2px offset`. Never remove the default focus ring without replacing it.

**Press / Active:**
-   Buttons invert colors on press (primary: yellow bg → black bg, white text). No opacity changes — use color inversion exclusively.
-   Scale down to `scale(0.97)` on `:active` with `80ms ease`.

**Transitions (Global Defaults):**
-   **Property transitions:** `150ms ease-out` for color/background, `200ms ease` for transform/layout.
-   **Page/View transitions:** Fade crossfade `250ms ease-in-out`.
-   **Overlay entry:** Slide-up `200ms cubic-bezier(0.16, 1, 0.3, 1)` + fade.
-   **Overlay exit:** Fade-out `150ms ease-in`.

**Micro-Animations:**
-   **Toast notifications:** Slide in from top-right, auto-dismiss with a shrinking progress bar.
-   **Skeleton loaders:** Subtle shimmer sweep (left-to-right gradient animation, `1.5s infinite`).
-   **Progress bars:** Stepped increments (not smooth) — each step snaps after a calculated delay to reinforce the "AI is computing" feel.
-   **Countdown timer digit changes:** Flip/roll transition on individual digits.