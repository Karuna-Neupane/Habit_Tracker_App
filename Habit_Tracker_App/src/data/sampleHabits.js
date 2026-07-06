// Three sample habits shown on first-ever visit (when localStorage is empty).
// Uses real relative date keys so streaks are live immediately.

import { makeId } from '../utils/storage.js'
import { addDays, computeStreak, toDateKey } from '../utils/streak.js'

function d(offsetDays) {
  return toDateKey(addDays(new Date(), -Math.abs(offsetDays)))
}

const waterCompletions = [d(6), d(5), d(4), d(3), d(1), d(0)]
const readCompletions = [d(6), d(5), d(4), d(3), d(2), d(1), d(0)]
const mealCompletions = [d(5), d(0)]

export const sampleHabits = [
  {
    id: makeId(),
    name: 'Drink 2L of water',
    frequency: 'daily',
    completions: waterCompletions,
    streak: computeStreak(waterCompletions, 'daily'),
  },
  {
    id: makeId(),
    name: 'Read 20 minutes',
    frequency: 'daily',
    completions: readCompletions,
    streak: computeStreak(readCompletions, 'daily'),
  },
  {
    id: makeId(),
    name: 'Weekly meal prep',
    frequency: 'weekly',
    completions: mealCompletions,
    streak: computeStreak(mealCompletions, 'weekly'),
  },
]
