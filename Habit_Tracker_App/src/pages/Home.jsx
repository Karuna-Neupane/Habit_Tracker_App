import { Link } from 'react-router-dom'
import {
  CheckCircle2, Flame, BarChart2, Bot, Shield, Zap,
  Calendar, Target, TrendingUp, Star, ArrowRight,
  MessageSquare, Brain, Sparkles, Check, Smartphone, Lock, ChevronDown, Frown,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Dashboard from './Dashboard.jsx'
import Footer from '../components/Footer.jsx'

// ── Animated counter (counts up on first render) ──────────────────────────────
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setCount(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return count
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isAuthenticated, initializing } = useAuth()

  if (initializing) return null

  // ── Signed in: keep existing behaviour — show Dashboard ──────────────────
  if (isAuthenticated) {
    return <Dashboard />
  }

  // ── Signed out: rich landing page ─────────────────────────────────────────
  return (
    <div>
      <HeroSection />
      <StatsStrip />
      <FeaturesSection />
      <AICoachSection />
      <AboutSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pineSoft/40 via-transparent to-emberSoft/20 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-pine/20 bg-pineSoft/60 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-pine mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-pine animate-pulse" />
          AI-Powered Habit Coaching
          <Sparkles className="h-3 w-3" />
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-ink leading-[1.08] tracking-tight">
          Build habits that{' '}
          <span className="relative inline-block">
            <span className="text-pine">actually</span>
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M2 6 Q50 2 100 5 Q150 8 198 4" stroke="#2F6F62" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>{' '}
          stick.
        </h1>

        <p className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl text-inkSoft leading-relaxed">
          Habit Tracker helps you build and maintain positive daily routines by tracking habits,
          monitoring streaks, and visualising your progress — with an AI coach to keep you going
          when motivation dips.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-2xl bg-ember px-8 py-4 text-base font-semibold text-white shadow-lg shadow-ember/25 transition-all hover:bg-ember/90 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Get started — it's free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-paperLine bg-white/70 px-8 py-4 text-base font-semibold text-ink transition-all hover:bg-white hover:shadow-md"
          >
            I already have an account
          </Link>
        </div>

        <p className="mt-4 text-xs text-inkSoft">No credit card required · Free forever for personal use</p>

        {/* Preview habit cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          {[
            { name: 'Morning run',      streak: 14, bars: [1,1,1,1,1,1,1], freq: 'daily'  },
            { name: 'Read 20 mins',     streak: 7,  bars: [1,1,1,0,1,1,1], freq: 'daily'  },
            { name: 'Weekly meal prep', streak: 5,  bars: [0,0,0,0,0,0,1], freq: 'weekly' },
          ].map(({ name, streak, bars, freq }) => (
            <div key={name} className="rounded-2xl border border-paperLine bg-white/80 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display text-sm font-semibold text-ink">{name}</p>
                  <span className="mt-0.5 inline-block rounded-full bg-pineSoft px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-pine">{freq}</span>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emberSoft px-2 py-0.5">
                  <Flame className="h-3 w-3 text-ember" />
                  <span className="font-mono text-xs font-bold text-ember">{streak}</span>
                </div>
              </div>
              <div className="flex gap-1 justify-between">
                {bars.map((done, i) => (
                  <div key={i} className={[
                    'h-6 w-6 rounded-full border-2 flex items-center justify-center',
                    done ? 'bg-pine border-pine' : 'border-paperLine',
                    i === bars.length - 1 && !done ? 'border-ember' : '',
                  ].join(' ')}>
                    {done && <span className="h-1.5 w-1.5 rounded-full bg-paper" />}
                  </div>
                ))}
              </div>
              <div className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-center text-xs font-semibold ${bars[bars.length-1] ? 'bg-pine text-white' : 'bg-ink text-paper'}`}>
                {bars[bars.length-1] && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {bars[bars.length-1] ? 'Done for today' : 'Mark today done'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats strip ──────────────────────────────────────────────────────────────
function StatsStrip() {
  const habits  = useCounter(2400)
  const streaks = useCounter(98)
  const users   = useCounter(1200)
  const rate    = useCounter(87)

  return (
    <section className="border-y border-paperLine bg-white/50 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `${habits.toLocaleString()}+`, label: 'Habits tracked'    },
            { value: `${streaks}%`,                 label: 'Streak retention'  },
            { value: `${users.toLocaleString()}+`,  label: 'Active users'      },
            { value: `${rate}%`,                    label: '30-day completion' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-3xl font-bold text-ink">{value}</p>
              <p className="mt-1 text-sm text-inkSoft">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: CheckCircle2, title: 'Daily & weekly habits',  desc: 'Track habits on your own schedule — daily workouts, weekly reviews, or anything in between.',                             color: 'bg-pineSoft text-pine'  },
  { icon: Flame,        title: 'Live streak tracking',   desc: 'Streaks recompute the moment you tick a habit. Miss a day and the counter honestly resets.',                             color: 'bg-emberSoft text-ember' },
  { icon: Calendar,     title: '7-day calendar strip',   desc: 'A punch-card strip shows your last 7 days at a glance — filled dots for done, open rings for missed.',                  color: 'bg-pineSoft text-pine'  },
  { icon: BarChart2,    title: 'Progress stats',         desc: '30-day completion rates, streak summaries, and per-habit progress bars on the Stats page.',                             color: 'bg-emberSoft text-ember' },
  { icon: Shield,       title: 'Private & secure',       desc: 'Your habits are tied to your account with JWT authentication. Sign in with email or Google.',                           color: 'bg-pineSoft text-pine'  },
  { icon: Zap,          title: 'Instant updates',        desc: 'Tick a habit and streak, calendar, and stats all update live — no page reloads, no waiting.',                           color: 'bg-emberSoft text-ember' },
  { icon: Target,       title: 'Smart validation',       desc: 'Duplicate dates, invalid inputs, and broken streaks are all caught and corrected gracefully.',                          color: 'bg-pineSoft text-pine'  },
  { icon: TrendingUp,   title: 'Long-term trends',       desc: 'Every completion is stored with its date so your full history is always available for analysis.',                       color: 'bg-emberSoft text-ember' },
  { icon: Bot,          title: 'AI coaching',            desc: 'An integrated AI coach gives personalised tips, motivation, and habit-building strategies on demand.',                  color: 'bg-pineSoft text-pine'  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-pine mb-2">Features</p>
          <h2 className="font-display text-4xl font-bold text-ink">Everything you need to stay consistent</h2>
          <p className="mt-3 text-inkSoft max-w-xl mx-auto">
            A focused set of tools designed around one goal: helping you build habits that outlast motivation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="rounded-2xl border border-paperLine bg-white/70 p-6 transition-all hover:shadow-md hover:-translate-y-0.5 hover:bg-white">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-4`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-semibold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-inkSoft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AI Coach ─────────────────────────────────────────────────────────────────
const CHAT = [
  { role: 'user', text: "I keep missing my morning run when it's cold. Any tips?" },
  { role: 'ai',   text: "Cold weather is one of the top habit killers! Try the '2-minute rule' — just put your running shoes on. Once they're on, you'll almost always go." },
  { role: 'user', text: "I've broken my streak 3 days in a row now", icon: Frown },
  { role: 'ai',   text: "A broken streak isn't failure — it's data. You went 11 days before this gap. Let's talk about what changed and build a buffer strategy." },
  { role: 'user', text: "What's a good habit to pair with reading?" },
  { role: 'ai',   text: "Habit stacking! Pair reading with something you already do daily — right after morning coffee, or before you put your phone down at night. The existing habit becomes your trigger." },
]

function AICoachSection() {
  const [visible, setVisible] = useState(2)

  return (
    <section id="ai-coach" className="py-24 bg-ink relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #F3F1EA 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pine/40 bg-pine/20 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-pineSoft mb-6">
              <Brain className="h-3 w-3" />
              AI Habit Coach
            </div>
            <h2 className="font-display text-4xl font-bold text-paper leading-tight">
              Your personal coach, available 24/7.
            </h2>
            <p className="mt-4 text-inkSoft leading-relaxed">
              Habit Tracker integrates an AI coach that understands your specific habits,
              streak history, and patterns. Ask for motivation, troubleshoot broken streaks,
              or get science-backed strategies for building long-term discipline.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                { icon: MessageSquare, text: 'Personalised motivation based on your actual streak data'        },
                { icon: Brain,         text: 'Evidence-based habit-building strategies tailored to you'        },
                { icon: TrendingUp,    text: 'Pattern analysis to identify weak spots before you miss'         },
                { icon: Sparkles,      text: 'On-demand coaching tips, any time, for any habit'               },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-pine/30">
                    <Icon className="h-3.5 w-3.5 text-pineSoft" />
                  </div>
                  <span className="text-sm text-inkSoft">{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ember px-6 py-3 text-sm font-semibold text-white hover:bg-ember/90 transition-colors">
              Try the AI coach free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mock chat */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-paper">Habit AI Coach</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-inkSoft">Online · Ready to help</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 min-h-[260px]">
              {CHAT.slice(0, visible).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pine/30 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-pineSoft" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-ember/20 text-paper rounded-br-sm' : 'bg-white/10 text-paper/90 rounded-bl-sm'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      {msg.text}
                      {msg.icon && <msg.icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {visible < CHAT.length ? (
              <button onClick={() => setVisible(v => Math.min(v + 2, CHAT.length))}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs text-inkSoft hover:bg-white/5 transition-colors">
                See more conversation
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <div className="mt-4 flex gap-2">
                <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-inkSoft">
                  Ask your coach anything…
                </div>
                <div className="rounded-xl bg-pine px-3 py-2 text-white flex items-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white/50 border-y border-paperLine">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Grid of value props */}
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            {[
              { icon: Target,     title: 'Goal-focused',    desc: 'Every feature exists to help you complete one more day.'            },
              { icon: Lock,       title: 'Private first',   desc: 'Your data is yours. JWT auth, no third-party sharing.'              },
              { icon: Smartphone, title: 'Works everywhere',desc: 'Responsive on mobile, tablet, and desktop out of the box.'          },
              { icon: Zap,        title: 'Real-time',       desc: 'Streaks and stats update the instant you tick a habit.'             },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-paperLine bg-paper/80 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-pineSoft text-pine">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <p className="font-display text-sm font-semibold text-ink">{title}</p>
                <p className="mt-1 text-xs text-inkSoft leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <p className="font-mono text-xs uppercase tracking-widest text-pine mb-2">About</p>
            <h2 className="font-display text-4xl font-bold text-ink leading-tight">
              Built for people who want to change their lives, not just track them.
            </h2>
            <p className="mt-5 text-inkSoft leading-relaxed">
              Habit Tracker is a full-stack web application designed to help you build and maintain
              positive daily routines. We believe consistency compounds — small daily actions,
              repeated over months, produce extraordinary results.
            </p>
            <p className="mt-4 text-inkSoft leading-relaxed">
              Most habit apps overwhelm you with features. We focus on the essentials: log your
              habits, see your streaks, understand your patterns. Then we add AI coaching to help
              you break through the resistance that stops most people before habits take root.
            </p>
            <p className="mt-4 text-inkSoft leading-relaxed">
              Built with React, Node.js, and Express. Designed to be fast, private, and genuinely
              useful — without the noise.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['React', 'Node.js', 'Express', 'JWT Auth', 'Google OAuth', 'REST API', 'AI Coaching'].map(tag => (
                <span key={tag} className="rounded-full border border-paperLine bg-paper px-3 py-1 text-xs font-mono text-inkSoft">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', icon: Shield,       title: 'Create your account',  desc: 'Sign up in seconds with your email or continue with Google. Your data is private and secure from day one.'                                          },
  { num: '02', icon: Target,       title: 'Add your habits',      desc: "Give each habit a clear name and choose daily or weekly. Start with 2–3 habits for best results."                                                    },
  { num: '03', icon: CheckCircle2, title: 'Check in every day',   desc: 'Tap the tick button each day you complete a habit. Watch your streak counter grow and your 7-day strip fill up.'                                    },
  { num: '04', icon: Bot,          title: 'Get coached by AI',    desc: 'When motivation drops or you break a streak, ask your AI coach for personalised advice and habit-building strategies.'                               },
  { num: '05', icon: BarChart2,    title: 'Review your progress', desc: 'Visit the Stats page to see 30-day completion rates, your longest streaks, and an overall picture of consistency.'                                  },
]

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-pine mb-2">How it works</p>
          <h2 className="font-display text-4xl font-bold text-ink">Up and running in 2 minutes</h2>
          <p className="mt-3 text-inkSoft max-w-lg mx-auto">No complex setup. No tutorial videos. Just a clean flow and you're tracking.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
          {/* Connector line desktop */}
          <div className="absolute top-8 left-16 right-16 h-px bg-paperLine hidden lg:block" />
          {STEPS.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="relative text-center">
              <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-paperLine bg-paper shadow-sm z-10">
                <Icon className="h-6 w-6 text-pine" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-bold text-paper">
                  {Number(num)}
                </span>
              </div>
              <h3 className="font-display text-sm font-semibold text-ink mb-2">{title}</h3>
              <p className="text-xs text-inkSoft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Priya M.',     role: 'Software engineer', avatar: 'P', color: 'bg-pineSoft text-pine',   stars: 5,
    text: "I've tried every habit app out there. This one is the first that actually shows me the truth — my streaks were shorter than I thought. The AI coach helped me understand why I kept failing at 2 weeks.",
  },
  {
    name: 'James K.',     role: 'Entrepreneur',      avatar: 'J', color: 'bg-emberSoft text-ember', stars: 5,
    text: "The 7-day calendar strip is genius. One glance and I know exactly where I stand. No numbers to decode, no graphs to interpret. And the streak counter updating live is oddly satisfying.",
  },
  {
    name: 'Ananya R.',    role: 'Graduate student',  avatar: 'A', color: 'bg-pineSoft text-pine',   stars: 5,
    text: "I asked the AI coach why I always skip my reading habit on Fridays. It identified a pattern I hadn't noticed and suggested habit stacking with something I already do. Game changer.",
  },
]

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white/50 border-y border-paperLine">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <p className="font-mono text-xs uppercase tracking-widest text-pine mb-2">Testimonials</p>
          <h2 className="font-display text-4xl font-bold text-ink">People who changed their routines</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, avatar, color, stars, text }) => (
            <div key={name} className="rounded-2xl border border-paperLine bg-paper/80 p-6 flex flex-col">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-ember text-ember" />
                ))}
              </div>
              <p className="text-sm text-inkSoft leading-relaxed flex-1">"{text}"</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-paperLine">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${color} font-display font-bold text-sm`}>
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="text-xs text-inkSoft">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 bg-ink relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #F3F1EA 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Sparkles className="h-8 w-8 text-pine mx-auto mb-5" />
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-paper leading-tight">
          Your best habits are waiting.<br />
          <span className="text-pine">Start today.</span>
        </h2>
        <p className="mt-5 text-inkSoft max-w-xl mx-auto leading-relaxed">
          Join today and start your first streak. It takes 30 seconds to create your account
          and you'll have an AI coach and full habit tracking from the moment you log in.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register"
            className="group inline-flex items-center gap-2 rounded-2xl bg-ember px-10 py-4 text-base font-semibold text-white shadow-lg shadow-ember/20 hover:bg-ember/90 transition-all hover:-translate-y-0.5">
            Create free account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-10 py-4 text-base font-semibold text-paper hover:bg-white/10 transition-colors">
            Sign in
          </Link>
        </div>
        <p className="mt-5 text-xs text-inkSoft">Free forever · No credit card · Sign in with Google</p>
      </div>
    </section>
  )
}

