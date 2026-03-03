# TaskBoard Hub

TaskBoard Hub is a production-oriented monorepo for a SaaS task management platform with todo lists, boards, a separated frontend (`apps/web`) and backend (`apps/api`), plus shared packages.

## Tech stack

- Frontend: React + TypeScript + Vite + Tailwind + Framer Motion + TanStack Query + Zustand + RHF/Zod + Recharts
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL + Socket.IO + JWT + bcrypt
- Monorepo: pnpm workspaces

## Monorepo structure

```txt
apps/
  api/
    prisma/
    src/
      config/
      core/
      features/
      lib/
      middlewares/
      routes/
      socket/events/
  web/
    src/
      components/
      features/
      lib/
      stores/
packages/
  types/
```

## Quick start

### 1) Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 14+

### 2) Install dependencies

```bash
pnpm install
```

### 3) Configure environment variables

Copy:

- `.env.example` -> `.env` (root reference)
- `apps/api/.env.example` -> `apps/api/.env`
- `apps/web/.env.example` -> `apps/web/.env`

### 4) Prisma setup

```bash
pnpm --filter @nexus/api prisma:generate
pnpm --filter @nexus/api prisma:migrate
```

### 5) Run development apps

```bash
pnpm dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

## Workspace scripts

- `pnpm dev`: run all apps in dev mode
- `pnpm build`: build all workspaces
- `pnpm lint`: lint all workspaces
- `pnpm typecheck`: typecheck all workspaces
- `pnpm format`: format repository

## API routes scaffolded

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- Tasks: `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`
- Events: `GET/POST /api/events`, `GET/PATCH/DELETE /api/events/:id`
- Notes: `GET/POST /api/notes`, `GET/PATCH/DELETE /api/notes/:id`
- Notifications: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- Dashboard Layout: `GET /api/dashboard/layout`, `PUT /api/dashboard/layout`, `POST /api/dashboard/layout/reset`
- Activity: `GET /api/activity`

## Prisma models scaffolded

- `User`
- `RefreshToken`
- `Task`, `Tag`, `TaskTag`
- `Event`
- `Note`
- `Notification`
- `ActivityLog`
- `DashboardLayout`
- `WidgetPreference`

## Current status

This first delivery includes:

- Monorepo root and pnpm workspace configuration
- Backend scaffold with layered feature architecture
- Frontend scaffold with persistent app shell and protected routing base
- Prisma relational schema foundation
- Shared types package

Next implementation phase will add:

- full JWT auth flow
- real CRUD persistence per module
- realtime notifications/activity integration
- advanced dashboard widgets, drag-drop layout, and complete UX polish
- full seed data
