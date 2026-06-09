# Serina's Book Library — UI Design Spec
**Date:** 2026-06-09
**Status:** Approved (brainstorming complete)

## Overview

Transform the working-but-bare React books frontend (currently a `<ul>` of "title — author" rows) into a magical, moonlit fantasy library with a tile-based collection view, per-book detail pages, a status-driven mana bar, and a fairy dust cursor.

The backend (DB, API, routing in Express) stays as-is for this scope. All work is on the React client + shared model + one new API endpoint.

## Aesthetic direction — "Moonlit Cobalt"

Drawn from Serina's reference image (xianxia-style cobalt night with moon, cherry blossoms, lanterns, lotus).

### Palette

| Role | Token | Hex |
|---|---|---|
| Background (deepest) | `--bg-deep` | `#0a1230` |
| Background (mid) | `--bg-mid` | `#142048` |
| Background (raised) | `--bg-raised` | `#1a2547` |
| Card surface tint | `--surface` | `rgba(255,255,255,0.025)` |
| Border (subtle gold) | `--border-gold` | `rgba(240,200,150,0.2)` |
| Text primary | `--text` | `#f3e8d4` |
| Text secondary | `--text-muted` | `#c8b8a0` |
| Accent gold (lantern) | `--gold` | `#e0c080` |
| Accent gold (warm) | `--gold-warm` | `#d4a880` |
| Accent pink (blossom) | `--pink` | `#f5a8c0` |
| Accent cyan (lotus) | `--cyan` | `#7ec8c0` |
| Moon glow | `--moon` | `#f5e8c8` |

Background uses a vertical gradient: `linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-mid) 50%, var(--bg-deep) 100%)`.

### Typography (dyslexia-friendly)

Serina is dyslexic, so typography prioritises **readability first, magical aesthetic second**. The pairing borrows from her own MTG project's chosen stack.

- **Display & headings (h1, h2, book titles):** **Cinzel** (Google Fonts) — magical and elegant via all-caps Roman letterforms, but well-spaced so letters don't blur. Used for page headings and book titles.
- **Body, labels, metadata, notes:** **Andika** (Google Fonts) — designed for literacy and used by reading-instruction programmes. Highly distinguishable letterforms (b/d, p/q, m/n) without looking clinical. Has just enough warmth to feel magical-cosy, not sterile.
- **Italics:** Used *sparingly* — only for short phrases (one line max). No italic body paragraphs. Notes use upright Andika.
- **Body sizing & spacing:** 16px minimum, line-height **1.6**, letter-spacing **0.02em**, max-width **65ch** on body text to prevent long-line fatigue.
- **Labels:** Small uppercase Cinzel, letter-spacing 2px, in `--gold-warm`, used to label sections like "NOTES" or "FANTASY · TRILOGY".
- **Text alignment:** Left-aligned only — never justified (justify destroys word spacing and reading flow for dyslexic readers).

This is the same Cinzel + Andika pairing she chose for her own MTG project, so it's a proven combination for her reading.

### Mana bar

A horizontal progress bar derived from `read_status`. Status-based (no schema change in this round).

| `read_status` value | Mana percentage |
|---|---|
| `not started` / `not_started` / `untouched` | 100% (full) |
| `just started` / `just_started` | 90% |
| `reading` / `in progress` | 50% |
| `nearly finished` / `almost done` | 10% |
| `finished` / `read` / `done` | 0% (empty) |
| anything else / null | 100% (default full) |

Visuals:
- 8px high on detail page, 5px high on tile
- 3-stop gradient fill: `gold → pink → cyan` (left to right)
- Pink box-shadow glow `rgba(245,168,192,0.7)`
- Track: `--bg-raised` with 1px gold border
- Drains from right to left as book is read (high mana = unread, low mana = read)

Mapping is centralised in a `manaFromStatus(status: string | null): number` helper in `client/lib/mana.ts`.

### Layout

**Tile grid (`/`):**
- CSS Grid, `repeat(auto-fit, minmax(180px, 1fr))`, gap 18px
- Each tile: cover image (2:3 aspect ratio), title (Cinzel, mixed-case), author (Andika, smaller, muted), mana bar
- Cover has soft pink box-shadow glow + 1px gold border
- Hover/focus state: brighter glow, subtle lift (translate-y-1px)

**Detail page (`/books/:id`)** — Spread layout:
- Header: small "← back to library" link in gold
- 2-column: 90px cover left, metadata stack right
- Metadata stack: small uppercase Cinzel label ("FANTASY · SERIES NAME"), title (Cinzel 24px), author ("by ...") in gold Andika, mana bar + status caption
- Divider rule (gold, 1px, 15% opacity)
- "Notes" section below: small uppercase label, italic body text

### Fairy dust cursor

Soft pink + gold sparkle particles trailing the cursor, gentle fade.

- Vanilla JS (no library), ~80 lines
- Spawns small `<div>` particles on `mousemove` (throttled to ~60Hz max)
- Each particle: 3-6px, radial gradient pink/gold, position: fixed, pointer-events: none
- CSS animation: fade out + scale down + drift up slightly, duration 800-1200ms randomised
- Self-removes when animation completes

**Disabled on:**
- `prefers-reduced-motion: reduce` (no particles spawned, JS guards entirely)
- Touch devices (`pointer: coarse` media query — no cursor exists)

**Scope:** Mounted once at the App level so it follows the cursor across every route (list, detail). Particle container is `position: fixed` at viewport root.

## Scope (Option C — full magical experience)

In scope this round:
1. Twilight/Moonlit palette via CSS custom properties on `:root`
2. Cinzel (display) + Andika (body) from Google Fonts — dyslexia-friendly pairing
3. React Router setup (already in devDeps)
4. List view as tile grid
5. Per-book detail page route (`/books/:id`)
6. `getById(id)` knex function + `GET /api/v1/books/:id` route + `fetchOne(id)` API client
7. Mana bar component (status-derived)
8. Fairy dust cursor effect
9. A11y: focus states, `prefers-reduced-motion`, mana bar with `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, focus management on route change

Out of scope (round two):
- `progress_percent` column for percentage-based mana bar (currently status-derived)
- Form for adding new books
- Editing book details (read_status, notes)
- Open Library cover lookup
- Sort/filter

## Components & file additions

```
client/
  apis/
    books.ts                 (existing — add fetchOne)
  components/
    App.tsx                  (existing — wrap in Router, add routes)
    BooksList.tsx            (existing — refactor as tile grid)
    BookCard.tsx             (NEW — single tile)
    BookDetail.tsx           (NEW — detail page route)
    ManaBar.tsx              (NEW — progress bar component)
    FairyDustCursor.tsx      (NEW — cursor effect mount)
  lib/
    mana.ts                  (NEW — status → mana% helper)
  styles/
    index.css                (existing — palette + Cinzel + Andika + base styles)

server/
  db/
    books.ts                 (existing — add getById)
  routes/
    books.ts                 (existing — add GET /:id handler)

models/
  books.ts                   (existing — no changes)
```

## Routing

- `/` → `<BooksList />` (tile grid)
- `/books/:id` → `<BookDetail />` (spread layout)
- React Router v7 (already installed)
- Wrap `<App />` in `<BrowserRouter>` inside `client/index.tsx`

## API additions

**Server:**
- `getById(id: number)` in `server/db/books.ts` — returns `Book | undefined`
- `GET /api/v1/books/:id` in `server/routes/books.ts` — calls `getById`, returns 404 if not found

**Client:**
- `fetchOne(id: number): Promise<Book>` in `client/apis/books.ts`
- `useQuery({ queryKey: ['books', id], queryFn: () => fetchOne(id) })` in `<BookDetail />`

## Accessibility checklist

| Item | Approach |
|---|---|
| Keyboard navigation | Tiles are `<Link to={`/books/${id}`}>` — keyboard-focusable by default. "Back to library" is also a `<Link>`. |
| Focus management on route change | On `<BookDetail />` mount, focus the `<h1>` book title (set `tabIndex={-1}` so it's programmatically focusable but not in the tab order). |
| Visible focus | `:focus-visible` styles in `index.css` — 2px gold outline, 2px offset, on every interactive element. |
| `prefers-reduced-motion` | Fairy dust JS guarded entirely. CSS animations on mana bar glow and tile hover reduced to instant. |
| Mana bar semantics | `role="progressbar"`, `aria-valuenow={percent}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label={`Reading progress: ${status}`}` |
| Cover images | If `cover_image` URL exists, render `<img alt={`Cover of ${book.title}`}>`. If null, render a placeholder `<div>` with a coloured gradient (no `<img>`); the title text adjacent makes alt-equivalent. |
| Color contrast | Verify `--text` (`#f3e8d4`) on `--bg-deep` (`#0a1230`) hits WCAG AA (~14.5:1, well above) and `--gold` (`#e0c080`) on same hits AA (~11:1, well above). Pink/cyan accents are decorative only, never sole carrier of info. |
| Heading structure | `<h1>` per page (library on `/`, book title on `/books/:id`). Sub-sections use `<h2>`. |
| Landmark | Existing `<main>` wraps routed content. |

## Out of scope

- New columns on `books` table (`progress_percent`, `pages_total`, etc.)
- "Add book" form / POST endpoint
- "Update reading status" form / PATCH endpoint
- "Delete book" / DELETE endpoint
- Open Library cover lookup integration
- Search, filter, sort
- Light theme / theme toggle
- Authentication

These are clear round-two candidates but not part of this design.
