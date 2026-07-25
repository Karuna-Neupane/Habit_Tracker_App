// Achievement badges — unlock conditions computed live from habit data.
// Nothing is stored: a badge is "earned" purely by whether the underlying
// numbers currently qualify, so it can never drift out of sync.
// Shown as a row of icon pills — only the badges already earned.

import { Award, Flame, Trophy, Star, BookOpen, Target, Dumbbell, Zap } from 'lucide-react'
import { longestStreakEver, completionRateN } from '../utils/streak.js'

export default function AchievementBadges({ habits }) {
  const totalHabits = habits.length
  const totalCompletions = habits.reduce((sum, h) => sum + (h.completions?.length || 0), 0)
  const bestCurrentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)
  const bestEverStreak = habits.reduce((max, h) => Math.max(max, longestStreakEver(h.completions, h.frequency)), 0)
  const weeklyProgress = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + completionRateN(h.completions, 7, h.createdAt), 0) / totalHabits)
    : 0
  const monthlyProgress = totalHabits
    ? Math.round(habits.reduce((sum, h) => sum + completionRateN(h.completions, 30, h.createdAt), 0) / totalHabits)
    : 0

  const badges = [
    { key: 'first',       Icon: Award,     label: 'First Habit',        earned: totalHabits >= 1 },
    { key: 'week',        Icon: Flame,     label: '7 Day Streak',       earned: bestCurrentStreak >= 7 },
    { key: 'month',       Icon: Trophy,    label: '30 Day Streak',      earned: bestEverStreak >= 30 },
    { key: 'century',     Icon: Star,      label: '100 Completions',    earned: totalCompletions >= 100 },
    { key: 'collector',   Icon: BookOpen,  label: 'Habit Collector',    earned: totalHabits >= 5 },
    { key: 'perfectweek', Icon: Target,    label: 'Perfect Week',       earned: totalHabits > 0 && weeklyProgress === 100 },
    { key: 'consistent',  Icon: Dumbbell,  label: 'Consistency Champ',  earned: totalHabits > 0 && monthlyProgress >= 80 },
    { key: 'onfire',      Icon: Zap,       label: 'On Fire',            earned: bestEverStreak >= 14 },
  ]

  const earned = badges.filter((b) => b.earned)

  if (earned.length === 0) {
    return (
      <p className="text-sm text-inkSoft">
        No badges yet — complete a habit to earn your first one.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {earned.map(({ key, Icon, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-pine/30 bg-pineSoft px-3 py-1.5 text-sm font-medium text-pine"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  )
}
