import { getLast7DateKeys } from '../utils/streak.js'

const DAY_INITIAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function WeekCalendarStrip({ completions = [] }) {
  const dateKeys     = getLast7DateKeys()
  const completedSet = new Set(completions)

  return (
    <div className="flex items-center justify-between gap-1">
      {dateKeys.map((dateKey, i) => {
        const isToday  = i === dateKeys.length - 1
        const done     = completedSet.has(dateKey)
        const dayLabel = DAY_INITIAL[new Date(`${dateKey}T00:00:00`).getDay()]

        return (
          <div key={dateKey} className="flex flex-col items-center gap-1 flex-1">
            {/* Day-of-week label */}
            <span className="text-[10px] font-mono uppercase tracking-wider text-inkSoft select-none">
              {dayLabel}
            </span>

            {/* Tick circle */}
            <div
              title={`${dateKey}${isToday ? ' — today' : ''}`}
              aria-label={done ? `Completed ${dateKey}` : `Not completed ${dateKey}`}
              className={[
                'h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors',
                done
                  ? 'bg-pine border-pine'
                  : 'bg-transparent border-paperLine',
                isToday && !done ? 'border-ember' : '',
              ].join(' ')}
            >
              {done && (
                <span className="h-1.5 w-1.5 rounded-full bg-paper" aria-hidden="true" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
