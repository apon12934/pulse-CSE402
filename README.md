<div align="center">

# ? PULSE

### *AI-Powered Personal Scheduling System*

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TiDB](https://img.shields.io/badge/TiDB-Serverless-E22C29?style=for-the-badge&logo=mysql&logoColor=white)](https://tidbcloud.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

<br/>

> **Pulse** is a real-time, AI-driven daily planner that dynamically reschedules your entire day in seconds. Built with a full-stack monorepo using Next.js, Express, and Google Gemini AI.

<br/>

**[?? Live Demo](http://pulse-ai.ddns.net)** &nbsp;&nbsp;|&nbsp;&nbsp; **[?? Documentation](#features)** &nbsp;&nbsp;|&nbsp;&nbsp; **[?? Getting Started](#getting-started)**

</div>

---

## ? Features

### ?? AI-Powered Scheduling Engine
The core of Pulse is a **Domino Rescheduling** system powered by **Google Gemini**. When you resize or move a task, the AI cascades adjustments through the rest of your day — just like dominoes falling — ensuring your schedule is always logically consistent.

- **Domino Rescheduling** — Resize a task and the AI shifts everything else to fit
- **AI Draft Mode** — Chat naturally with Gemini to generate a complete schedule from scratch
- **Energy-Aware Optimization** — AI matches High/Medium/Low energy tasks to your cognitive peaks
- **Timezone-Safe** — All AI operations happen in your local time, no UTC confusion

### ?? Dynamic Timeline
A premium, pixel-perfect visual timeline where every task is a draggable, resizable block.

- **Drag to Move** — Grab any task and drop it anywhere on the timeline
- **Resize to Adjust** — Drag the bottom handle to extend or shrink task duration
- **Live Recalculation** — AI recalculates remaining tasks instantly after every change
- **Task Status Tracking** — Upcoming ? Running ? Completed ? Overdue lifecycle

### ?? Weekly Template System
Build a recurring weekly routine that automatically generates tasks every week.

- **Anchor Tasks** — Fixed-time immovable events (Classes, Meetings)
- **Fluid Tasks** — Flexible routines that adapt to your anchors (Study, Gym)
- **Global Edits** — Edit a task and propagate changes to all future same-weekday instances
- **4-Week Auto-Generation** — Templates auto-expand 4 weeks into the future

### ?? Conversational AI Chat
Talk to Pulse like a person. Describe your goals, constraints, and preferences in plain English.

- **Persistent Chat History** — Conversations are saved and resumed across sessions
- **Draft + Approve Workflow** — AI proposes a schedule; you review and approve before it saves
- **Context-Aware** — The AI reads your existing calendar before suggesting changes

### ?? Authentication & Security
- **JWT Authentication** — Stateless, secure token-based auth
- **bcrypt Password Hashing** — Industry-standard salted password hashing
- **Bring Your Own API Key** — Use your own Gemini API key for unlimited AI requests
- **Multi-Tenant Isolation** — All data is strictly scoped per user

### ??? Profile & Personalization
- **Avatar Upload** — Upload a custom profile picture via Cloudinary
- **Rescheduling Strategy** — Choose between Balanced, Aggressive, or Gentle AI behavior
- **Password Management** — Change password from the settings page securely

---

## ??? Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS v4 |
| **Backend** | Express 5, Node.js 20+, TypeScript |
| **AI** | Google Gemini (gemini-3.5-flash-lite) |
| **ORM** | Prisma 6 |
| **Database** | TiDB Serverless (MySQL-compatible) |
| **Image Storage** | Cloudinary |
| **State Management** | Zustand |
| **Monorepo** | Turborepo + npm workspaces |
| **Auth** | JWT + bcrypt |
| **Validation** | Zod |

---

## ??? Project Structure

`
pulse/
+-- apps/
¦   +-- api/                  # Express backend
¦   ¦   +-- src/
¦   ¦   ¦   +-- controllers/  # Route handlers (schedule, tasks, auth, etc.)
¦   ¦   ¦   +-- services/     # Gemini AI service & scheduling logic
¦   ¦   ¦   +-- middlewares/  # Auth, error handling
¦   ¦   ¦   +-- routes/       # API route definitions
¦   ¦   ¦   +-- utils/        # Prisma client, Zod validators, errors
¦   ¦   +-- prisma/
¦   ¦       +-- schema.prisma # Database schema (Users, Tasks, Templates, Chat)
¦   +-- web/                  # Next.js frontend
¦       +-- src/
¦           +-- app/          # Next.js App Router pages
¦           ¦   +-- page.tsx          # Dashboard
¦           ¦   +-- timeline/         # Visual timeline editor
¦           ¦   +-- chat/             # Full-screen AI chat
¦           ¦   +-- settings/         # Account & preferences
¦           ¦   +-- config/           # Weekly template configuration
¦           ¦   +-- help/             # Onboarding & help guide
¦           +-- components/   # UI components (Timeline, Dashboard, Auth, Shell)
¦           +-- store/        # Zustand state (auth, tasks, layout)
¦           +-- lib/          # API client utilities
+-- packages/
    +-- ui/                   # Shared component library (Button, cn utils)
    +-- types/                # Shared TypeScript types
`

---

## ?? Getting Started

### Prerequisites

- Node.js 20+
- npm 11+
- A [TiDB Serverless](https://tidbcloud.com/) database
- A [Google Gemini API Key](https://ai.google.dev/)
- A [Cloudinary](https://cloudinary.com/) account (for avatar uploads)

### 1. Clone the repository

`ash
git clone https://github.com/apon12934/pulse.git
cd pulse
`

### 2. Install dependencies

`ash
npm install
`

### 3. Configure environment variables

Create pps/api/.env:

`env
DATABASE_URL="mysql://user:password@host:4000/pulse?ssl={"rejectUnauthorized":true}"
JWT_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-gemini-api-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
PORT=4000
`

Create pps/web/.env.local:

`env
NEXT_PUBLIC_API_URL="http://localhost:4000"
`

### 4. Setup the database

`ash
cd apps/api
npx prisma generate
npx prisma db push
`

### 5. Run the development servers

`ash
# From root — starts both API and Web concurrently
npm run dev
`

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **Health Check:** [http://localhost:4000/health](http://localhost:4000/health)

---

## ??? API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create a new user account |
| POST | /api/auth/login | Authenticate and receive a JWT |
| GET | /api/tasks | Fetch all tasks for a given date |
| POST | /api/tasks | Create a new task |
| PATCH | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |
| POST | /api/schedule/generate | AI-generate an optimized daily schedule |
| POST | /api/schedule/reschedule | Domino-reschedule after a task overruns |
| POST | /api/schedule/move | Move a task and recalculate the day |
| POST | /api/schedule/reorder | Reorder tasks with AI time recalculation |
| POST | /api/schedule/chat | Chat with AI to draft a schedule |
| DELETE | /api/schedule/reset-day | Reset a day from its weekly template |
| GET | /api/weekly-template | Fetch the user's weekly template |
| POST | /api/weekly-template/generate | Save an AI-drafted weekly routine |
| PATCH | /api/weekly-template/tasks/:id | Edit a template task (with global propagation) |
| DELETE | /api/weekly-template/tasks/:id | Delete a template task |
| GET | /api/user/me | Fetch authenticated user profile |
| PATCH | /api/user/me | Update name, username, email |
| PATCH | /api/user/me/password | Change password |
| POST | /api/user/me/avatar | Upload a profile picture |

---

## ??? Data Models

`
User
 +-- Task[]           (daily scheduled tasks)
 +-- TemplateTask[]   (recurring weekly routine)
 +-- TaskBlock[]      (grouped task composites)
 +-- DailyRoutine[]   (daily completion snapshots)
 +-- ChatMessage[]    (AI conversation history)
`

**Task Types:**
- Anchor — Fixed-time tasks that the AI never moves
- Fluid — Flexible tasks that the AI can shift to optimize the day

**Task Status Flow:**
`
Upcoming ? Running ? Completed
                  ? Overdue
`

---

## ?? Screenshots

> **Dashboard** — Active task view with AI chat panel  
> **Timeline** — Drag-and-drop visual timeline with real-time AI rescheduling  
> **Config** — Weekly template builder with global edit propagation  
> **Help** — Onboarding guide for new users  

*(Screenshots available at [pulse-ai.ddns.net](http://pulse-ai.ddns.net))*

---

## ?? Development Scripts

`ash
npm run dev          # Start both API and Web in watch mode
npm run dev:web      # Start only the Next.js frontend
npm run dev:api      # Start only the Express backend
npm run build        # Production build for both apps
npm run lint         # Lint both apps
`

---

## ?? Contributing

1. Fork the repository
2. Create your feature branch: git checkout -b feat/amazing-feature
3. Commit your changes: git commit -m 'feat: add amazing feature'
4. Push to the branch: git push origin feat/amazing-feature
5. Open a Pull Request

---

<div align="center">

Built with ? by [Apon](https://github.com/apon12934)

*Pulse — Because your day should adapt to you, not the other way around.*

</div>
