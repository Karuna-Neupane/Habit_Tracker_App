// Date + Streak Logic 
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
export function toISOWeekKey(date) {
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
//
// Anchor point: normally "today" per this machine's own clock. But the streak
// is often computed on the server while the completion date was stamped by
// the browser — if they're in different timezones, the server's "today" can
// be a calendar day behind the browser's (e.g. server in UTC, user ahead of
// UTC). If the most recent logged date is AHEAD of this machine's "today",
// trust the data and anchor there instead — otherwise a same-day, same-streak
// completion could undercount because the walk-back never reaches it.
function computeDailyStreak(dateKeys) {
  const set = new Set(dateKeys)
  const localToday = todayKey()
  const latestLogged = [...set].sort().at(-1)
  const anchorKey = latestLogged && latestLogged > localToday ? latestLogged : localToday
  let cursor = new Date(`${anchorKey}T00:00:00`)

  // Allow grace: if the anchor day is not yet done, start checking from the day before
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

// Weekly streak — same anchor-drift protection as computeDailyStreak above.
function computeWeeklyStreak(dateKeys) {
  const weekKeys = dateKeys.map((key) => toISOWeekKey(new Date(`${key}T00:00:00`)))
  const weekSet = new Set(weekKeys)
  const localWeek = toISOWeekKey(new Date())
  const latestLoggedWeek = [...weekSet].sort().at(-1)
  const anchorWeek = latestLoggedWeek && latestLoggedWeek > localWeek ? latestLoggedWeek : localWeek

  let cursor = new Date()
  // Walk `cursor` to land on the anchor week by nudging in 7-day steps.
  while (toISOWeekKey(cursor) !== anchorWeek && toISOWeekKey(cursor) < anchorWeek) {
    cursor = addDays(cursor, 7)
  }
  while (toISOWeekKey(cursor) !== anchorWeek && toISOWeekKey(cursor) > anchorWeek) {
    cursor = addDays(cursor, -7)
  }

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
 * Percentage of the trailing `days` days that were completed.
 * completionRate30 (below) is just this with days=30.
 *
 * If `createdAt` is given, the window is capped to how long the habit has
 * actually existed — a 3-day-old habit completed every day should read
 * 100%, not 10% (3/30), which is what a flat 30-day denominator would show.
 */
export function completionRateN(completions, days, createdAt) {
  if (!Array.isArray(completions)) return 0

  let windowDays = days
  if (createdAt) {
    const createdKey = toDateKey(new Date(createdAt))
    const msPerDay = 86_400_000
    const daysSinceCreated = Math.floor(
      (new Date(`${todayKey()}T00:00:00`) - new Date(`${createdKey}T00:00:00`)) / msPerDay
    ) + 1 // inclusive of the creation day itself
    windowDays = Math.min(days, Math.max(daysSinceCreated, 1))
  }

  const set = new Set(completions)
  let count = 0
  for (let i = 0; i < windowDays; i++) {
    if (set.has(toDateKey(addDays(new Date(), -i)))) count++
  }
  return Math.round((count / windowDays) * 100)
}

/**
 * Percentage of the last 30 days (or the habit's full age, if younger) that
 * were completed. Used on the Stats page and habit cards.
 */
export function completionRate30(completions, createdAt) {
  return completionRateN(completions, 30, createdAt)
}

// Longest streak ever achieved (not just the current one) — scans the full
// completion history for the longest run of consecutive days/weeks.
function longestConsecutiveDailyRun(dateKeys) {
  const uniqueSorted = [...new Set(dateKeys)].sort()
  let longest = 0, run = 0, prevTime = null
  for (const key of uniqueSorted) {
    const t = new Date(`${key}T00:00:00`).getTime()
    run = (prevTime !== null && t - prevTime === 86_400_000) ? run + 1 : 1
    longest = Math.max(longest, run)
    prevTime = t
  }
  return longest
}

// Weeks aren't a fixed number of days, so we sort by a simple sortable
// ordinal ("year * 54 + week number") and look for consecutive integers.
// The 54 multiplier just needs to safely exceed the max ISO week count (53).
function weekKeyToOrdinal(weekKey) {
  const [year, week] = weekKey.split('-W').map(Number)
  return year * 54 + week
}

function longestConsecutiveWeeklyRun(dateKeys) {
  const weekKeys = [...new Set(dateKeys.map((k) => toISOWeekKey(new Date(`${k}T00:00:00`))))]
  const ordinals = weekKeys.map(weekKeyToOrdinal).sort((a, b) => a - b)
  let longest = 0, run = 0, prev = null
  for (const o of ordinals) {
    run = (prev !== null && o === prev + 1) ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = o
  }
  return longest
}

/**
 * The longest streak this habit has EVER had, regardless of whether it's
 * still active. Unlike computeStreak() (which only looks backwards from
 * today), this scans the entire completion history.
 */
export function longestStreakEver(completions, frequency = 'daily') {
  if (!Array.isArray(completions) || completions.length === 0) return 0
  const valid = completions.filter(isValidDateKey)
  if (valid.length === 0) return 0
  return frequency === 'weekly'
    ? longestConsecutiveWeeklyRun(valid)
    : longestConsecutiveDailyRun(valid)
}

// ─── Occurrence-based period progress (Weekly/Monthly Progress cards) ───────
// Unlike completionRateN (which averages each habit's OWN percentage),
// this counts every *scheduled occurrence* across ALL habits and every
// *completed occurrence* across all habits, then divides once:
//   percent = (total completed occurrences) / (total scheduled occurrences) × 100
// This is what makes "3 daily habits this week" a flat 21-occurrence
// denominator (3 × 7) rather than an average of three separate percentages.

/** Monday–Sunday range containing `date` (defaults to today), as Date objects at midnight. */
export function getWeekRange(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dayIndex = (d.getDay() + 6) % 7 // Mon=0 … Sun=6
  const start = addDays(d, -dayIndex)
  const end   = addDays(start, 6)
  return { start, end }
}

/** First–last day of the calendar month containing `date` (defaults to today). */
export function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0) // day 0 = last day of prior month arg → last day of this month
  end.setHours(0, 0, 0, 0)
  return { start, end }
}

/**
 * Total scheduled vs. completed occurrences across every habit within
 * [periodStart, periodEnd] (inclusive, both at midnight).
 *
 * - Daily habits: one scheduled occurrence per calendar day in the period —
 *   including days later in the period that haven't happened yet, so a
 *   3-daily-habit week is always a 21-occurrence denominator, not a shrinking
 *   "days elapsed so far" count. Days before the habit was created don't count.
 * - Weekly habits: one scheduled occurrence per ISO week that overlaps the
 *   period (again, skipped if the habit didn't exist yet that week); "completed"
 *   means at least one completion date fell in that week.
 */
export function getPeriodProgress(habits, periodStart, periodEnd) {
  let totalScheduled = 0
  let totalCompleted = 0

  for (const h of habits || []) {
    const completions = Array.isArray(h.completions) ? h.completions : []
    const completionSet = new Set(completions)
    const createdKey = h.createdAt ? toDateKey(new Date(h.createdAt)) : null

    if (h.frequency === 'weekly') {
      const weekKeys = new Set()
      for (let d = new Date(periodStart); d <= periodEnd; d = addDays(d, 1)) {
        weekKeys.add(toISOWeekKey(d))
      }
      const createdWeekKey = createdKey ? toISOWeekKey(new Date(`${createdKey}T00:00:00`)) : null
      for (const wk of weekKeys) {
        if (createdWeekKey && createdWeekKey > wk) continue // habit didn't exist yet that week
        totalScheduled += 1
        const completedThisWeek = completions.some(
          (key) => toISOWeekKey(new Date(`${key}T00:00:00`)) === wk
        )
        if (completedThisWeek) totalCompleted += 1
      }
    } else {
      for (let d = new Date(periodStart); d <= periodEnd; d = addDays(d, 1)) {
        const key = toDateKey(d)
        if (createdKey && key < createdKey) continue // habit didn't exist yet that day
        totalScheduled += 1
        if (completionSet.has(key)) totalCompleted += 1
      }
    }
  }

  return {
    completed: totalCompleted,
    scheduled: totalScheduled,
    percent: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0,
  }
}
