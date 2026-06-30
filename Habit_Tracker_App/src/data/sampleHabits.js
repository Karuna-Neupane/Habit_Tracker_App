// Example data shape only — NOT loaded by the app by default (the app
// starts with zero habits and relies on localStorage; see utils/storage.js
// and App.jsx). Kept here as a reference for the `completions` shape.

import { addDays, toDateKey } from '../utils/streak.js'

function daysAgo(n) {
  return toDateKey(addDays(new Date(), -n))
}

export const sampleHabits = [
  {
    id: 'h1',
    name: 'Drink 2L of water',
    frequency: 'daily',
    completions: [daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(0)],
    streak: 1,
  },
  {
    id: 'h2',
    name: 'Read 20 minutes',
    frequency: 'daily',
    completions: [
      daysAgo(6),
      daysAgo(5),
      daysAgo(4),
      daysAgo(3),
      daysAgo(2),
      daysAgo(1),
      daysAgo(0),
    ],
    streak: 7,
  },
  {
    id: 'h3',
    name: 'Weekly meal prep',
    frequency: 'weekly',
    completions: [daysAgo(0)],
    streak: 1,
  },
]
