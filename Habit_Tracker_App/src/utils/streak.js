// ─── Date + Streak Logic (Week 2) ────────────────────────────────────────────
//
// Habits store `completions`: an array of "YYYY-MM-DD" strings (local calendar
// dates, NOT UTC timestamps) — one entry per completed day.
//
// `streak` is ALWAYS derived from `completions` via computeStreak().
// It is never incremented/decremented by hand, so it can never drift out of
// sync with the real completion history.

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

/** Local calendar date → "YYYY-MM-DD". Never uses UTC so midnight stays correct. */
export function toDateKey(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Today as "YYYY-MM-DD" in the user's local timezone. */
export function todayKey() {
  return toDateKey(new Date())
}

export function isValidDateKey(value) {
  return typeof value === 'string' && DATE_KEY_RE.test(value)
}

/** Returns a new Date offset by `days` from the given date. */
export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** ISO week key ("2026-W26") for weekly-habit streak counting. */
function toISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = (d.getUTCDay() + 6) % 7 // Mon = 0 … Sun = 6
  d.setUTCDate(d.getUTCDate() - dayNum + 3)
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  const week =
    1 + Math.round(((d - jan4) / 86_400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

// Daily streak 
// Walks backwards day-by-day. Treats the streak as still "alive" if yesterday
// was done even when today hasn't been ticked yet (so it doesn't flicker to 0
// the moment midnight passes). Any real gap resets it to 0.
function computeDailyStreak(dateKeys) {
  const set = new Set(dateKeys)
  let cursor = new Date()

  // Allow grace: if today is not yet done, start checking from yesterday
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

// Weekly streak 
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
 * Derives the current streak from a habit's `completions` array.
 * This is the single source of truth — never store a raw counter.
 */
export function computeStreak(completions, frequency = 'daily') {
  if (!Array.isArray(completions) || completions.length === 0) return 0
  const valid = completions.filter(isValidDateKey)
  if (valid.length === 0) return 0
  return frequency === 'weekly'
    ? computeWeeklyStreak(valid)
    : computeDailyStreak(valid)
}

/** Returns true if today's date key is in the completions array. */
export function isCompletedToday(completions) {
  return Array.isArray(completions) && completions.includes(todayKey())
}

/** Last 7 calendar days as date keys, oldest first, today last. */
export function getLast7DateKeys() {
  const keys = []
  for (let i = 6; i >= 0; i--) {
    keys.push(toDateKey(addDays(new Date(), -i)))
  }
  return keys
}

/**
 * Percentage of the last 30 days that were completed.
 * Used on the Stats page.
 */
export function completionRate30(completions) {
  if (!Array.isArray(completions)) return 0
  const set = new Set(completions)
  let count = 0
  for (let i = 0; i < 30; i++) {
    if (set.has(toDateKey(addDays(new Date(), -i)))) count++
  }
  return Math.round((count / 30) * 100)
}
