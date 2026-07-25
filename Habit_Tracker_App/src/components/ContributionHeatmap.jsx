// GitHub-style contribution heatmap — colors each day by what fraction of
// habits were completed that day. Derived entirely from `completions`
// (never stored), same principle as everything else in streak.js.

import { toDateKey, addDays, todayKey } from '../utils/streak.js'

const WEEKS = 18 // ~4.5 months — compact enough to read, long enough to matter
const LEVEL_COLORS = ['#EDE8DA', '#CFE3D8', '#9CC7B3', '#63A38B', '#2F6F62']
const MONTH_LABEL = (d) => d.toLocaleDateString(undefined, { month: 'short' })

function startOfWeekSun(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function levelFor(done, total) {
  if (total === 0 || done === 0) return 0
  const ratio = done / total
  if (ratio >= 1)    return 4
  if (ratio >= 0.66)  return 3
  if (ratio >= 0.33)  return 2
  return 1
}

export default function ContributionHeatmap({ habits }) {
  const total = habits.length
  const today = todayKey()

  const gridStart = startOfWeekSun(addDays(new Date(), -(WEEKS * 7 - 1)))
  const end = new Date()

  const days = []
  for (let d = new Date(gridStart); d <= end; d = addDays(d, 1)) {
    days.push(new Date(d))
  }
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        {/* Month labels above the columns that start a new month */}
        <div className="flex gap-1 pl-0">
          {weeks.map((week, i) => {
            const firstOfMonth = week.find((d) => d.getDate() === 1)
            return (
              <div key={i} className="w-3 shrink-0 text-[9px] font-mono text-inkSoft">
                {firstOfMonth ? MONTH_LABEL(firstOfMonth) : ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date, di) => {
                const key = toDateKey(date)
                const done = habits.filter((h) => h.completions?.includes(key)).length
                const isFuture = key > today
                const level = isFuture ? -1 : levelFor(done, total)
                return (
                  <div
                    key={di}
                    title={isFuture ? '' : `${date.toDateString()}: ${done}/${total} habits completed`}
                    className="h-3 w-3 rounded-[3px]"
                    style={{ backgroundColor: isFuture ? 'transparent' : LEVEL_COLORS[level] }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-inkSoft">
        <span>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <span key={i} className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
