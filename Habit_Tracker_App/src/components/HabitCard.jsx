import WeekCalendarStrip from './WeekCalendarStrip.jsx'
import { isCompletedToday } from '../utils/streak.js'

export default function HabitCard({ habit, onToggleToday, onEdit, onDelete }) {
  const todayDone = isCompletedToday(habit.completions)

  return (
    <div className="rounded-xl border border-paperLine bg-white/60 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">
            {habit.name}
          </h3>
          <span className="mt-0.5 inline-block rounded-full bg-pineSoft px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide text-pine">
            {habit.frequency}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-emberSoft px-2.5 py-1">
            <span aria-hidden="true">🔥</span>
            <span className="font-mono text-sm font-semibold text-ember">
              {habit.streak}
            </span>
          </div>

          <button
            onClick={() => onEdit(habit.id)}
            aria-label={`Edit ${habit.name}`}
            title="Edit habit"
            className="rounded-md p-1.5 text-inkSoft hover:bg-pineSoft hover:text-pine"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            aria-label={`Delete ${habit.name}`}
            title="Delete habit"
            className="rounded-md p-1.5 text-inkSoft hover:bg-emberSoft hover:text-ember"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mt-4">
        <WeekCalendarStrip completions={habit.completions} />
      </div>

      <button
        onClick={() => onToggleToday(habit.id)}
        className={[
          'mt-4 w-full rounded-lg py-2 text-sm font-semibold transition-colors',
          todayDone
            ? 'bg-pine text-white hover:bg-pine/90'
            : 'bg-ink text-paper hover:bg-ink/90',
        ].join(' ')}
      >
        {todayDone ? "Done for today ✓" : 'Mark today done'}
      </button>
    </div>
  )
}
