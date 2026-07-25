// Recent Activity — a checklist of what happened across all habits lately:
// completions (from `completions`) and habit creation (from `createdAt`).
// Entries only carry a date, not a time-of-day, so same-day entries are
// grouped and ordered alphabetically by habit name.

import { CheckCircle2 } from 'lucide-react'
import { toDateKey, addDays, todayKey } from '../utils/streak.js'

const LOOKBACK_DAYS = 30
const MAX_ENTRIES   = 8

function relativeLabel(dateKey, today, yesterday) {
  if (dateKey === today) return 'Today'
  if (dateKey === yesterday) return 'Yesterday'
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function RecentActivity({ habits }) {
  const today = todayKey()
  const yesterday = toDateKey(addDays(new Date(), -1))
  const earliest = toDateKey(addDays(new Date(), -LOOKBACK_DAYS))

  const entries = []
  for (const h of habits) {
    if (h.createdAt) {
      const addedKey = toDateKey(new Date(h.createdAt))
      if (addedKey >= earliest) entries.push({ dateKey: addedKey, name: h.name, type: 'added' })
    }
    for (const dateKey of h.completions || []) {
      if (dateKey >= earliest) entries.push({ dateKey, name: h.name, type: 'completed' })
    }
  }

  entries.sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : a.name.localeCompare(b.name)))
  const recent = entries.slice(0, MAX_ENTRIES)

  if (recent.length === 0) {
    return (
      <p className="py-2 text-sm text-inkSoft">
        No activity in the last {LOOKBACK_DAYS} days yet — mark a habit done to see it here.
      </p>
    )
  }

  return (
    <ul className="space-y-2.5">
      {recent.map((entry, i) => (
        <li key={`${entry.dateKey}-${entry.name}-${entry.type}-${i}`} className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-pine" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-sm text-ink">
            <span className="font-semibold">{entry.name}</span>{' '}
            {entry.type === 'added' ? 'added' : 'completed'}
          </p>
          <span className="shrink-0 font-mono text-[11px] text-inkSoft">
            {relativeLabel(entry.dateKey, today, yesterday)}
          </span>
        </li>
      ))}
    </ul>
  )
}
