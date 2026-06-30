// Renders the last 7 calendar days as a "punch card": stamped circle =
// completed that day, empty ring = missed, ember ring = today (if not
// done yet). Days are derived from real dates via getLast7DateKeys(),
// not a fixed array index, so it always reflects "today" correctly.

import { getLast7DateKeys } from '../utils/streak.js'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function WeekCalendarStrip({ completions }) {
  const dateKeys = getLast7DateKeys()
  const completedSet = new Set(Array.isArray(completions) ? completions : [])

  return (
    <div className="flex items-center justify-between gap-1.5">
      {dateKeys.map((dateKey, i) => {
        const isToday = i === dateKeys.length - 1
        const done = completedSet.has(dateKey)
        const dayLabel = DAY_LABELS[new Date(`${dateKey}T00:00:00`).getDay()]

        return (
          <div key={dateKey} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono uppercase text-inkSoft">
              {dayLabel}
            </span>
            <div
              title={`${dateKey}${isToday ? ' (today)' : ''}`}
              className={[
                'h-6 w-6 rounded-full border-2 flex items-center justify-center',
                done
                  ? 'bg-pine border-pine'
                  : 'bg-transparent border-paperLine',
                isToday && !done ? 'border-ember' : '',
              ].join(' ')}
            >
              {done && <span className="h-1.5 w-1.5 rounded-full bg-paper" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
