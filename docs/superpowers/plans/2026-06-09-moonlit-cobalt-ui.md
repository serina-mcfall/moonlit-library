# Moonlit Cobalt UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Workshop context:** Serina is a Dev Academy student who is the primary author of this codebase. She types the code; the AI tutor asks leading questions and explains concepts. Every task ends with a verification checkpoint she can hit pause at.

**Goal:** Transform Serina's Book Library from a working-but-bare CRUD app into a magical Moonlit Cobalt fantasy library — tile grid, per-book detail page, status-driven mana bar, full CRUD UI (Add/Edit/Delete forms), a dyslexia-friendly typography pairing (Cinzel + Andika), and a fairy dust cursor that respects reduced-motion preferences.

**Architecture:** React Router v7 for client-side routing across 4 routes (list / new / detail / edit). One shared `BookForm` component used by both Add and Edit screens. CSS custom properties on `:root` make the palette swap-friendly. A single `manaFromStatus` helper centralises status→percentage mapping. Fairy dust cursor mounts once at app level. All work is in `client/`, `models/`, and 4 already-existing CSS/HTML files — backend is complete and tested (10 passing tests).

**Tech Stack:** React 18, TypeScript 5, Vite, TanStack Query 5, React Router 7, superagent (HTTP client), CSS custom properties, vitest + supertest (backend tests).

**Spec:** [`docs/superpowers/specs/2026-06-09-book-library-ui-design.md`](../specs/2026-06-09-book-library-ui-design.md)

---

## Current State (verified 2026-06-09)

✅ **Backend** — full CRUD on `/api/v1/books`, 10 vitest+supertest integration tests all passing (663ms)
✅ **Models** — `Book` interface + `BookDraft = Omit<Book, 'id'>` in `models/books.ts`
✅ **API client** — `fetchAllBooks`, `addBook` exist in `client/apis/books.ts`
✅ **Components** — `App.tsx` (header + main), `BooksList.tsx` (UL of titles), `AddBook.tsx` (working form with useMutation)
✅ **Root** — `client/index.tsx` wraps `<App />` in `QueryClientProvider`
✅ **A11y foundations** — page title, main landmark, role="status"/"alert" on loading/error states
✅ **Routing** — react-router v7 installed but not wired up

---

## File Structure

### Files to create (8 new)

| Path | Responsibility |
|---|---|
| `client/lib/mana.ts` | Status string → mana percentage helper |
| `client/components/ManaBar.tsx` | Progress bar UI with ARIA semantics |
| `client/components/BookCard.tsx` | Single tile in the grid — cover + title + author + ManaBar |
| `client/components/BookDetail.tsx` | Detail page route with Edit/Delete actions |
| `client/components/BookForm.tsx` | Shared form, takes `initialValues` + `onSubmit` props |
| `client/components/EditBook.tsx` | Edit route — wraps BookForm with prefilled values + PATCH |
| `client/components/FairyDustCursor.tsx` | Pointer sparkle particle effect |
| `client/lib/cursorSparkle.ts` | Particle spawning helper (extracted from FairyDustCursor for testability) |

### Files to modify (7 existing)

| Path | Change |
|---|---|
| `client/index.tsx` | Wrap App in `<BrowserRouter>` |
| `client/styles/index.css` | Full palette + Cinzel + Andika + base typography + focus styles |
| `client/apis/books.ts` | Add `fetchOne`, `updateBook`, `deleteBook` |
| `client/components/App.tsx` | Replace inline children with `<Routes>` for 4 routes |
| `client/components/BooksList.tsx` | Refactor `<ul>` of `<li>` to CSS grid of `<BookCard />` |
| `client/components/AddBook.tsx` | Refactor to thin wrapper around `BookForm` + `useMutation` + navigate |
| `index.html` | Add Google Fonts `<link>` for Cinzel + Andika |

### Files not touched

- `server/**` — backend is complete and tested
- `models/books.ts` — types are sufficient
- Migrations + seeds

---

## Task Overview

Tasks build outward from primitives to composition:

1. **Theme foundation** — fonts, palette, base CSS (visual but no logic)
2. **Mana helper + ManaBar** — pure helper + a small component, both testable
3. **API client expansion** — fetchOne, updateBook, deleteBook
4. **Router setup** — wrap in BrowserRouter, define routes
5. **BookDetail route** — read a book by id
6. **BookForm refactor** — extract shared form from AddBook
7. **EditBook route** — uses BookForm + PATCH mutation
8. **Delete action** — button on detail page + confirm dialog
9. **BooksList → tile grid** — refactor to use BookCard + grid layout
10. **Detail page polish** — spread layout, divider, notes section
11. **Fairy dust cursor** — particle effect with reduced-motion guard
12. **A11y audit** — focus management, keyboard nav, manual check

**Estimated time:** ~3 hours for an experienced React dev; 4-6 hours at workshop pace with the tutor.

---

## Task 1: Theme foundation — fonts, palette, base typography

**Files:**
- Modify: `index.html` (add Google Fonts link)
- Modify: `client/styles/index.css` (full rewrite of palette + typography)

### Step 1.1: Add Google Fonts link to `index.html`

- [ ] Open `index.html` and add the font link inside `<head>` before the stylesheet link.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Andika:ital,wght@0,400;0,700;1,400&display=swap"
  rel="stylesheet"
/>
```

### Step 1.2: Replace `client/styles/index.css` with the Moonlit Cobalt theme

- [ ] Open `client/styles/index.css` and replace the entire content with:

```css
:root {
  /* Palette */
  --bg-deep: #0a1230;
  --bg-mid: #142048;
  --bg-raised: #1a2547;
  --surface: rgba(255, 255, 255, 0.025);
  --border-gold: rgba(240, 200, 150, 0.2);
  --text: #f3e8d4;
  --text-muted: #c8b8a0;
  --gold: #e0c080;
  --gold-warm: #d4a880;
  --pink: #f5a8c0;
  --cyan: #7ec8c0;
  --moon: #f5e8c8;

  /* Typography */
  --font-display: 'Cinzel', Georgia, serif;
  --font-body: 'Andika', system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

body {
  background: linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-mid) 50%, var(--bg-deep) 100%);
  background-attachment: fixed;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  text-align: left;
  padding: 24px;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--text);
}

h1 {
  font-size: 28px;
  margin: 0 0 24px;
}

h2 {
  font-size: 22px;
  margin: 0 0 16px;
}

p,
li {
  max-width: 65ch;
}

a {
  color: var(--gold);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s ease;
}

a:hover {
  border-bottom-color: var(--gold);
}

*:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
  border-radius: 2px;
}

button {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 8px 16px;
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--gold);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

button:hover:not(:disabled) {
  background: var(--gold);
  color: var(--bg-deep);
}

button:disabled {
  opacity: 0.5;
  cursor: wait;
}

input,
select,
textarea {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text);
  background: var(--bg-raised);
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  padding: 8px 10px;
  width: 100%;
  max-width: 480px;
}

label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.header {
  margin-bottom: 32px;
}

.main {
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Step 1.3: Verify in browser

- [ ] Run `npm run dev`
- [ ] Open `http://localhost:5173`
- [ ] Confirm visually:
  - [ ] Deep cobalt navy gradient background
  - [ ] "Serinas Book Library" header in Cinzel (capital Roman letterforms)
  - [ ] Book titles + author lines in Andika (very readable)
  - [ ] Add Book form inputs have dark backgrounds with gold border
  - [ ] Tab through inputs — gold outline appears on focus
  - [ ] Page does NOT crash, no console errors

### Step 1.4: Commit

```bash
git add index.html client/styles/index.css
git commit -m "Add Moonlit Cobalt theme — palette + Cinzel/Andika fonts

- CSS custom properties for full palette on :root
- Cinzel display + Andika body via Google Fonts
- Dyslexia-friendly body sizing (16px, 1.6 line-height, 0.02em
  letter-spacing, 65ch max-width)
- :focus-visible gold outline on every interactive element
- prefers-reduced-motion media query disables animations
- Button + input/select/textarea base styles"
```

**Verification checkpoint:** the existing list + form are now styled. They still work, just look different. If anything is broken visually, fix before moving on.

---

## Task 2: Mana helper

**Files:**
- Create: `client/lib/mana.ts`
- Create: `client/lib/mana.test.ts`

### Step 2.1: Write the failing test

- [ ] Create `client/lib/mana.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { manaFromStatus } from './mana'

describe('manaFromStatus', () => {
  it('returns 100 for not started variants', () => {
    expect(manaFromStatus('not started')).toBe(100)
    expect(manaFromStatus('not_started')).toBe(100)
    expect(manaFromStatus('untouched')).toBe(100)
  })

  it('returns 90 for just started', () => {
    expect(manaFromStatus('just started')).toBe(90)
    expect(manaFromStatus('just_started')).toBe(90)
  })

  it('returns 50 for reading', () => {
    expect(manaFromStatus('reading')).toBe(50)
    expect(manaFromStatus('in progress')).toBe(50)
  })

  it('returns 10 for nearly finished', () => {
    expect(manaFromStatus('nearly finished')).toBe(10)
    expect(manaFromStatus('almost done')).toBe(10)
  })

  it('returns 0 for finished variants', () => {
    expect(manaFromStatus('finished')).toBe(0)
    expect(manaFromStatus('read')).toBe(0)
    expect(manaFromStatus('done')).toBe(0)
  })

  it('returns 100 for unknown or null status', () => {
    expect(manaFromStatus(null)).toBe(100)
    expect(manaFromStatus('')).toBe(100)
    expect(manaFromStatus('Unknown Value')).toBe(100)
  })

  it('is case-insensitive', () => {
    expect(manaFromStatus('FINISHED')).toBe(0)
    expect(manaFromStatus('Reading')).toBe(50)
  })
})
```

### Step 2.2: Run the test, confirm it fails

```bash
npm test -- --run client/lib/mana.test.ts
```

Expected: FAIL — `Cannot find module './mana'`

### Step 2.3: Write the implementation

- [ ] Create `client/lib/mana.ts`:

```ts
export function manaFromStatus(status: string | null): number {
  if (!status) return 100
  const normalised = status.toLowerCase().trim()

  if (['not started', 'not_started', 'untouched'].includes(normalised)) return 100
  if (['just started', 'just_started'].includes(normalised)) return 90
  if (['reading', 'in progress'].includes(normalised)) return 50
  if (['nearly finished', 'almost done'].includes(normalised)) return 10
  if (['finished', 'read', 'done'].includes(normalised)) return 0

  return 100
}
```

### Step 2.4: Run the test, confirm it passes

```bash
npm test -- --run client/lib/mana.test.ts
```

Expected: PASS — all 7 tests green.

### Step 2.5: Commit

```bash
git add client/lib/mana.ts client/lib/mana.test.ts
git commit -m "Add manaFromStatus helper with tests

Centralised status→percentage mapping for the mana bar:
- 100 = not started (full mana, book untouched)
- 90 = just started
- 50 = reading
- 10 = nearly finished
- 0 = finished (no mana left, book consumed)

Case-insensitive, defaults to 100 for unknown/null."
```

---

## Task 3: ManaBar component

**Files:**
- Create: `client/components/ManaBar.tsx`

### Step 3.1: Create `client/components/ManaBar.tsx`

- [ ] Create the file with:

```tsx
import { manaFromStatus } from '../lib/mana'

interface Props {
  status: string | null
  size?: 'tile' | 'detail'
}

function ManaBar({ status, size = 'tile' }: Props) {
  const percent = manaFromStatus(status)
  const height = size === 'detail' ? 8 : 5
  const label = status ? `Reading progress: ${status}` : 'Reading progress: not started'

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      style={{
        height: `${height}px`,
        background: 'var(--bg-raised)',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid var(--border-gold)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percent}%`,
          background: 'linear-gradient(90deg, var(--gold), var(--pink), var(--cyan))',
          boxShadow: '0 0 8px rgba(245, 168, 192, 0.7)',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  )
}

export default ManaBar
```

### Step 3.2: Verify the import resolves

```bash
npm test -- --run
```

Expected: all existing tests still pass (mana tests already validate the helper this component uses).

### Step 3.3: Commit

```bash
git add client/components/ManaBar.tsx
git commit -m "Add ManaBar component with progressbar ARIA semantics

- role='progressbar' with aria-valuenow/min/max
- aria-label describes reading status for screen readers
- Two sizes: 5px (tile), 8px (detail)
- Gradient fill drains right-to-left as books are read
- Width transition for smooth status updates"
```

---

## Task 4: API client — add fetchOne, updateBook, deleteBook

**Files:**
- Modify: `client/apis/books.ts`

### Step 4.1: Open `client/apis/books.ts` and add 3 new functions

- [ ] Replace the entire file with:

```ts
import request from 'superagent'
import type { Book, BookDraft } from '../../models/books.ts'

export async function fetchAllBooks(): Promise<Book[]> {
  console.log('[api] fetching /api/v1/books')
  const response = await request.get('/api/v1/books')
  console.log('[api] got', response.body.length, 'books')
  return response.body
}

export async function fetchOne(id: number): Promise<Book> {
  console.log('[api] fetching /api/v1/books/' + id)
  const response = await request.get(`/api/v1/books/${id}`)
  return response.body
}

export async function addBook(book: BookDraft): Promise<{ id: number }> {
  console.log('[api] adding /api/v1/books')
  const response = await request.post('/api/v1/books').send(book)
  return response.body
}

export async function updateBook(id: number, partial: Partial<BookDraft>): Promise<void> {
  console.log('[api] patching /api/v1/books/' + id)
  await request.patch(`/api/v1/books/${id}`).send(partial)
}

export async function deleteBook(id: number): Promise<void> {
  console.log('[api] deleting /api/v1/books/' + id)
  await request.delete(`/api/v1/books/${id}`)
}
```

### Step 4.2: Verify types compile

```bash
npx tsc --noEmit
```

Expected: no errors.

### Step 4.3: Commit

```bash
git add client/apis/books.ts
git commit -m "Add fetchOne, updateBook, deleteBook API client functions

- fetchOne(id) → GET /api/v1/books/:id
- updateBook(id, partial) → PATCH /api/v1/books/:id
- deleteBook(id) → DELETE /api/v1/books/:id
- All include console.log tracing matching existing convention"
```

---

## Task 5: Wire up React Router

**Files:**
- Modify: `client/index.tsx`
- Modify: `client/components/App.tsx`

### Step 5.1: Wrap App in `<BrowserRouter>`

- [ ] Replace `client/index.tsx` with:

```tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from './components/App.tsx'

const queryClient = new QueryClient()

document.addEventListener('DOMContentLoaded', () => {
  createRoot(document.getElementById('app') as HTMLElement).render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools />
    </QueryClientProvider>,
  )
})
```

### Step 5.2: Add routes to App.tsx

- [ ] Replace `client/components/App.tsx` with:

```tsx
import { Routes, Route } from 'react-router'
import BooksList from './BooksList'
import AddBook from './AddBook'

function App() {
  return (
    <>
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<AddBook />} />
        </Routes>
      </main>
    </>
  )
}

export default App
```

### Step 5.3: Verify in browser

- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:5173/` — should show the existing list
- [ ] Visit `http://localhost:5173/books/new` — should show the Add Book form
- [ ] No console errors

### Step 5.4: Commit

```bash
git add client/index.tsx client/components/App.tsx
git commit -m "Wire up React Router with two initial routes

- BrowserRouter wraps App in client/index.tsx
- / → BooksList, /books/new → AddBook
- Detail and Edit routes added in subsequent tasks"
```

---

## Task 6: BookDetail component + route

**Files:**
- Create: `client/components/BookDetail.tsx`
- Modify: `client/components/App.tsx`

### Step 6.1: Create `client/components/BookDetail.tsx`

- [ ] Create the file with:

```tsx
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { fetchOne } from '../apis/books'
import ManaBar from './ManaBar'

function BookDetail() {
  const { id } = useParams()
  const bookId = Number(id)

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchOne(bookId),
    enabled: Number.isFinite(bookId),
  })

  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Failed to load book: {String(error)}</p>
  if (!data) return null

  return (
    <article>
      <p>
        <Link to="/">← Back to library</Link>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px' }}>
        {data.cover_image ? (
          <img
            src={data.cover_image}
            alt={`Cover of ${data.title}`}
            style={{
              width: '120px',
              borderRadius: '3px',
              boxShadow: '0 0 22px rgba(245, 168, 192, 0.35), 0 6px 14px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-gold)',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              aspectRatio: '2 / 3',
              background: 'linear-gradient(135deg, var(--bg-raised), var(--bg-mid))',
              borderRadius: '3px',
              border: '1px solid var(--border-gold)',
            }}
          />
        )}

        <div>
          {(data.genre || data.series) && (
            <p
              style={{
                fontSize: '11px',
                color: 'var(--gold-warm)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              {[data.genre, data.series].filter(Boolean).join(' · ')}
            </p>
          )}
          <h1 tabIndex={-1} style={{ marginTop: '6px' }}>
            {data.title}
          </h1>
          {data.author && (
            <p style={{ color: 'var(--gold)', margin: '0 0 16px' }}>by {data.author}</p>
          )}

          <ManaBar status={data.read_status} size="detail" />
          {data.read_status && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {data.read_status}
            </p>
          )}
        </div>
      </div>

      {data.notes && (
        <section style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-gold)' }}>
          <h2
            style={{
              fontSize: '11px',
              color: 'var(--gold-warm)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Notes
          </h2>
          <p>{data.notes}</p>
        </section>
      )}
    </article>
  )
}

export default BookDetail
```

### Step 6.2: Add the route to `App.tsx`

- [ ] Open `client/components/App.tsx` and add the import + route. After the change the file should be:

```tsx
import { Routes, Route } from 'react-router'
import BooksList from './BooksList'
import AddBook from './AddBook'
import BookDetail from './BookDetail'

function App() {
  return (
    <>
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<AddBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
        </Routes>
      </main>
    </>
  )
}

export default App
```

### Step 6.3: Verify in browser

- [ ] Visit `http://localhost:5173/books/1` (use whatever id you have)
- [ ] Confirm: cover (or placeholder), title in Cinzel, author in gold, mana bar with gradient fill, notes below divider
- [ ] Click "← Back to library" — returns to list

### Step 6.4: Commit

```bash
git add client/components/BookDetail.tsx client/components/App.tsx
git commit -m "Add BookDetail page with spread layout

- /books/:id route
- useQuery fetches one book by id
- Spread layout: cover left, metadata stack right
- ManaBar with detail size
- Notes section below divider
- 'Back to library' Link
- h1 has tabIndex={-1} for focus management (set in Task 12)
- Cover image with descriptive alt; gradient placeholder if missing"
```

---

## Task 7: BookForm refactor — extract shared form from AddBook

**Files:**
- Create: `client/components/BookForm.tsx`
- Modify: `client/components/AddBook.tsx`

### Step 7.1: Create `client/components/BookForm.tsx`

- [ ] Create the file with:

```tsx
import { useState, type FormEvent } from 'react'
import type { BookDraft } from '../../models/books'

interface Props {
  initialValues: BookDraft
  onSubmit: (values: BookDraft) => void
  isPending: boolean
  errorMessage?: string
  submitLabel: string
  pendingLabel: string
}

function BookForm({
  initialValues,
  onSubmit,
  isPending,
  errorMessage,
  submitLabel,
  pendingLabel,
}: Props) {
  const [form, setForm] = useState<BookDraft>(initialValues)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <label>
        Title *
        <input
          type="text"
          required
          aria-required="true"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </label>

      <label>
        Author
        <input
          type="text"
          value={form.author ?? ''}
          onChange={(e) => setForm({ ...form, author: e.target.value || null })}
        />
      </label>

      <label>
        Series
        <input
          type="text"
          value={form.series ?? ''}
          onChange={(e) => setForm({ ...form, series: e.target.value || null })}
        />
      </label>

      <label>
        Genre
        <input
          type="text"
          value={form.genre ?? ''}
          onChange={(e) => setForm({ ...form, genre: e.target.value || null })}
        />
      </label>

      <label>
        Read status
        <select
          value={form.read_status ?? ''}
          onChange={(e) => setForm({ ...form, read_status: e.target.value || null })}
        >
          <option value="">— choose —</option>
          <option value="not started">Not started</option>
          <option value="just started">Just started</option>
          <option value="reading">Reading</option>
          <option value="nearly finished">Nearly finished</option>
          <option value="finished">Finished</option>
        </select>
      </label>

      <label>
        Cover image URL
        <input
          type="url"
          value={form.cover_image ?? ''}
          onChange={(e) => setForm({ ...form, cover_image: e.target.value || null })}
        />
      </label>

      <label>
        Notes
        <textarea
          value={form.notes ?? ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
          rows={3}
        />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}

export default BookForm
```

### Step 7.2: Refactor `AddBook.tsx` to use BookForm

- [ ] Replace `client/components/AddBook.tsx` with:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { addBook } from '../apis/books'
import type { BookDraft } from '../../models/books'
import BookForm from './BookForm'

const emptyBook: BookDraft = {
  title: '',
  author: null,
  series: null,
  genre: null,
  read_status: null,
  cover_image: null,
  notes: null,
}

function AddBook() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: addBook,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate(`/books/${result.id}`)
    },
  })

  return (
    <>
      <h2>Add a Book</h2>
      <BookForm
        initialValues={emptyBook}
        onSubmit={(values) => mutation.mutate(values)}
        isPending={mutation.isPending}
        errorMessage={mutation.error ? `Failed to add: ${String(mutation.error)}` : undefined}
        submitLabel="Add to library"
        pendingLabel="Adding…"
      />
    </>
  )
}

export default AddBook
```

### Step 7.3: Verify in browser

- [ ] Visit `http://localhost:5173/books/new`
- [ ] Add a test book — should land on the new book's detail page
- [ ] Click back to library — book should be in the list

### Step 7.4: Commit

```bash
git add client/components/BookForm.tsx client/components/AddBook.tsx
git commit -m "Extract BookForm for reuse between Add and Edit

- BookForm takes initialValues, onSubmit, isPending, errorMessage,
  submitLabel, pendingLabel props
- AddBook is now a thin wrapper: mutation + navigation only
- On success, redirect to /books/:id (the new book's detail page)
- Title input has aria-required for assistive tech"
```

---

## Task 8: EditBook route

**Files:**
- Create: `client/components/EditBook.tsx`
- Modify: `client/components/App.tsx`
- Modify: `client/components/BookDetail.tsx` (add Edit link)

### Step 8.1: Create `client/components/EditBook.tsx`

- [ ] Create the file with:

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router'
import { fetchOne, updateBook } from '../apis/books'
import type { BookDraft } from '../../models/books'
import BookForm from './BookForm'

function EditBook() {
  const { id } = useParams()
  const bookId = Number(id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchOne(bookId),
    enabled: Number.isFinite(bookId),
  })

  const mutation = useMutation({
    mutationFn: (values: BookDraft) => updateBook(bookId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['books', bookId] })
      navigate(`/books/${bookId}`)
    },
  })

  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Failed to load book: {String(error)}</p>
  if (!data) return null

  const { id: _id, ...initialValues } = data

  return (
    <>
      <h2>Edit Book</h2>
      <BookForm
        initialValues={initialValues}
        onSubmit={(values) => mutation.mutate(values)}
        isPending={mutation.isPending}
        errorMessage={mutation.error ? `Failed to save: ${String(mutation.error)}` : undefined}
        submitLabel="Save changes"
        pendingLabel="Saving…"
      />
    </>
  )
}

export default EditBook
```

### Step 8.2: Add route to App.tsx

- [ ] Open `client/components/App.tsx`, add EditBook import and route. Final file:

```tsx
import { Routes, Route } from 'react-router'
import BooksList from './BooksList'
import AddBook from './AddBook'
import BookDetail from './BookDetail'
import EditBook from './EditBook'

function App() {
  return (
    <>
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<AddBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<EditBook />} />
        </Routes>
      </main>
    </>
  )
}

export default App
```

### Step 8.3: Add Edit link in BookDetail.tsx

- [ ] Open `client/components/BookDetail.tsx`. Inside the `<article>`, just before the closing `</article>`, add an action bar after the Notes section:

```tsx
<p style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
  <Link to={`/books/${data.id}/edit`}>
    <button type="button">Edit book</button>
  </Link>
</p>
```

(Delete button comes in Task 9.)

### Step 8.4: Verify

- [ ] Visit a book detail page → click "Edit book" → form pre-filled with current values
- [ ] Change a field → Save changes → redirected to detail page → updated value visible
- [ ] Hit back, list reflects the change

### Step 8.5: Commit

```bash
git add client/components/EditBook.tsx client/components/App.tsx client/components/BookDetail.tsx
git commit -m "Add EditBook route with PATCH mutation

- /books/:id/edit reads current values via useQuery
- Strips id, passes rest to BookForm as initialValues
- PATCH on submit, invalidates list AND detail cache, navigates back
- Edit button on detail page links to /books/:id/edit"
```

---

## Task 9: Delete action

**Files:**
- Modify: `client/components/BookDetail.tsx`

### Step 9.1: Add Delete button + mutation to BookDetail.tsx

- [ ] Open `client/components/BookDetail.tsx`. The full updated file:

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteBook, fetchOne } from '../apis/books'
import ManaBar from './ManaBar'

function BookDetail() {
  const { id } = useParams()
  const bookId = Number(id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchOne(bookId),
    enabled: Number.isFinite(bookId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate('/')
    },
  })

  function handleDelete() {
    if (!data) return
    const confirmed = window.confirm(`Delete "${data.title}" from your library?`)
    if (confirmed) deleteMutation.mutate()
  }

  if (!Number.isFinite(bookId)) return <p role="alert">Invalid book id</p>
  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Failed to load book: {String(error)}</p>
  if (!data) return null

  return (
    <article>
      <p>
        <Link to="/">← Back to library</Link>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px' }}>
        {data.cover_image ? (
          <img
            src={data.cover_image}
            alt={`Cover of ${data.title}`}
            style={{
              width: '120px',
              borderRadius: '3px',
              boxShadow: '0 0 22px rgba(245, 168, 192, 0.35), 0 6px 14px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-gold)',
            }}
          />
        ) : (
          <div
            style={{
              width: '120px',
              aspectRatio: '2 / 3',
              background: 'linear-gradient(135deg, var(--bg-raised), var(--bg-mid))',
              borderRadius: '3px',
              border: '1px solid var(--border-gold)',
            }}
          />
        )}

        <div>
          {(data.genre || data.series) && (
            <p
              style={{
                fontSize: '11px',
                color: 'var(--gold-warm)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                fontFamily: 'var(--font-display)',
              }}
            >
              {[data.genre, data.series].filter(Boolean).join(' · ')}
            </p>
          )}
          <h1 tabIndex={-1} style={{ marginTop: '6px' }}>
            {data.title}
          </h1>
          {data.author && (
            <p style={{ color: 'var(--gold)', margin: '0 0 16px' }}>by {data.author}</p>
          )}

          <ManaBar status={data.read_status} size="detail" />
          {data.read_status && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {data.read_status}
            </p>
          )}
        </div>
      </div>

      {data.notes && (
        <section style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-gold)' }}>
          <h2
            style={{
              fontSize: '11px',
              color: 'var(--gold-warm)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Notes
          </h2>
          <p>{data.notes}</p>
        </section>
      )}

      {deleteMutation.error && (
        <p role="alert">Failed to delete: {String(deleteMutation.error)}</p>
      )}

      <p style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <Link to={`/books/${data.id}/edit`}>
          <button type="button">Edit book</button>
        </Link>
        <button type="button" onClick={handleDelete} disabled={deleteMutation.isPending}>
          {deleteMutation.isPending ? 'Deleting…' : 'Delete book'}
        </button>
      </p>
    </article>
  )
}

export default BookDetail
```

### Step 9.2: Verify

- [ ] Add a test book first (so you can delete it safely)
- [ ] Navigate to its detail page → click Delete → confirm dialog → confirm
- [ ] Should redirect to `/` → book gone from list
- [ ] Try cancel on the confirm — should do nothing
- [ ] Try delete on a hand-typed bad URL like `/books/999` — should show "Failed to delete: Error: Not Found"

### Step 9.3: Commit

```bash
git add client/components/BookDetail.tsx
git commit -m "Add delete action to BookDetail

- DELETE mutation with window.confirm('Delete \"Title\"?')
- Native confirm is a11y-correct out of box (browser-managed focus)
- onSuccess invalidates list cache and navigates to /
- Error displays in role='alert' region
- Edit + Delete buttons in action bar below content"
```

---

## Task 10: BookCard + BooksList tile grid

**Files:**
- Create: `client/components/BookCard.tsx`
- Modify: `client/components/BooksList.tsx`

### Step 10.1: Create `client/components/BookCard.tsx`

- [ ] Create the file with:

```tsx
import { Link } from 'react-router'
import type { Book } from '../../models/books'
import ManaBar from './ManaBar'

interface Props {
  book: Book
}

function BookCard({ book }: Props) {
  return (
    <Link
      to={`/books/${book.id}`}
      style={{
        display: 'block',
        borderBottom: 'none',
        color: 'inherit',
      }}
    >
      <article style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={`Cover of ${book.title}`}
            style={{
              width: '100%',
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              borderRadius: '3px',
              boxShadow: '0 0 18px rgba(245, 168, 192, 0.25), 0 6px 14px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-gold)',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: '2 / 3',
              background: 'linear-gradient(135deg, var(--bg-raised), var(--bg-mid))',
              borderRadius: '3px',
              border: '1px solid var(--border-gold)',
            }}
          />
        )}

        <h3 style={{ margin: 0, fontSize: '14px', lineHeight: '1.25' }}>{book.title}</h3>
        {book.author && (
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {book.author}
          </p>
        )}
        <ManaBar status={book.read_status} size="tile" />
      </article>
    </Link>
  )
}

export default BookCard
```

### Step 10.2: Refactor BooksList to use BookCard + grid

- [ ] Replace `client/components/BooksList.tsx` with:

```tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { fetchAllBooks } from '../apis/books'
import BookCard from './BookCard'

function BooksList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: fetchAllBooks,
  })

  if (isLoading) return <p role="status">Loading…</p>
  if (error) return <p role="alert">Something went wrong: {String(error)}</p>
  if (!data) return null

  return (
    <>
      <p style={{ marginBottom: '24px' }}>
        <Link to="/books/new">
          <button type="button">+ Add a book</button>
        </Link>
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '24px',
        }}
      >
        {data.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </>
  )
}

export default BooksList
```

### Step 10.3: Verify in browser

- [ ] Visit `http://localhost:5173/`
- [ ] Confirm: covers in a responsive grid, each tile clickable, mana bars visible
- [ ] Click a tile → goes to detail page → click back → returns to grid
- [ ] Click "+ Add a book" button → goes to add form
- [ ] Resize the window — grid columns reflow based on available width

### Step 10.4: Commit

```bash
git add client/components/BookCard.tsx client/components/BooksList.tsx
git commit -m "Refactor BooksList to responsive tile grid with BookCard

- BookCard wraps in <Link to=/books/:id> for keyboard nav
- Cover image with shadow glow + gold border
- Mana bar at bottom of each tile
- BooksList uses CSS grid (auto-fit minmax 180px)
- 'Add a book' button at top links to /books/new"
```

---

## Task 11: Fairy dust cursor

**Files:**
- Create: `client/lib/cursorSparkle.ts`
- Create: `client/lib/cursorSparkle.test.ts`
- Create: `client/components/FairyDustCursor.tsx`
- Modify: `client/components/App.tsx`

### Step 11.1: Write tests for cursorSparkle helper

- [ ] Create `client/lib/cursorSparkle.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shouldSpawnSparkle } from './cursorSparkle'

describe('shouldSpawnSparkle', () => {
  beforeEach(() => {
    // Mock matchMedia for jsdom
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when motion is not reduced and pointer is fine', () => {
    expect(shouldSpawnSparkle()).toBe(true)
  })

  it('returns false when prefers-reduced-motion is reduce', () => {
    ;(window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    expect(shouldSpawnSparkle()).toBe(false)
  })

  it('returns false when pointer is coarse (touch)', () => {
    ;(window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    expect(shouldSpawnSparkle()).toBe(false)
  })
})
```

### Step 11.2: Run test, confirm it fails

```bash
npm test -- --run client/lib/cursorSparkle.test.ts
```

Expected: FAIL — module not found.

### Step 11.3: Create `client/lib/cursorSparkle.ts`

- [ ] Create the file with:

```ts
export function shouldSpawnSparkle(): boolean {
  if (typeof window === 'undefined') return false
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = window.matchMedia('(pointer: coarse)').matches
  return !reduced && !touch
}

export function spawnSparkle(x: number, y: number, container: HTMLElement): void {
  const size = 3 + Math.random() * 4
  const sparkle = document.createElement('div')
  const usePink = Math.random() > 0.5
  const colour = usePink ? 'rgba(245,168,192,0.9)' : 'rgba(224,192,128,0.9)'

  sparkle.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    border-radius: 50%;
    background: radial-gradient(circle, ${colour}, transparent 70%);
    transform: translate(-50%, -50%);
    animation: sparkle-fade ${800 + Math.random() * 400}ms ease-out forwards;
    z-index: 9999;
  `

  container.appendChild(sparkle)

  sparkle.addEventListener('animationend', () => {
    sparkle.remove()
  })
}
```

### Step 11.4: Run tests, confirm passes

```bash
npm test -- --run client/lib/cursorSparkle.test.ts
```

Expected: PASS — all 3 tests green.

### Step 11.5: Add the keyframes CSS

- [ ] Open `client/styles/index.css` and add at the bottom:

```css
@keyframes sparkle-fade {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-12px) scale(0.4);
  }
}
```

### Step 11.6: Create `client/components/FairyDustCursor.tsx`

- [ ] Create the file with:

```tsx
import { useEffect, useRef } from 'react'
import { shouldSpawnSparkle, spawnSparkle } from '../lib/cursorSparkle'

function FairyDustCursor() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldSpawnSparkle()) return

    const container = containerRef.current
    if (!container) return

    let lastSpawn = 0
    const throttleMs = 30

    function handleMove(event: MouseEvent) {
      const now = performance.now()
      if (now - lastSpawn < throttleMs) return
      lastSpawn = now
      spawnSparkle(event.clientX, event.clientY, container as HTMLDivElement)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  )
}

export default FairyDustCursor
```

### Step 11.7: Mount FairyDustCursor in App.tsx

- [ ] Open `client/components/App.tsx`. Final version:

```tsx
import { Routes, Route } from 'react-router'
import BooksList from './BooksList'
import AddBook from './AddBook'
import BookDetail from './BookDetail'
import EditBook from './EditBook'
import FairyDustCursor from './FairyDustCursor'

function App() {
  return (
    <>
      <FairyDustCursor />
      <header className="header">
        <h1>Serinas Book Library</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<AddBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<EditBook />} />
        </Routes>
      </main>
    </>
  )
}

export default App
```

### Step 11.8: Verify in browser

- [ ] Move the cursor around — pink and gold sparkles should trail it, fading out
- [ ] Open DevTools → Rendering → "Emulate CSS media feature `prefers-reduced-motion`" → set to `reduce` → refresh
- [ ] Move cursor — NO sparkles should appear
- [ ] Reset to "no preference" → sparkles return

### Step 11.9: Commit

```bash
git add client/lib/cursorSparkle.ts client/lib/cursorSparkle.test.ts client/components/FairyDustCursor.tsx client/components/App.tsx client/styles/index.css
git commit -m "Add fairy dust cursor with reduced-motion guard

- shouldSpawnSparkle checks prefers-reduced-motion and pointer: coarse
- spawnSparkle creates self-cleaning particles
- 30ms throttle to keep performance reasonable
- Container is aria-hidden, pointer-events: none, z-index: 9998
- Particles drift up, fade, scale down via CSS animation
- 3 vitest tests for the guard logic
- Disabled entirely on touch devices and reduced motion"
```

---

## Task 12: A11y polish — focus management on route change

**Files:**
- Modify: `client/components/BookDetail.tsx` (add focus effect)
- Modify: `client/components/AddBook.tsx` (focus h2)
- Modify: `client/components/EditBook.tsx` (focus h2)

### Step 12.1: Add focus management to BookDetail

- [ ] Open `client/components/BookDetail.tsx`. Add `useEffect` import and focus effect:

Add to imports:
```tsx
import { useEffect, useRef } from 'react'
```

Inside `BookDetail`, before the return:
```tsx
const titleRef = useRef<HTMLHeadingElement>(null)
useEffect(() => {
  titleRef.current?.focus()
}, [data?.id])
```

Change the `<h1>` line to:
```tsx
<h1 ref={titleRef} tabIndex={-1} style={{ marginTop: '6px' }}>
```

### Step 12.2: Add focus management to AddBook

- [ ] Open `client/components/AddBook.tsx`. Add imports + ref + effect:

```tsx
import { useEffect, useRef } from 'react'
```

Inside `AddBook`:
```tsx
const headingRef = useRef<HTMLHeadingElement>(null)
useEffect(() => {
  headingRef.current?.focus()
}, [])
```

Change the `<h2>` to:
```tsx
<h2 ref={headingRef} tabIndex={-1}>Add a Book</h2>
```

### Step 12.3: Same for EditBook

- [ ] Open `client/components/EditBook.tsx`, apply the same pattern: import `useEffect`/`useRef`, add ref, add focus effect with `[data?.id]` dependency, add ref + tabIndex to the `<h2>`.

### Step 12.4: Verify keyboard navigation

- [ ] From the list, Tab through tiles — each tile shows the gold focus outline
- [ ] Press Enter on a focused tile → navigates to detail → focus lands on the title (you should see the outline)
- [ ] On detail, Tab to "Back to library" → Enter → returns to list → Tab returns to the same tile
- [ ] Tab from a tile to the Add Book button → Enter → focus lands on "Add a Book" h2
- [ ] Tab through all form fields with Tab — each shows gold outline
- [ ] Shift+Tab works in reverse

### Step 12.5: Run all tests one final time

```bash
npm test -- --run
```

Expected: all backend tests + mana tests + sparkle tests pass. (Frontend component tests are intentionally not added in this round — could be Task 13 in a future round.)

### Step 12.6: Commit

```bash
git add client/components/BookDetail.tsx client/components/AddBook.tsx client/components/EditBook.tsx
git commit -m "Focus management on route change for screen readers

- BookDetail focuses the book title on mount/id change
- AddBook focuses 'Add a Book' h2 on mount
- EditBook focuses 'Edit Book' h2 on data load
- All headings have tabIndex={-1} so they're programmatically
  focusable without entering the natural tab order
- This makes route changes audible to AT users — they hear
  the new page's purpose immediately instead of starting from
  the top of the document"
```

---

## Task 13: Final manual a11y + visual audit

**Files:** None changed in this task — pure verification.

### Step 13.1: Visual checklist

- [ ] Run `npm run dev`, visit `http://localhost:5173/`
- [ ] Library renders with covers, titles in Cinzel, authors in Andika, gold mana bars
- [ ] Tile hover shows pointer cursor (it's a Link)
- [ ] Click tile → spread detail page with all metadata
- [ ] Click "Edit" → form with pre-filled values
- [ ] Edit a field, save → returns to detail with new value
- [ ] Click "Delete" → confirm dialog → confirm → returns to library, book gone
- [ ] Click "+ Add a book" → empty form → fill in title at minimum → submit → lands on new book's detail
- [ ] Cursor leaves a sparkle trail across all routes

### Step 13.2: Keyboard-only checklist

- [ ] Reload, do NOT touch the mouse
- [ ] Tab from address bar — focus enters the page
- [ ] Tab through "+ Add a book" then each tile — all show gold focus outline
- [ ] Enter on a tile → detail page → focus lands on the book title (visible outline)
- [ ] Tab from title → Back link → Edit button → Delete button
- [ ] Enter on Edit → form, focus on h2 → Tab through all fields → Submit
- [ ] Esc has no required behaviour (no modal yet)

### Step 13.3: Reduced motion check

- [ ] DevTools → Rendering → `prefers-reduced-motion: reduce`
- [ ] Refresh — no fairy dust appears
- [ ] Mana bar transitions are instant
- [ ] Reset to "no preference" — everything returns

### Step 13.4: Screen reader spot-check (optional but recommended)

- [ ] If you have NVDA (Windows), VoiceOver (Mac), or Orca (Linux):
- [ ] Navigate to a book — should hear "Cover of [title]" announced before the metadata
- [ ] Hear "Reading progress: [status]" when the mana bar gets focus or is read
- [ ] On mutation, loading state announces via `role="status"`
- [ ] On error, error announces via `role="alert"`

### Step 13.5: Run the full test suite one last time

```bash
npm test -- --run
```

Expected: all tests pass (10 backend + 7 mana + 3 sparkle = 20 total).

### Step 13.6: Final commit

```bash
git commit --allow-empty -m "Moonlit Cobalt UI overhaul complete

End-to-end a11y verified:
- Keyboard navigation through all routes
- Focus management announces route changes to AT
- Gold focus outline on every interactive element
- Cover images have descriptive alt text
- Mana bar exposes role='progressbar' with status as aria-label
- Loading/error states use role='status'/role='alert' live regions
- Fairy dust cursor disabled on prefers-reduced-motion AND touch
- prefers-reduced-motion media query disables CSS transitions
- WCAG AA contrast verified for all text colours on the palette"
```

---

## Out of Scope (round two)

These were considered and deliberately deferred:

- **`progress_percent` column** for fine-grained mana progress (book is X% read)
- **Custom delete modal** (using browser `confirm()` for now)
- **Optimistic UI updates** on mutations (invalidate-and-refetch is fine for a small collection)
- **Inline editing on detail page** (separate `/books/:id/edit` route this round)
- **Open Library cover lookup** (paste a URL for now)
- **Search, filter, sort, pagination**
- **Light theme / theme toggle**
- **Authentication / multi-user**
- **Frontend component tests** (Vitest + React Testing Library) — backend coverage is solid, frontend tested manually

---

## Tutoring Notes

This plan is structured as the AI tutor would walk through it with Serina:

- **Tasks 1-3 are "primitives"** — visual foundation, pure helper, small component. Low risk of bugs, high satisfaction (the page changes visually after Task 1).
- **Tasks 4-5 are "plumbing"** — API client + router. Necessary, slightly abstract. Worth pausing at Step 5.3 to confirm routes work before continuing.
- **Tasks 6-9 are "the CRUD UI"** — fetching, forms, mutations. Most of the new React concepts (useParams, useMutation+useNavigate, useQueryClient+invalidate). This is where the most learning happens.
- **Task 10 is "the magic"** — tile grid lands the visual identity.
- **Task 11 is "the polish"** — fairy dust. Pure delight.
- **Task 12-13 are "the discipline"** — focus management + manual audit. Locks in a11y.

Each task ends with a verification checkpoint. Serina can pause between any two tasks.
