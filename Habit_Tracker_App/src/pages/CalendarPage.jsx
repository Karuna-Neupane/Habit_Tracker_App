// Calendar — Week 6
// Weekly and monthly views of completion history, aggregated across every
// habit. A day's status is derived purely from `completions` on each habit
// (never stored separately), same principle as streak.js.
//
// Status per day (simplification noted inline): counts how many habits were
// completed on that date out of the total habit count. This is a simple,
// habit-count-based read of "how complete was this day" rather than trying
// to model which habits were specifically "due" that day (daily vs weekly
// due-dates would need a much more complex scheduler for a small gain here).

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useHabits } from '../context/HabitsContext.jsx'
import { toDateKey, addDays, todayKey } from '../utils/streak.js'

const VIEW_WEEK  = 'week'
const VIEW_MONTH = 'month'

const WEEKDAY_LABELS      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH_LABEL_FMT     = (d) => d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

function startOfWeek(date) {
  const d = new Date(date)
  const dayIndex = (d.getDay() + 6) % 7 // Monday = 0 ... Sunday = 6
  d.setDate(d.getDate() - dayIndex)
  d.setHours(0, 0, 0, 0)
  return d
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const STATUS_STYLES = {
  full:    'bg-pine text-white',
  partial: 'bg-ember text-white',
  missed:  'bg-emberSoft text-ember',
  future:  'bg-paperLine/40 text-inkSoft',
  empty:   'bg-paperLine/40 text-inkSoft',
}

export default function CalendarPage() {
  const { habits } = useHabits()
  const [view, setView]     = useState(VIEW_WEEK)
  const [anchor, setAnchor] = useState(new Date())

  const today = todayKey()

  const dayStats = useMemo(() => {
    return (dateKey) => {
      const total = habits.length
      const done  = habits.filter((h) => h.completions?.includes(dateKey)).length
      return { done, total }
    }
  }, [habits])

  function dayStatus(dateKey) {
    const { done, total } = dayStats(dateKey)
    if (total === 0) return 'empty'
    if (dateKey > today) return 'future'
    if (done === total) return 'full'
    if (done > 0) return 'partial'
    return 'missed'
  }

  function goPrev() {
    setAnchor((d) => view === VIEW_WEEK ? addDays(d, -7) : new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function goNext() {
    setAnchor((d) => view === VIEW_WEEK ? addDays(d, 7) : new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goToday() {
    setAnchor(new Date())
  }

  // ── Week data ──────────────────────────────────────────────────────────
  const weekStart = startOfWeek(anchor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // ── Month data ─────────────────────────────────────────────────────────
  const monthStart   = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const leadingBlanks = (monthStart.getDay() + 6) % 7 // Monday-first offset
  const totalDays      = daysInMonth(anchor)
  const monthCells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth(), i + 1)),
  ]

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pine">Your history</p>
          <h1 className="font-display text-3xl font-bold text-ink">Calendar</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Week / Month toggle */}
          <div className="flex rounded-xl border border-paperLine bg-white/70 p-0.5">
            {[[VIEW_WEEK, 'Week'], [VIEW_MONTH, 'Month']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={[
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  view === key ? 'bg-pineSoft text-pine' : 'text-inkSoft hover:text-ink',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nav row */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-paperLine bg-white/70 px-4 py-3">
        <button onClick={goPrev} className="rounded-lg p-1.5 text-inkSoft hover:bg-paperLine/60 hover:text-ink transition-colors" aria-label="Previous">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-pine" aria-hidden="true" />
          <span className="font-display text-sm font-semibold text-ink">
            {view === VIEW_WEEK
              ? `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
              : MONTH_LABEL_FMT(anchor)}
          </span>
          <button onClick={goToday} className="ml-2 rounded-full bg-pineSoft px-2 py-0.5 text-[11px] font-semibold text-pine hover:bg-pine hover:text-white transition-colors">
            Today
          </button>
        </div>
        <button onClick={goNext} className="rounded-lg p-1.5 text-inkSoft hover:bg-paperLine/60 hover:text-ink transition-colors" aria-label="Next">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {habits.length === 0 && (
        <div className="mb-4 rounded-2xl border-2 border-dashed border-paperLine p-6 text-center text-sm text-inkSoft">
          Add a habit to start seeing your history here.
        </div>
      )}

      {/* ── Week view ────────────────────────────────────────────────────── */}
      {view === VIEW_WEEK && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, i) => {
            const dateKey = toDateKey(date)
            const status  = dayStatus(dateKey)
            const { done, total } = dayStats(dateKey)
            const isToday = dateKey === today

            return (
              <div
                key={dateKey}
                className={[
                  'rounded-2xl border p-3 text-center flex flex-col items-center gap-2',
                  isToday ? 'border-pine ring-2 ring-pine/40' : 'border-paperLine',
                ].join(' ')}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-inkSoft">
                  {WEEKDAY_LABELS[i]}
                </span>
                <span className="font-display text-sm font-semibold text-ink">
                  {date.getDate()}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${STATUS_STYLES[status]}`}>
                  {total > 0 ? `${done}/${total}` : '–'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Month view ───────────────────────────────────────────────────── */}
      {view === VIEW_MONTH && (
        <div>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="text-[10px] font-mono uppercase tracking-wider text-inkSoft">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthCells.map((date, i) => {
              if (!date) return <div key={`blank-${i}`} />
              const dateKey = toDateKey(date)
              const status  = dayStatus(dateKey)
              const isToday = dateKey === today

              return (
                <div
                  key={dateKey}
                  title={WEEKDAY_LABELS_FULL[(date.getDay() + 6) % 7]}
                  className={[
                    'aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-colors',
                    STATUS_STYLES[status],
                    isToday ? 'ring-2 ring-pine ring-offset-1 ring-offset-paper' : '',
                  ].join(' ')}
                >
                  {date.getDate()}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-inkSoft">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-pine" /> All habits done</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-ember" /> Some habits done</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emberSoft" /> Missed</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-paperLine/60" /> Future / no data</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-pine" /> Today</span>
      </div>
    </div>
  )
}
