// AI Coach — placeholder (Week 6)
// Full Gemini-powered coaching (analyzing habits/streaks/missed days/rate
// and returning motivation, weak habits, suggestions, a weekly goal, and
// encouragement) is intentionally not built yet — just the entry point.

import { Bot, Sparkles } from 'lucide-react'

export default function AICoach() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pineSoft text-pine">
        <Bot className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-pine">Coming soon</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">AI Coach</h1>
      <p className="mt-3 max-w-md text-sm text-inkSoft leading-relaxed">
        Your AI coach will analyze your habits, streaks, missed days, and
        completion rate to give you motivation, flag weak habits, suggest
        improvements, set a weekly goal, and cheer you on.
      </p>

      <button
        type="button"
        disabled
        title="Coming soon"
        className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-ember/50 px-6 py-3 text-sm font-semibold text-white cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Get AI Coaching
      </button>
    </div>
  )
}
