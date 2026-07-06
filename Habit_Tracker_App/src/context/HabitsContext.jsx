import { createContext, useContext, useEffect, useState } from 'react'
import { loadHabits, makeId, saveHabits } from '../utils/storage.js'
import { computeStreak, todayKey } from '../utils/streak.js'
import { sampleHabits } from '../data/sampleHabits.js'

// STEP 1: Create the Context 
const HabitsContext = createContext(null)

// STEP 2: Provide the Context 
export function HabitsProvider({ children }) {
  /**
   * useState for habits array 
   * Initialiser: load from localStorage; if empty (first visit) seed with
   * the 3 sample habits so the UI isn't blank on day one (Week 1, item 3).
   */
  const [habits, setHabits] = useState(() => {
    const saved = loadHabits()
    return saved.length > 0 ? saved : sampleHabits
  })

  // Persist every time the habits array changes (add / edit / delete / tick)
  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  /**
   * useEffect: reset any broken streaks on app load (Week 2, item 4).
   *
   * If the user didn't open the app for a few days, the cached streak numbers
   * are stale. On mount we recompute every streak fresh from `completions`.
   * Any habit whose streak has dropped gets corrected immediately, before
   * the user sees anything.
   */
  useEffect(() => {
    setHabits((prev) => {
      let changed = false
      const next = prev.map((habit) => {
        const correct = computeStreak(habit.completions, habit.frequency)
        if (correct !== habit.streak) {
          changed = true
          return { ...habit, streak: correct }
        }
        return habit
      })
      return changed ? next : prev   // avoid unnecessary re-renders
    })
    // Intentionally runs once on mount only (load-time integrity check).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actions

  /**
   * Toggle today's completion on/off (Week 2, items 2 + 3 + 6).
   * Adds or removes today's date key in `completions`, then recomputes the
   * streak live from the updated array so the UI updates instantly.
   */
  function toggleToday(habitId) {
    const today = todayKey()
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit
        const alreadyDone = habit.completions.includes(today)
        const completions = alreadyDone
          ? habit.completions.filter((d) => d !== today)
          : [...habit.completions, today].sort()
        return {
          ...habit,
          completions,
          streak: computeStreak(completions, habit.frequency),
        }
      })
    )
  }

  /** Add a new habit with an empty completions history (Week 2, item 5). */
  function addHabit({ name, frequency }) {
    const newHabit = {
      id: makeId(),
      name,
      frequency,
      completions: [],
      streak: 0,
    }
    setHabits((prev) => [...prev, newHabit])
  }

  /**
   * Edit an existing habit's name and/or frequency.
   * Changing frequency recomputes the streak because the counting rules differ
   * (daily counts consecutive days; weekly counts consecutive ISO weeks).
   */
  function editHabit(habitId, { name, frequency }) {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id !== habitId
          ? habit
          : {
            ...habit,
            name,
            frequency,
            streak: computeStreak(habit.completions, frequency),
          }
      )
    )
  }

  /** Remove a habit permanently (Week 2, item 5). */
  function deleteHabit(habitId) {
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }

  const value = {
    habits,
    toggleToday,
    addHabit,
    editHabit,
    deleteHabit,
  }

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  )
}

// STEP 3: Custom hook to consume the Context 
/**
 * useHabits() — call this in any component to get habits data + actions.
 * No prop drilling needed: components reach directly into the context.
 */
export function useHabits() {
  const ctx = useContext(HabitsContext)
  if (!ctx) {
    throw new Error('useHabits must be used inside <HabitsProvider>')
  }
  return ctx
}
