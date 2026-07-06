import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    document.title = `Stats — Habit Tracker`
    return () => { document.title = 'Habit Tracker' }
  }, [])

  if (totalHabits === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-4xl mb-3">📊</p>
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
    <div className="mx-auto max-w-5xl px-4 py-8">

      {/* Page header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-pine">Overview</p>
        <h1 className="font-display text-3xl font-bold text-ink">Progress Stats</h1>
        <p className="mt-1 text-sm text-inkSoft">Last 30 days</p>
      </div>

      {/* Top-line summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          { label: 'Habits', value: totalHabits, unit: '' },
          { label: 'Done today', value: `${doneToday}/${totalHabits}`, unit: '' },
          { label: 'Best streak', value: longestStreak, unit: '🔥' },
          { label: '30-day avg', value: `${avgRate30}%`, unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="rounded-2xl border border-paperLine bg-white/70 p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-inkSoft">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {value}{unit && <span className="ml-1 text-lg">{unit}</span>}
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
                  <span className="font-mono text-xs text-inkSoft">
                    🔥 {h.streak}
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
