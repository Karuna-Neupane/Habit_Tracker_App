// AI Coach Controller — Week 7
// POST /api/ai/coach
//
// 1. Fetches the logged-in user's real habits from MongoDB (never trusts
//    habit data from the request body — same principle as habitController).
// 2. Computes each habit's current streak, longest streak, and 30-day
//    completion rate server-side (reusing utils/streak.js).
// 3. Sends habit names + streaks to Gemini with a habit-coach prompt.
// 4. Returns motivation, weak habits, suggestions, a weekly goal, and
//    encouragement as structured JSON for the frontend's coaching card.
//
// If GEMINI_API_KEY isn't set, or the Gemini call fails for any reason,
// this falls back to a rule-based analysis computed from the same data —
// so the feature always works, and never hard-fails the UI.

const Habit = require('../models/Habit');
const { computeStreak } = require('../utils/streak');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Longest streak ever (not just current) — same logic as the frontend's
// longestStreakEver, reimplemented here since the backend never imports
// frontend code. Daily: longest run of consecutive days. Weekly: longest
// run of consecutive ISO weeks with a completion.
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

// ── 30-day completion rate — mirrors the frontend's completionRateN ────────
function completionRate30(completions) {
  const set = new Set(completions || []);
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (set.has(d.toISOString().slice(0, 10))) count++;
  }
  return Math.round((count / 30) * 100);
}

function buildHabitSummaries(habitDocs) {
  return habitDocs.map((h) => ({
    name:             h.name,
    frequency:        h.frequency,
    currentStreak:    computeStreak(h.completions, h.frequency),
    longestStreak:    longestStreakEver(h.completions, h.frequency),
    completionRate30: completionRate30(h.completions),
    totalCompletions: (h.completions || []).length,
  }));
}

function buildPrompt(summaries) {
  return `You are a habit coach. Review these habits and give motivational tips, based on real streak and completion data. Respond with ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "motivation": "string, 1-2 upbeat sentences referencing their actual data",
  "weakHabits": ["habit name", "..."],
  "suggestions": ["actionable, specific suggestion", "..."],
  "weeklyGoal": "string, one concrete, achievable goal for next week",
  "encouragement": "string, 1 short closing sentence"
}

Habits (JSON):
${JSON.stringify(summaries, null, 2)}`;
}

// ── Rule-based fallback (no API key, or Gemini call failed) ────────────────
function buildFallbackAnalysis(summaries) {
  if (summaries.length === 0) {
    return {
      motivation: "You haven't added any habits yet — every streak starts with a single day.",
      weakHabits: [],
      suggestions: ['Add your first habit from My Habits to get started.'],
      weeklyGoal: 'Add one habit and complete it at least 5 out of 7 days this week.',
      encouragement: "You've got this!",
      source: 'fallback',
    };
  }

  const sorted = [...summaries].sort((a, b) => a.completionRate30 - b.completionRate30);
  const weak = sorted.filter((h) => h.completionRate30 < 50).map((h) => h.name);
  const strongest = sorted[sorted.length - 1];
  const avgRate = Math.round(summaries.reduce((s, h) => s + h.completionRate30, 0) / summaries.length);

  const suggestions = [];
  if (weak.length > 0) {
    suggestions.push(`Try anchoring "${weak[0]}" to an existing routine, like right after you wake up or brush your teeth.`);
  }
  if (summaries.some((h) => h.currentStreak === 0)) {
    suggestions.push('Restart any broken streaks today — momentum matters more than a perfect record.');
  }
  suggestions.push('Check the Analytics page weekly to spot patterns in what\'s working.');

  return {
    motivation: avgRate >= 70
      ? `Strong work — you're completing habits at a ${avgRate}% average rate over the last 30 days.`
      : `You're at a ${avgRate}% average completion rate over the last 30 days — there's real room to build momentum.`,
    weakHabits: weak,
    suggestions,
    weeklyGoal: weak.length > 0
      ? `Get "${weak[0]}" above 60% completion this week.`
      : `Keep "${strongest?.name}" going and aim for a full streak this week.`,
    encouragement: 'Small, consistent steps compound — keep showing up.',
    source: 'fallback',
  };
}

// ── POST /api/ai/coach ──────────────────────────────────────────────────────
exports.getCoaching = async (req, res) => {
  try {
    const habitDocs = await Habit.find({ userId: req.userId });
    const summaries  = buildHabitSummaries(habitDocs);

    if (!GEMINI_API_KEY) {
      return res.status(200).json(buildFallbackAnalysis(summaries));
    }

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(summaries) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return res.status(200).json(buildFallbackAnalysis(summaries)); // graceful fallback, never hard-fail
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(200).json(buildFallbackAnalysis(summaries));
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(200).json(buildFallbackAnalysis(summaries));
    }

    return res.status(200).json({ ...parsed, source: 'gemini' });
  } catch (err) {
    console.error('AI Coach error:', err.message);
    // Still try to return something useful rather than a bare 500
    try {
      const habitDocs = await Habit.find({ userId: req.userId });
      return res.status(200).json(buildFallbackAnalysis(buildHabitSummaries(habitDocs)));
    } catch {
      return res.status(500).json({ message: 'Could not generate AI coaching right now.' });
    }
  }
};
