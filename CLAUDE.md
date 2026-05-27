# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

---

## Project Overview

Full-stack monorepo with a **NestJS API** (`apps/api`) and a **React frontend** (`apps/ui`), backed by PostgreSQL via TypeORM. Package manager is **npm**.

## Domain context

The project is being specialized into a **"Sistema di pianificazione degli appelli"** — a university exam planning system. Domain entities and DTOs use Italian field names where they reflect domain language (e.g., `yearsDuration`, `cfu`). User-facing error messages and `@ApiProperty` examples are in Italian.

The user communicates in Italian and is learning the framework as they build, so explanations should precede code changes when introducing new patterns.

## Common Commands

```bash
# Serve the API (reads $PORT from .env; code default is 3000 if unset, .env sets 3333)
npm run start:api          # alias for: npx nx serve api

# Serve the React UI (port 4200)
npx nx serve ui

# Build
npx nx build api
npx nx build ui

# Run all tests
npx nx run-many -t test

# Run tests for a single project — use the FULL project name (the @-scoped name,
# NOT the directory name). `nx test server-exam-planning` fails with "Cannot find project".
npx nx test @server/auth
npx nx test @server/users
npx nx test @server/exam-planning

# Run a single test file / single test case (pass jest args after --)
npx nx test @server/exam-planning -- exams.service
npx nx test @server/exam-planning -- -t "should create an exam"

# Lint
npx nx run-many -t lint
npx nx lint api

# E2E
npx nx e2e api-e2e
npx nx e2e ui-e2e

# Typecheck
npx nx run-many -t typecheck
```

Project names are `@org/api`, `@org/ui`, `@server/auth`, `@server/users`, `@server/security`, `@server/exam-planning`, `@org/database`. App targets (`api`, `ui`, `api-e2e`, `ui-e2e`) resolve by the short alias; libs generally need the full `@server/...` / `@org/...` name.

Swagger UI is available at `http://localhost:<PORT>/api/docs` when the API is running (e.g. `http://localhost:3333/api/docs` with the current `.env`).

## Environment Setup

Copy `.env` and set the following variables before running:

| Variable | Description |
|---|---|
| `PORT` | API listen port (`.env` sets 3333; falls back to 3000 if unset) |
| `PG_HOST` | Postgres host |
| `PG_PORT` | Postgres port |
| `PG_USERNAME` | Postgres username |
| `PG_PASSWORD` | Postgres password |
| `PG_DATABASE` | Database name |
| `SECRET_KEY` | JWT signing secret |

## Architecture

### Apps

- **`apps/api`** — NestJS application. `AppModule` composes `DatabaseModule`, `ServerUsersModule`, `ServerAuthModule`, and `ServerExamPlanningModule`. Global prefix `/api`.
- **`apps/ui`** — React + React Router SPA built with Vite.
- **`apps/api-e2e`** — Jest-based API integration tests.
- **`apps/ui-e2e`** — Playwright E2E tests for the UI.

### Libraries (`libs/`)

| Import path | Location | Purpose |
|---|---|---|
| `@org/database` | `libs/database` | `DatabaseModule` — TypeORM PostgreSQL root config, `synchronize: true` in dev |
| `@server/users` | `libs/server/users` | `UserEntity`, CRUD service, custom `UsersRepository` |
| `@server/auth` | `libs/server/auth` | JWT + Passport auth (local + JWT strategies), public `login`, SEGRETERIA-only `register` |
| `@server/security` | `libs/server/security` | Shared guards (`JwtAuthGuard`, `RolesGuard`), decorators (`@CurrentUser`, `@Roles`), and `UserRole` enum |
| `@server/exam-planning` | `libs/server/exam-planning` | Domain modules for exam planning: `DegreeCourse`, `Subject`, `ExamSession`, `Exam`, `Teacher`, `Secretariat` entities + CRUD; per-entity `interfaces/*-list-item.interface.ts`; shared `handleDatabaseError` helper. Barrel `index.ts` re-exports entities/DTOs/enums/interfaces for the frontend |

### Auth Flow

1. `POST /api/auth/login` — public; validated by `LocalStrategy` (email + password via bcrypt), returns JWT + user. Login failures return `401` for BOTH unknown email and wrong password (no user enumeration) — `usersService.findByEmail` returns `null`, `validateUser` throws `UnauthorizedException`.
2. `POST /api/auth/register` and `POST /api/users` — **SEGRETERIA-only** (`JwtAuthGuard + RolesGuard + @Roles(SEGRETERIA)`). They create a bare `User` (no profile) so they are NOT the normal way to onboard users — they were kept (not removed) but the frontend must not call them.
3. **Normal user creation** is via `POST /api/teachers` and `POST /api/secretariats` (SEGRETERIA-only): each creates the `User` + its profile atomically (role forced server-side, rollback on failure). This is how the SEGRETERIA registers DOCENTE/SEGRETERIA accounts.
4. Protected routes use `JwtAuthGuard` and optionally `RolesGuard` from `@server/security`.
5. JWT payload: `{ sub, name, email, role }`, expiry 24h. `GET /api/users/me` returns this payload shape (`{id,name,email,role}`), while `/api/teachers/me` and `/api/secretariats/me` return the full profile entity.

### Data Layer

TypeORM with `synchronize: true` (schema auto-sync on startup — dev only). Entities are loaded automatically via `autoLoadEntities: true` in `DatabaseModule`. Each feature module registers its own entities via `TypeOrmModule.forFeature([...])`.

### Nx TypeScript project references (gotcha)

This workspace uses package-based TS project references (`tsconfig.base.json` has `customConditions: ["@org/source"]`, no `paths`). The `@nx/js:typescript-sync` generator manages the `references` arrays of each `tsconfig.*.json` automatically **from the real imports** in the code. Do NOT hand-edit `references` expecting them to stick — an entry not backed by an actual import is stripped on the next `nx sync`. To wire a lib into `apps/ui`: write a real `import ... from '@server/...'` first, then run `npx nx sync` (or any target, which triggers sync). If a target fails with "The workspace is out of sync", run `npx nx sync`.

### Layered pattern for domain features

Each domain entity in `@server/exam-planning` follows the same 4-step structure:

1. **Repository** (`xxx.repository.ts`) — `@Injectable()` class wrapping `Repository<XxxEntity>` from TypeORM. Pure CRUD only: `findAll`, `findById`, `createOne`, `updateOne`, `deleteOne`. Uses `find`/`findOne` (NOT QueryBuilder) so the entities' `eager` relations are always loaded. No HTTP exceptions; returns `null` / `boolean` to signal absence.
2. **Service** (`xxx.service.ts`) — Injects the custom repository (NOT `@InjectRepository`). Translates `null` → `NotFoundException`, wraps writes in `try/catch` + `handleDatabaseError`, owns domain rules. **Public methods return a flat `XxxListItem` interface, never the TypeORM entity** — a private `toListItem(entity)` mapper does the conversion (renames `xxxId` → `id`, nests FKs as `{ id, name }`, and strips sensitive fields like `user.passwordHash` on teacher/secretariat). When a public read is also needed internally (e.g. `updateOne` reading the current row), the service uses a private `getEntityById` returning the entity — do NOT call the public `findById` internally, it now returns a list-item.
3. **List-item interface** (`interfaces/xxx-list-item.interface.ts`) — the shape exposed to the client (and re-exported for the frontend, see below). One interface per entity, shared between list and detail responses.
4. **Controller** (`xxx.controller.ts`) — Routing + guards (`JwtAuthGuard`, `RolesGuard` + `@Roles`) + `ParseIntPipe` on `:id`. Minimal Swagger: `@ApiTags` + `@ApiBearerAuth`. Uses `@Body() dto: XxxDto` (global `ValidationPipe` validates). Controllers do NOT annotate return types — they inherit the service's list-item type.
5. **Module wiring** — Register `XxxRepository` in `providers` of `ServerExamPlanningModule`. Entity already in `TypeOrmModule.forFeature([...])`.

`libs/server/exam-planning/src/index.ts` is the public barrel: it re-exports the module **plus** all entities, DTOs, enums (`ExamType`, `RoomType`), and list-item interfaces — so `apps/ui` can `import type { ExamListItem, CreateExamDto } from '@server/exam-planning'`. Prefer `import type` in the frontend to avoid pulling class-validator/swagger runtime into the browser bundle.

`UserRole` enum lives in `@server/security` (moved there to break a circular dep with `@server/users`). Values: `DOCENTE`, `SEGRETERIA`. **SEGRETERIA acts as admin** for most resources (CRUD writes on degree-courses, subjects, exam-sessions, teachers). Exceptions baked into the services: `Exam` is created by `DOCENTE` (teacher forced to the current user) and editable/deletable by SEGRETERIA or the owning DOCENTE; a `Secretariat` can only update/delete **its own** profile (self-only).

### Validation & DTOs

Global `ValidationPipe` is registered in `apps/api/src/main.ts` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }`.

Consequences:
- Unknown fields in request bodies are stripped and rejected (400)
- Class-validator decorators (`@IsString`, `@IsInt`, `@IsEmail`, etc.) run automatically
- String-to-number/Date conversion happens automatically

DTO conventions:
- `CreateXxxDto` uses class-validator + `@ApiProperty` from `@nestjs/swagger`
- `UpdateXxxDto extends PartialType(CreateXxxDto)` from `@nestjs/swagger` (NOT from `@nestjs/mapped-types`)
- Sensitive fields (e.g., `role`) NEVER live in client-facing DTOs — they are forced server-side in the service

### DB error mapping

`handleDatabaseError(error, fallbackMessage)` in `libs/server/exam-planning/src/lib/database-error.helper.ts` (return type `never`) maps PostgreSQL error codes to HTTP exceptions:

| PG code | Meaning | HTTP |
|---|---|---|
| 23505 | unique_violation | 409 Conflict |
| 23502 | not_null_violation | 422 Unprocessable Entity |
| 23503 | foreign_key_violation | 400 Bad Request |
| 23514 | check_violation | 422 |
| 23P01 | exclusion_violation | 409 |
| 40001 / 40P01 | serialization / deadlock | 503 Service Unavailable |
| (other) | — | 500 Internal Server Error (fallback) |

Pattern in services: `try { ... } catch (e) { if (e instanceof NotFoundException) throw e; handleDatabaseError(e, '...'); }` — always re-throw `NotFoundException` (and similar app-level exceptions) before delegating to the helper.
