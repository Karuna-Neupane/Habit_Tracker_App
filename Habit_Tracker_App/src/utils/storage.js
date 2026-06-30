// Small wrapper around localStorage so habits survive a page refresh.
// Every value coming OUT of storage is re-validated (`sanitizeHabit`)
// before it ever reaches React state. This matters because localStorage
// is plain text a user (or a browser extension) can edit by hand — the
// app must not trust it blindly.

import { ALLOWED_FREQUENCIES, NAME_MAX_LENGTH, sanitizeName } from './validation.js'
import { computeStreak, isValidDateKey } from './streak.js'

const STORAGE_KEY = 'habit-tracker:habits'
const MAX_HABITS = 200 // sane upper bound, avoids unbounded storage growth
const MAX_COMPLETIONS_PER_HABIT = 3660 // ~10 years of daily ticks, plenty

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers without crypto.randomUUID
  return `h${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Coerces an unknown value from storage into a well-formed habit object,
// or returns null if it can't be salvaged. This is the single choke point
// that guarantees every habit in app state has the right shape and types.
// Streak is never trusted from storage — it's always recomputed from
// `completions`, so a hand-edited or stale streak number can't survive.
function sanitizeHabit(raw) {
  if (!raw || typeof raw !== 'object') return null

  const name = sanitizeName(raw.name).slice(0, NAME_MAX_LENGTH)
  if (!name) return null

  const frequency = ALLOWED_FREQUENCIES.includes(raw.frequency)
    ? raw.frequency
    : 'daily'

  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : makeId()

  const completions = Array.isArray(raw.completions)
    ? Array.from(new Set(raw.completions.filter(isValidDateKey)))
        .sort()
        .slice(-MAX_COMPLETIONS_PER_HABIT)
    : []

  const streak = computeStreak(completions, frequency)

  return { id, name, frequency, completions, streak }
}

export function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const seenIds = new Set()
    return parsed
      .map(sanitizeHabit)
      .filter(Boolean)
      .filter((habit) => {
        if (seenIds.has(habit.id)) return false
        seenIds.add(habit.id)
        return true
      })
      .slice(0, MAX_HABITS)
  } catch (err) {
    console.warn('Could not read habits from localStorage:', err)
    return []
  }
}

export function saveHabits(habits) {
  try {
    const safe = Array.isArray(habits) ? habits.slice(0, MAX_HABITS) : []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
  } catch (err) {
    // Quota exceeded, storage disabled, etc. — fail quietly, app still
    // works in-memory for the rest of the session.
    console.warn('Could not save habits to localStorage:', err)
  }
}

export { makeId }
