# Serina's Book Library — UI Design Spec
**Date:** 2026-06-09
**Status:** Approved (brainstorming complete) — scope expanded to include full CRUD per Serina's update

## Overview

Transform the working-but-bare React books frontend (currently a `<ul>` of "title — author" rows) into a magical, moonlit fantasy library with a tile-based collection view, per-book detail pages, a status-driven mana bar, and a fairy dust cursor. Pair the UI work with **full CRUD** on the backend — Serina chose to scaffold Create / Update / Delete now rather than in a later round.

The implementation spans: 1 shared model, 4 new DB functions + 4 new routes + 4 new API client calls, 5 new React components, 5 routes, and the theme/CSS layer.

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

## Scope (Option C+ — full magical experience with full CRUD)

In scope this round:
1. Twilight/Moonlit palette via CSS custom properties on `:root`
2. Cinzel (display) + Andika (body) from Google Fonts — dyslexia-friendly pairing
3. React Router setup (already in devDeps)
4. List view as tile grid
5. Per-book detail page route (`/books/:id`)
6. **Full CRUD backend**: `getAll`, `getById`, `add`, `update`, `deleteById` knex functions + matching Express routes
7. **Full CRUD frontend**: `fetchAllBooks`, `fetchOne`, `addBook`, `updateBook`, `deleteBook` API client calls
8. **Add Book form** at `/books/new`
9. **Edit Book form** at `/books/:id/edit`
10. **Delete Book** action on detail page (uses browser `confirm()` for the workshop — no custom modal complexity)
11. Mana bar component (status-derived)
12. Fairy dust cursor effect
13. A11y: focus states, `prefers-reduced-motion`, mana bar with `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, focus management on route change, every form input labelled, errors announced via `role="alert"`

## Components & file additions

```
client/
  apis/
    books.ts                 (existing — add fetchOne, addBook, updateBook, deleteBook)
  components/
    App.tsx                  (existing — wrap in Router, add routes)
    BooksList.tsx            (existing — refactor as tile grid + "Add Book" header link)
    BookCard.tsx             (NEW — single tile, clickable Link)
    BookDetail.tsx           (NEW — detail page route + Edit / Delete buttons)
    BookForm.tsx             (NEW — shared form, used for both Add and Edit)
    AddBook.tsx              (NEW — /books/new route, wraps BookForm)
    EditBook.tsx             (NEW — /books/:id/edit route, wraps BookForm with prefill)
    ManaBar.tsx              (NEW — progress bar component)
    FairyDustCursor.tsx      (NEW — cursor effect mount)
  lib/
    mana.ts                  (NEW — status → mana% helper)
  styles/
    index.css                (existing — palette + Cinzel + Andika + base styles)

server/
  db/
    books.ts                 (existing — add getById, add, update, deleteById)
  routes/
    books.ts                 (existing — add GET /:id, POST /, PATCH /:id, DELETE /:id)

models/
  books.ts                   (existing — add BookDraft type for inputs without id)
```

**Why one `BookForm` component for both Add and Edit:** the inputs and validation are identical. The only differences are the initial values (empty vs prefilled) and the submit handler (POST vs PATCH). `BookForm` accepts `initialValues` and `onSubmit` props; `AddBook.tsx` and `EditBook.tsx` are thin wrappers that supply those.

## Routing

- `/` → `<BooksList />` (tile grid)
- `/books/new` → `<AddBook />` (empty form)
- `/books/:id` → `<BookDetail />` (spread layout with Edit / Delete actions)
- `/books/:id/edit` → `<EditBook />` (form prefilled with current values)
- React Router v7 (already installed)
- Wrap `<App />` in `<BrowserRouter>` inside `client/index.tsx`

**Post-mutation navigation:**
- After successful Add → navigate to `/books/:newId` (the new detail page)
- After successful Edit → navigate to `/books/:id` (back to the detail page)
- After successful Delete → navigate to `/` (back to the library)
- All mutations invalidate the `['books']` query so the list refreshes when next viewed

## API additions — full CRUD

### Shared model (`models/books.ts`)

```ts
export interface Book {
  id: number
  title: string
  author: string | null
  series: string | null
  genre: string | null
  read_status: string | null
  cover_image: string | null
  notes: string | null
}

// For inserts/updates — same shape minus the auto-generated id
export type BookDraft = Omit<Book, 'id'>
```

### Server (`server/db/books.ts`)

| Function | Returns | Notes |
|---|---|---|
| `getAll()` | `Promise<Book[]>` | Existing — no change |
| `getById(id: number)` | `Promise<Book \| undefined>` | `.where({ id }).first()` |
| `add(book: BookDraft)` | `Promise<number>` | `.insert(book).returning('id')` — returns the new row's id |
| `update(id: number, book: Partial<BookDraft>)` | `Promise<number>` | Returns count of affected rows (1 or 0) |
| `deleteById(id: number)` | `Promise<number>` | Returns count of deleted rows |

### Server (`server/routes/books.ts`)

| Method | Path | Handler logic |
|---|---|---|
| `GET` | `/` | Existing — `getAll()`, return JSON array |
| `GET` | `/:id` | Parse `id` from params, call `getById`. If `undefined`, `res.status(404).json({ error: 'Book not found' })`. Otherwise return the book. |
| `POST` | `/` | Read `req.body`, validate `title` is non-empty string. Call `add(book)`, return `res.status(201).json({ id: newId })`. |
| `PATCH` | `/:id` | Parse `id`. Call `update(id, req.body)`. If 0 affected rows → 404. Otherwise `res.status(200).json({ ok: true })`. |
| `DELETE` | `/:id` | Parse `id`. Call `deleteById(id)`. If 0 affected rows → 404. Otherwise `res.status(204).end()`. |

All routes log on entry (`console.log('[route] ...')`) per the existing tracing convention.

### Client (`client/apis/books.ts`)

| Function | Returns | Used by |
|---|---|---|
| `fetchAllBooks()` | `Promise<Book[]>` | Existing — used by `<BooksList />` |
| `fetchOne(id)` | `Promise<Book>` | `<BookDetail />`, `<EditBook />` |
| `addBook(book: BookDraft)` | `Promise<{ id: number }>` | `<AddBook />` |
| `updateBook(id, partial: Partial<BookDraft>)` | `Promise<void>` | `<EditBook />` |
| `deleteBook(id)` | `Promise<void>` | `<BookDetail />` |

### React Query usage

- **Reads:** `useQuery({ queryKey: ['books'] })` for the list, `useQuery({ queryKey: ['books', id] })` for one book.
- **Mutations:** `useMutation` with `onSuccess` that calls `queryClient.invalidateQueries({ queryKey: ['books'] })` and `navigate(...)` to the appropriate next route.
- Optimistic updates are **out of scope** for round one — simpler to just invalidate-and-refetch.

## Forms & validation

`BookForm.tsx` holds all input UI. Field rules:

| Field | Input type | Required | Validation |
|---|---|---|---|
| `title` | text | yes | non-empty after trim |
| `author` | text | no | trim, empty → null |
| `series` | text | no | trim, empty → null |
| `genre` | text | no | trim, empty → null |
| `read_status` | select | no | dropdown of `not started / just started / reading / nearly finished / finished` |
| `cover_image` | url | no | empty → null; basic URL shape check |
| `notes` | textarea | no | trim, empty → null |

**Validation strategy** — client-side does the obvious checks (title required, URL shape), server still enforces title-required so a malformed request can't slip through. Error messages render in a `role="alert"` `<div>` above the form so they're announced to assistive tech.

**Visual treatment of form inputs** (consistent with Moonlit Cobalt palette):

- Inputs: `--bg-raised` background, 1px `--border-gold` border, `--text` text colour, 8px padding
- Focused input: 2px `--gold` outline + soft pink glow
- Labels: Andika, `--text`, above each input, `margin-bottom: 4px`
- Submit button: Cinzel small-caps, gold border + gold text on transparent bg, hover gold-fill
- Cancel button: same shape, muted (no border glow)
- Delete confirmation: use browser `confirm('Delete "Title" from your library?')` — pragmatic and a11y-correct out of the box. Custom modal deferred to round two.

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
| Heading structure | `<h1>` per page (library on `/`, book title on `/books/:id`, "Add Book" on `/books/new`, "Edit Book" on `/books/:id/edit`). Sub-sections use `<h2>`. |
| Landmark | Existing `<main>` wraps routed content. |
| Form labels | Every `<input>` has a `<label htmlFor>` association. Required fields marked `aria-required="true"`. |
| Form errors | Validation messages render in a `role="alert"` `<div>` so they're announced when they appear. |
| Mutation feedback | Submit button disabled while mutation pending; success → navigate (announces new page); error → `role="alert"` message. |
| Delete confirmation | Native `confirm()` is fully a11y-compliant (browser-managed focus and announcement) — pragmatic choice that avoids custom-modal complexity. |

## Out of scope

- New columns on `books` table (`progress_percent`, `pages_total`, etc.)
- Custom delete-confirmation modal (using browser `confirm()` for this round)
- Optimistic UI updates on mutations (invalidate-and-refetch is fine for 5-50 books)
- Inline editing on the detail page (separate `/books/:id/edit` route this round)
- Open Library cover lookup integration (autofill via ISBN)
- Search, filter, sort
- Light theme / theme toggle
- Authentication

These are clear round-two candidates but not part of this design.
