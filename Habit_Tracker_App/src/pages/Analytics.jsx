// Analytics — Week 6
// Charts built with recharts. All data is derived on the fly from each
// habit's `completions` array (streak.js) — nothing charted here is stored
// as a separate aggregate, so it's always consistent with the raw history.

import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { BarChart2, Flame } from 'lucide-react'
import { useHabits } from '../context/HabitsContext.jsx'
import { toDateKey, addDays, completionRate30, longestStreakEver } from '../utils/streak.js'

const PINE  = '#2F6F62'
const EMBER = '#E2672F'
const GRID  = '#DAD3C0'

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-paperLine bg-white/70 p-4 sm:p-5">
      <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-inkSoft">{subtitle}</p>}
      <div className="mt-4 h-56">{children}</div>
    </section>
  )
}

function tooltipStyle() {
  return {
    contentStyle: { background: '#FBF9F4', border: '1px solid #DAD3C0', borderRadius: 12, fontSize: 12 },
    labelStyle: { color: '#2B2B26', fontWeight: 600 },
  }
}

export default function Analytics() {
  const { habits } = useHabits()
  const totalHabits = habits.length

  if (totalHabits === 0) {
    return (
      <div className="py-16 text-center">
        <BarChart2 className="mx-auto mb-3 h-10 w-10 text-inkSoft" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-ink">No data yet</h1>
        <p className="mt-2 text-sm text-inkSoft">
          Head back to My Habits and add some habits first.
        </p>
        <Link
          to="/habits"
          className="mt-4 inline-block rounded-xl bg-ember px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
        >
          Go to My Habits
        </Link>
      </div>
    )
  }

  const doneToday    = habits.filter((h) => h.completions?.includes(toDateKey(new Date()))).length
  const longestOverall = habits.reduce((max, h) => Math.max(max, longestStreakEver(h.completions, h.frequency)), 0)
  const avgRate30    = Math.round(habits.reduce((sum, h) => sum + completionRate30(h.completions), 0) / totalHabits)

  // ── Weekly completion: last 7 days, % of habits completed each day ──────
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), -(6 - i))
    const key  = toDateKey(date)
    const done = habits.filter((h) => h.completions?.includes(key)).length
    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      rate: totalHabits ? Math.round((done / totalHabits) * 100) : 0,
    }
  })

  // ── Monthly completion: last 30 days trend, % of habits completed each day ─
  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), -(29 - i))
    const key  = toDateKey(date)
    const done = habits.filter((h) => h.completions?.includes(key)).length
    return {
      label: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      rate: totalHabits ? Math.round((done / totalHabits) * 100) : 0,
    }
  })

  // ── Habit comparison: 30-day completion rate per habit ──────────────────
  const comparisonData = habits
    .map((h) => ({ name: h.name, rate: completionRate30(h.completions) }))
    .sort((a, b) => b.rate - a.rate)

  // ── Longest streak per habit ─────────────────────────────────────────────
  const streakData = habits
    .map((h) => ({ name: h.name, longest: longestStreakEver(h.completions, h.frequency) }))
    .sort((a, b) => b.longest - a.longest)

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-pine">Overview</p>
        <h1 className="font-display text-3xl font-bold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-inkSoft">Charts across your full habit history</p>
      </div>

      {/* Top-line summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          { label: 'Habits',        value: totalHabits },
          { label: 'Done today',    value: `${doneToday}/${totalHabits}` },
          { label: 'Best streak',   value: longestOverall, Icon: Flame },
          { label: '30-day avg',    value: `${avgRate30}%` },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly completion */}
        <ChartCard title="Weekly completion" subtitle="% of habits completed, last 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6558' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B6558' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...tooltipStyle()} formatter={(v) => [`${v}%`, 'Completed']} />
              <Bar dataKey="rate" fill={PINE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly completion trend */}
        <ChartCard title="Monthly completion" subtitle="% of habits completed, last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B6558' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B6558' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...tooltipStyle()} formatter={(v) => [`${v}%`, 'Completed']} />
              <Line type="monotone" dataKey="rate" stroke={EMBER} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Habit comparison */}
        <ChartCard title="Habit comparison" subtitle="30-day completion rate by habit">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B6558' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#2B2B26' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle()} formatter={(v) => [`${v}%`, 'Completion rate']} />
              <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                {comparisonData.map((entry, i) => (
                  <Cell key={i} fill={entry.rate >= 80 ? PINE : entry.rate >= 50 ? EMBER : GRID} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Longest streak per habit */}
        <ChartCard title="Longest streak" subtitle="Best streak ever achieved, per habit">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streakData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6558' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#2B2B26' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle()} formatter={(v) => [v, 'Longest streak']} />
              <Bar dataKey="longest" fill={EMBER} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Exact per-habit completion % (precise numbers, not just the chart) */}
      <section className="mt-5">
        <h2 className="font-display text-lg font-semibold text-ink mb-3">
          30-day completion rate — exact figures
        </h2>
        <div className="space-y-3">
          {comparisonData.map((h) => (
            <div key={h.name} className="rounded-2xl border border-paperLine bg-white/70 p-4">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-medium text-sm text-ink truncate">{h.name}</span>
                <span className="font-mono text-sm font-bold text-ink">{h.rate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-paperLine overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${h.rate}%`,
                    backgroundColor: h.rate >= 80 ? PINE : h.rate >= 50 ? EMBER : GRID,
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
