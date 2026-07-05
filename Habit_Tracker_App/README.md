# Habit Tracker

A React-based single-page application for building and maintaining positive daily routines. Track habits, monitor streaks, and visualize your consistency through a 7-day calendar strip — all with data that persists locally in your browser.

---

## Features

- **Habit management** — Add, edit, and delete habits with a name and frequency (daily or weekly)
- **Daily check-ins** — Mark any habit as done for the day; the tick button turns green on completion
- **Live streak counter** — Streak is computed in real time from your actual completion history, not a manually stored number
- **Auto-recovery** — Broken streaks are detected and corrected automatically the moment you open the app
- **7-day calendar strip** — A punch-card style strip shows your completion history for the last 7 days
- **Stats page** — 30-day completion rate per habit with a visual progress bar, plus overall totals
- **Persistent storage** — All habits survive a page refresh via localStorage; first-time users see 3 seeded habits to get started
- **No native alerts** — Destructive actions (delete) use a styled in-app confirmation dialog, not `window.confirm`
- **Full form validation** — Name required, 2–60 characters, no duplicates allowed, frequency whitelisted

---

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | react-router-dom v6 |
| State management | React Context API + useState |
| Persistence | localStorage (browser) |
| Language | JavaScript (ES Modules) |

---

## Project structure

```
habit-tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── src/
    ├── main.jsx                      # React root — mounts <App />
    ├── App.jsx                       # BrowserRouter + Routes + HabitsProvider wrapper
    ├── index.css                     # Tailwind directives, dot-grid texture, focus styles
    │
    ├── context/
    │   └── HabitsContext.jsx         # Global state: habits array + all actions
    │                                 # (createContext → Provider → useHabits hook)
    │
    ├── pages/
    │   ├── Dashboard.jsx             # Route "/" — main habit tracker view
    │   └── Stats.jsx                 # Route "/stats" — 30-day progress overview
    │
    ├── components/
    │   ├── Navbar.jsx                # Top navigation with Link (SPA, no page reload)
    │   ├── HabitCard.jsx             # Single habit tile: name, streak, tick, edit, delete
    │   ├── HabitList.jsx             # Responsive grid of HabitCards + empty state
    │   ├── AddHabitForm.jsx          # Controlled modal form for adding and editing
    │   ├── ConfirmDialog.jsx         # Accessible in-app confirmation popup
    │   └── WeekCalendarStrip.jsx     # 7-day punch-card strip from real date keys
    │
    ├── utils/
    │   ├── streak.js                 # Date helpers, computeStreak(), isCompletedToday()
    │   ├── storage.js                # localStorage read/write + sanitizeHabit()
    │   └── validation.js             # validateHabitName(), validateFrequency(), sanitizeName()
    │
    └── data/
        └── sampleHabits.js           # 3 seeded habits shown on first visit
```

---

## Getting started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Install and run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview    # preview the production build locally
```

### Push to GitHub

```bash
git init
git add .
git commit -m "feat: habit tracker with streak logic, routing, and context API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/habit-tracker.git
git push -u origin main
```

---

## How it works

### Habit data model

Each habit is stored as a plain object:

```js
{
  id:          "3f2a1b...",                         // crypto.randomUUID()
  name:        "Read 20 minutes",
  frequency:   "daily",                             // "daily" | "weekly"
  completions: ["2026-06-28", "2026-06-29", "2026-06-30"],  // YYYY-MM-DD strings
  streak:      3,                                   // always derived, never stored manually
}
```

`completions` is the source of truth. The `streak` field is always computed from it via `computeStreak()` and never incremented or decremented by hand — so it can never drift out of sync with the actual history.

### Streak calculation

`computeStreak()` in `src/utils/streak.js` walks backwards from today:

- **Daily habits** — counts consecutive calendar days. The streak is kept "alive" if either today or yesterday is completed, so it doesn't visually drop to zero the moment midnight passes before you've had a chance to tick today.
- **Weekly habits** — counts consecutive ISO weeks. One completion anywhere in a given week counts for that week.
- Any gap beyond one day (or one week) resets the count to zero.

On every app load, a `useEffect` recomputes every habit's streak fresh from its `completions` array and corrects any cached number that is now stale (e.g. you skipped two days while the tab was closed).

### State management — Context API

Habits state and all actions live in `HabitsContext.jsx`. Any component that needs them calls `useHabits()` directly — no prop drilling through intermediate components.

```js
// In any component, anywhere in the tree:
const { habits, toggleToday, addHabit, editHabit, deleteHabit } = useHabits()
```

Local UI state (which modal is open, which habit is pending deletion) stays local to the page that needs it via `useState`.

### Routing

`App.jsx` sets up two routes with `react-router-dom`:

| Path | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Daily habit list — tick, add, edit, delete |
| `/stats` | Stats | 30-day completion rates and streak summary |

The `<Navbar>` uses `<Link>` so navigating between pages never triggers a full browser reload.

### Form validation

`AddHabitForm` is a controlled component — React state drives every input value. On submission:

| Rule | Detail |
|---|---|
| Name required | Blank or whitespace-only names are rejected |
| Minimum length | 2 characters after trimming |
| Maximum length | 60 characters (enforced by `maxLength` attribute and validator) |
| No duplicates | Case-insensitive check against all other habits; editing your own name is allowed |
| Frequency | Must be `daily` or `weekly` — no free-text accepted |

Errors appear inline beneath the field as `role="alert"` paragraphs, accessible to screen readers.

---

## Security

| Concern | How it's handled |
|---|---|
| XSS | No `dangerouslySetInnerHTML` anywhere. React auto-escapes all rendered text, so a habit named `<script>` displays as literal text. |
| Untrusted storage | Every habit loaded from localStorage passes through `sanitizeHabit()`, which coerces wrong types, strips invalid date strings, and recomputes the streak — a hand-edited JSON value cannot crash the app or fake a streak. |
| Input sanitization | Control characters are stripped and whitespace collapsed before anything is stored or displayed. |
| Fake streaks | `streak` is never trusted from storage. It is always recomputed from `completions` on load. |
| Bounded storage | Max 200 habits, 60 chars per name, 3 660 completions per habit. |
| Unique IDs | `crypto.randomUUID()` with a time-based fallback for older browsers. |
| Confirmations | No `window.confirm` or `window.alert`. All destructive actions use the in-app `<ConfirmDialog>` which is keyboard-accessible (focus on open, Escape to cancel). |

---

## Keyboard accessibility

- Every interactive element is reachable by Tab
- Focus ring visible on all buttons, inputs, and links
- Modals trap focus on open and close on Escape
- `role="dialog"` and `role="alertdialog"` with `aria-modal`, `aria-labelledby`, and `aria-describedby` on all overlays
- Streak and calendar cells have `aria-label` text for screen readers
- `prefers-reduced-motion` media query disables all transitions for users who request it

---

## Roadmap

The following features are planned for upcoming iterations:

- **Backend API** — REST endpoints (Node/Express or FastAPI) to replace localStorage
- **Database** — PostgreSQL or MongoDB for multi-device persistence
- **Authentication** — Sign up, log in, protected routes
- **AI coaching** — Personalised motivation and tips via the Anthropic API
- **Monthly calendar** — Full calendar view with historical completion data
- **Charts** — Recharts-based progress graphs on the Stats page