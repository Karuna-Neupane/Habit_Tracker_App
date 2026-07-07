const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Local calendar date → "YYYY-MM-DD" */
function toDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayKey() {
  return toDateKey(new Date());
}

function isValidDateKey(value) {
  return typeof value === 'string' && DATE_KEY_RE.test(value);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((d - jan4) / 86_400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function computeDailyStreak(dateKeys) {
  const set = new Set(dateKeys);
  let cursor = new Date();
  if (!set.has(toDateKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (set.has(toDateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function computeWeeklyStreak(dateKeys) {
  const weekSet = new Set(
    dateKeys.map((k) => toISOWeekKey(new Date(`${k}T00:00:00`)))
  );
  let cursor = new Date();
  if (!weekSet.has(toISOWeekKey(cursor))) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weekSet.has(toISOWeekKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

function computeStreak(completions, frequency = 'daily') {
  if (!Array.isArray(completions) || completions.length === 0) return 0;
  const valid = completions.filter(isValidDateKey);
  if (valid.length === 0) return 0;
  return frequency === 'weekly'
    ? computeWeeklyStreak(valid)
    : computeDailyStreak(valid);
}

module.exports = { toDateKey, todayKey, isValidDateKey, computeStreak };
