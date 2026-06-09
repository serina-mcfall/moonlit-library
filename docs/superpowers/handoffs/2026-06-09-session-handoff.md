# Session Handoff — 2026-06-09 → 2026-06-10

> **For Claude on Serina's laptop tomorrow:** This file is the bridge between today's session and tomorrow's. Read it before doing anything else. The auto-memory system lives in `~/.claude/` and does NOT transfer between machines, so this file is the only "what happened yesterday" context that survives.

---

## The mission

Build "Serina's Book Library" — a magical, moonlit fantasy library UI on top of a working full-CRUD Express + React + SQLite backend. This is a Dev Academy workshop, which means **tutor mode**: Serina types the code, you ask leading questions and review. Do NOT implement components on her behalf unless she explicitly delegates (e.g. *"take over the fix"* or *"fix please"*).

Detailed tutoring rules are in `CLAUDE.md` at repo root.

---

## What's done (sessions 2026-06-09)

### Backend — complete and tested
- `books` table: `id, title, author, series, genre, read_status, cover_image, notes`
- Migration: `server/db/migrations/20260608215242_create_characters.js` (filename is misleading — it creates `books` now)
- Seed: `server/db/seeds/books.js` — 5 favourite books with Open Library cover URLs
- DB layer: `server/db/books.ts` — `getAll`, `getById`, `add`, `update`, `deleteById`
- Routes: `server/routes/books.ts` — full REST (GET, GET/:id, POST, PATCH/:id, DELETE/:id) with proper status codes (200, 201, 204, 400, 404, 500)
- Models: `models/books.ts` — `Book` interface + `BookDraft = Omit<Book, 'id'>`
- **Tests: 10 vitest+supertest integration tests** in `server/routes/books.test.ts`, all green in ~660ms

### Frontend foundations
- Theme: `client/styles/index.css` — Moonlit Cobalt palette as CSS custom properties + Cinzel (display) + Andika (body, dyslexia-friendly)
- Fonts: Google Fonts links in `index.html` (Cinzel + Andika preloaded)
- API client: `client/apis/books.ts` — `fetchAllBooks`, `fetchOne`, `addBook`, `updateBook`, `deleteBook`
- Mana helper: `client/lib/mana.ts` + tests in `client/lib/mana.test.ts` — status → percentage (0-100)
- ManaBar component: `client/components/ManaBar.tsx` — `role="progressbar"` with full ARIA semantics
- React Router wired up in `client/index.tsx` (`BrowserRouter`)
- Routes in `client/components/App.tsx`: `/`, `/books/new`, `/books/:id`
- BookDetail: `client/components/BookDetail.tsx` — spread layout, cover left, metadata + ManaBar right, notes below divider
- BookForm: `client/components/BookForm.tsx` — shared form, takes `initialValues` + `onSubmit` props
- AddBook: `client/components/AddBook.tsx` — thin wrapper around BookForm, mutation + `navigate('/books/:newId')` on success
- BooksList: `client/components/BooksList.tsx` — STILL the plain `<ul>` of titles, refactored in Task 10

### Design + plan (in `docs/superpowers/`)
- Spec: `docs/superpowers/specs/2026-06-09-book-library-ui-design.md` — palette, typography, mana bar, layouts, fairy dust, a11y checklist
- Plan: `docs/superpowers/plans/2026-06-09-moonlit-cobalt-ui.md` — 13 tasks with full code blocks per step

---

## Where Serina is in the plan

**Tasks 1-7 complete and committed:**
1. ✅ Theme foundation (palette + fonts)
2. ✅ Mana helper (TDD-style, 7 tests)
3. ✅ ManaBar component
4. ✅ API client expanded (fetchOne, updateBook, deleteBook)
5. ✅ React Router wired up
6. ✅ BookDetail page
7. ✅ BookForm refactor + AddBook redirects on success

**Task 8 is the next task to tackle:** EditBook route. Three files involved:
- Create `client/components/EditBook.tsx`
- Add `/books/:id/edit` route to `App.tsx`
- Add "Edit book" button to `BookDetail.tsx` linking to that route

Full code for Task 8 is in the plan at `docs/superpowers/plans/2026-06-09-moonlit-cobalt-ui.md`, search for "Task 8". The pattern: `useQuery` + `useMutation` in the same component, two `invalidateQueries` calls on success (list cache AND detail cache), navigate back to `/books/:id`.

**Remaining tasks (8-13):**
- 8: EditBook route
- 9: Delete action (`window.confirm` + DELETE mutation on BookDetail)
- 10: BookCard + tile grid refactor of BooksList (the big visual moment)
- 11: Fairy dust cursor (with `prefers-reduced-motion` guard, 3 tests)
- 12: Focus management on route change (auto-focus h1 on detail, h2 on forms)
- 13: Final manual a11y + visual audit

---

## Critical context for tomorrow-Claude

### Tutor mode is non-negotiable
This is a workshop. Serina types the code. You ask questions and review. The exception is explicit delegation — when she says *"take over the fix"*, *"fix please"*, or *"can you clean it up"* for a specific scoped piece, do it once, then default back to tutor mode for the next step.

### Commit after every meaningful step
Not after every task — after every step that touches a file. Mark commit prompts with "🪶 commit time" so they're visually distinct. Verification-only steps (run tests, refresh browser) do NOT need commits.

### Serina is dyslexic
Typography must stay readable. Cinzel + Andika is the locked-in pairing. No heavy italics in body text. Line-height 1.6, max-width 65ch on paragraphs. This applies to every UI choice forever, not just this project.

### Iterative learning style
She prefers "build the simple version end-to-end first, then layer complexity in round two." Don't pre-load sophistication. When she asks "can I do the simple version first then add more later?" — yes, always affirm.

### Working state
- Branch: `serinas-book-library`
- Tests: should be 17 green (10 backend + 7 mana). Run with `npm test -- --run`
- Dev: `npm run dev` for client + server, opens at `http://localhost:5173`

---

## Setup commands for the laptop

```bash
git clone git@github.com:Ngahuru-2026/my-fullstack-collection.git
cd my-fullstack-collection
git checkout serinas-book-library
npm install
npm run knex migrate:latest
npm run knex seed:run
npm run dev
```

Then open `http://localhost:5173`.

**Note:** `dev.sqlite3` is gitignored, so any books added via the UI today won't be there. The seed file has 5 originals which will be re-seeded fresh.

---

## Auto-memory rebuild

Today's machine has rich auto-memory in `~/.claude/projects/-home-serina-Dev-Academy-my-fullstack-collection/memory/` covering:

- `feedback_workshop_tutor_mode.md` — tutor mode rules + common workshop confusions
- `feedback_iterative_learning.md` — "simple-first then layer" + tests-after-manual-proof patterns
- `feedback_commit_per_step.md` — small-commits discipline
- `feedback_accessibility_first.md` (global) — accessibility rules
- `user_dyslexia.md` — dyslexia-friendly typography constraints
- `user_reading_taste.md` — modern fantasy / Asian fantasy slant
- `project_avalune_compendium.md` — Express+Knex+SQLite sandbox at `~/GitHub/Personal/avalune-compendium`
- `project_serinas_universe.md` — main canon repo at `~/GitHub/Personal/serinas-universe` (note: Aoli renamed to Anwara in 2026)
- `project_mtg.md` — Next.js MTG project at `~/GitHub/Personal/mtg-project`
- `reference_open_library_api.md` — book metadata API
- `reference_express_supertest_ready.md` — this repo's test setup
- `reference_knex_esm_gotcha.md` — knex + ESM tooling notes
- `reference_design_docs_location.md` — `docs/superpowers/specs/` + `plans/`

If laptop-Claude wants any of these contexts, ask Serina if she wants to recreate them on the laptop. They're not auto-synced.

---

## Pick-up message to use

When Serina says "back at Task 8" or similar, the response is:

> Welcome back! You're picking up at **Task 8 — EditBook route**. Three small pieces: new `EditBook.tsx`, add `/books/:id/edit` route to `App.tsx`, add an Edit button to `BookDetail.tsx`. Code is in the plan at `docs/superpowers/plans/2026-06-09-moonlit-cobalt-ui.md` (Task 8 section). Want to start typing `EditBook.tsx`?
