# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Student Exercises

This is a build-from-scratch challenge — there are no stubs to fill in. Students choose their own collection topic and implement all layers themselves, guided by the README task list:

**Step 1 — Choose a collection topic:** Pick something simple with one table (e.g. books, movies, games). Keep to a few columns to start.

**Backend (create these files):**
- `server/db/migrations/<timestamp>_create_<collection>.ts` — schema for the collection table
- `server/db/seeds/<timestamp>_<collection>.ts` — a few sample rows
- `server/db/<collection>.ts` — Knex query functions: at minimum `getAll()`, `add(data)`, `update(id, data)`, `delete(id)`
- `server/routes/<collection>.ts` — Express router with GET, POST, PATCH, DELETE handlers
- Mount the router in `server/server.ts` below the `// ADD YOUR API ROUTES HERE` comment

**Frontend (create/extend these files):**
- `client/apis/<collection>.ts` — API client functions using `superagent` or `fetch`
- `client/hooks/<collection>.ts` (optional) — TanStack Query hooks wrapping the API functions
- `client/components/<Collection>List.tsx` — list component using `useQuery`
- `client/components/Add<Collection>.tsx` — form/input for adding items using `useMutation`
- Extend `client/components/App.tsx` to render the list and add-form components

**Stretch:**
- Add a detail view for a single item
- Add filtering or sorting
- Add a second table with a relationship

## Tutoring Guidelines

- Follow the `promptkit/workflows/tutor.md` workflow for explanation sessions.
- Ask questions that move students toward the answer rather than stating it.
- Encourage the student to decide their collection topic before writing any code — the schema drives everything.
- When a student is stuck on the schema, ask: "What are the must-have fields? What could you add later?"
- When a student is stuck on React Query, point them to the `query-em-all` challenge as a reference for `useQuery` and `useMutation` patterns.
- Do not implement entire files on behalf of the student — ask them to describe each operation in plain English first, then guide them to the Knex or React Query docs.
- Remind students to test each layer as they go: database → API (Postman/Thunder Client) → frontend.
