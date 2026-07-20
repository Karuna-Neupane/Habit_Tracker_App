import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart2, Flame } from 'lucide-react'
import { useHabits } from '../context/HabitsContext.jsx'
import { completionRate30, getLast7DateKeys, isCompletedToday } from '../utils/streak.js'

export default function Stats() {
  const { habits } = useHabits()

  // Derived stats (computed each render, no extra state needed)
  const totalHabits = habits.length
  const doneToday = habits.filter((h) => isCompletedToday(h.completions)).length
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)
  const avgRate30 = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + completionRate30(h.completions), 0) / totalHabits)
    : 0

  // Per-habit 30-day bars
  const habitStats = habits.map((h) => ({
    ...h,
    rate: completionRate30(h.completions),
  }))

  // useEffect: document title update 
  useEffect(() => {
    document.title = `Habitra`
    return () => { document.title = 'Habitra' }
  }, [])

  if (totalHabits === 0) {
    return (
      <div className="py-16 text-center">
        <BarChart2 className="mx-auto mb-3 h-10 w-10 text-inkSoft" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-ink">No data yet</h1>
        <p className="mt-2 text-sm text-inkSoft">
          Head back to the Dashboard and add some habits first.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-xl bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>

      {/* Page header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-pine">Overview</p>
        <h1 className="font-display text-3xl font-bold text-ink">Progress Stats</h1>
        <p className="mt-1 text-sm text-inkSoft">Last 30 days</p>
      </div>

      {/* Top-line summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          { label: 'Habits', value: totalHabits, Icon: null },
          { label: 'Done today', value: `${doneToday}/${totalHabits}`, Icon: null },
          { label: 'Best streak', value: longestStreak, Icon: Flame },
          { label: '30-day avg', value: `${avgRate30}%`, Icon: null },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border border-paperLine bg-white/70 p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-inkSoft">{label}</p>
            <p className="mt-1 flex items-center gap-1 font-display text-2xl font-bold text-ink">
              {value}
              {Icon && <Icon className="h-4 w-4 text-ember" aria-hidden="true" />}
            </p>
          </div>
        ))}
      </div>

      {/* Per-habit completion rate bars */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">
          30-day completion rate
        </h2>
        <div className="space-y-3">
          {habitStats.map((h) => (
            <div key={h.id} className="rounded-2xl border border-paperLine bg-white/70 p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-sm text-ink truncate">{h.name}</span>
                  <span className="shrink-0 rounded-full bg-pineSoft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-pine">
                    {h.frequency}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 font-mono text-xs text-inkSoft">
                    <Flame className="h-3 w-3 text-ember" aria-hidden="true" />
                    {h.streak}
                  </span>
                  <span className="font-mono text-sm font-bold text-ink">{h.rate}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-paperLine overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${h.rate}%`,
                    backgroundColor: h.rate >= 80 ? '#2F6F62' : h.rate >= 50 ? '#E2672F' : '#DAD3C0',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
