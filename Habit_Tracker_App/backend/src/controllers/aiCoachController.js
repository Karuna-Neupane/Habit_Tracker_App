// AI Coach Controller (+ premium chatbot upgrade)
// POST /api/ai/coach
//
// 1. Fetches the logged-in user's real habits from MongoDB (never trusts
//    habit data from the request body — same principle as habitController).
// 2. Computes each habit's current streak, longest streak, weekly and
//    monthly completion rates, and overall progress server-side
//    (see utils/habitStats.js — shared with the AI chatbot so both features
//    always reason from identical numbers).
// 3. Sends those real stats to Gemini with a habit-coach prompt.
// 4. Returns a structured coaching card: overall performance, strongest
//    habit, weakest habit, improvement suggestions, tomorrow's goal, and a
//    motivational message.
//
// If GEMINI_API_KEY isn't set, or the Gemini call fails for any reason,
// this falls back to a rule-based analysis computed from the same data —
// so the feature always works, and never hard-fails the UI.

const Habit = require('../models/Habit');
const { getUserHabitStats } = require('../utils/habitStats');
const gemini = require('../utils/gemini');

function buildPrompt(summaries, overall) {
  return `You are Habitra's AI habit coach. Analyze this user's REAL habit data below and coach them like a supportive, practical expert who never invents facts. Respond with ONLY valid JSON (no markdown fences, no commentary) matching EXACTLY this shape:
{
  "overallPerformance": "string, 2-3 sentences summarizing their overall progress, referencing real numbers (avg weekly/monthly rate, streaks)",
  "strongestHabit": "string naming their strongest habit and briefly why (based on the data)",
  "weakestHabit": "string naming the habit that needs the most attention and briefly why (based on the data), or a positive note if every habit is doing well",
  "improvementSuggestions": ["actionable, specific suggestion tied to a real habit", "...", "..."],
  "tomorrowGoal": "string, one concrete, achievable goal for tomorrow referencing a specific habit",
  "motivationalMessage": "string, 1-2 upbeat closing sentences"
}

Overall stats (JSON):
${JSON.stringify(overall, null, 2)}

Per-habit stats (JSON):
${JSON.stringify(summaries, null, 2)}`;
}

// Rule-based fallback (no API key, or Gemini call failed) 
function buildFallbackCoaching(summaries, overall) {
  if (summaries.length === 0) {
    return {
      overallPerformance: "You haven't added any habits yet — every streak starts with a single day.",
      strongestHabit: 'None yet — add your first habit to get started.',
      weakestHabit: 'None yet.',
      improvementSuggestions: ['Add your first habit from My Habits to get started.'],
      tomorrowGoal: 'Add one habit and complete it tomorrow.',
      motivationalMessage: "You've got this!",
      source: 'fallback',
    };
  }

  const { strongest, weakest, avgWeeklyRate, avgMonthlyRate, totalCurrentStreakDays } = overall;

  const suggestions = [];
  if (weakest) {
    suggestions.push(`Try anchoring "${weakest.name}" to an existing routine, like right after you wake up or brush your teeth.`);
  }
  if (summaries.some((h) => h.currentStreak === 0)) {
    suggestions.push('Restart any broken streaks today — momentum matters more than a perfect record.');
  }
  suggestions.push("Check the Analytics page weekly to spot patterns in what's working.");

  return {
    overallPerformance: avgMonthlyRate >= 70
      ? `Strong work — you're completing habits at a ${avgMonthlyRate}% average rate over the last 30 days, with ${totalCurrentStreakDays} total streak days across all habits right now.`
      : `You're at a ${avgMonthlyRate}% average completion rate over the last 30 days (${avgWeeklyRate}% this week) — there's real room to build momentum.`,
    strongestHabit: strongest
      ? `"${strongest.name}" — ${strongest.monthlyRate}% completion over 30 days with a current streak of ${strongest.currentStreak}.`
      : 'Keep going — no clear leader yet.',
    weakestHabit: weakest && weakest.name !== strongest?.name
      ? `"${weakest.name}" — only ${weakest.monthlyRate}% completion over 30 days.`
      : 'Every habit is holding steady — nice work.',
    improvementSuggestions: suggestions,
    tomorrowGoal: weakest
      ? `Complete "${weakest.name}" tomorrow to start pulling its rate up.`
      : `Keep "${strongest?.name}" going with another completion tomorrow.`,
    motivationalMessage: 'Small, consistent steps compound — keep showing up.',
    source: 'fallback',
  };
}

// POST /api/ai/coach 
exports.getCoaching = async (req, res) => {
  try {
    const { summaries, overall } = await getUserHabitStats(Habit, req.user.id);

    if (!gemini.isConfigured()) {
      return res.status(200).json(buildFallbackCoaching(summaries, overall));
    }

    try {
      const text = await gemini.generate(
        [{ role: 'user', parts: [{ text: buildPrompt(summaries, overall) }] }],
        { json: true }
      );
      const parsed = JSON.parse(text);
      return res.status(200).json({ ...parsed, source: 'gemini' });
    } catch (err) {
      console.error('Gemini coaching call failed, using fallback:', err.message);
      return res.status(200).json(buildFallbackCoaching(summaries, overall)); // graceful fallback, never hard-fail
    }
  } catch (err) {
    console.error('AI Coach error:', err.message);
    try {
      const { summaries, overall } = await getUserHabitStats(Habit, req.user.id);
      return res.status(200).json(buildFallbackCoaching(summaries, overall));
    } catch {
      return res.status(500).json({ message: 'Could not generate AI coaching right now.' });
    }
  }
};
