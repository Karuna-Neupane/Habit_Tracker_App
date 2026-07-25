// Recent Activity — a feed of what happened across all habits lately:
// added and completed events are derived live from each habit's own
// `createdAt` / `completions` (always accurate, can't drift). "Deleted"
// events come from a small separate persisted log (utils/activityLog.js),
// since a deleted habit's own history disappears along with it.

import { useEffect, useState } from 'react'
import { CheckCircle2, PlusCircle, Trash2, History as HistoryIcon, X } from 'lucide-react'
import { toDateKey, addDays, todayKey } from '../utils/streak.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getDeletedActivity, clearDeletedActivity } from '../utils/activityLog.js'
import ConfirmDialog from './ConfirmDialog.jsx'

const LOOKBACK_DAYS = 30
const PREVIEW_COUNT = 8

function relativeLabel(dateKey, today, yesterday) {
  if (dateKey === today) return 'Today'
  if (dateKey === yesterday) return 'Yesterday'
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const ICONS = {
  added:     { Icon: PlusCircle,   color: 'text-pine'  },
  completed: { Icon: CheckCircle2, color: 'text-pine'  },
  deleted:   { Icon: Trash2,       color: 'text-ember' },
}

const VERBS = { added: 'added', completed: 'completed', deleted: 'deleted' }

// Build the full merged, sorted activity list (used by both the compact
// preview and the full-history modal, so they never disagree).
function buildEntries(habits, deletions) {
  const today = todayKey()
  const earliest = toDateKey(addDays(new Date(), -LOOKBACK_DAYS))

  const entries = []
  for (const h of habits) {
    if (h.createdAt) {
      const addedKey = toDateKey(new Date(h.createdAt))
      if (addedKey >= earliest) {
        entries.push({ dateKey: addedKey, ts: new Date(`${addedKey}T00:00:00`).getTime(), name: h.name, type: 'added' })
      }
    }
    for (const dateKey of h.completions || []) {
      if (dateKey >= earliest) {
        entries.push({ dateKey, ts: new Date(`${dateKey}T00:00:00`).getTime(), name: h.name, type: 'completed' })
      }
    }
  }
  for (const d of deletions) {
    entries.push({ dateKey: toDateKey(new Date(d.timestamp)), ts: d.timestamp, name: d.habitName, type: 'deleted' })
  }

  entries.sort((a, b) => b.ts - a.ts || a.name.localeCompare(b.name))
  return entries
}

function ActivityRow({ entry, today, yesterday }) {
  const { Icon, color } = ICONS[entry.type]
  return (
    <li className="flex items-center gap-3">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate text-sm text-ink">
        <span className="font-semibold">{entry.name}</span> {VERBS[entry.type]}
      </p>
      <span className="shrink-0 font-mono text-[11px] text-inkSoft">
        {relativeLabel(entry.dateKey, today, yesterday)}
      </span>
    </li>
  )
}

export default function RecentActivity({ habits }) {
  const { user } = useAuth()
  const today = todayKey()
  const yesterday = toDateKey(addDays(new Date(), -1))

  const [deletions, setDeletions] = useState(() => getDeletedActivity(user?.id, LOOKBACK_DAYS))
  const [historyOpen, setHistoryOpen] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)

  // Re-read the deletion log whenever the habits list changes (e.g. right
  // after a delete) so a freshly-deleted habit shows up immediately.
  useEffect(() => {
    setDeletions(getDeletedActivity(user?.id, LOOKBACK_DAYS))
  }, [habits, user?.id])

  const entries = buildEntries(habits, deletions)
  const preview = entries.slice(0, PREVIEW_COUNT)

  function handleClear() {
    clearDeletedActivity(user?.id)
    setDeletions([])
    setConfirmingClear(false)
  }

  return (
    <div>
      {/* Top-right actions */}
      <div className="mb-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine hover:underline"
        >
          <HistoryIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Past history
        </button>
        <button
          type="button"
          onClick={() => setConfirmingClear(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-inkSoft hover:text-ember transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear history
        </button>
      </div>

      {preview.length === 0 ? (
        <p className="py-2 text-sm text-inkSoft">
          No activity in the last {LOOKBACK_DAYS} days yet — add or complete a habit to see it here.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {preview.map((entry, i) => (
            <ActivityRow key={`${entry.ts}-${entry.name}-${entry.type}-${i}`} entry={entry} today={today} yesterday={yesterday} />
          ))}
        </ul>
      )}

      {/* Full-history modal: shows everything from the last 30 days.
          The list container is capped to roughly 8 rows tall — scroll to
          see the rest, exactly like the compact preview above but complete. */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                Past {LOOKBACK_DAYS} days
              </h2>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg p-1 text-inkSoft hover:bg-white/70 hover:text-ink transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="text-sm text-inkSoft">No activity in the last {LOOKBACK_DAYS} days yet.</p>
            ) : (
              <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {entries.map((entry, i) => (
                  <ActivityRow key={`${entry.ts}-${entry.name}-${entry.type}-${i}`} entry={entry} today={today} yesterday={yesterday} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmingClear}
        title="Clear activity history?"
        message={
          <>
            This clears the record of habits you've <strong>deleted</strong> in the last {LOOKBACK_DAYS} days.
            Added and completed activity is generated live from your current habits, so it can't be cleared
            separately — deleting a habit itself is the only way to remove its history.
          </>
        }
        confirmLabel="Clear"
        danger
        onConfirm={handleClear}
        onCancel={() => setConfirmingClear(false)}
      />
    </div>
  )
}
