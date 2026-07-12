import { Flame, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import WeekCalendarStrip from './WeekCalendarStrip.jsx'
import { isCompletedToday } from '../utils/streak.js'

export default function HabitCard({ habit, onToggleToday, onEdit, onDelete }) {
  const todayDone = isCompletedToday(habit.completions)

  return (
    <article className="rounded-2xl border border-paperLine bg-white/70 backdrop-blur-sm p-5 shadow-sm flex flex-col gap-4">

      {/* Header: name + badges + action icons */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-ink truncate">
            {habit.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-pineSoft px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide text-pine">
            {habit.frequency}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Streak badge (Week 2: live-updating) */}
          <div
            className="flex items-center gap-1 rounded-full bg-emberSoft px-2.5 py-1"
            title={`${habit.streak}-day streak`}
          >
            <Flame aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
            <span className="font-mono text-sm font-bold text-ember">
              {habit.streak}
            </span>
          </div>

          {/* Edit */}
          <button
            onClick={() => onEdit(habit)}
            aria-label={`Edit "${habit.name}"`}
            title="Edit habit"
            className="rounded-lg p-1.5 text-inkSoft hover:bg-pineSoft hover:text-pine transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(habit)}
            aria-label={`Delete "${habit.name}"`}
            title="Delete habit"
            className="rounded-lg p-1.5 text-inkSoft hover:bg-emberSoft hover:text-ember transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 7-day calendar strip */}
      <WeekCalendarStrip completions={habit.completions} />

      {/* Tick button — GREEN when done today (Week 2, item 6) */}
      <button
        onClick={() => onToggleToday(habit.id)}
        className={[
          'w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200',
          todayDone
            ? 'bg-pine text-white shadow-sm shadow-pine/30 hover:bg-pine/90'  // green
            : 'bg-ink text-paper hover:bg-ink/85',
        ].join(' ')}
      >
        {todayDone ? (
          <span className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Done for today
          </span>
        ) : (
          'Mark today done'
        )}
      </button>
    </article>
  )
}
