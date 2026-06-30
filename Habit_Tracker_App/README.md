# Habit Tracker — Week 1

React + Vite + Tailwind UI for the Habit Tracker app. This covers every Week 1
checklist item:

1. React + Vite project, Tailwind installed
2. `HabitCard` — habit name, streak count, today's tick button, edit + delete buttons
3. `HabitList` — renders habits, with an empty state ("No habits added yet")
4. `AddHabitForm` (`HabitFormModal`) — one modal used for both adding and editing: name + frequency (daily/weekly)
5. `WeekCalendarStrip` — 7-day strip showing ticks for the last 7 days
6. Habits persist in the browser (`localStorage`) so they survive a refresh
7. Ready to push to GitHub (steps below)

## Folder structure

```
habit-tracker/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx              # React root render
    ├── App.jsx               # Top-level state (habits, modal open/close, persistence)
    ├── index.css             # Tailwind directives + global styles
    ├── data/
    │   └── sampleHabits.js   # Unused by default; kept as example data shape
    ├── utils/
    │   └── storage.js        # localStorage load/save helpers
    └── components/
        ├── HabitCard.jsx         # One habit: name, streak, tick/edit/delete buttons, week strip
        ├── HabitList.jsx         # Grid of HabitCards + empty state
        ├── AddHabitForm.jsx      # Modal used for both adding AND editing a habit
        └── WeekCalendarStrip.jsx # Punch-card style 7-day strip
```

## Design notes

Visual language is a "habit log" theme: warm paper background with a dot-grid
texture, deep pine green for completed days, and an ember-orange streak badge
(🔥 count) so progress reads at a glance. The week strip is a punch-card: a
solid pine dot for a day done, an empty ring for a day missed, an ember ring
on today if it isn't done yet.

State lives in `App.jsx` (`useState`) and is saved to `localStorage` on every
change, then reloaded on page load — so the app starts with **no habits**
on a brand-new browser, and whatever you add sticks around after a refresh.
There's no backend/database yet; that's a later week.

- `onToggleToday` flips today's tick and bumps the streak up/down
- `onAddHabit` (via the modal) appends a new habit with an empty 7-day history
- `onEdit` opens the same modal pre-filled, and saves changes to name/frequency
  without touching its streak or tick history
- `onDelete` asks for confirmation, then removes the habit for good

## Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Week 1: React + Tailwind habit tracker UI"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

(Create an empty repo on GitHub first — no README/license selected there — so
there's no conflicting history to merge.)

## What's next (Week 2+, not in this scope)

- Backend API + database for habits/completions
- Authentication (login/signup, protected routes)
- AI coaching/motivation endpoint
- Full month calendar + progress dashboard charts

## Validation

- **Required, trimmed name** — blank or whitespace-only names are rejected.
- **Length limits** — 2–60 characters, enforced both by the input's
  `maxLength` and by `validateHabitName` (a live "characters left" counter
  is shown).
- **No duplicate names** — case-insensitive check against your other
  habits; renaming a habit to its own current name is allowed.
- **Whitelisted frequency** — only `daily` or `weekly` can ever be saved;
  there's no free-text field for it.
- All rules live in `src/utils/validation.js` so the form and the storage
  layer use the exact same logic.

## Security notes

This is a client-only app right now (no backend/auth yet), so "security"
here means: don't trust input, don't trust storage, and don't open any
injection holes. Specifically:

- **No `dangerouslySetInnerHTML` anywhere.** Habit names are rendered as
  plain React text, which auto-escapes — so a habit named `<script>...`
  is just displayed as that literal text, never executed.
- **Input is validated AND sanitized**, not just validated: control
  characters are stripped and whitespace is collapsed (`sanitizeName`)
  before anything is stored or displayed.
- **`localStorage` is treated as untrusted input.** It's plain text a user
  (or a browser extension) can edit by hand. Every habit read back from
  storage is re-validated and coerced into the correct shape
  (`sanitizeHabit` in `src/utils/storage.js`) — wrong types, missing
  fields, a tampered `frequency`, more than 7 ticks, a negative streak,
  etc. are all corrected or dropped rather than crashing the app or being
  trusted as-is.
- **Bounded storage** — at most 200 habits and 60 characters per name are
  ever persisted, to avoid unbounded `localStorage` growth.
- **No native `alert`/`confirm`/`prompt`.** Destructive actions (delete)
  use an in-app `ConfirmDialog` instead — it's keyboard accessible
  (focus moves to it, `Escape` cancels), can't be skinned to look like a
  real browser dialog by a malicious page, and doesn't block the whole
  tab the way native dialogs do.
- **IDs use `crypto.randomUUID()`** (with a fallback) instead of a
  timestamp, so two habits added in the same millisecond can't collide.
