// Activity log (Dashboard polish)
//
// "Added" and "completed" events are already fully and accurately derivable
// live from each habit's own `createdAt`/`completions` — see RecentActivity.jsx.
// "Deleted" events are the one thing that CAN'T be derived that way, because
// the moment a habit is deleted, all its data (including when it was created
// and completed) is gone. So this is a small, separate, persisted log that
// only ever records deletions, keyed per user in localStorage.

const PREFIX = 'habitTracker.deletedActivity.'
const MAX_ENTRIES = 200 // generous cap so the log never grows unbounded

function keyFor(userId) {
  return `${PREFIX}${userId}`
}

function readAll(userId) {
  if (!userId) return []
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId))) || []
  } catch {
    return []
  }
}

/** Record that a habit was deleted, right now, for this user. */
export function logHabitDeleted(userId, habitName) {
  if (!userId) return
  const entries = readAll(userId)
  entries.unshift({
    id: crypto.randomUUID(),
    type: 'deleted',
    habitName,
    timestamp: Date.now(),
  })
  localStorage.setItem(keyFor(userId), JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

/** All deletions for this user within the last `days` days, newest first. */
export function getDeletedActivity(userId, days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return readAll(userId)
    .filter((e) => e.timestamp >= cutoff)
    .sort((a, b) => b.timestamp - a.timestamp)
}

/** Wipe the deletion log for this user (the "Clear history" action). */
export function clearDeletedActivity(userId) {
  if (!userId) return
  localStorage.removeItem(keyFor(userId))
}
