# Moonlit Library

A personal book library — built as a Dev Academy fullstack challenge, polished as a portfolio piece, designed for the way I actually read.

## Status

Feature-complete against the original challenge brief. Currently being polished for public showcase as part of [vixenz.dev](https://vixenz.dev) — a11y sweep and case study in progress.

## Live demo

Deployed on Render — see [`render.yaml`](./render.yaml) for the config.

> **Demo behaviour:** the deployed instance uses ephemeral SQLite that re-seeds on every redeploy. Visitors can add/edit books and write reviews, but those changes only live until the next push. The repo is the full app — clone it to keep your own books.

## What it does

A small fullstack app to keep, review, and reflect on books I'm reading:

- Browse a personal collection
- Add books with title, author, series, genre, and read status
- Edit and delete entries
- Review with **MoonRating** — a custom moon-themed rating component (because stars are overdone)
- Capture longer thoughts in an **Impressions** section (because ratings alone don't say much)
- Search across the collection
- Existing-value suggestions for author/series/genre via native HTML `datalist`
- Locally-hosted WebP covers — the library works offline

## Why it looks the way it does

- **Dark palette by default.** Deep blues, warm gold accents, parchment-tinted text. Easier on dyslexic and migraine-prone eyes; easier on most others too.
- **Cinzel for display, Andika for body.** Andika is a literacy-themed typeface designed for dyslexic readers. Thematically right for a *book* library; practically right for me.
- **`prefers-reduced-motion` respected** wherever animation is used.
- **Accessibility caught while building**, not retrofitted — see the `Fix orphaned form labels and skipped heading level` commit for the receipts.

## Engineering notes

Process artefacts live in `docs/superpowers/`:

- `specs/` — design specs written before features are built
- `plans/` — implementation plans linking spec → code
- `handoffs/` — checkpoints between work sessions

The `moonRating` helper was built test-first — see `Add failing tests for moonRating helper` followed by `Implement moonRating helper` in `git log`.

## Tech stack

- **Client:** Vite, React 18, TypeScript, React Router, TanStack Query
- **Server:** Express, Knex, SQLite (better-sqlite3)
- **Tests:** Vitest, supertest
- **Typography:** Cinzel + Andika (loaded via Google Fonts)
- **Tooling:** ESLint, Prettier

## Getting started

```sh
npm install
npm run knex migrate:latest
npm run knex seed:run
npm run dev
```

Then open the URL Vite prints (defaults to `http://localhost:5173`).

Run the tests with `npm test`, lint with `npm run lint`, format with `npm run format`.

## Origin + lineage

This repo carries its full git history from the Dev Academy fullstack-collection brief — the original `Sporked` commit is preserved as the first commit. The bootcamp shell stays in `~/Dev-Academy/my-fullstack-collection/` on the local machine as the original record; this repo is the *journey* from "brief filled in" to "portfolio piece."

## Case study

The case study lives at [vixenz.dev/work/moonlit-library](https://vixenz.dev/work/moonlit-library) — covers the design choices, the a11y arc, and what I'd build next.

---

Built by **Serina Mcfall** — [vixenz.dev](https://vixenz.dev) · [github.com/serina-mcfall](https://github.com/serina-mcfall)
