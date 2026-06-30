// Renders the last 7 days as a "punch card": stamped circle = done,
// empty ring = missed, ember ring = today.

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function getLast7DayLabels() {
  const today = new Date()
  const labels = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    labels.push(DAY_LABELS[d.getDay()])
  }
  return labels
}

export default function WeekCalendarStrip({ ticks }) {
  const dayLabels = getLast7DayLabels()

  return (
    <div className="flex items-center justify-between gap-1.5">
      {ticks.map((done, i) => {
        const isToday = i === ticks.length - 1
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono uppercase text-inkSoft">
              {dayLabels[i]}
            </span>
            <div
              title={isToday ? 'Today' : dayLabels[i]}
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
