# Field Suggestions (datalist) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Workshop context:** Serina is a Dev Academy student and the primary author of this codebase. She types the code; the AI tutor asks leading questions and reviews. Every task ends with a verification checkpoint she can pause at. She commits after every meaningful step ("🪶 commit time"), not only at the end of a task.

**Goal:** Let the `author`, `series`, and `genre` inputs suggest values that already exist in the library (via native `<datalist>`), while still allowing brand-new values to be typed.

**Architecture:** Pure frontend. A small `distinct()` helper computes deduped/sorted lists from the books already in the TanStack cache; `BookForm` fetches `['books']` (free — served from cache), derives the three lists, and renders three `<datalist>` elements wired to the existing inputs via the `list=` attribute. No backend, model, migration, or API-client change.

**Tech Stack:** React 18, TypeScript 5, TanStack Query 5 (`useQuery`), native HTML `<datalist>`, vitest (unit test for the helper).

**Spec:** [`docs/superpowers/specs/2026-06-11-field-suggestions-datalist-design.md`](../specs/2026-06-11-field-suggestions-datalist-design.md)

---

## Current State (verified 2026-06-11)

✅ `BookForm.tsx` holds the three free-text inputs (`author` line 43-50, `series` line 51-58, `genre` line 60-67) plus a fixed `read_status` `<select>`.
✅ `BookForm` is shared by `AddBook` and `EditBook`; it is currently purely controlled by props (no data fetching of its own).
✅ `BooksList` already runs `useQuery({ queryKey: ['books'], queryFn: fetchAllBooks })`, so `['books']` is cached.
✅ `client/apis/books.ts` exports `fetchAllBooks` returning `Book[]`.
✅ `models/books.ts` `Book` has `author`, `series`, `genre` as `string | null`.
✅ No `client/lib/distinct.ts` exists yet.

---

## Wiring decision (flag for Serina)

The spec left one choice open: where the suggestion lists are derived.

- **Option B — BookForm fetches internally (this plan's choice).** `BookForm` calls `useQuery(['books'])` itself and derives the lists. **Only one component changes**, and the derive logic lives in exactly one place (DRY). The cost: a presentational component now does a (cache-served) data fetch.
- **Option A — parents pass a `suggestions` prop.** `AddBook` and `EditBook` each fetch + derive and pass the lists down. Keeps `BookForm` purely presentational, but touches three files and duplicates the derive call.

This plan implements **B**. If you'd rather keep `BookForm` presentational, say so and I'll rewrite Task 2 for Option A.

---

## File Structure

### Files to create (2 new)

| Path | Responsibility |
|---|---|
| `client/lib/distinct.ts` | Pure helper: trim, drop empties, dedupe, alphabetical sort |
| `client/lib/distinct.test.ts` | Unit tests for `distinct()` |

### Files to modify (1 existing)

| Path | Change |
|---|---|
| `client/components/BookForm.tsx` | Fetch `['books']`, derive three lists, add `list=` to the author/series/genre inputs, render three `<datalist>`s |

### Files NOT touched

- `client/components/AddBook.tsx`, `EditBook.tsx` — under Option B they render `BookForm` unchanged.
- `server/**`, `models/books.ts`, `client/apis/books.ts` — no backend or contract change.

---

## Task Overview

3 tasks:

1. **`distinct` helper (TDD)** — the pure dedupe/sort function + tests
2. **Wire suggestions into BookForm** — fetch, derive, render datalists
3. **Manual end-to-end + accessibility verification**

**Estimated time:** ~45-60 min at workshop pace.

---

## Task 1: `distinct` helper (TDD)

**Files:**
- Create: `client/lib/distinct.ts`
- Test: `client/lib/distinct.test.ts`

### Step 1.1: Write the failing test

- [ ] Create `client/lib/distinct.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { distinct } from './distinct'

describe('distinct', () => {
  it('dedupes and sorts alphabetically', () => {
    expect(distinct(['Brandon', 'Andy', 'Andy'])).toEqual(['Andy', 'Brandon'])
  })

  it('drops null, undefined, empty and whitespace-only values', () => {
    expect(distinct(['Fantasy', null, undefined, '', '   '])).toEqual([
      'Fantasy',
    ])
  })

  it('trims surrounding whitespace before deduping', () => {
    expect(distinct(['R.F. Kuang', '  R.F. Kuang  '])).toEqual(['R.F. Kuang'])
  })

  it('returns an empty array for no usable values', () => {
    expect(distinct([null, undefined, ''])).toEqual([])
  })
})
```

### Step 1.2: Run the test to verify it fails

- [ ] Run:

```bash
npm test -- --run client/lib/distinct.test.ts
```

Expected: FAIL — `distinct` cannot be imported (module/file does not exist).

### Step 1.3: Write the minimal implementation

- [ ] Create `client/lib/distinct.ts`:

```ts
export function distinct(values: Array<string | null | undefined>): string[] {
  const cleaned = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))

  return [...new Set(cleaned)].sort((a, b) => a.localeCompare(b))
}
```

### Step 1.4: Run the test to verify it passes

- [ ] Run:

```bash
npm test -- --run client/lib/distinct.test.ts
```

Expected: PASS — all 4 tests green.

### Step 1.5: Commit 🪶

```bash
git add client/lib/distinct.ts client/lib/distinct.test.ts
git commit -m "Add distinct helper for deriving suggestion lists"
```

---

## Task 2: Wire suggestions into BookForm

**Files:**
- Modify: `client/components/BookForm.tsx`

### Step 2.1: Add the imports

- [ ] At the top of `client/components/BookForm.tsx`, below the existing imports (lines 1-2), add:

```ts
import { useQuery } from '@tanstack/react-query'
import { fetchAllBooks } from '../apis/books'
import { distinct } from '../lib/distinct'
```

### Step 2.2: Fetch the books and derive the three lists

- [ ] Inside the component, immediately after the `useState` line (currently line 21: `const [form, setForm] = useState<BookDraft>(initialValues)`), add:

```ts
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: fetchAllBooks,
  })

  const authorSuggestions = distinct(books.map((book) => book.author))
  const seriesSuggestions = distinct(books.map((book) => book.series))
  const genreSuggestions = distinct(books.map((book) => book.genre))
```

Note: because `BooksList` already cached `['books']`, this `useQuery` is normally served from cache with no extra network request. If the form is opened on a fresh page load with no cache, it fetches once — harmless.

### Step 2.3: Add `list=` and a `<datalist>` to the Author field

- [ ] Replace the Author `<label>` block (currently lines 43-50) with:

```tsx
      <label>
        Author
        <input
          type="text"
          list="author-suggestions"
          value={form.author ?? ''}
          onChange={(e) => setForm({ ...form, author: e.target.value || null })}
        />
      </label>
      <datalist id="author-suggestions">
        {authorSuggestions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
```

### Step 2.4: Add `list=` and a `<datalist>` to the Series field

- [ ] Replace the Series `<label>` block (currently lines 51-58) with:

```tsx
      <label>
        Series
        <input
          type="text"
          list="series-suggestions"
          value={form.series ?? ''}
          onChange={(e) => setForm({ ...form, series: e.target.value || null })}
        />
      </label>
      <datalist id="series-suggestions">
        {seriesSuggestions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
```

### Step 2.5: Add `list=` and a `<datalist>` to the Genre field

- [ ] Replace the Genre `<label>` block (currently lines 60-67) with:

```tsx
      <label>
        Genre
        <input
          type="text"
          list="genre-suggestions"
          value={form.genre ?? ''}
          onChange={(e) => setForm({ ...form, genre: e.target.value || null })}
        />
      </label>
      <datalist id="genre-suggestions">
        {genreSuggestions.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
```

### Step 2.6: Lint, format, typecheck

- [ ] Run:

```bash
npm run lint && npm run format
```

Expected: no errors. (Prettier may reformat; that's fine.)

### Step 2.7: Commit 🪶

```bash
git add client/components/BookForm.tsx
git commit -m "Suggest existing author/series/genre values via datalist"
```

---

## Task 3: Manual end-to-end + accessibility verification

**Files:** none — this is a verification task.

### Step 3.1: Start the dev server

- [ ] Run:

```bash
npm run dev
```

Open `http://localhost:5173`.

### Step 3.2: Golden path — pick an existing value

- [ ] Make sure you have at least two books with different authors (the seed covers this).
- [ ] Go to **Add a Book**. Click into **Author** and type the first letter or two of an existing author.
- [ ] Confirm a suggestion dropdown appears showing the matching existing author(s).
- [ ] Click (or arrow-down + Enter) to select it. Confirm the field fills with the exact stored spelling.
- [ ] Repeat for **Series** and **Genre**.

### Step 3.3: New value still works (the must-not-block case)

- [ ] In **Author**, type a brand-new name that isn't in any book. Confirm nothing blocks you — you can type it freely and submit.
- [ ] Save the book, then open **Add a Book** again and confirm the new author now appears as a suggestion (proves derivation from the live library).

### Step 3.4: Edit form shows suggestions too

- [ ] Open an existing book's **Edit** page. Confirm the same three fields offer suggestions (BookForm is shared, so they should).

### Step 3.5: Accessibility checks (non-negotiable)

- [ ] **Keyboard only (no mouse):** Tab to the Author field, type a letter, press **Down arrow** to move into the suggestion list, **Enter** to select. Confirm it works without a mouse.
- [ ] **Visible focus:** confirm each input still shows the gold `:focus-visible` outline when tabbed to.
- [ ] **Label association:** confirm clicking the "Author" label text still focuses the input (label wraps input — should be intact).
- [ ] **Degrade-gracefully sanity check:** the field is still an ordinary text input — even with no suggestions it accepts typing. (This is the property that makes datalist safe for assistive tech.)

### Step 3.6: Final commit if any fixes were needed 🪶

```bash
git add -A
git commit -m "Verify datalist suggestions end-to-end"
```

(Skip if no changes were needed during verification.)

---

## Done criteria

- `distinct()` unit tests pass.
- Author / series / genre inputs offer existing values as you type.
- Typing a brand-new value is never blocked, and new values appear as suggestions afterwards.
- Suggestions appear on both Add and Edit forms.
- Keyboard navigation, visible focus, and label association all verified.
- `npm run lint` clean.
