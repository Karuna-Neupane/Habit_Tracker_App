const { v4: uuidv4 } = require('crypto').webcrypto
  ? { v4: () => require('crypto').randomUUID() }
  : { v4: () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };

const { computeStreak, todayKey, isValidDateKey } = require('../utils/streak');

const ALLOWED_FREQUENCIES = ['daily', 'weekly'];
const MAX_COMPLETIONS = 3_660;

// Seed data (3 sample habits shown on first run) 
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

let habits = [
  {
    id: require('crypto').randomUUID(),
    name: 'Drink 2L of water',
    frequency: 'daily',
    completions: [daysAgo(6), daysAgo(5), daysAgo(4), daysAgo(3), daysAgo(1), daysAgo(0)],
    createdAt: new Date().toISOString(),
  },
  {
    id: require('crypto').randomUUID(),
    name: 'Read 20 minutes',
    frequency: 'daily',
    completions: [daysAgo(6), daysAgo(5), daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1), daysAgo(0)],
    createdAt: new Date().toISOString(),
  },
  {
    id: require('crypto').randomUUID(),
    name: 'Weekly meal prep',
    frequency: 'weekly',
    completions: [daysAgo(6), daysAgo(0)],
    createdAt: new Date().toISOString(),
  },
];

// Helper: attach the derived streak field before sending to client 
function withStreak(habit) {
  return {
    ...habit,
    streak: computeStreak(habit.completions, habit.frequency),
  };
}

// Model methods (exported for use by controllers)
module.exports = {
  /** Return all habits with live streak counts. */
  getAll() {
    return habits.map(withStreak);
  },

  /** Return one habit by id, or null if not found. */
  getById(id) {
    const habit = habits.find((h) => h.id === id);
    return habit ? withStreak(habit) : null;
  },

  /** Create a new habit and return it. */
  create({ name, frequency }) {
    const newHabit = {
      id: require('crypto').randomUUID(),
      name: String(name).trim(),
      frequency: ALLOWED_FREQUENCIES.includes(frequency) ? frequency : 'daily',
      completions: [],
      createdAt: new Date().toISOString(),
    };
    habits.push(newHabit);
    return withStreak(newHabit);
  },

  /** Update a habit's name and/or frequency. Returns updated habit or null. */
  update(id, { name, frequency }) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return null;
    if (name !== undefined) habit.name = String(name).trim();
    if (frequency !== undefined && ALLOWED_FREQUENCIES.includes(frequency)) {
      habit.frequency = frequency;
    }
    return withStreak(habit);
  },

  /** Delete a habit. Returns true if deleted, false if not found. */
  delete(id) {
    const index = habits.findIndex((h) => h.id === id);
    if (index === -1) return false;
    habits.splice(index, 1);
    return true;
  },

  /**
   * Add today's date as a completion.
   * Returns { success, habit, message } so the controller can communicate
   * exactly what happened (added, already exists, habit not found).
   */
  addCompletion(id, date) {
    const today = date || todayKey();

    // Guard: must be a valid YYYY-MM-DD string
    if (!isValidDateKey(today)) {
      return { success: false, code: 'INVALID_DATE', message: 'Invalid date format. Use YYYY-MM-DD.' };
    }

    const habit = habits.find((h) => h.id === id);
    if (!habit) return { success: false, code: 'NOT_FOUND', message: 'Habit not found.' };

    // Reject duplicate completion for same date
    if (habit.completions.includes(today)) {
      return {
        success: false,
        code: 'DUPLICATE',
        message: `Habit already completed on ${today}. Each day can only be marked once.`,
      };
    }

    habit.completions = [...habit.completions, today]
      .filter(isValidDateKey)
      .sort()
      .slice(-MAX_COMPLETIONS);

    return { success: true, habit: withStreak(habit) };
  },

  /**
   * Remove a specific completion date (un-tick).
   * Returns updated habit or null if habit/date not found.
   */
  removeCompletion(id, date) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return null;
    if (!habit.completions.includes(date)) return null;
    habit.completions = habit.completions.filter((d) => d !== date);
    return withStreak(habit);
  },

  /** Return just the completions array for a habit. */
  getHistory(id) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return null;
    return {
      id: habit.id,
      name: habit.name,
      frequency: habit.frequency,
      completions: habit.completions,
      streak: computeStreak(habit.completions, habit.frequency),
      totalCompletions: habit.completions.length,
    };
  },

  /** Check if a habit name is already taken (for duplicate validation). */
  nameExists(name, excludeId = null) {
    return habits.some(
      (h) =>
        h.name.toLowerCase() === String(name).trim().toLowerCase() &&
        h.id !== excludeId
    );
  },
};
