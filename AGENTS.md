@promptkit/

# AGENTS.md

## Project Overview

my-fullstack-collection is an open-ended full-stack exercise where students build a complete collection app of their own choosing — from the database to the UI. The collection topic is entirely up to the student (books, movies, games, rocks, etc.). Unlike other challenges with pre-built routes or stubs, students design the schema and implement every layer themselves.

**Key Technologies:**
- **Frontend**: React, TypeScript, Vite, TanStack Query (React Query), CSS
- **Backend**: Node.js, Express.js, TypeScript, Knex.js, SQLite3
- **Testing**: Vitest

**Architecture:**
- `client/`: React SPA — `App.tsx` is a minimal scaffold with an `<h1>` and empty `<section>`
- `server/`: Express backend — `server.ts` has no routes yet; students add them
- API client functions go in `client/apis/`
- API base path: (student-defined)

## Building and Running

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run knex migrate:latest` | Run database migrations |
| `npm run knex seed:run` | Seed database with initial data |
| `npm run dev` | Start client (`http://localhost:5173`) and server (`http://localhost:3000`) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test -- --run` | Run all tests once |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Format code with Prettier |

**Important:** Always use `npm run dev`. Opening `index.html` directly won't load TypeScript.

## Development Conventions

- **Code Style**: ESLint and Prettier enforce consistent style. Run `npm run lint` and `npm run format` before committing.
- **API routes**: Added in `server/server.ts` (comment `// ADD YOUR API ROUTES HERE` marks the location), or extracted to a separate routes file and mounted there.
- **Frontend components**: React components go in `client/components/`.
- **Data fetching**: TanStack Query. API client functions go in `client/apis/`.
- **Styling**: CSS. Main stylesheet at `client/styles/index.css`.

## Architecture Decisions

- **Student-chosen collection topic**: The schema is entirely student-designed. The README suggests keeping it simple — one table, a few columns. The `my-fullstack-collection-solution` uses a sample dataset as a reference.
- **`server.ts` is bare**: Only `express.json()` and static production serving are set up. Students import and mount their own router or add routes inline.
- **`App.tsx` is minimal**: Just a heading and empty `<section>` — students add all components and data-fetching logic.
- **TanStack Query for data fetching**: The project is pre-configured. Students use `useQuery` for listing items and `useMutation` for CUD operations.
- **`client/apis/` directory**: The convention is to place `superagent` or `fetch` API client functions here, separate from hooks.

## Key Conventions

- DB functions live in a new `server/db/<collection>.ts` file; route handlers in `server/routes/<collection>.ts` (or inline in `server.ts` for simpler implementations).
- Migrations go in `server/db/migrations/`; seeds go in `server/db/seeds/`.
- `server/db/connection.ts` exports the Knex connection — import it in the DB functions file.
- After a mutation, call `queryClient.invalidateQueries({ queryKey: ['<collection>'] })` to refresh the list.
- **Note:** This is a pedagogical project with intentionally strict TypeScript, ESLint, and Prettier rules. These enforce industry best practices — follow them exactly.

## Potential Pitfalls

- **No routes means nothing works**: `server.ts` has no API routes until the student adds them — all API calls return 404.
- **Schema complexity creep**: Students sometimes design overly complex schemas (multiple tables, many columns). Encourage one simple table first; add complexity after the basic flow works.
- **TanStack Query cache invalidation**: After mutations, `queryClient.invalidateQueries` must be called — without it the list doesn't update after add/delete.
- **Migrations must be run before seeding**: `seed:run` fails if the table doesn't exist yet.
- **TypeScript type for collection items**: Students should define an interface (e.g. `interface Book`) in a `models/` file and use it across DB functions, routes, and React components.

## Related Documentation

- [README.md](README.md): Project requirements and step-by-step task list.
- [AGENTS.md](AGENTS.md): Shared AI context file — source of truth for all agent briefings.
- [CLAUDE.md](CLAUDE.md): Claude Code context (imports AGENTS.md; may include tutoring guidelines if used in educational settings).
- [GEMINI.md](GEMINI.md): Gemini AI context (self-contained copy of this file's content).
- [my-fullstack-collection-solution](../my-fullstack-collection-solution/): Reference implementation.

## PromptKit Quick Reference
- Review the available artefacts when the student requests them:
  - Protocol: `promptkit/protocols/setup.md` — instructions for updating these CLI briefings.
  - Workflow: `promptkit/workflows/tutor.md` — guide for tutoring/explanation sessions.
  - Workflow: `promptkit/workflows/reflect.md` — guide for documenting outcomes and next steps.
- Student notes live in `promptkit/notes/`; The table in `progress-journal.md` is main place to update with reflections. Instructor Activities are in `promptkit/activities/` (read-only).
- When new workflows arrive, expect additional files under `promptkit/workflows/`.
