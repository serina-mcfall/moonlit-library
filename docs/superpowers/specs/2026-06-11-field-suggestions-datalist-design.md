# Field Suggestions (datalist) — Design Spec

**Date:** 2026-06-11
**Status:** Approved (brainstorming complete)

## Overview

Add value suggestions to the `author`, `series`, and `genre` inputs on the Add/Edit Book form. As the library grows, the same author/series/genre recurs across many books; free-text entry invites typos and drift (e.g. "R.F. Kuang" vs "RF Kuang"). Suggestions let Serina **pick an existing value** to stay consistent, while still **typing a brand-new value** so a growing collection is never blocked.

The feature touches **no backend** — no migration, no route, no DB function. It's entirely a frontend change to `BookForm` and its two parents (`AddBook`, `EditBook`).

## Why this matters

`title` is unique per book, so suggesting from past titles is noise. But `author`, `series`, and `genre` repeat constantly — they're exactly where inconsistency creeps in. A misspelt or differently-formatted author splits one author into two across the library, which quietly breaks any future grouping/filtering and just looks untidy. Reducing typing also serves the dyslexia-friendly goal: **picking the correct spelling beats retyping it**, and errors become easy to fix.

## Design decisions

Each decision below was chosen against a named alternative during brainstorming.

### 1. Which fields — `author`, `series`, `genre` (skip `title`)
`title` is unique per record, so a title datalist would only ever suggest noise. The other three recur and are where typos bite.

### 2. UX pattern — native HTML `<datalist>`
Chosen over a custom ARIA combobox and over recent-value chips.

- **Native `<datalist>`** — one `list="..."` attribute on the existing input + a `<datalist>` of options. The browser supplies the dropdown, keyboard handling, and screen-reader support. Type-or-pick; new values always allowed. **Least code, and impossible to get wrong for assistive tech** because it degrades to a plain text input — a screen-reader user who gets no suggestion is never worse off than with a normal field.
- *Rejected — custom ARIA combobox:* the W3C APG "editable combobox with list autocomplete" is the textbook tool for type-or-pick, and fully themeable, but it's a lot of code (managing `aria-expanded`, `aria-activedescendant`, arrow-key navigation, focus) and **done wrong it lies to assistive tech** — a hard no under the project's accessibility rule. High ceiling, high floor-risk.
- *Rejected — recent-value chips:* simplest and very dyslexia-friendly, but **doesn't scale** — fine for ~5 genres, unusable at 40 authors. Could return later as a polish layer on `genre` only.

**Accessibility note:** the "impossible to get wrong" property was the deciding factor. Reliability of the underlying tech ranks chips > datalist > combobox; right-tool-for-the-job ranks combobox > datalist > chips; best risk-adjusted choice to build solo is the datalist, which can't trap or mislead anyone.

### 3. Data source — derive distinct values from the `books` table
Chosen over normalised dimension tables.

- **Derive from existing books** — the suggestion lists are just the distinct non-null values already in the library. Add a book with a new author and that author appears automatically next time.
- *Rejected — normalised `authors`/`series`/`genres` tables with foreign keys:* the textbook relational model, but it earns its complexity only when many records share a *rich* entity (bio, photo, dates) you don't want to duplicate. Here each value is just a string — there's nothing to normalise *into*. This is the "schema complexity creep" pitfall the project's AGENTS.md warns about.

### 4. Where derivation happens — client-side, from already-fetched books
Chosen over a new server endpoint.

- **Client-side** — `BookList` already runs `useQuery(['books'])` and pulls the *entire* library into the TanStack cache. The distinct authors/series/genres are already in that data; compute them with a `Set`. **Zero new backend, zero new endpoint, zero new query** — and because the list isn't paginated, the only limitation of client derivation ("knows only loaded books") doesn't bite.
- *Rejected — `GET /api/v1/books/facets` endpoint:* cleaner separation and scales to a huge paginated library, but it fetches data already sitting in memory. Graduate to this only if the list ever paginates.

## Implementation shape

No backend, no model change. Frontend only.

### Deriving the suggestion lists
From the books array (already cached under `['books']`):

```ts
function distinct(values: (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort()
}

const suggestions = {
  authors: distinct(books.map((b) => b.author)),
  series: distinct(books.map((b) => b.series)),
  genres: distinct(books.map((b) => b.genre)),
}
```

### Wiring it into the shared form
`BookForm` is shared by `AddBook` and `EditBook` and does not currently know the full book list. Two viable wirings — pick during planning:

- **Option A (props):** `AddBook` and `EditBook` each call `useQuery(['books'])` (free — served from cache), derive the three lists, and pass them down: `<BookForm suggestions={{ authors, series, genres }} ... />`. Explicit data flow; parents own the fetch.
- **Option B (self-contained):** `BookForm` itself calls `useQuery(['books'])` and derives internally, so neither parent changes. Less prop-plumbing, slightly more "magic" inside a presentational component.

`BookForm` then renders three `<datalist>` elements with stable ids and adds `list=` to the matching inputs:

```tsx
<input
  type="text"
  list="author-suggestions"
  value={fields.author ?? ''}
  onChange={...}
/>
<datalist id="author-suggestions">
  {suggestions.authors.map((a) => (
    <option key={a} value={a} />
  ))}
</datalist>
```

(Repeat for `series` and `genre`.)

## Accessibility checklist

- **Keyboard:** native datalist is fully keyboard-operable (arrow into suggestions, Enter to select, or just keep typing) — provided by the browser.
- **Focus management:** no custom widget, no dialog, nothing to trap or restore — not applicable.
- **ARIA roles/states:** none authored by hand; the browser exposes the datalist relationship. No risk of fake/mismatched ARIA.
- **Visible focus:** inputs already inherit the project `:focus-visible` gold outline. Unchanged.
- **Reduced motion:** no animation introduced.
- **Label association:** each input is already wrapped by its `<label>`; the accessible name is preserved.

Clean pass — the appeal of the datalist is precisely that it adds capability without adding any custom-widget accessibility surface to get wrong.

## Out of scope

- Normalised author/series/genre tables.
- A server facets endpoint.
- Recent-value chips (possible future polish on `genre` only).
- Editing/merging/renaming existing values across the library.
- Suggestions for `title`, `read_status` (already a fixed `<select>`), or any review field.

## Files touched

- `client/components/BookForm.tsx` — render three `<datalist>`s, add `list=` to the author/series/genre inputs, accept suggestions (prop or internal query).
- `client/components/AddBook.tsx` — if Option A: fetch + derive + pass `suggestions`.
- `client/components/EditBook.tsx` — if Option A: fetch + derive + pass `suggestions`.
- Possibly a small helper (e.g. `client/lib/distinct.ts`) for the dedupe/sort, with a unit test.

No server, model, migration, seed, or API-client changes.
