# WD04 — Fullstack: Written Submission

**Project:** Moonlit Library (formerly `my-fullstack-collection` — Dev Academy fullstack-collection challenge)
**Branch:** `main`
**Repo:** https://github.com/serina-mcfall/moonlit-library
**Live demo:** https://moonlit-library.onrender.com
**Submitted by:** Serina McFall
**Date:** 2026-06-15

This submission documents Moonlit Library as a deployed fullstack application — a React + Vite client, an Express + Knex server, a SQLite database with migrations and seeds, and a live Render deployment built from a config-as-code `render.yaml`. The same project was submitted for **CP02 (Software Quality)** on 2026-06-13 (`docs/cp02-submission.md`) and **WD03 (Forms)** on 2026-06-15 (`docs/wd03-submission.md`). Where those docs already exhaustively cover a11y / forms / refactoring, this doc references rather than duplicates and focuses on the deployment story.

---

## 1. Architecture overview

```
┌───────────────────┐       ┌─────────────────────┐       ┌──────────────┐
│  React 18 client  │  ───► │  Express API server │  ───► │  SQLite DB   │
│  (Vite-built)     │       │  (Knex query layer) │       │  (migrations │
│  served as static │       │  /api/v1/*          │       │   + seeds)   │
└───────────────────┘       └─────────────────────┘       └──────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  Open Library API   │
                            │  (search backend)   │
                            └─────────────────────┘
```

| Layer | Stack |
|---|---|
| **Client** | Vite, React 18, TypeScript, React Router, TanStack Query |
| **Server** | Express 4, Knex 2 |
| **Database** | SQLite 3, migrations + seeds via Knex |
| **External API** | Open Library (search-to-prefill on AddBook — see `wd03-submission.md` §8) |
| **Build / run** | Vite for the client bundle, `tsx` for the server (TS in production without a pre-bundled `dist/server.js`) |
| **Tests** | Vitest, supertest, nock — 34 passing |
| **Lint / format** | ESLint (Dev Academy React preset), Prettier |
| **Deployment** | Render free tier, Node runtime, config-as-code via `render.yaml` |

The Express server **also serves the built client** as static files in production (`server.use(express.static(…))`) — so a single Render web service hosts both the API and the SPA, behind one URL.

---

## 2. Live demo — and what visitors actually see

**URL:** https://moonlit-library.onrender.com

The deployed instance behaves as a working library — visitors can browse the seeded books, search via Open Library, add their own, edit / review them, and use the MoonRating widget. Two honest caveats are worth knowing:

### 2a. Ephemeral database
Each redeploy wipes the container's filesystem and re-seeds from scratch (see §5). That is by design — see the persistence decision tree below.

### 2b. Cold starts on the free tier
Render's free tier sleeps a service after **15 minutes of inactivity**. The first request after that takes ~30 seconds to wake the container. Subsequent requests are fast. The trade-off is acceptable for a portfolio piece — and I'd rather be honest about the constraint than pretend a free demo is a production app.

Both behaviours are disclosed in the repo's `README.md` under "Live demo":
> **Demo behaviour:** the deployed instance uses ephemeral SQLite that re-seeds on every redeploy. Visitors can add/edit books and write reviews, but those changes only live until the next push. The repo is the full app — clone it to keep your own books.

---

## 3. Build pipeline

The build step turns the `client/` source into a static bundle. The server isn't pre-compiled — it runs straight from TypeScript via `tsx` in production, which removes a whole category of "did we ship the right `dist/server.js`?" deployment errors.

```json
// package.json (excerpts)
"scripts": {
  "start": "tsx server/index.ts",
  "build": "vite build",
  …
},
"engines": {
  "node": ">=20"
}
```

`tsx` is intentionally listed under **`dependencies`** (not `devDependencies`) so it's available in production:

```json
"dependencies": {
  …
  "tsx": "^4.21.0"
}
```

The `engines.node` pin makes sure Render selects a Node 20+ image during the build — avoiding the ESM / native-modules / `node:` import gotchas that older Node versions on Render's free tier can trip into.

---

## 4. Start command — the NODE_ENV scoping decision

The start command sets `NODE_ENV=production` *at runtime*, not via Render's `envVars` block:

```yaml
# render.yaml
startCommand: NODE_ENV=production npm start
```

This is deliberate. If `NODE_ENV=production` were exported at build time, npm would **skip `devDependencies`** during `npm install`, and `vite build` would fail with `vite: not found` (Vite lives in `devDependencies`). Setting `NODE_ENV` only in the `startCommand` lets the build install everything it needs, then narrows down to production behaviour at boot.

The full intent is captured in `render.yaml`'s header comments so future-me (or a reviewer) doesn't accidentally "fix" it:

```yaml
# NODE_ENV is intentionally set in startCommand, not as an envVar,
# so that `npm install` during the build phase still installs
# devDependencies (vite, @vitejs/plugin-react etc. are needed for
# `vite build` to succeed).
```

---

## 5. Production database — the persistence decision tree

SQLite on Render's free tier has a constraint: **the container's filesystem is ephemeral**. Anything written to disk during a deploy survives until the next deploy, then is wiped. Three options were on the table:

| Option | What it means | Cost |
|---|---|---|
| **(a) Ephemeral + seed-on-startup** | Migrations + seeds run on every boot. Visitors get a fresh seeded library each redeploy. | ~2 hours |
| (b) Switch to Render's free Postgres | Real persistence. Requires a Knex client swap + new migrations + new connection config. | ~half day |
| (c) Turso (LibSQL) | Keep the SQLite shape, get cloud persistence. Requires a Turso account + LibSQL adapter. | ~2–3 hours |

**Decision: option (a).** Reasoning:

- A personal book library doesn't *need* to remember visitor data — it's not a multi-tenant app, and the deployed instance is a demo of the *codebase*, not a public service.
- Fastest path to the WD04 deploy requirement (which was the assessment gate).
- The repo is the truth — anyone who wants their own persistent library clones it and runs it locally.

This is disclosed clearly in the README, the `render.yaml` header, and the live-demo section above. Option (b) or (c) remain straightforward upgrade paths if the project ever needs persistent multi-visitor state.

---

## 6. Seed-on-startup mechanism

The startup wrapper in `server/index.ts` runs migrations and seeds **only in production**, then starts the listener. In development, migrations/seeds are run manually via `npm run knex migrate:latest && npm run knex seed:run` — no behavioural change from before the deploy work.

```ts
// server/index.ts
import 'dotenv/config'
import server from './server.ts'
import db from './db/connection.ts'

const PORT = process.env.PORT || 3000

async function start() {
  if (process.env.NODE_ENV === 'production') {
    console.log('[startup] Running migrations…')
    await db.migrate.latest()
    console.log('[startup] Running seeds…')
    await db.seed.run()
    console.log('[startup] Database ready.')
  }

  server.listen(PORT, () => {
    console.log('Listening on port', PORT)
  })
}

start().catch((err) => {
  console.error('[startup] Failed to start:', err)
  process.exit(1)
})
```

If migrations or seeds fail, the process exits with code 1 and the deploy is marked failed — the container never serves stale traffic with a half-initialised database.

The matching production block in `server/db/knexfile.js`:

```js
production: {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: Path.join(__dirname, 'prod.sqlite3'),
  },
  migrations: {
    directory: Path.join(__dirname, 'migrations'),
  },
  seeds: {
    directory: Path.join(__dirname, 'seeds'),
  },
  pool: {
    afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb),
  },
},
```

The connection filename uses `Path.join(__dirname, …)` so the prod database lives next to the migrations and seeds inside the container — no absolute paths, no `/app/storage/` indirection, nothing that depends on Render-specific filesystem layout. The same `pool.afterCreate` hook enables foreign-key enforcement (off by default in SQLite) consistently across all three environments.

---

## 7. Render config-as-code

The whole deploy lives in one file:

```yaml
# render.yaml
services:
  - type: web
    name: moonlit-library
    runtime: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: NODE_ENV=production npm start
    autoDeploy: true
```

That covers:

- **`type: web`** — public web service (vs. background worker / cron)
- **`runtime: node`** — Node image, version chosen by `engines.node` in `package.json`
- **`plan: free`** — free tier (with the 15-min sleep behaviour disclosed above)
- **`buildCommand`** — install everything (devDeps included for the Vite build) then `vite build`
- **`startCommand`** — narrow to production at boot (see §4)
- **`autoDeploy: true`** — pushes to `main` trigger redeploys automatically; the seed-on-startup mechanism means every push gives the demo a clean library

The Render dashboard was used **only to point Render at the repo**; everything else was committed to git as `render.yaml`. That means the deployment is reproducible — anyone forking the repo can deploy their own copy by pointing a fresh Render Blueprint at it, no dashboard archaeology needed.

---

## 8. Local verification before deploy

Before pushing the deploy commit, the production mode was exercised locally. From a clean checkout:

```sh
npm install
npm run build               # vite build → client/dist/
NODE_ENV=production npm start
# [startup] Running migrations…
# [startup] Running seeds…
# [startup] Database ready.
# Listening on port 3000
```

Then in a second terminal:

```sh
curl http://localhost:3000/api/v1/books          # returns the seeded library
curl http://localhost:3000/api/v1/search?q=harry+potter  # returns Open Library results
curl http://localhost:3000/                       # returns the bundled index.html
```

All three behaved identically to the deployed Render instance. The local check caught and fixed:
- a `dist/` lint-pollution issue (the build output was being linted) — added `dist` to `eslintConfig.ignorePatterns`
- a `prod.sqlite3` working-tree pollution — added to `.gitignore`

---

## 9. Tests

The same 34-test suite documented in WD03 §10 is exercised before every deploy. Server-route tests use an **in-memory SQLite** that's migrated and seeded fresh per test:

```ts
// server/routes/books.test.ts
beforeEach(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
  await db.seed.run()
})
```

The same migrations-then-seeds sequence used at production boot is therefore exercised by every test run, which gives the deploy mechanism continuous coverage. Run with `npm test`.

**Result before the deploy commit (`db95b5d`):**
```
 Test Files  6 passed (6)
      Tests  34 passed (34)
      Lint   0 problems
      Tsc    0 errors
```

---

## 10. The deploy event itself

A single commit shipped all the production-readiness changes:

> `db95b5d` — *feat: prepare production startup + Render deploy config*

This touched:
- `server/index.ts` — startup wrapper with migrations + seeds
- `server/db/knexfile.js` — production block with the container-relative paths
- `package.json` — `start` / `build` scripts, `tsx` moved to dependencies, `engines.node`, `dist` added to `eslintConfig.ignorePatterns`
- `render.yaml` — new file, config-as-code
- `README.md` — live-demo section with honest behaviour disclosure
- `.gitignore` — `prod.sqlite3`

Render's Blueprint flow read `render.yaml` from the repo root, created the `moonlit-library` web service automatically, and the first build went green in ~6 minutes:
1. Render cloned the repo at `db95b5d`.
2. `npm install` installed everything (including devDeps — see §4).
3. `npm run build` produced `client/dist/`.
4. `NODE_ENV=production npm start` booted Node, ran migrations, ran seeds, and started listening on Render's injected `PORT` (10000).
5. Render's healthcheck passed; the service flipped to "Live"; the URL became reachable.

Subsequent pushes to `main` auto-redeploy via `autoDeploy: true` — the WD03 typo fix commit (`1ef6978 refactor: fix handelSubmit -> handleSubmit typo`) was the first auto-deploy after the initial setup.

---

## Summary

| Area | Demonstration |
|---|---|
| **Live URL** | https://moonlit-library.onrender.com |
| **Fullstack** | React + Vite client → Express + Knex server → SQLite database → Open Library search backend |
| **Build pipeline** | `npm install && npm run build` (devDeps available); single Vite build for the client; server runs straight from TypeScript via `tsx` |
| **Production startup** | Migrations + seeds run on every boot under `NODE_ENV=production`; clear `[startup]` log lines; exits non-zero on failure |
| **Persistence** | Option (a) ephemeral SQLite + seed-on-startup. Decided, disclosed, defensible. |
| **Config-as-code** | `render.yaml` checked in; deployment reproducible by forking + pointing a Blueprint at the repo |
| **NODE_ENV scoping** | Set in `startCommand`, not `envVars`, so build-time `npm install` keeps devDeps for Vite |
| **Honest demo behaviour** | Cold-start + ephemeral-DB caveats spelled out in the README and again in §2 of this doc |
| **Local pre-deploy verification** | Full production-mode run-through tested locally; lint, tsc, and tests all green before the push |
| **Tests covering the deploy mechanism** | 34 passing tests; `beforeEach` re-runs migrations + seeds in each route test, mirroring the production startup sequence |
| **CI behaviour** | `autoDeploy: true` — every push to `main` redeploys, exercises the migrations + seeds path again |

All code, deploy config, and supporting docs are committed to `main` at the repo URL at the top of this document. The live deployment is reachable at https://moonlit-library.onrender.com.
