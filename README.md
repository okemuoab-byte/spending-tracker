# Spending Tracker

A personal finance dashboard built with React + Vite, tailored to real Lloyds Bank data (Jun '25 – Jan '26).

## Stack

| Package | Version | Purpose |
|---|---|---|
| React | 18 | UI |
| Vite | 7 | Build / dev server |
| Tailwind CSS | v4 (`@tailwindcss/vite`) | Styling |
| recharts | latest | All charts |
| lucide-react | 0.383.0 | All icons (no emojis) |
| papaparse | latest | CSV parsing |

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## What's done

### Core app
- [x] React 18 + Vite 7 + Tailwind CSS v4 setup
- [x] 7 tabs: Overview, Monthly, Forecast, Income, Goals, Insights, Transactions
- [x] All charts via recharts (BarChart, AreaChart, PieChart, ComposedChart)
- [x] All icons via lucide-react — zero emojis anywhere in the app
- [x] Framer Motion tab transitions (AnimatePresence + motion.div)
- [x] Animated rolling number counters on balance ticker (RAF ease-out)

### CSV Import
- [x] Drag-and-drop CSV importer (Lloyds Bank format)
- [x] Auto-categorisation via keyword rules (`autocat` / `autocatInc`)
- [x] Preview screen before committing data
- [x] "Revert to demo data" button
- [x] selMonth auto-resets to last available month on import
- [x] txCatOverrides reset on new import

### Data & calculations
- [x] 8-month real data (Jun '25 – Jan '26)
- [x] Month-over-month deltas
- [x] Income reliability score
- [x] Spending DNA (category % breakdown)
- [x] Financial health score
- [x] Purchase impact simulator (month-by-month trajectory)
- [x] Months of runway (4 income scenarios)
- [x] Forecast with breach detection
- [x] Subscription audit with cancellation toggles
- [x] Fixed vs variable cost budgets
- [x] Goals tracker

### UX Features
- [x] "Other" category drill-down modal (click pie slice or category row → reassign transactions)
- [x] Transaction cat overrides persist via `txCatOverrides` state
- [x] Weekly view toggle in Monthly tab (ISO week bar chart + budget reference line)
- [x] PNG export of Overview via html2canvas (Export PNG button)
- [x] verdictStyle labels cleaned (no emojis: COMFORTABLE / PROCEED CAREFULLY / NOT YET)

---

## What's left to build

### Priority 1 — Vitest testing
- Set up Vitest + React Testing Library.
- Extract `autocat`, `autocatInc`, `parseCSV`, `fmt`, `fmtK` to `src/utils/finance.js`.
- Tests for all pure functions + financial calculations.
- Run `npm test -- --watch` alongside dev server.

### Priority 2 — Chart entrance animations
- Wrap `ResponsiveContainer` charts in `motion.div` with staggered fade+scale entrance.

### Priority 3 — "Other" feeds into charts
- Currently reassigning "Other" transactions updates the transaction list but not the pie chart.
- Recompute `MONTHLY_CATEGORIES` from the override-applied transaction list so charts reflect changes.

---

## Known quirks
- Chunk size warning on build (~1MB) — recharts + framer-motion + lucide are large. Not a runtime issue; can be addressed with dynamic imports later.
- Demo data uses monthly aggregate transactions (not daily), so the Weekly view shows one bar per month in demo mode. Works correctly with real CSV imports.
- html2canvas may not capture `position:fixed` elements (the balance ticker). The overview div captures correctly.
