// Dashboard — overview page.
// Everything here is derived live from `habits` (never stored as a separate
// aggregate), so it can never drift out of sync with My Habits.

import { Link } from 'react-router-dom'
import {
  Sun, CloudSun, Sunset, Moon, Bot, Trophy, Grid3x3, History,
  ListChecks, CalendarDays, BarChart2, PartyPopper,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useHabits } from '../context/HabitsContext.jsx'
import AchievementBadges from '../components/AchievementBadges.jsx'
import RecentActivity from '../components/RecentActivity.jsx'
import ContributionHeatmap from '../components/ContributionHeatmap.jsx'
import {
  isCompletedToday, longestStreakEver,
  getWeekRange, getMonthRange, getPeriodProgress,
} from '../utils/streak.js'
import { quoteOfTheDay } from '../utils/motivationalQuotes.js'

const TODAY_LABEL = new Date().toLocaleDateString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})

function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return { text: 'Good Morning', Icon: Sun }
  if (hour < 17) return { text: 'Good Afternoon', Icon: CloudSun }
  if (hour < 21) return { text: 'Good Evening', Icon: Sunset }
  return { text: 'Good Night', Icon: Moon }
}

function Divider() {
  return <hr className="my-6 border-paperLine" />
}

function ProgressBar({ label, percent, color, subtitle }) {
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
      {subtitle && <p className="mt-1.5 text-xs text-inkSoft">{subtitle}</p>}
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-paperLine bg-white/70 p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-inkSoft">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${accent || 'text-ink'}`}>{value}</p>
    </div>
  )
}

function Card({ title, Icon, children }) {
  return (
    <section className="rounded-2xl border border-paperLine bg-white/70 p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
        {Icon && <Icon className="h-4 w-4 text-pine" aria-hidden="true" />}
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { habits, loading } = useHabits()

  const greeting = getGreeting()

  const totalHabits = habits.length
  const completedToday = habits.filter((h) => isCompletedToday(h.completions)).length
  const remainingToday = Math.max(totalHabits - completedToday, 0)
  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, longestStreakEver(h.completions, h.frequency)),
    0
  )

  // Weekly/Monthly Progress: total completed occurrences ÷ total scheduled
  // occurrences across ALL habits — never an average of individual habit
  // percentages. See utils/streak.js getPeriodProgress for the full rules
  // (daily habits: 1 occurrence/day; weekly habits: 1 occurrence/week).
  const { start: weekStart, end: weekEnd } = getWeekRange()
  const { start: monthStart, end: monthEnd } = getMonthRange()
  const weeklyStats = getPeriodProgress(habits, weekStart, weekEnd)
  const monthlyStats = getPeriodProgress(habits, monthStart, monthEnd)

  let goalText
  let goalDone = false
  if (totalHabits === 0) {
    goalText = 'Add a habit to set today\u2019s goal.'
  } else if (remainingToday === 0) {
    goalText = 'All habits complete for today!'
    goalDone = true
  } else {
    goalText = `Complete ${remainingToday} more habit${remainingToday !== 1 ? 's' : ''} today`
  }

  const quickActions = [
    { to: '/habits', label: 'My Habits', desc: 'View, edit & complete', Icon: ListChecks, color: 'bg-pineSoft text-pine' },
    { to: '/calendar', label: 'Calendar', desc: 'Week & month view', Icon: CalendarDays, color: 'bg-emberSoft text-ember' },
    { to: '/analytics', label: 'Analytics', desc: 'Charts & comparisons', Icon: BarChart2, color: 'bg-pineSoft text-pine' },
    { to: '/ai-coach', label: 'AI Coach', desc: 'Get personalised tips', Icon: Bot, color: 'bg-emberSoft text-ember' },
  ]

  return (
    <div>
      {/* Greeting header */}
      <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-ink">
        <greeting.Icon className="h-7 w-7 text-ember" aria-hidden="true" />
        {greeting.text}, {user?.name || 'there'}
      </h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-pine">{TODAY_LABEL}</p>

      {/* Motivational quote */}
      <p className="mt-3 text-sm italic text-inkSoft">"{quoteOfTheDay()}"</p>

      {/* Today's Goal */}
      <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-paperLine bg-pineSoft/50 px-4 py-3">
        {goalDone && <PartyPopper className="h-4 w-4 shrink-0 text-pine" aria-hidden="true" />}
        <div>
          <p className="font-display text-sm font-semibold text-ink">Today's Goal</p>
          <p className="mt-0.5 text-sm text-inkSoft">
            {loading ? 'Loading your habits…' : goalText}
          </p>
        </div>
      </div>

      <Divider />

      {/* Statistics cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Habits" value={totalHabits} />
        <StatCard label="Completed Today" value={`${completedToday}/${totalHabits}`} accent="text-pine" />
        <StatCard label="Current Streak" value={currentStreak} accent="text-ember" />
        <StatCard label="Longest Streak" value={longestStreak} accent="text-ember" />
      </div>

      <Divider />

      {/* Weekly & Monthly Progress */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
          <ProgressBar
            label="Weekly Progress"
            percent={weeklyStats.percent}
            color="#2F6F62"
            subtitle="Overall completion rate for this week"
          />
        </div>
        <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
          <ProgressBar
            label="Monthly Progress"
            percent={monthlyStats.percent}
            color="#E2672F"
            subtitle="Overall completion rate for this month"
          />
        </div>
      </div>

      <Divider />

      {/* Achievement Badges */}
      <Card title="Achievement Badges" Icon={Trophy}>
        <AchievementBadges habits={habits} />
      </Card>

      <Divider />

      {/* Heatmap */}
      <Card title="Heatmap" Icon={Grid3x3}>
        <ContributionHeatmap habits={habits} />
      </Card>

      <Divider />

      {/* Recent Activity */}
      <Card title="Recent Activity" Icon={History}>
        <RecentActivity habits={habits} />
      </Card>

      <Divider />

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
    </div>
  )
}
