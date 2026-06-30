// Sample habits used for Week 1 UI before the backend/API exists (Week 2+).
// `ticks` holds the last 7 days, oldest first, today last (true = completed).

export const sampleHabits = [
  {
    id: 'h1',
    name: 'Drink 2L of water',
    frequency: 'daily',
    streak: 5,
    ticks: [true, true, true, false, true, true, false],
  },
  {
    id: 'h2',
    name: 'Read 20 minutes',
    frequency: 'daily',
    streak: 12,
    ticks: [true, true, true, true, true, true, false],
  },
  {
    id: 'h3',
    name: 'Weekly meal prep',
    frequency: 'weekly',
    streak: 3,
    ticks: [false, false, false, false, false, false, true],
  },
]
