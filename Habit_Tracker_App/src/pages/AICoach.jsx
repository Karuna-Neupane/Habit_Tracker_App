// AI Coach — Week 7, now with a premium AI Chatbot alongside it
// Calls POST /api/ai/coach, which sends the user's real habit names,
// streaks, and completion rates to Gemini (server-side — the API key never
// touches the browser) with a habit-coach prompt, and returns structured
// coaching feedback. Falls back to a rule-based analysis if Gemini isn't
// configured, so this always works.
//
// Below the coaching card sits the AI Chatbot (AIChatBot.jsx) — a separate,
// additive premium feature for natural-language follow-up questions. It
// does not replace this section.

import { useState } from 'react'
import {
  Bot, Sparkles, AlertTriangle, RefreshCw, Gauge,
  Trophy, TrendingDown, Lightbulb, Target, Heart,
} from 'lucide-react'
import api from '../utils/api.js'
import { useHabits } from '../context/HabitsContext.jsx'
import AIChatBot from '../components/AIChatBot.jsx'

export default function AICoach() {
  const { habits } = useHabits()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleGetCoaching() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/ai/coach')
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the AI coach. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* ── AI Coach section ──────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pineSoft text-pine">
          <Bot className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-pine">AI Coach</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Get AI Coaching</h1>
        <p className="mt-3 text-sm text-inkSoft leading-relaxed">
          Your coach reviews {habits.length > 0 ? `all ${habits.length} of your habits` : 'your habits'} —
          streaks, weekly and monthly completion rates, and what's slipping — and gives you an honest read on
          your overall performance, your strongest and weakest habits, concrete suggestions, and a goal for
          tomorrow.
        </p>
      </div>

      {/* ── Button / loading state ─────────────────────────────────────── */}
      {!result && (
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleGetCoaching}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-ember px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-ember/30 transition-colors hover:bg-ember/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analysing your habits…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Get AI Coaching
              </>
            )}
          </button>

          {loading && (
            <div className="mt-8 w-full space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded-full bg-paperLine" style={{ width: `${85 - i * 15}%` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────────── */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-ember/30 bg-emberSoft px-4 py-3 text-sm text-ember">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              type="button"
              onClick={handleGetCoaching}
              className="mt-2 font-semibold underline underline-offset-2 hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Result: styled coaching card ─────────────────────────────────── */}
      {result && (
        <div className="space-y-4">
          {/* Overall Performance */}
          <div className="rounded-2xl border border-pine/20 bg-gradient-to-br from-pineSoft/60 to-emberSoft/30 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pine text-white">
                <Gauge className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-pine">Overall Performance</p>
                <p className="mt-1 font-display text-base font-semibold text-ink leading-relaxed">
                  {result.overallPerformance}
                </p>
              </div>
            </div>
          </div>

          {/* Strongest / Weakest habit */}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.strongestHabit && (
              <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-pine" aria-hidden="true" />
                  <p className="font-display text-sm font-semibold text-ink">Strongest Habit</p>
                </div>
                <p className="text-sm text-inkSoft leading-relaxed">{result.strongestHabit}</p>
              </div>
            )}

            {result.weakestHabit && (
              <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-ember" aria-hidden="true" />
                  <p className="font-display text-sm font-semibold text-ink">Weakest Habit</p>
                </div>
                <p className="text-sm text-inkSoft leading-relaxed">{result.weakestHabit}</p>
              </div>
            )}
          </div>

          {/* Improvement Suggestions */}
          {result.improvementSuggestions?.length > 0 && (
            <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-pine" aria-hidden="true" />
                <p className="font-display text-sm font-semibold text-ink">Improvement Suggestions</p>
              </div>
              <ul className="space-y-2">
                {result.improvementSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-inkSoft leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-pine" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tomorrow's Goal */}
          {result.tomorrowGoal && (
            <div className="rounded-2xl border border-paperLine bg-white/70 p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <Target className="h-4 w-4 text-ember" aria-hidden="true" />
                <p className="font-display text-sm font-semibold text-ink">Tomorrow's Goal</p>
              </div>
              <p className="text-sm text-inkSoft leading-relaxed">{result.tomorrowGoal}</p>
            </div>
          )}

          {/* Motivational Message */}
          {result.motivationalMessage && (
            <div className="flex items-center gap-2 rounded-2xl bg-ink px-5 py-4 text-paper">
              <Heart className="h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
              <p className="text-sm font-medium">{result.motivationalMessage}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-inkSoft">
              {result.source === 'gemini' ? 'Generated by Gemini AI' : 'Generated locally from your habit data'}
            </p>
            <button
              type="button"
              onClick={handleGetCoaching}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-paperLine bg-white/70 px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-white disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh coaching
            </button>
          </div>
        </div>
      )}

      {/* ── AI Chatbot section (premium, additive) ─────────────────────── */}
      <AIChatBot />
    </div>
  )
}
