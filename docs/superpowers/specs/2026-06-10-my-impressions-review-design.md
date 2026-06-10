# My Impressions — Review Feature Design Spec

**Date:** 2026-06-10
**Status:** Approved (brainstorming complete)

## Overview

Add a four-field "My Impressions" feature to Serina's Book Library — her *after-reading* take on each book, distinct from `notes` (which stays as during-reading scratch / quotes auto-filled from Google Books). The impression captures her considered opinion, a moon-phase rating, a favourite quote, and a favourite character.

The feature touches one migration, no new backend routes (reuses `PATCH /api/v1/books/:id`), one new frontend route (`/books/:id/review`), and one new display section on the existing book detail page.

## Why this matters

Right now the Google Books description autofills into `notes`, which means "personal jottings" and "blurb from an API" are sharing one field. Adding `my_thoughts` separates the two cleanly. The rating + quote + character fields make the library a personal record, not just a catalogue.

## Data model

Four new nullable columns on the existing `books` table.

| Column | Type | Constraint | Purpose |
|---|---|---|---|
| `my_thoughts` | TEXT | nullable | Free-text considered take on the book |
| `rating` | INTEGER | nullable, 0–10 | Moon-phase rating; each moon = 2 units, half-moon = 1 unit |
| `favorite_quote` | TEXT | nullable | Memorable line from the book |
| `favorite_character` | TEXT | nullable | Standout character |

All nullable — a book can exist forever without a review. No new table, no foreign keys, no relationships.

**Type updates** (`models/books.ts`):
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
  my_thoughts: string | null
  rating: number | null
  favorite_quote: string | null
  favorite_character: string | null
}
```

`BookDraft = Omit<Book, 'id'>` automatically picks up the new fields.

## Rating mechanism — moon phases

Five moon glyphs representing 0–10 in half-step increments:

| Rating value | Visual | Meaning |
|---|---|---|
| 0 | ○ ○ ○ ○ ○ | No moons (new moons) — "didn't connect" |
| 1 | ◐ ○ ○ ○ ○ | One half-moon |
| 2 | ● ○ ○ ○ ○ | One full moon |
| 3 | ● ◐ ○ ○ ○ | One and a half |
| ... | ... | continues by half-steps |
| 10 | ● ● ● ● ● | Five full moons — "instant favourite" |

Display: warm gold radial gradient with subtle glow on filled moons; dim navy with thin border on empty moons.

**Interaction model:**
- **Edit mode** (in form):
  - Click the **left half** of moon N → rating becomes `(N-1)*2 + 1` (half-fills moon N)
  - Click the **right half** of moon N → rating becomes `N*2` (fully fills moon N)
  - Example: clicking right half of moon 3 → rating = 6 (three full moons)
  - Example: clicking left half of moon 3 → rating = 5 (two full moons + one half)
  - Keyboard: ← decrement by 1 (half-moon step), → increment by 1, Home → 0, End → 10
- **Display mode** (on detail): read-only, no click handlers, no focus styles.

Reusable component: `<MoonRating value={number} onChange?={(n: number) => void} />`. When `onChange` is omitted, the component is in display mode.

## Backend changes

### Migration

File: `server/db/migrations/<timestamp>_add_review_fields_to_books.js`

```js
export async function up(knex) {
  await knex.schema.alterTable('books', (table) => {
    table.text('my_thoughts').nullable()
    table.integer('rating').nullable()
    table.text('favorite_quote').nullable()
    table.text('favorite_character').nullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('books', (table) => {
    table.dropColumn('my_thoughts')
    table.dropColumn('rating')
    table.dropColumn('favorite_quote')
    table.dropColumn('favorite_character')
  })
}
```

### Routes

**No new routes.** The existing `PATCH /api/v1/books/:id` already accepts `Partial<BookDraft>`, so it picks up the new fields automatically. Same for `GET /api/v1/books/:id` and `GET /api/v1/books` — they return all columns, which now includes the review fields.

### DB layer

**No changes** to `server/db/books.ts`. `update()` already uses `Partial<BookDraft>`, so the new fields are submittable. `getAll()` and `getById()` already return all columns.

### Tests

Add three new vitest+supertest cases to `server/routes/books.test.ts`:

1. **PATCH updates review fields** — submit all four review fields, expect 200, verify persistence via subsequent GET
2. **PATCH with rating out of range** — submit `rating: 11`, currently passes (we trust the client); document the constraint as client-side only
3. **GET returns review fields** — verify the response shape includes the new columns even when null

Existing 10 tests must still pass.

## Frontend changes

### New components

| File | Responsibility |
|---|---|
| `client/components/MoonRating.tsx` | Interactive + display moon-phase rating. Props: `value`, optional `onChange`. |
| `client/components/ReviewBook.tsx` | Route component for `/books/:id/review`. Fetches book, renders form, PATCHes on submit. |
| `client/components/ImpressionsSection.tsx` | Read-only display section on detail page. Shows rating + thoughts + quote + character if any are non-null. Includes "Edit impressions" link. |

### Modified components

| File | Change |
|---|---|
| `client/components/App.tsx` | Add `<Route path="/books/:id/review" element={<ReviewBook />} />` |
| `client/components/BookDetail.tsx` | Render `<ImpressionsSection book={data} />` below the Notes section. If no impressions exist yet, show a "Write impressions" link instead of the section. |

### Route + URL

- `/books/:id/review` — form page with `MoonRating` for rating, textareas for thoughts/quote, text input for character
- Same h2 focus management as Add/Edit
- Cancel button → navigate back to `/books/:id`
- Save → PATCH, invalidate `['books', id]` and `['books']` caches, navigate to `/books/:id`

### Detail page UX

- **No impressions yet** (all four fields null): A single subtle "+ Write impressions" link/button below Notes
- **Impressions exist** (any non-null): "MY IMPRESSIONS" section with:
  - "Your rating" label + `<MoonRating value={book.rating ?? 0} />` (read-only)
  - "Your thoughts" (if non-null): the text in Andika italic, indented as a quote
  - "Favourite line" (if non-null): the quote in italic with attribution to character if also present (`— Rin`)
  - "Favourite character" (if quote is null but character isn't): just the name in gold
  - "Edit impressions" link at bottom right of the section → `/books/:id/review`

### API client

`client/apis/books.ts` already exports `updateBook(id, partial)`. No additions needed — `ReviewBook` calls it with the four review fields.

## Spelling convention

Database column names use **American spelling** (`favorite_quote`, `favorite_character`) to match standard SQL/JS conventions and stay short. UI labels and section headings use **British spelling** (`Favourite line`, `Favourite character`) to match the rest of the app and Serina's NZ context. Code that bridges the two (e.g. form field name → column name) does the conversion at the boundary.

## Visual treatment

Continues the Moonlit Cobalt palette:

- **Section background** — slight `rgba(245,168,192,0.04)` tint to distinguish from Notes
- **Section label** — small uppercase Cinzel "MY IMPRESSIONS" in `--gold-warm`
- **MoonRating glyphs** — 24px diameter, gap 12px between, gold radial gradient on filled, navy with gold border on empty
- **Form inputs** — same `--bg-raised` + gold border treatment as existing forms
- **Quote display** — italicised, indented, with a thin pink left border (`border-left: 2px solid var(--pink)`)
- **Character name** — `--gold`

## Accessibility

| Item | Approach |
|---|---|
| MoonRating semantics | `role="radiogroup"` on container with `aria-label="Rating: N of 5 moons"`. Each moon position is a `role="radio"` with `aria-checked` and `aria-label` describing the half-step (e.g. "Two and a half moons"). Keyboard: arrow keys to move (half-step), Space/Enter to select. |
| MoonRating focus | Visible `:focus-visible` gold outline on the focused moon; roving tab index — only the currently-selected (or first if none) moon is `tabIndex={0}`, others are `tabIndex={-1}`. |
| Display mode | When read-only (no `onChange`), no role/tabIndex/keyboard handlers. Container gets `aria-label="Rating: N of 5 moons"` so screen readers announce it as a single value. |
| Form labels | Every input has explicit `<label htmlFor>`. |
| Form errors | None for now — all fields optional. If a future scale-out adds validation, use `role="alert"`. |
| Section visibility | If impressions section is hidden when empty, the "+ Write impressions" link is still keyboard-reachable. |
| Focus management on route change | h2 "Edit Impressions" focused on `/books/:id/review` mount. h1 of detail page focused on return. |
| Halves accessibility | The aria-label on each moon reports half values clearly ("Rating: 3.5 of 5 moons"). |

## Out of scope (future rounds)

- **Locking review until `read_status=finished`** — could add later if she wants the constraint
- **Multiple quotes per book** — would require a `quotes` table with FK to books
- **Rating-based filtering / sorting** on the library page
- **Aggregate stats** ("average rating across library")
- **Markdown rendering** in `my_thoughts` (plain text for now)
- **Export reviews** to JSON/markdown

## Open questions

None blocking. Decision points for future Serina-design rounds:
- If the moon-phase clickable halves prove annoying to use, fall back to full-moon-only (1–5 scale, 5 values instead of 11)
- If the impressions section gets too cluttered, splitting "rating only" vs "long-form thoughts" into separate UI tiers
