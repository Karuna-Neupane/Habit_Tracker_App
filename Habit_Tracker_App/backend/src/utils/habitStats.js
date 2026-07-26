// Habit Stats — shared by AI Coach + AI Chatbot
//
// Both /api/ai/coach and /api/ai/chat need the exact same real numbers about
// the logged-in user's habits (names, frequencies, streaks, completion
// rates, overall progress) so Gemini is always grounded in the same facts
// regardless of which feature is asking. Centralizing it here means the
// chatbot can never "invent" a stat that disagrees with the coaching card —
// they're computed from one function, from the same MongoDB documents.

const { computeStreak } = require('./streak');

// ── Longest streak ever (not just current) ─────────────────────────────────
function longestStreakEver(completions, frequency) {
  const valid = [...new Set((completions || []).filter(Boolean))].sort();
  if (valid.length === 0) return 0;

  if (frequency === 'weekly') {
    function isoWeekKey(dateStr) {
      const d = new Date(`${dateStr}T00:00:00`);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const firstThursday = new Date(d.getFullYear(), 0, 4);
      const week = 1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
      return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    const weekKeys = [...new Set(valid.map(isoWeekKey))].sort();
    let longest = 1, current = 1;
    for (let i = 1; i < weekKeys.length; i++) {
      const [py, pw] = weekKeys[i - 1].split('-W').map(Number);
      const [cy, cw] = weekKeys[i].split('-W').map(Number);
      const consecutive = (cy === py && cw === pw + 1) || (cy === py + 1 && pw >= 52 && cw === 1);
      current = consecutive ? current + 1 : 1;
      longest = Math.max(longest, current);
    }
    return longest;
  }

  let longest = 1, current = 1;
  for (let i = 1; i < valid.length; i++) {
    const prev = new Date(`${valid[i - 1]}T00:00:00`);
    const next = new Date(prev);
    next.setDate(next.getDate() + 1);
    const nextKey = next.toISOString().slice(0, 10);
    current = nextKey === valid[i] ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

// ── Trailing-N-day completion rate ──────────────────────────────────────────
function completionRateN(completions, days) {
  const set = new Set(completions || []);
  let count = 0;
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (set.has(d.toISOString().slice(0, 10))) count++;
  }
  return Math.round((count / days) * 100);
}

// ── Per-habit summary (name, frequency, streaks, weekly/monthly rates) ─────
function buildHabitSummaries(habitDocs) {
  return habitDocs.map((h) => ({
    name:              h.name,
    frequency:         h.frequency,
    currentStreak:     computeStreak(h.completions, h.frequency),
    longestStreak:     longestStreakEver(h.completions, h.frequency),
    weeklyRate:        completionRateN(h.completions, 7),
    monthlyRate:       completionRateN(h.completions, 30),
    totalCompletions:  (h.completions || []).length,
  }));
}

// ── Overall (across-all-habits) progress numbers ────────────────────────────
function buildOverallStats(summaries) {
  if (summaries.length === 0) {
    return {
      habitCount: 0,
      avgWeeklyRate: 0,
      avgMonthlyRate: 0,
      totalCurrentStreakDays: 0,
      strongest: null,
      weakest: null,
    };
  }
  const avgWeeklyRate  = Math.round(summaries.reduce((s, h) => s + h.weeklyRate, 0) / summaries.length);
  const avgMonthlyRate = Math.round(summaries.reduce((s, h) => s + h.monthlyRate, 0) / summaries.length);
  const totalCurrentStreakDays = summaries.reduce((s, h) => s + h.currentStreak, 0);
  const byRate = [...summaries].sort((a, b) => b.monthlyRate - a.monthlyRate);

  return {
    habitCount: summaries.length,
    avgWeeklyRate,
    avgMonthlyRate,
    totalCurrentStreakDays,
    strongest: byRate[0] || null,
    weakest: byRate[byRate.length - 1] || null,
  };
}

// Fetches the user's habits and returns { summaries, overall } — the single
// entry point both controllers should call so the numbers are always
// identical no matter which endpoint asks for them.
async function getUserHabitStats(Habit, userId) {
  const habitDocs = await Habit.find({ userId });
  const summaries = buildHabitSummaries(habitDocs);
  const overall   = buildOverallStats(summaries);
  return { summaries, overall };
}

module.exports = {
  buildHabitSummaries,
  buildOverallStats,
  getUserHabitStats,
  longestStreakEver,
  completionRateN,
};
