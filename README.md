<div align="center">
  <img src="https://raw.githubusercontent.com/apon12934/pulse/main/apps/web/public/logo.svg" alt="Pulse Logo" width="280" />
  <br/><br/>
  <p><em>AI-Powered Personal Scheduling System</em></p>
  <br/>

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![TiDB](https://img.shields.io/badge/TiDB-Serverless-E22C29?style=for-the-badge&logo=mysql&logoColor=white)](https://tidbcloud.com/)
  [![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

  <br/>

  **[🌐 Live Demo → pulse-ai.ddns.net](http://pulse-ai.ddns.net)**

  <br/>
</div>

---

## What is Pulse?

Most scheduling apps are static. You move one task, and everything else stays put — leaving you with overlapping blocks and wasted time you have to manually fix.

**Pulse is different.** It uses **Google Gemini AI** to implement a **Domino Rescheduling** system: when you resize or move one task, the AI instantly cascades adjustments through every subsequent task — keeping your day tight, logical, and stress-free.

---

## ✨ Features

### ⚡ Domino Rescheduling Engine
> *Move one task. The AI fixes the rest.*

When a task overruns or you drag it to a new time, Pulse sends your remaining schedule to Gemini and gets back a fully recalculated timeline in seconds. No more manual juggling.

### 🗓️ Visual Drag-and-Drop Timeline
A pixel-perfect daily timeline where tasks are interactive blocks you can **drag to move** and **resize to adjust**. Every change triggers a live AI recalculation.

| Task Type | Behaviour |
|-----------|-----------|
| **Anchor** | Fixed-time events (classes, meetings) — the AI never moves these |
| **Fluid**  | Flexible routines (study, gym, lunch) — the AI freely reorganizes these |

### 🔁 Weekly Template System
Define your recurring routine once. Pulse auto-generates task instances **4 weeks ahead**. Editing a task with "Apply Globally" propagates changes to all future same-weekday instances automatically.

### 💬 Conversational AI Chat
Describe your goals in plain English and Pulse drafts a full schedule for your approval.

```
"I have an exam tomorrow. Schedule 4 hours of study after my 2 PM class."
"I'm exhausted today. Give me a light schedule with longer breaks."
```

### 🔋 Energy-Aware Scheduling
Tag every task with a **High / Medium / Low** energy requirement. The AI avoids stacking demanding work back-to-back, honoring your natural cognitive rhythm throughout the day.

### 🔒 Authentication & Isolation
Full multi-tenant isolation with JWT auth, bcrypt password hashing, and optional bring-your-own Gemini API key for unlimited AI usage.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS v4 |
| **Backend** | Express 5, Node.js 20+, TypeScript |
| **AI Engine** | Google Gemini (`gemini-3.5-flash-lite`) |
| **ORM** | Prisma 6 |
| **Database** | TiDB Serverless (MySQL-compatible) |
| **Storage** | Cloudinary (avatar images) |
| **State** | Zustand |
| **Monorepo** | Turborepo + npm workspaces |
| **Auth** | JWT + bcrypt |
| **Validation** | Zod |

---

## 🏗️ Project Structure

```
pulse/
├── apps/
│   ├── api/                    # Express REST API
│   │   ├── src/
│   │   │   ├── controllers/    # schedule, tasks, auth, user, weeklyTemplate
│   │   │   ├── services/       # Gemini AI (generate, reschedule, move, chat)
│   │   │   ├── middlewares/    # JWT auth, global error handler
│   │   │   ├── routes/         # Route registration
│   │   │   └── utils/          # Prisma client, Zod validators
│   │   └── prisma/
│   │       └── schema.prisma   # Users, Tasks, Templates, Chat
│   └── web/                    # Next.js 16 App Router frontend
│       └── src/
│           ├── app/
│           │   ├── page.tsx        # Dashboard
│           │   ├── timeline/       # Visual drag-and-drop timeline
│           │   ├── chat/           # Full-screen AI conversation
│           │   ├── config/         # Weekly template builder
│           │   ├── settings/       # Profile, password, API key
│           │   └── help/           # Onboarding guide
│           ├── components/     # Timeline, Dashboard, Shell, Auth UI
│           └── store/          # Zustand (auth, tasks, layout)
└── packages/
    ├── ui/                     # Shared Button, cn utilities
    └── types/                  # Shared TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+, **npm** 11+
- [TiDB Serverless](https://tidbcloud.com/) — free tier available
- [Google Gemini API Key](https://ai.google.dev/) — free tier available
- [Cloudinary](https://cloudinary.com/) — free tier available

### 1. Clone

```bash
git clone https://github.com/apon12934/pulse.git
cd pulse
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

**`apps/api/.env`**
```env
DATABASE_URL="mysql://user:password@host:4000/pulse"
JWT_SECRET="your-super-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=4000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 4. Database Setup

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 5. Run

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health Check | http://localhost:4000/health |

---

## 🗺️ API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Login and receive a JWT |
| `GET` | `/api/tasks` | Fetch tasks for a date |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/schedule/generate` | AI-generate a full day schedule |
| `POST` | `/api/schedule/reschedule` | Domino-reschedule after overrun |
| `POST` | `/api/schedule/move` | Move task and recalculate day |
| `POST` | `/api/schedule/reorder` | Reorder tasks with AI time-fill |
| `POST` | `/api/schedule/chat` | Draft a schedule via AI chat |
| `DELETE` | `/api/schedule/reset-day` | Reset day from weekly template |
| `GET` | `/api/weekly-template` | Get user's weekly template |
| `POST` | `/api/weekly-template/generate` | Save AI-drafted weekly routine |
| `PATCH` | `/api/weekly-template/tasks/:id` | Edit template task globally |
| `DELETE` | `/api/weekly-template/tasks/:id` | Delete template task |
| `GET` | `/api/user/me` | Get authenticated user profile |
| `PATCH` | `/api/user/me` | Update profile details |
| `PATCH` | `/api/user/me/password` | Change password |
| `POST` | `/api/user/me/avatar` | Upload profile picture |

---

## 🗄️ Data Model

```
User
 ├── Task[]            Daily scheduled task instances
 ├── TemplateTask[]    Recurring weekly routine definitions
 ├── TaskBlock[]       Grouped task composites
 ├── DailyRoutine[]    Completion snapshot per day
 └── ChatMessage[]     Persistent AI conversation history
```

**Task status lifecycle:**
```
Upcoming → Running → Completed
                  ↘ Overdue
```

---

## 🔧 Scripts

```bash
npm run dev          # Run API + Web concurrently
npm run dev:web      # Next.js frontend only
npm run dev:api      # Express backend only
npm run build        # Production build
npm run lint         # ESLint both apps
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

<div align="center">
  <br/>
  <img src="https://raw.githubusercontent.com/apon12934/pulse/main/apps/web/public/logo.svg" alt="Pulse" width="140" />
  <br/><br/>
  <sub>Built by <a href="https://github.com/apon12934">Apon</a></sub>
  <br/>
  <sub><em>Because your day should adapt to you, not the other way around.</em></sub>
  <br/><br/>
</div>
