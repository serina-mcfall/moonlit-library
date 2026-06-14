# CP02 — Software Quality: Written Submission

**Project:** Serina's Book Library (`my-fullstack-collection`)
**Branch:** `serinas-book-library`
**Repo:** https://github.com/Ngahuru-2026/my-fullstack-collection
**Submitted by:** Serina McFall
**Date:** 2026-06-13

This single project (a full-stack book collection app) covers all three parts of the CP02 brief. Each part below documents the views/areas examined, the issues found, the fixes made, and links to the commits that introduced the change.

---

## Part One — Accessibility

### Tools used

- **WAVE (WebAIM) browser extension** — automated accessibility evaluation across multiple views.
- **Manual keyboard navigation** — Tab / Shift+Tab / Enter / Space / Arrow keys across each view, no mouse.

### Pages tested

| View | Route | Type |
|---|---|---|
| Book list | `/` | List page |
| Book detail | `/books/:id` | Read-only detail |
| Add a book | `/books/new` | **Form** |
| Edit a book | `/books/:id/edit` | **Form** |
| Review (My Impressions) | `/books/:id/review` | **Form** |

(The CP02 brief requires at least two views including a form — three forms covered, plus list + detail.)

### Issues found and fixed

#### Issue 1 — Skipped heading level on the list page

- **View:** Book list (`/`)
- **WAVE finding:** *Alert — Skipped heading level (h1 → h3, no h2 in between)*
- **Cause:** the page heading was `<h1>` ("Serina's Book Library") and each book card title was `<h3>`, skipping `<h2>` entirely. Screen-reader users navigating by heading would lose the outline structure.
- **Fix:** promoted `BookCard` title from `<h3>` to `<h2>` so the heading order is `h1 → h2`. CSS styling preserved (class-based, not tag-based).
- **File:** `client/components/BookCard.tsx`
- **Re-scan result:** 0 Errors, 0 Contrast Errors, 0 Alerts on the list page.

#### Issue 2 — Orphaned form labels on Edit / Add book

- **View:** Edit a book (`/books/:id/edit`) — same `BookForm.tsx` powers Add and Edit
- **WAVE finding:** *Alert — Orphaned form label* (×2): the **Read status** `<select>` and the **Notes** `<textarea>`
- **Cause:** the labels were *wrapping* labels (`<label>Read status <select>…</select></label>`). WAVE recognises this implicit association reliably for `<input>` elements but flags `<select>` and `<textarea>` because the inference isn't guaranteed.
- **Fix:** added an explicit `htmlFor`/`id` pairing for each, while keeping the control nested inside the label so the existing flex-column CSS layout is unaffected. The explicit pairing makes the relationship unambiguous to both WAVE and assistive tech.

```tsx
// Before
<label>
  Read status
  <select value={form.read_status ?? ''} …>…</select>
</label>

// After
<label htmlFor="read-status">
  Read status
  <select id="read-status" value={form.read_status ?? ''} …>…</select>
</label>
```

- **File:** `client/components/BookForm.tsx`
- **Re-scan result:** 0 orphaned-label alerts on the Edit / Add form.

### Keyboard navigation — manual testing

Each view was navigated end-to-end with the mouse untouched. The codebase already had a few accessibility-supportive properties in place which keyboard testing confirmed:

- **`:focus-visible` styles** are applied across interactive elements (buttons, inputs, links) so the focused control is always clearly indicated when tabbing — no "where am I" guesswork.
- **Tab order is logical** on every view (top to bottom, left to right within each section).
- **Enter activates buttons** (Submit, Add, Edit, Delete, Save) without needing the mouse.
- **Forms submit via Enter** from any input.
- **MoonRating widget** (custom rating input on the Review form) is implemented as an ARIA `radiogroup` with arrow-key navigation between moons — the W3C APG pattern. Tab moves *into* the group, arrows move *between* moons, Tab moves *out* of the group.

### Known limitation

- **Review form (`ReviewBook.tsx`)** still shows 2 *orphaned-label* alerts on the "Your thoughts" and "Favourite line" textareas — same pattern as the Edit form, identified and diagnosed but not fixed in this submission scope. The fix is identical (`htmlFor`/`id`) and is queued for the next iteration.

### Commit

> `d93be0e` — *Fix orphaned form labels and skipped heading level*

---

## Part Two — Performance: Image optimisation

### Approach

The book covers are normally fetched from the Open Library API as remote URLs. For this assessment, five covers were sourced as full-size JPEGs, optimised, and committed locally so the optimisation work has concrete before/after evidence. The other titles continue to use the API.

**Two optimisation levers were applied:**

1. **Format conversion** — JPEG → WebP. Modern, well-supported, much smaller for photographic content at the same perceived quality.
2. **Resize** — covers render at ~140 px (detail page) to ~240 px (list card). The originals were ~984 px wide, meaning the browser was downloading roughly 4× the pixels it would display. Resized to **500 px wide** (preserving each cover's natural 2:3-ish ratio) — that's still crisp at 2× retina density on the biggest render slot, with no wasted bytes beyond that.

**Tool:** [squoosh.app](https://squoosh.app) — Google's image optimisation web tool. No project dependencies added. Resize method: Lanczos3 (best quality for downscaling). Format: WebP, default quality.

**Evidence captured:** browser DevTools showing intrinsic vs. displayed dimensions for each `<img>` element, confirming the served files match the display target.

### Before / After

| Cover | Original (JPG) | Optimised (WebP @ 500 px wide) | Reduction |
|---|---|---|---|
| Daughter of the Drowned Empire | 272 KB (1000 × 1500) | 68 KB (500 × 750) | −75 % |
| The Hurricane Wars | 208 KB (981 × 1500) | 49 KB (500 × 764) | −76 % |
| Dark Star Burning, Ash Falls White | 255 KB (988 × 1500) | 65 KB (500 × 759) | −75 % |
| My Summer in Seoul | 189 KB (984 × 1500) | 54 KB (500 × 762) | −71 % |
| Song of Silver, Flame Like Night | 268 KB (981 × 1500) | 74 KB (500 × 764) | −72 % |
| **Total** | **1.19 MB** | **310 KB** | **−74 %** |

### References updated

Five rows in `server/db/seeds/books.js` had their `cover_image` swapped from `https://covers.openlibrary.org/…` to a local `/bookCovers/<slug>.webp` path. Filenames were renamed from spaced/comma form (e.g. `Dark Star Burning, Ash Falls White.webp`) to URL-safe slugs (`dark-star-burning.webp`) to avoid encoding fragility.

```js
// Example seed row, after change
{
  title: 'Daughter of the Drowned Empire',
  …
  cover_image: '/bookCovers/daughter-of-the-drowned-empire.webp',
  …
}
```

After re-seeding (`npm run knex seed:run`), the five hardwired cards render the local WebP files; the remaining cards keep their remote Open Library URLs — so the app demonstrates a mixed local + API approach.

### Commit

> `ed28433` — *Add local optimised WebP covers for five books*

---

## Part Three — Refactoring & Technical Debt

### Debt identified

The Add Book and Edit Book forms had three nearly-identical free-text inputs for **author**, **series**, and **genre**. Two problems:

1. **No discoverability of existing values.** A user adding a second Hurricane Wars book has to type "Thea Guazou" from memory — likely producing inconsistent values across rows over time (e.g. "R.F. Kuang" vs "R F Kuang" vs "RF Kuang").
2. **No safeguard against typos / inconsistent capitalisation**, which would later cause grouping and filtering bugs.

A naïve fix (turn them into fixed `<select>` dropdowns) would *over*-correct: the library is open-ended, so new authors / series / genres need to be addable. That ruled out a closed list.

### Refactor

Implemented a **"suggest existing values but allow new ones"** pattern using the native HTML `<datalist>` element:

- A new pure helper, `distinct(values)`, derives a sorted, deduplicated, trimmed list from an array of `string | null | undefined`.
- `BookForm` calls TanStack Query (cache key `['books']` — already populated by the list page) to fetch existing book data, then derives three suggestion arrays (`authorSuggestions`, `seriesSuggestions`, `genreSuggestions`) via the helper.
- Each input has a `list="…"` attribute pointing at a sibling `<datalist>` containing the suggestions.

The user sees existing values as autocompletions while typing, can pick one to enforce consistency, **or** keep typing a new value freely. No custom ARIA needed — the native `<datalist>` is fully accessible out of the box and degrades gracefully to a plain input if a browser doesn't support it.

### Before / After

**Before — repeated inline input blocks, no suggestions:**

```tsx
<label>
  Author
  <input
    type="text"
    value={form.author ?? ''}
    onChange={(e) => setForm({ ...form, author: e.target.value || null })}
  />
</label>
// …same pattern repeated for series and genre
```

**After — derived suggestion lists wired via datalist:**

```tsx
const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: fetchAllBooks })
const authorSuggestions = distinct(books.map((b) => b.author))
const seriesSuggestions = distinct(books.map((b) => b.series))
const genreSuggestions  = distinct(books.map((b) => b.genre))

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
  {authorSuggestions.map((value) => <option key={value} value={value} />)}
</datalist>
```

`distinct` itself, with full test coverage:

```ts
// client/lib/distinct.ts
export function distinct(values: Array<string | null | undefined>): string[] {
  const cleaned = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
  return [...new Set(cleaned)].sort((a, b) => a.localeCompare(b))
}
```

### Approach used

- **TDD** — failing tests for `distinct` written first (`client/lib/distinct.test.ts`), then the implementation made them pass.
- **Design document first** — `docs/superpowers/specs/2026-06-11-field-suggestions-datalist-design.md` captured the decision (fixed list vs. suggest-but-allow-new) and ruled out alternatives.
- **Implementation plan** — `docs/superpowers/plans/2026-06-11-field-suggestions-datalist.md` broke the work into reviewable tasks.

### Files affected

| File | Change |
|---|---|
| `client/lib/distinct.ts` | **New** — pure helper |
| `client/lib/distinct.test.ts` | **New** — 4 unit tests, all passing |
| `client/components/BookForm.tsx` | Modified — fetch books, derive suggestion lists, add three `<datalist>` blocks, wire `list=` on three inputs |
| `docs/superpowers/specs/2026-06-11-field-suggestions-datalist-design.md` | **New** — design spec |
| `docs/superpowers/plans/2026-06-11-field-suggestions-datalist.md` | **New** — implementation plan |

### Commits

> `9f629d3` — *Add design spec for datalist field suggestions*
> `3de8cb2` — *Add implementation plan for datalist field suggestions*
> `64895cc` — *Add distinct helper for deriving suggestion lists*
> `554d6a4` — *Suggest existing author/series/genre values via datalist*

---

## Summary

| Part | Outcome | Headline metric |
|---|---|---|
| One — Accessibility | List page: heading order fixed (h1 → h2). Edit / Add form: 2 orphaned-label alerts fixed via explicit `htmlFor`/`id`. | WAVE clean on list and Edit / Add form |
| Two — Performance | 5 covers converted JPEG → WebP and resized 984 → 500 px wide. | **1.19 MB → 310 KB total (−74 %)** |
| Three — Refactoring | Repeated free-text inputs replaced with `<datalist>`-backed suggestions sourced from a tested `distinct()` helper. | 3 inputs converted, helper covered by 4 tests, design + plan docs committed |

All changes are committed to the `serinas-book-library` branch and pushed to GitHub at the repo URL above.
