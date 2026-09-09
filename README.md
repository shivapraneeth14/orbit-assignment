# ORBIT — Team Delivery Platform

**Plan. Assign. Ship.**

ORBIT is a lightweight project-management platform where teams create projects, break them into tasks, assign owners, track status, and see progress at a glance — the core loop of Linear / Asana / Trello, built lean.

> Live demo: `[YOUR_VERCEL_URL_HERE]`
>
> Demo screenshots: (add screenshots of the dashboard, board, and settings pages here)

---

## Demo login

| Email | Password | Role |
| --- | --- | --- |
| `demo@orbit.dev` | `demo1234` | Workspace owner |
| `teammate@orbit.dev` | `demo1234` | Workspace member |

The seed script creates a workspace (`Orbit Engineering`), two projects (`Mobile App`, `Website Redesign`), and 12 tasks spread across all four board statuses, with a couple of overdue tasks to exercise the dashboard's overdue highlighting.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Vercel (Next.js 16 App Router)                            │
│                                                            │
│  ┌─────────────────────┐      ┌──────────────────────────┐ │
│  │  Frontend (React)   │      │  API (Route Handlers)    │ │
│  │  • (app) pages      │◄────►│  /api/auth/*             │ │
│  │  • Sidebar / Shell  │ REST │  /api/workspaces/*       │ │
│  │  • Kanban board     │      │  /api/projects/*         │ │
│  │  • dnd-kit DnD      │      │  /api/tasks/*            │ │
│  │  • Sonner toasts    │      │  Zod validation          │ │
│  └─────────┬───────────┘      └────────────┬─────────────┘ │
│            │                               │               │
│            │      Prisma ORM + pg adapter  │               │
│            └───────────────┬───────────────┘               │
└────────────────────────────┼──────────────────────────────┘
                             │ DATABASE_URL
                 ┌───────────▼───────────┐
                 │  PostgreSQL            │
                 │  (Supabase / Neon,     │
                 │   local for dev)       │
                 └───────────────────────┘
```

**Auth flow**

```
Browser ──POST /api/auth/callback/credentials──► NextAuth Credentials provider
                                                    │ bcrypt.compare(password, hash)
                                                    ▼
                                              Session (JWT, cookie)
Browser ──GET /api/workspaces──▪──► route handler
                                          │ auth() reads JWT cookie
                                          ▼
                              ├─ ✓ session → authorize via DB (WorkspaceMember role)
                              └─ ✗ no session → 401
```

---

## Tech stack & why

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | One deployable app for frontend + API; shared code in a single repo = ideal for a one-person MVP; native Vercel deployment. |
| Language | TypeScript | Type-safe contracts between schema, API, and UI through Prisma's generated types. |
| Styling | Tailwind CSS v4 | Utility-first, fast to build a dense, Linear-like UI; themeable design tokens. |
| ORM | Prisma 7 | Type-safe queries, declarative schema, first-class migrations, trivial Supabase/Neon integration. |
| Database | PostgreSQL (Supabase) | Free tier, relational integrity enforced with real foreign keys, production-grade. |
| Auth | NextAuth.js (Auth.js) v5 | Battle-tested sessions; JWT strategy avoids DB lookups per request; Credentials provider fits email/password for this beta. |
| Validation | Zod | Shared schemas (`lib/validations.ts`) used on both server and client. |
| Drag & drop | @dnd-kit | Actively maintained successor to react-beautiful-dnd; excellent React 18/19 support; optimistic updates are easy. |
| Toasts | Sonner | Lightweight, themeable, straightforward API. |
| Icons | lucide-react | Clean, tree-shakeable icon set. |

---

## Local setup

### Prerequisites

- Node.js 20.9+
- npm
- PostgreSQL (a local instance, or a free Neon project)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd orbit
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
# Runtime/app connection — use the POOLED URL (host has "-pooler" in it): neon.com → Connect
DATABASE_URL="postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/neondb?...&sslmode=require"
# Prisma CLI (migrations/seed) — use the DIRECT URL (Prisma Migrate must bypass PgBouncer)
DATABASE_URL_UNPOOLED="postgresql://<user>:<password>@<endpoint>.<region>.aws.neon.tech/neondb?...&sslmode=require"
AUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

Both connection strings come from the Neon console (or `neon env pull`), already
include `?sslmode=require`, and differ only by the `-pooler` suffix. The pooled
URL is used by the app at runtime; Prisma CLI commands read `DATABASE_URL_UNPOOLED`
directly so migrations never traverse the pooler.

### 3. Create the database (local Postgres)

```bash
createdb orbit            # or: psql -d postgres -c "CREATE DATABASE orbit;"
```

### 4. Migrate & seed

```bash
npm run prisma:migrate    # applies migrations (also runs seed automatically)
# or, if you prefer to seed manually:
npm run prisma:seed
```

This creates the schema, migration history, and demo data.

### 5. Run

```bash
npm run dev
```

Open **http://localhost:3000** and log in with the demo credentials above.

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` / `npm start` | Production build & run |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Create/apply DB migrations |
| `npm run prisma:deploy` | Apply migrations in production (Vercel build step) |
| `npm run prisma:seed` | Re-seed demo data |
| `npm run prisma:studio` | Browse the DB in Prisma Studio |

---

## Deploying to Vercel + Neon

1. Push the repo to GitHub.
2. Create a free project at [neon.com](https://neon.com). The **Connect** dialog gives two connection strings (pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED`) — or run `neon link --project-id <id> --branch production` and the CLI writes both into `.env`.
3. Import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js.
4. Add these environment variables in Vercel → Project → Settings → Environment Variables:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon **pooled** connection string (host has `-pooler`) |
   | `DATABASE_URL_UNPOOLED` | Neon **direct** connection string |
   | `AUTH_SECRET` | `openssl rand -base64 32` output |
   | `NEXTAUTH_URL` | `https://<your-project>.vercel.app` |
   | `AUTH_TRUST_HOST` | `true` |

5. Deploy. The `vercel-build` script (`prisma generate && prisma migrate deploy && next build`):
   - regenerates the Prisma client,
   - applies pending migrations to Neon using the **direct** URL (avoids the pooler),
   - then builds the app. No manual DB step needed.
6. Seed production once (local one-off with the prod URLs): `npm run prisma:seed`.

---

## Features

- **Authentication** — signup/login/logout with bcrypt-hashed passwords, protected routes (unauthenticated users are redirected to `/login`), persistent JWT sessions.
- **Workspaces** — auto-created on signup, create additional workspaces, workspace switcher in the sidebar.
- **Projects** — create / rename / archive / delete; card grid shows task count and progress bar; archived section.
- **Tasks** — board (Kanban) view with drag-and-drop between columns and optimistic UI updates; list/table view sortable by status, priority, due date, assignee, and title; task detail slide-over with inline editing, assignee, priority, due date, and comments.
- **Progress** — per-project progress bar; dashboard shows tasks assigned to you across all projects, a stats summary, and overdue-highlighted items.
- **Team management** — members list with roles; only OWNER/ADMIN can invite or remove members, enforced **server-side** (not just hidden in the UI).

---

## API reference

| Method | Endpoint | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Create account + default workspace |
| GET | `/api/workspaces` | Yes | List workspaces for the session user |
| POST | `/api/workspaces` | Yes | Create a workspace |
| PATCH | `/api/workspaces/:id` | Yes | Rename workspace |
| DELETE | `/api/workspaces/:id` | Owner | Delete workspace (cascades) |
| GET | `/api/workspaces/:id/members` | Yes | List members |
| DELETE | `/api/workspaces/:id/members` | OWNER/ADMIN | Remove a member |
| POST | `/api/workspaces/:id/invite` | OWNER/ADMIN | Add an existing user by email |
| GET | `/api/projects?workspaceId=` | Yes | List projects with progress |
| POST | `/api/projects` | Yes | Create project |
| GET | `/api/projects/:id` | Yes | Single project |
| PATCH | `/api/projects/:id` | Yes | Rename / archive / recolor |
| DELETE | `/api/projects/:id` | Yes | Delete project (cascades tasks) |
| GET | `/api/tasks?projectId=` | Yes | List tasks (board/list data) |
| POST | `/api/tasks` | Yes | Create task |
| GET | `/api/tasks/:id` | Yes | Task + comments |
| PATCH | `/api/tasks/:id` | Yes | Update status/priority/assignee/due date |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| POST | `/api/tasks/:id/comments` | Yes | Add a comment |

All mutating endpoints:
- derive the acting user **from the session**, never from a client-sent id;
- enforce workspace membership and role (`permissions.ts` / `requireWorkspaceMember`);
- validate bodies with **Zod** (`lib/validations.ts`);
- never return password hashes.

---

## Written explanation

### Schema design decisions

The schema is deliberately relational — six models with real foreign keys:

- **`User`** ↔ **`Workspace`** are joined through **`WorkspaceMember`**, a join table that carries the `role` (`OWNER`/`ADMIN`/`MEMBER`). This is the heart of the permission model: membership is a first-class relation, not a field on the user.
- **`Project`** belongs to one `Workspace` (`onDelete: Cascade`), so deleting a workspace never leaves orphan projects.
- **`Task`** belongs to one `Project` (cascade), and its `assigneeId` references `User` with `onDelete: SetNull` — deleting a user must not delete their tasks, but it should unassign them. `Task` carries its own `status` and `priority` enums; the state machine is intentionally simple (no separate "transition" table) for an MVP.
- **`Comment`** references both `Task` (cascade) and `User`, with denormalized `author` info returned via Prisma `include`.

Enums (`WorkspaceRole`, `TaskStatus`, `TaskPriority`, `ProjectStatus`) live in Postgres as native enum types, keeping the model self-documenting and preventing invalid values at the DB layer. Indexes are placed on foreign keys (`@@index`) because those are the hot join paths.

**Trade-offs:** no separate `TaskAssignee` join table — a task has exactly one assignee, matching the "one owner per task" mental model. If multiple assignees are ever needed, converting `assigneeId` to a join table is a small migration.

### How authentication & authorization work

- **Authentication**: The Credentials provider (`lib/auth.ts`) looks up the user by email and verifies the password with `bcrypt.compare`. On success, NextAuth issues a signed **JWT session** stored in an `__Secure-authjs.session-token` cookie. The JWT strategy means every `/api/*` request is validated by signature in-process — no database hit per request.
- **Protecting routes**: Server layouts call `auth()`; in `(app)/layout.tsx` an unauthenticated session calls `redirect('/login')`, so every page under the app group is guarded. API routes use `requireAuth()` which returns `401` when no session exists.
- **Authorization (RBAC)**: Every mutating API handler derives the acting user from the session and then checks:
  1. **Workspace membership** — via `requireWorkspaceMember(id, userId)`.
  2. **Role** — via `canManageMembers()` for invites and member removal (OWNER/ADMIN only), and `ownerId` equality for workspace deletion.
  3. **Cross-resource checks** — e.g., assigning a task to someone who is not a member of the project's workspace returns `400`.
  
  Critical detail: the client never sends `userId`; it sends the `memberId`/`assigneeId` of a *target*, and the server authorizes *that target* against the workspace. UI hiding is only a convenience layer; the server is the real gate.

### Adding real-time updates (future)

The plan is a three-tier approach:

1. **Broadcast** — publish task/project changes to a 3rd-party realtime gateway. With Supabase, Postgres `LISTEN/NOTIFY` or its Realtime extension can push row changes to connected clients via WebSockets with zero extra infra.
2. **Subscribe** — a client hook (`useRealtime(taskId)`) opens a WebSocket/SSE subscription and merges incoming patches with the existing React state (or a client cache like TanStack Query), reusing the optimistic-update path already built into the board.
3. **Backfill** — on reconnect, re-fetch the delta since `lastEventId` (or just refetch the board) so no updates are lost.

Simplest production shape without new infra: subscribe to a Supabase Realtime channel filtered by `workspaceId`, and update the local query cache. This keeps the optimistic-first UX and makes collaboration multi-user for free.

### Scaling

Current design already scales to tens of thousands of rows comfortably. For the next order of magnitude:

- **Reads**: `GET /api/tasks?projectId=` is benchmarked against indexes on `projectId` and `assigneeId`; a composite `(projectId, status)` index would make board fetches index-only. Optional: Column store caching layer (or just cache the pre-aggregated project progress — it's currently computed per read).
- **Writes**: Supabase connection pooler absorbs concurrent connections; the transaction in `signup` and `createWorkspace` keeps multi-row writes atomic.
- **Stateless API**: the app is stateless (JWT sessions, no server-local state), so it can be horizontally scaled across many Vercel lambdas / Node instances with no session-store to coordinate.
- **Denormalization**: project `taskCount`/`doneCount` are computed on read; if progress becomes hot, store a `completedCount` counter on `Project` updated transactionally with task mutations.
- **Database**: move to a dedicated instance, enable pgBouncer, and add read replicas if dashboard/board read volume justifies it.

### Known limitations (this MVP)

- **Email invites are simplified** — inviting requires the person to already have an ORBIT account. Production version would send a real invite email (Resend/Postmark) with a signup link + `INVITE_SECRET` token that provisions membership on first login, and handle the non-user case.
- **No real-time** — see the plan above; this is intentionally out of scope.
- **No file uploads** — attachments to tasks aren't supported; production path is signed Supabase Storage URLs.
- **No pagination** on board/list — fine at MVP scale; swap to cursor pagination when a project exceeds ~1k tasks.
- **Comments are read-only-after-post** — no edit/delete; trivial follow-up.
- **OAuth (Google) not wired** — Credentials-only, per scope; the Auth.js providers array makes adding it a ~15-line change.
- **Board has no persistent task ordering** — columns reorder by creation order on reload; adding a `sortOrder` int + sortable persist is the follow-up.

---

## Project structure

```
src/
  app/
    (auth)/login|signup        # public auth pages
    (app)/                     # protected group
      dashboard/               # personal task overview
      workspace/[workspaceId]/ # project list + settings
      project/[projectId]/     # board + list views
    api/                       # route handlers (REST)
  components/
    ui/                        # Button, Input, Select, Modal, etc.
    board/                     # KanbanBoard, KanbanColumn, TaskCard
    tasks/                     # TaskModal, TaskListView, CreateTaskModal
    workspace/                 # CreateProjectModal, MemberManager, ...
    layout/                    # Shell, Sidebar
    auth/                      # Login/Signup forms
  lib/                         # prisma, auth, validations, permissions, api
prisma/
  schema.prisma                # the full relational schema
  seed.ts                      # demo data
  migrations/                  # migration history
```

---

## AI tools used

- **opencode / Claude (big-pickle)** — planning, scaffolding, implementation, type-driven iteration, and this README.
- **Next.js 16 bundled docs** — consulted (`node_modules/next/dist/docs`) to respect v16 breaking changes (async `params`/`cookies`, `proxy` instead of `middleware`, Turbopack default).

---

## License

Private / internal beta.