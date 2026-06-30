// Date + streak logic for Week 2.
//
// Habits store `completions`: an array of "YYYY-MM-DD" date strings (local
// calendar dates, not timestamps) marking every day the habit was done.
// Streak is never trusted as a stored number on its own — it is always
// DERIVED from `completions`, so it can never drift out of sync with the
// actual history (see computeStreak below, and the "reset broken streaks
// on load" effect in App.jsx).

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

/** Local calendar date as "YYYY-MM-DD" (not UTC, not a timestamp). */
export function toDateKey(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function isValidDateKey(value) {
  return typeof value === 'string' && DATE_KEY_RE.test(value)
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// ISO week key ("2026-W26") so weekly habits count one completion per
// calendar week regardless of which day of that week it was ticked.
function toISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7 // Monday = 0 ... Sunday = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const week =
    1 +
    Math.round(
      ((d - firstThursday) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    )
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

/**
 * Counts the current consecutive streak up to (and including) today, based
 * on actual completion dates rather than a fixed window. A streak is
 * "alive" if today OR yesterday is completed (so it doesn't visually
 * vanish at midnight before the user has had a chance to tick today) but
 * any earlier gap breaks it.
 */
function computeDailyStreak(dateKeys) {
  const set = new Set(dateKeys)
  let cursor = new Date()
  if (!set.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1)
  }
  let streak = 0
  while (set.has(toDateKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

function computeWeeklyStreak(dateKeys) {
  const weekSet = new Set(
    dateKeys.map((key) => toISOWeekKey(new Date(`${key}T00:00:00`)))
  )
  let cursor = new Date()
  if (!weekSet.has(toISOWeekKey(cursor))) {
    cursor = addDays(cursor, -7)
  }
  let streak = 0
  while (weekSet.has(toISOWeekKey(cursor))) {
    streak++
    cursor = addDays(cursor, -7)
  }
  return streak
}

/**
 * Derives the current streak from a habit's completion history. This is
 * the single source of truth for streak numbers — never increment/decrement
 * a stored counter by hand, always recompute from `completions`.
 */
export function computeStreak(completions, frequency = 'daily') {
  if (!Array.isArray(completions) || completions.length === 0) return 0
  const validKeys = completions.filter(isValidDateKey)
  if (validKeys.length === 0) return 0

  return frequency === 'weekly'
    ? computeWeeklyStreak(validKeys)
    : computeDailyStreak(validKeys)
}

export function isCompletedToday(completions) {
  return Array.isArray(completions) && completions.includes(todayKey())
}

/** Last 7 calendar days, oldest first, today last — for the week strip. */
export function getLast7DateKeys() {
  const keys = []
  for (let i = 6; i >= 0; i--) {
    keys.push(toDateKey(addDays(new Date(), -i)))
  }
  return keys
}
