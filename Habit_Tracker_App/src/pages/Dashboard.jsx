// Dashboard — overview page (Week 6)
// Pure stats + quick actions. Full habit CRUD (search/filter/sort, per-habit
// cards) now lives on the "My Habits" page — this page's job is to answer
// "how am I doing right now" at a glance, then hand off to the right tool.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, ListChecks, CalendarDays, BarChart2, Bot,
  Flame, Trophy, CheckCircle2, ListTodo,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useHabits } from '../context/HabitsContext.jsx'
import AddHabitForm from '../components/AddHabitForm.jsx'
import { completionRateN, isCompletedToday, longestStreakEver } from '../utils/streak.js'

const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})

function ProgressBar({ label, percent, color }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-inkSoft">{label}</span>
        <span className="font-mono font-semibold text-ink">{percent}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-paperLine overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, Icon, accent }) {
  return (
    <div className="rounded-2xl border border-paperLine bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wide text-inkSoft">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${accent || 'text-inkSoft'}`} aria-hidden="true" />}
      </div>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { habits, loading, addHabit } = useHabits()

  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')

  const totalHabits = habits.length
  const completedToday = habits.filter((h) => isCompletedToday(h.completions)).length
  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, longestStreakEver(h.completions, h.frequency)),
    0
  )

  const weeklyProgress = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + completionRateN(h.completions, 7), 0) / totalHabits)
    : 0
  const monthlyProgress = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + completionRateN(h.completions, 30), 0) / totalHabits)
    : 0

  async function handleAddHabit({ name, frequency }) {
    try {
      await addHabit({ name, frequency })
      setFormOpen(false)
      setFormError('')
    } catch (err) {
      setFormError(err.message)
    }
  }

  const quickActions = [
    { to: '/habits',    label: 'My Habits', desc: 'View, edit & complete', Icon: ListChecks,  color: 'bg-pineSoft text-pine'   },
    { to: '/calendar',  label: 'Calendar',  desc: 'Week & month view',     Icon: CalendarDays, color: 'bg-emberSoft text-ember' },
    { to: '/analytics', label: 'Analytics', desc: 'Charts & comparisons',  Icon: BarChart2,    color: 'bg-pineSoft text-pine'   },
    { to: '/ai-coach',  label: 'AI Coach',  desc: 'Get personalised tips', Icon: Bot,          color: 'bg-emberSoft text-ember' },
  ]

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-pine">{TODAY_LABEL}</p>
          <h1 className="font-display text-3xl font-bold text-ink">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm text-inkSoft">
            {loading
              ? 'Loading your habits…'
              : totalHabits === 0
                ? "You haven't added any habits yet — start with your first one below."
                : `${completedToday}/${totalHabits} habits done today.`}
          </p>
        </div>
        <button
          onClick={() => { setFormError(''); setFormOpen(true) }}
          className="mt-3 inline-flex items-center gap-2 self-start rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-ember/30 hover:bg-ember/90 transition-colors sm:mt-0 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add habit
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <StatCard label="Total habits"     value={totalHabits}                    Icon={ListTodo}     />
        <StatCard label="Completed today"  value={`${completedToday}/${totalHabits}`} Icon={CheckCircle2} accent="text-pine"  />
        <StatCard label="Current streak"   value={currentStreak}                  Icon={Flame}        accent="text-ember" />
        <StatCard label="Longest streak"   value={longestStreak}                  Icon={Trophy}       accent="text-ember" />
      </div>

      {/* Weekly / monthly progress */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
        <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
          <ProgressBar label="Weekly progress (last 7 days)" percent={weeklyProgress} color="#2F6F62" />
        </div>
        <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
          <ProgressBar label="Monthly progress (last 30 days)" percent={monthlyProgress} color="#E2672F" />
        </div>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ to, label, desc, Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="rounded-2xl border border-paperLine bg-white/70 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 hover:bg-white"
            >
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <p className="font-display text-sm font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-xs text-inkSoft">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <AddHabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddHabit}
        existingNames={habits.map((h) => h.name)}
        serverError={formError}
      />
    </div>
  )
}
