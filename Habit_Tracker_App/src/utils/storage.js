// localStorage wrapper.
//
// SECURITY: localStorage is plain text that any user or browser extension can
// edit by hand. Everything read back from storage is coerced into the correct
// shape by sanitizeHabit(). Streak is NEVER trusted from storage — it is
// always recomputed from `completions` so it can't be faked by editing JSON.

import { ALLOWED_FREQUENCIES, NAME_MAX_LENGTH, sanitizeName } from './validation.js'
import { computeStreak, isValidDateKey } from './streak.js'

const STORAGE_KEY         = 'habit-tracker:habits'
const MAX_HABITS          = 200
const MAX_COMPLETIONS     = 3_660   // ~10 years of daily ticks

/** Cryptographically random ID. Falls back for very old browsers. */
export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `h${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Sanitize one unknown value from storage into a valid habit, or null.
 * This is the single choke-point: every habit flowing into React state
 * has been through here.
 */
function sanitizeHabit(raw) {
  if (!raw || typeof raw !== 'object') return null

  const name = sanitizeName(raw.name).slice(0, NAME_MAX_LENGTH)
  if (!name) return null

  const frequency = ALLOWED_FREQUENCIES.includes(raw.frequency)
    ? raw.frequency
    : 'daily'

  const id =
    typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : makeId()

  // Deduplicate + sort + cap completions; reject invalid date strings
  const completions = Array.isArray(raw.completions)
    ? Array.from(new Set(raw.completions.filter(isValidDateKey)))
        .sort()
        .slice(-MAX_COMPLETIONS)
    : []

  // Always derive streak — never trust the stored number
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
      .filter(({ id }) => {
        if (seenIds.has(id)) return false
        seenIds.add(id)
        return true
      })
      .slice(0, MAX_HABITS)
  } catch (err) {
    console.warn('[HabitTracker] Could not load habits:', err)
    return []
  }
}

export function saveHabits(habits) {
  try {
    const safe = Array.isArray(habits) ? habits.slice(0, MAX_HABITS) : []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
  } catch (err) {
    // Quota exceeded, private browsing, etc. — keep working in-memory
    console.warn('[HabitTracker] Could not save habits:', err)
  }
}
