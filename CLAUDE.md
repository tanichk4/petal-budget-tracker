# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # Production build
npm run test       # Run all Vitest tests (single run)
npm run test:ui    # Open Vitest UI
npm run lint       # ESLint
```

To run a single test file:
```bash
npx vitest run src/components/ExpenseCard/ExpenseCard.test.jsx
```

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Required Supabase configuration (manual setup in Supabase dashboard)

**Table: `expenses`** with columns: `id` (uuid pk), `user_id` (uuid → auth.users), `name` (text), `amount` (numeric), `currency` (text: UAH/USD/EUR), `date` (date), `category` (text), `notes` (text nullable), `photo_url` (text nullable), `created_at` (timestamptz).

**Row Level Security:**
```sql
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**Storage bucket:** `expense-photos` (public read, authenticated write)

## Architecture

**Auth gate** — `App.jsx` checks `supabase.auth.getSession()` on mount. `session === undefined` = loading, `null` = show `<AuthPage>`, otherwise render dashboard.

**Data flow** — `useExpenses(userId)` fetches from Supabase and maintains a realtime subscription. `useExchangeRates()` fetches live USD rates from `open.er-api.com` and exposes `convertToUAH(amount, currency)`. Both hooks are called in `App.jsx` and results passed down as props.

**Filtering** — done client-side in `App.jsx` via `useMemo` over the full expenses array. No extra fetches on filter/search changes.

**CSS architecture** — `@layer tokens, animations, base, components, utilities` cascade in `src/index.css`. Design tokens are CSS custom properties in `src/styles/tokens.css` using `oklch()` colors. Component styles use CSS Modules (`*.module.css`). `color-mix()`, `backdrop-filter`, `clamp()`, and `@keyframes` animations are used throughout.

**Category list** is the single source of truth in `src/components/CategoryFilter/CategoryFilter.jsx` (`CATEGORIES` export). Both `AddExpenseModal` and `ExpenseCard` import from there.

**Testing** — Vitest + React Testing Library. `src/test-setup.js` imports `@testing-library/jest-dom`. Supabase is mocked via `vi.mock('../../lib/supabase')` in auth tests. Each component folder has a co-located `*.test.jsx`.
