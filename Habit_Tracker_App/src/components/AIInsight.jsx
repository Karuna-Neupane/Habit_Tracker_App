// AI Insight — a short, rule-based read on the person's current habit data.
// This is NOT a live model call (that's the separate, not-yet-built AI Coach
// page with Gemini) — it's a lightweight, on-device analysis with no network
// round-trip required.

import { Bot } from 'lucide-react'
import { completionRateN, longestStreakEver } from '../utils/streak.js'

export function buildInsight(habits) {
  if (habits.length === 0) {
    return "Add your first habit to start getting personalised insights here."
  }

  const withRates = habits.map((h) => ({
    ...h,
    rateThisWeek: completionRateN(h.completions, 7, h.createdAt),
    ratePrevWeek: (() => {
      // % completed in the 7 days before the last 7 (days 8-14 back)
      const set = new Set(h.completions)
      let count = 0
      for (let i = 7; i < 14; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        if (set.has(key)) count++
      }
      return Math.round((count / 7) * 100)
    })(),
    rate30: completionRateN(h.completions, 30, h.createdAt),
    longest: longestStreakEver(h.completions, h.frequency),
  }))

  const avgThisWeek = Math.round(withRates.reduce((s, h) => s + h.rateThisWeek, 0) / withRates.length)
  const avgPrevWeek = Math.round(withRates.reduce((s, h) => s + h.ratePrevWeek, 0) / withRates.length)
  const strongest = [...withRates].sort((a, b) => b.streak - a.streak)[0]
  const weakest   = [...withRates].sort((a, b) => a.rate30 - b.rate30)[0]

  const trend = avgThisWeek > avgPrevWeek
    ? "You're more consistent than last week."
    : avgThisWeek < avgPrevWeek
      ? "You're a bit behind where you were last week."
      : "You're holding steady with last week's pace."

  let focus
  if (weakest.rate30 < 50 && weakest.name !== strongest.name) {
    focus = `Keep completing your "${weakest.name}" habit — it's fallen to ${weakest.rate30}% this month.`
  } else if (strongest.streak >= 3) {
    focus = `Keep the momentum going on "${strongest.name}" — you're ${strongest.streak} days in.`
  } else {
    focus = `Try to complete at least one habit before the day ends.`
  }

  return `${trend} ${focus}`
}

export default function AIInsight({ habits }) {
  return (
    <div className="flex items-start gap-3">
      <Bot className="mt-0.5 h-5 w-5 shrink-0 text-pine" aria-hidden="true" />
      <p className="text-sm italic leading-relaxed text-ink">"{buildInsight(habits)}"</p>
    </div>
  )
}
