# WD03 — Forms: Written Submission

**Project:** Moonlit Library (formerly `my-fullstack-collection` — Dev Academy fullstack-collection challenge)
**Branch:** `main`
**Repo:** https://github.com/serina-mcfall/moonlit-library
**Submitted by:** Serina McFall
**Date:** 2026-06-15

This submission documents the form work in Moonlit Library — a personal book library that started as the Dev Academy fullstack-collection challenge. The project covers WD03 with **three working forms** spanning create, update, and a custom review flow, plus a shared form component, smart suggestions, validation on both client and server, accessible labels, and a custom-ARIA rating widget.

The same project was submitted for **CP02 (Software Quality)** on 2026-06-13 — see `docs/cp02-submission.md` for the parallel a11y / performance / refactoring write-up. Where a11y or refactoring details are already exhaustively documented in CP02, this doc references rather than duplicates.

---

## Forms in scope

| Form | Route | Component(s) | Purpose |
|---|---|---|---|
| **Add a Book** | `/books/new` | `AddBook.tsx` → `BookForm.tsx` | Create a new book record |
| **Edit a Book** | `/books/:id/edit` | `EditBook.tsx` → `BookForm.tsx` | Update fields of an existing book |
| **Review (My Impressions)** | `/books/:id/review` | `ReviewBook.tsx` (contains `ReviewForm`) | Add personal review fields: rating, thoughts, favourite quote, favourite character |

The Add and Edit pages share a single **`BookForm`** component. Review is a separate `ReviewForm` because its fields and shape (including the custom `MoonRating` widget) are quite different from the book metadata.

---

## 1. Shared form component (Add + Edit)

To avoid duplicating the same eight fields and their state-handling across two views, the form was extracted into a single shared component once the Add flow was working.

```tsx
// client/components/BookForm.tsx (excerpt)
interface Props {
  initialValues: BookDraft
  onSubmit: (values: BookDraft) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

function BookForm({ initialValues, onSubmit, isPending, errorMessage, submitLabel, pendingLabel }: Props) {
  const [form, setForm] = useState<BookDraft>(initialValues)
  // …
}
```

The page wrappers (`AddBook`, `EditBook`) own the **mutation** and the **navigation after success**; the form component owns the **input state** and **submission semantics**. That split keeps the shared form free of any "are we creating or updating?" branching — the parent passes in the right `onSubmit`, `submitLabel`, and `pendingLabel`, and the form renders identically.

**Commits:**
> `8c40d3e` — *Add 'Add Book' form with useMutation*
> `8ceb42d` — *Extract BookForm for reuse between Add and Edit*
> `db392f1` — *Add EditBook with update mutation and cache invalidation*

---

## 2. Controlled inputs

Every input in every form is **controlled** — its value comes from React state, and changes flow through an `onChange` handler that updates state. There are no uncontrolled inputs, refs-into-DOM reads, or `defaultValue` patterns anywhere.

```tsx
// Example — title field on BookForm
<input
  type="text"
  required
  aria-required="true"
  value={form.title}
  onChange={(e) => setForm({ ...form, title: e.target.value })}
/>
```

For nullable fields (author, series, genre, read_status, cover_image, notes, etc.), the bound value uses the **`??`** fallback so React never receives `null` as a value (which would warn about uncontrolled/controlled switching), and the change handler converts empty strings back to `null` for the database:

```tsx
value={form.author ?? ''}
onChange={(e) => setForm({ ...form, author: e.target.value || null })}
```

This same pattern is used uniformly across `BookForm.tsx` (8 fields) and `ReviewForm` inside `ReviewBook.tsx` (4 fields).

---

## 3. Validation

### Client-side

`BookForm` blocks submission when **title** is missing or whitespace-only — both at the HTML level (`required`) and in the submit handler (defence in depth, since `required` only fires on certain event paths):

```tsx
// BookForm.tsx
<input
  type="text"
  required
  aria-required="true"
  …
/>

function handelSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  if (!form.title.trim()) return     // explicit guard alongside HTML required
  onSubmit(form)
}
```

`aria-required="true"` ensures assistive tech announces the required state even on browsers/SR pairs that don't surface the `required` attribute consistently.

### Server-side

The Express route layer runs its own validation on every POST and PATCH — never trusting the client:

```ts
// server/routes/books.ts
router.post('/', async (req, res) => {
  if (
    !req.body?.title ||
    typeof req.body.title !== 'string' ||
    !req.body.title.trim()
  ) {
    return res.status(400).json({ error: 'Title is required' })
  }
  const newId = await books.add(req.body)
  res.status(201).json({ id: newId })
})
```

The `:id` segment on PATCH / GET-one / DELETE is similarly validated with `Number.isFinite`, returning `400 Invalid id` for non-numeric input:

```ts
const id = Number(req.params.id)
if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' })
```

This double-layered validation is covered by the route test suite — see Section 9 below.

---

## 4. Labels and accessibility

Each input has an **associated `<label>`**, using one of two patterns:

- **Wrapping label** for `<input>` elements — the input is nested inside the label, which is reliably picked up by assistive tech and click-to-focus.
- **Explicit `htmlFor` / `id` pairing** for `<select>` and `<textarea>` — added during the CP02 a11y pass because WAVE flagged orphaned-label alerts on the inferred wrapping form.

```tsx
<label htmlFor="read-status">
  Read status
  <select id="read-status" value={form.read_status ?? ''} …>…</select>
</label>

<label htmlFor="notes">
  Notes
  <textarea id="notes" value={form.notes ?? ''} … />
</label>
```

Full a11y story (WAVE findings, heading-level fix, keyboard navigation verification) is documented in `docs/cp02-submission.md` Part One.

**Commit:**
> `d93be0e` — *Fix orphaned form labels and skipped heading level*

---

## 5. Smart suggestions via `<datalist>` (refactor)

The author / series / genre fields would naturally accumulate inconsistent values (e.g. `"R.F. Kuang"` vs `"R F Kuang"`) if left as plain free-text inputs. To support **existing-value suggestions without locking out new values**, each of these three fields was wired to a `<datalist>` populated from existing book records:

```tsx
const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: fetchAllBooks })
const authorSuggestions = distinct(books.map((book) => book.author))

<input
  type="text"
  list="author-suggestions"
  value={form.author ?? ''}
  onChange={(e) => setForm({ ...form, author: e.target.value || null })}
/>
<datalist id="author-suggestions">
  {authorSuggestions.map((value) => <option key={value} value={value} />)}
</datalist>
```

The suggestions are derived using a small pure helper, `distinct()`, which trims, deduplicates, and sorts a `(string | null | undefined)[]` array. The helper was built TDD-style with **4 unit tests** covering empty arrays, null entries, whitespace-only entries, and locale-aware sorting.

`distinct.ts`:
```ts
export function distinct(values: Array<string | null | undefined>): string[] {
  const cleaned = values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
  return [...new Set(cleaned)].sort((a, b) => a.localeCompare(b))
}
```

Approach: a design spec was written *first* (`docs/superpowers/specs/2026-06-11-field-suggestions-datalist-design.md`) ruling out alternatives (fixed `<select>` dropdowns — would lock out new values; combobox — overbuilt for the use case). An implementation plan followed. Then the failing tests, then the implementation.

**Commits:**
> `9f629d3` — *Add design spec for datalist field suggestions*
> `3de8cb2` — *Add implementation plan for datalist field suggestions*
> `64895cc` — *Add distinct helper for deriving suggestion lists*
> `554d6a4` — *Suggest existing author/series/genre values via datalist*

---

## 6. Submission flow + state management

All three forms submit via **TanStack Query mutations**, which handle pending state, error state, and cache invalidation:

```tsx
// AddBook.tsx
const mutation = useMutation({
  mutationFn: addBook,
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ['books'] })
    navigate(`/books/${result.id}`)
  },
})

// passed to BookForm:
onSubmit={(values) => mutation.mutate(values)}
isPending={mutation.isPending}
```

On success:
- The `['books']` query is invalidated so the list page refreshes.
- For Edit and Review, the per-book query (`['books', bookId]`) is also invalidated so the detail page picks up the change immediately.
- The user is navigated back to the relevant detail page.

The form's submit button is **disabled while pending** and shows a contextual pending label (e.g. `Updating…`, `Saving impressions…`) so the user has clear feedback:

```tsx
<button type="submit" disabled={isPending}>
  {isPending ? pendingLabel : submitLabel}
</button>
```

---

## 7. Error handling

Errors are surfaced **at the top of the form** in a `role="alert"` element so they're announced to screen readers as soon as they render:

```tsx
{errorMessage && <p role="alert">{errorMessage}</p>}
```

The error message string is composed by the parent page from `mutation.error`:

```tsx
errorMessage={
  mutation.error
    ? `Failed to add: ${String(mutation.error)}`
    : undefined
}
```

Page-level guards in `EditBook` and `ReviewBook` also use `role="alert"` for load-state and validity errors:

```tsx
if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
if (isLoading) return <p role="status">Loading…</p>
if (error) return <p role="alert">Failed to load book: {String(error)}</p>
```

---

## 8. Search-to-prefill helper (AddBook only)

The AddBook page has a **search bar above the form** that queries the Open Library API and lets the user pick a result to autofill title, author, cover image, and notes. This is a UX win — the user types "Harry Potter", picks the right edition, and the form is mostly filled.

The search backend was originally Google Books but was switched to **Open Library** during the WD03 pass because Google's anonymous quota was rate-limiting every request (and a keyless library-themed source is a better fit for a personal book library anyway).

The search states (searching / found N / no results / error / form-filled) are surfaced to the user in an **`aria-live="polite"`** region so screen-reader users get feedback at every step rather than silent success/failure:

```tsx
{feedback && (
  <p role="status" aria-live="polite" className="search-feedback">
    {feedback}
  </p>
)}
```

**Commits:**
> `965f032` — *fix: replace Google Books search backend with Open Library*
> `2f7a34b` — *a11y: surface search state in an aria-live region*

---

## 9. Custom rating widget (Review form)

The Review form uses a custom **`MoonRating`** widget instead of a plain numeric input, themed to the project's Moonlit palette. The widget is implemented as a **W3C APG `radiogroup` pattern**:

- The wrapper element is `role="radiogroup"` with an `aria-label` that includes the current rating ("Rating: Three and a half moons").
- Each moon is `role="radio"` with `aria-checked` reflecting its state.
- Roving tabindex — only one moon at a time has `tabIndex={0}`, the rest have `-1`, so Tab moves into the group then out, and arrow keys move *between* moons inside it.
- Keyboard: `ArrowRight`/`ArrowUp` increment, `ArrowLeft`/`ArrowDown` decrement, `Home` jumps to 0, `End` jumps to 10. The rating supports half-moons (0–10 in half-moon steps).

```tsx
const containerProps = interactive
  ? {
      role: 'radio',
      'aria-checked': selected,
      tabIndex: isFocusable ? 0 : -1,
      onKeyDown,
      'aria-label': `Moon ${moonIndex + 1}`,
    }
  : {}
```

The widget also accepts **mouse clicks on the left or right half of each moon**, which is how half-moon values are entered with the mouse. Keyboard users get full half-moon resolution via arrow keys regardless.

**Commits:**
> `4192e1d` — *Add MoonRating component*
> `39ede74` — *Add failing tests for moonRating helper*
> `bfc294b` — *Implement moonRating helper*

---

## 10. Tests

The form-related code is exercised by:

### Server route tests — `server/routes/books.test.ts` (13 tests, all passing)

Covers:
- `POST /api/v1/books` — success with new id, **400 when title missing**.
- `PATCH /api/v1/books/:id` — success persists the change, **404 when id doesn't exist**.
- `PATCH /api/v1/books/:id (review fields)` — all four review fields persist; null clears a field.
- `GET /api/v1/books/:id (review fields shape)` — returns review fields as null on unreviewed books.
- Plus list, single-fetch, and delete coverage.

Each test runs against a **freshly rolled-back, migrated, and seeded** test database (`beforeEach`):
```ts
beforeEach(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
  await db.seed.run()
})
```

### Client unit tests — `client/lib/`

- `distinct.test.ts` — 4 tests covering the suggestion-derivation helper used by the datalist work.
- `moonRating.test.ts` — 10 tests covering the MoonRating value-to-display logic and the `ratingLabel` helper.

**Total test count: 34 passing / 34 total.** Run with `npm test`.

---

## Summary

| Area | Demonstration |
|---|---|
| Number of forms | **3** — Add, Edit, Review |
| Form architecture | Shared `BookForm` for create + update; separate `ReviewForm` for the impressions flow |
| Inputs | All **controlled** with React state; null-safe value/onChange pairs for nullable fields |
| Validation | Client (`required` + `aria-required` + handler guard) **and** server (Express route validation returning 400 JSON) |
| Labels + a11y | Wrapping labels for `<input>`, explicit `htmlFor`/`id` for `<select>` and `<textarea>` — full story in `cp02-submission.md` |
| Suggestions | Native `<datalist>` populated from cached query data via `distinct()` helper |
| Submission | TanStack Query mutations with pending/error states, cache invalidation, post-success navigation |
| Error handling | `role="alert"` for form errors; `role="status"` for loading; `aria-live="polite"` for search feedback |
| Custom widget | `MoonRating` — W3C APG `radiogroup` pattern with roving tabindex, arrow-key navigation, half-moon resolution |
| Tests | 34 passing — server-route validation, distinct helper, moonRating helper |

All code, tests, and supporting design + implementation docs (`docs/superpowers/specs/`, `docs/superpowers/plans/`) are committed to `main` at the repo URL at the top of this document.
