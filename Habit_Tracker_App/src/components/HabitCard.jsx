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
            <span aria-hidden="true" className="text-sm">🔥</span>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(habit)}
            aria-label={`Delete "${habit.name}"`}
            title="Delete habit"
            className="rounded-lg p-1.5 text-inkSoft hover:bg-emberSoft hover:text-ember transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
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
        {todayDone ? '✓  Done for today' : 'Mark today done'}
      </button>
    </article>
  )
}
